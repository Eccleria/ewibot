import dayjs from "dayjs";
import RelativeTime from "dayjs/plugin/relativeTime.js";
import "dayjs/locale/fr.js";
dayjs.extend(RelativeTime);
dayjs.locale("fr");

import { Client, Intents } from "discord.js";
import SpotifyWebApi from "spotify-web-api-node";

import { roleInit } from "./admin/role.js";

import { join } from "path";
import { Low, JSONFile } from "lowdb";

// helpers imports
import { generateSpotifyClient } from "./helpers/index.js";

// listeners imports
import {
  onPrivateMessage,
  onPublicMessage,
} from "./listeners.js"
import {
  onChannelCreate,
  onChannelDelete,
  onChannelUpdate,
  onReactionAdd,
  onReactionRemove,
  onRoleCreate,
  onRoleDelete,
  onRoleUpdate,
  onMessageDelete,
  onGuildBanAdd,
  onGuildMemberAdd,
  onGuildMemberRemove,
  onGuildMemberUpdate,
} from "./admin/listeners.js";

//alavirien import
import { checkAlavirien } from "./admin/alavirien.js";

// json import
import { readFileSync } from "fs";
const commons = JSON.parse(readFileSync("static/commons.json"));

// command import
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
const timeToTomorrowBD = tomorrow.diff(dayjs()); //diff between tomorrow 8am and now in ms
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
}, timeToTomorrowBD);

//ALAVIRIEN
const timeToTomorrowAlavirien = tomorrow.minute(5).diff(dayjs());

setTimeout(async () => {
  console.log("Alavirien check");

  const server = commons.find(({ name }) =>
    process.env.DEBUG === "yes" ? name === "test" : name === "prod"
  );
  const logChannel = await client.channels.fetch(server.logChannelId);
  checkAlavirien(client, server, logChannel);

  setInterval(() => checkAlavirien, frequency, client, server, logChannel)
}, timeToTomorrowAlavirien);

// Discord CLIENT
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
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

// Create event LISTENERS
client.once("ready", () => {
  console.log("I am ready!");
  roleInit(client, commons);
});

client.on("messageCreate", onMessageHandler);
client.on("messageDelete", onMessageDelete);

client.on("messageReactionAdd", onReactionAdd);
client.on("messageReactionRemove", onReactionRemove);

client.on("roleCreate", onRoleCreate);
client.on("roleDelete", onRoleDelete);
client.on("roleUpdate", onRoleUpdate);

client.on("channelCreate", onChannelCreate);
client.on("channelDelete", onChannelDelete);
client.on("channelUpdate", onChannelUpdate);

client.on("guildBanAdd", onGuildBanAdd);

client.on("guildMemberAdd", onGuildMemberAdd);
client.on("guildMemberRemove", onGuildMemberRemove);
client.on("guildMemberUpdate", onGuildMemberUpdate);

// Log our bot in using the token from https://discord.com/developers/applications
client.login(process.env.TOKEN);
