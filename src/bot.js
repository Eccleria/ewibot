import dotenv from "dotenv";
dotenv.config();

import dayjs from "dayjs";
import RelativeTime from "dayjs/plugin/relativeTime.js";
import "dayjs/locale/fr.js";
dayjs.extend(RelativeTime);
dayjs.locale("fr");

import { Client, Intents, MessageEmbed } from "discord.js";
import SpotifyWebApi from "spotify-web-api-node";

import { roleInit } from "./admin/role.js";

//import { getTwitterFeed } from "./admin/twitter.js"
//import { getTwitterUser } from "./admin/twitter.js"

import { join } from "path";
import { Low, JSONFile } from "lowdb";

// helpers imports
import { generateSpotifyClient } from "./helpers/index.js";

import {
  onPrivateMessage,
  onPublicMessage,
  onReactionAdd,
  onReactionRemove,
  onMessageUpdate,
} from "./listeners.js";

// jsons imports
import { readFileSync } from "fs";
const commons = JSON.parse(readFileSync("static/commons.json"));

// commands imports
import { wishBirthday } from "./commands/birthday.js";

// DB
const file = join("db", "db.json"); // Use JSON file for storage
const adapter = new JSONFile(file);
const db = new Low(adapter);

db.read(); // Read data from JSON file, this will set db.data content

db.wasUpdated = false;
db.birthdayInitiated = false;

setInterval(async () => {
  // db updater loop, used to centralize db.write()
  if (db.wasUpdated) {
    await db.write();
    db.wasUpdated = false;
  }
}, 10000);

// BIRTHDAY
const tomorrow = dayjs()
  .add(1, "day")
  .hour(8)
  .minute(0)
  .second(0)
  .millisecond(0);
const timeToTomorrow = tomorrow.diff(dayjs()); //diff between tomorrow 8am and now in ms
const frequency = 24 * 60 * 60 * 1000; // 24 hours in ms

setTimeout(async () => {
  // init birthday check
  const server = commons.find(({ name }) =>
    process.env.DEBUG === "yes" ? name === "test" : name === "prod"
  );
  const channel = await client.channels.fetch(server.randomfloodChannelId);

  console.log("hello, timeoutBirthday");

  wishBirthday(db, channel);

  setInterval(wishBirthday, frequency, db, channel); // Set birthday check every morning @ 8am.
}, timeToTomorrow);

// Discord CLIENT
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
  partials: [
    "CHANNEL", // Required to receive DMs
    "MESSAGE", // MESSAGE && REACTION for role handling
    "REACTION",
  ],
});

client.playlistCachedMessages = []; // Spotify messages cache

client.db = db; // db cache
client.remindme = []; // reminders cache

if (process.env.USE_SPOTIFY === "yes") {
  // Spotify API cache
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: "http://localhost:3001",
  });
  generateSpotifyClient(spotifyApi);
  client.spotifyApi = spotifyApi;
}

const self = process.env.CLIENTID; // get self Discord Id

// Bot event FUNCTIONS
const onMessageHandler = async (message) => {
  // Function triggered for each message sent
  const { channel } = message;

  if (channel.type === "DM") {
    onPrivateMessage(message, client);
  } else {
    const currentServer = commons.find(
      ({ guildId }) => guildId === channel.guild.id
    );
    onPublicMessage(message, client, currentServer, self);
  }
};

// Create an event listener for messages
client.on("messageCreate", onMessageHandler);
client.on("messageUpdate", onMessageUpdate);

client.on("messageReactionAdd", onReactionAdd);
client.on("messageReactionRemove", onReactionRemove);

import { TwitterApi } from 'twitter-api-v2';

client.once("ready", async () => {
  console.log("I am ready!");
  roleInit(client, commons);

  //TWITTER
  const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

  const twitter = twitterClient.v2;

  let params = {
    max_results: 5,
    exclude: ["replies"]
  };

  const andartaTimeline = await twitter.userTimeline("1039418011260727296", params)

  console.log("andartaTimeline", andartaTimeline);

  console.log("data", andartaTimeline.data)

  params = {
    "user.fields": ["profile_image_url", "url", "username"]
  }
  const andartaId = "1039418011260727296";
  const andartaObj = await twitter.user(andartaId, params);
  const andarta = andartaObj.data;
  const { url, name, profile_image_url, username } = andarta;

  const twitterIcon = "https://abs.twimg.com/icons/apple-touch-icon-192x192.png";

  const embed = new MessageEmbed()
    .setAuthor({ name: name, iconURL: profile_image_url, url: url })
    .addFields({ name: "Tweet", value: "insert tweet content here" })
    .setColor("#00ACEE")
    .setFooter({ text: "Twitter", iconURL: twitterIcon })
    .setTimestamp();

  const tweetLink = "https://twitter.com/" + username + "/status/" + andartaId;

  embed.setDescription(`[Tweet link](${tweetLink})`);

  /*
  const server = commons.find(({ name }) =>
    process.env.DEBUG === "yes" ? name === "test" : name === "prod"
  );
  
  const channel = await client.channels.fetch(server.randomfloodChannelId);

  channel.send({ embeds: [embed] });*/
});

// Log our bot in using the token from https://discord.com/developers/applications
client.login(process.env.TOKEN);

/*const andartaTimeline = await twitter.userTimeline("1039418011260727296", params)

console.log("andartaTimeline", andartaTimeline);

console.log("data", andartaTimeline.data)*/


