import dotenv from "dotenv";
dotenv.config();

import dayjs from "dayjs";
import RelativeTime from "dayjs/plugin/relativeTime.js";
import "dayjs/locale/fr.js";
dayjs.extend(RelativeTime);
dayjs.locale("fr");

import { Client, Intents } from "discord.js";
import SpotifyWebApi from "spotify-web-api-node";

import { roleInit } from "./admin/role.js";

import { TwitterApi } from 'twitter-api-v2';

import { join } from "path";
import { Low, JSONFile } from "lowdb";

// helpers imports
import { generateSpotifyClient } from "./helpers/index.js";

import {
  onPrivateMessage,
  onPublicMessage,
  onReactionAdd,
  onReactionRemove,
} from "./listeners.js";

// jsons imports
import { readFileSync } from "fs";
const commons = JSON.parse(readFileSync("static/commons.json"));

// commands imports
import { wishBirthday } from "./commands/birthday.js";
/*import {
  fetchUserProfile,
  fetchUserTimeline,
  setupTwitterEmbed,
  //tweetLink,
} from "./admin/twitter.js";*/

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

client.on("messageReactionAdd", onReactionAdd);
client.on("messageReactionRemove", onReactionRemove);


import { ETwitterStreamEvent } from 'twitter-api-v2';

client.once("ready", async () => {
  console.log("I am ready!");
  roleInit(client, commons);

  //TWITTER
  const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN); //login app
  const twitter = twitterClient.v2; //setup client to v2 api
  client.twitter = twitter;

  const stream = await twitter.searchStream({ expansions: "author_id" });
  /*
  console.log(await twitter.updateStreamRules({
    delete: {
      ids: ['1557837241409572864', '1557837241409572865', "1557837764422418434", "1557837764422418435", "1557839400448450562"],
    },
  }));

  console.log(await twitter.updateStreamRules({
    add: [
      { value: "from:953964541 OR from:1039418011260727296", tag: "from" }
    ]
  }));
  */
  const rules = await twitter.streamRules();
  console.log("rules", rules);
  //{expansions: "author_id"}
  // Awaits for a tweet
  stream.on(
    // Emitted when Node.js {response} emits a 'error' event (contains its payload).
    ETwitterStreamEvent.ConnectionError,
    err => console.log('Connection error!', err),
  );
  //twitter.
  stream.on(
    // Emitted when Node.js {response} is closed by remote or using .close().
    ETwitterStreamEvent.ConnectionClosed,
    () => console.log('Connection has been closed.'),
  );

  stream.on(
    // Emitted when a Twitter payload (a tweet or not, given the endpoint).
    ETwitterStreamEvent.Data,
    eventData => console.log('Twitter has sent something:', eventData),
  );

  stream.on(
    // Emitted when a Twitter sent a signal to maintain connection active
    ETwitterStreamEvent.DataKeepAlive,
    () => console.log('Twitter has a keep-alive packet.'),
  );

  // Enable reconnect feature
  stream.autoReconnect = true;

  /*const yawasay = await twitter.userByUsername("Yawasay");
  console.log("yawasay", yawasay);*/

  /*
  const id = "953964541";
  const andartaId = "1039418011260727296";
  const twitterUser = await fetchUserProfile(client, andartaId);
  const { url, name, profile_image_url, username } = twitterUser.data; //get usefull user data

  console.log("twitterUser", twitterUser);
  console.log("data", url, name, profile_image_url, username)
  const timeline = fetchUserTimeline(client, id);
  console.log("timeline", timeline);

  const embed = setupTwitterEmbed(name, profile_image_url, url);
  //const tLink = tweetLink(username, tweetId);
  const server = commons.find(({ name }) =>
    process.env.DEBUG === "yes" ? name === "test" : name === "prod"
  );
  */

  //embed.setDescription(`[Tweet link](${tLink})`); //add tweet url to embed

  /*
  const channel = await client.channels.fetch(server.randomfloodChannelId);

  channel.send({ embeds: [embed] });
  */
});

// Log our bot in using the token from https://discord.com/developers/applications
client.login(process.env.TOKEN);
