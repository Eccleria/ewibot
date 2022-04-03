import dotenv from "dotenv";
dotenv.config();

import dayjs from "dayjs";
import RelativeTime from "dayjs/plugin/relativeTime.js";
import "dayjs/locale/fr.js";
dayjs.extend(RelativeTime);
dayjs.locale("fr");

import { Client, Intents } from "discord.js";
import SpotifyWebApi from "spotify-web-api-node";
import { join } from "path";
import { Low, JSONFile } from "lowdb";

// helpers imports
import { generateSpotifyClient } from "./helpers/index.js";

import {
  onPrivateMessage,
  onPublicMessage,
  onRemoveReminderReaction,
  onRemoveSpotifyReaction,
} from "./listeners.js";
// jsons imports
import commons from "../static/commons.json";
// commands imports
import { wishBirthday } from "./commands/birthday.js";
import { initReminder } from "./commands/reminder.js";

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
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
  ],
  partials: [
    "CHANNEL", // Required to receive DMs
  ],
});

client.playlistCachedMessages = []; // Spotify messages cache

client.db = db; // db cache
client.remindme = []; // reminders cache

// Recreate older reminder supressed by bot reboot
setTimeout(
  async () => {
    initReminder(client);
    console.log("try to initiate reminders from db");
  },
  2000,
  client
);

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

const onReactionHandler = async (messageReaction) => {
  const currentServer = commons.find(
    ({ guildId }) => guildId === messageReaction.message.channel.guild.id
  );
  if (messageReaction.message.channel.type === "DM")
    onDMReactionHandler(messageReaction);
  else {
    const { message, emoji, users } = messageReaction;
    const currentServer = servers.find(
      ({ guildId }) => guildId === message.channel.guild.id
    );

    const { removeEmoji } = currentServer;

    const foundMessageSpotify = client.playlistCachedMessages.find(
      ({ id }) => id === message.id
    );

    const foundReminder = client.remindme.find(
      ({ botMessage }) => botMessage.id === message.id
    );

    if (
      foundReminder &&
      emoji.name === removeEmoji &&
      users.cache
        .map((user) => user.id)
        .includes(message.mentions.users.first().id)
    ) {
      try {
        client.remindme = client.remindme.filter(({ botMessage, timeout }) => {
          if (botMessage.id === message.id) {
            clearTimeout(timeout);
            botMessage.reply(PERSONNALITY.commands.reminder.delete);
            removeReminder(client.db, botMessage.id);
            return false;
          }
          return true;
        });
        return;
      } catch (err) {
        console.log(err);
      }
    }

    if (
      process.env.USE_SPOTIFY === "yes" &&
      foundMessageSpotify &&
      emoji.name === removeEmoji &&
      users.cache
        .map((user) => user.id)
        .includes(message.mentions.users.first().id)
    ) {
      const { songId } = foundMessageSpotify;

      const result = await deleteSongFromPlaylist(
        songId,
        client,
        PERSONNALITY.spotify
      );
      client.playlistCachedMessages = client.playlistCachedMessages.filter(
        ({ id }) => id !== message.id
      );
      await message.reply(result);
    }
  }
};

const onDMReactionHandler = async (messageReaction) => {
  const removeEmoji = servers[0].removeEmoji;
  const { emoji, message, users } = messageReaction;

  const foundReminder = client.remindme.filter(
    (reminder) => reminder.botMessageId === message.id
  );
  const usersCollection = await users.fetch();
  if (
    foundReminder &&
    emoji.name === removeEmoji &&
    usersCollection.first().id != self
  ) {
    try {
      client.remindme = client.remindme.filter(async ({ authorId, botMessage, timeout }) => {
        if (botMessage.id === message.id) {
          clearTimeout(timeout);
          try {
            await botMessage.reply(PERSONNALITY.commands.reminder.delete);
          } catch {
            console.log("Changement de paramètres de confidentialité pour l'utilisateur " + `${authorId}`)
          }
          removeReminder(client.db, botMessage.id);
          return false;
        }
        return true;
      });
      return;
    } catch (err) {
      console.log("reminderError", err);
    }
  }
};

const onPrivateMessage = async (message) => {
  const { author, content } = message;

  // Tiitch id, Eccléria id
  if (!isAdmin(author.id)) return;

  const destinationChannelId = content.split(" ")[0];

  const newContent = content.split(" ").slice(1).join(" ");

  onRemoveSpotifyReaction(messageReaction, client, currentServer);

  onRemoveReminderReaction(messageReaction, client, currentServer);
};

// Create an event listener for messages
client.on("messageCreate", onMessageHandler);

client.on("messageReactionAdd", onReactionHandler);

client.once("ready", () => {
  console.log("I am ready!");
});

// Log our bot in using the token from https://discord.com/developers/applications
client.login(process.env.TOKEN);
