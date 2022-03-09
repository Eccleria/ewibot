import dotenv from "dotenv";
dotenv.config();

import dayjs from "dayjs";
import RelativeTime from "dayjs/plugin/relativeTime.js";
import "dayjs/locale/fr.js";
dayjs.extend(RelativeTime);
dayjs.locale("fr");

import personnalities from "./personnalities.json";

import { Client, Intents } from "discord.js";
import SpotifyWebApi from "spotify-web-api-node";
import {
  isAdmin,
  isCommand,
  reactionHandler,
  parseLink,
  checkIsOnThread,
  deleteSongFromPlaylist,
  generateSpotifyClient,
  isUserMessagesCounted,
  addUserMessageCount,
} from "./helpers/index.js";
import servers from "./servers.json";
import commands from "./commands/index.js";
import { join } from "path";
import { Low, JSONFile } from "lowdb";
import { wishBirthday } from "./commands/birthday.js";
import { sendCount } from "./commands/messageCount.js";

// Use JSON file for storage
const file = join("db", "db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);
// Read data from JSON file, this will set db.data content
db.read();

db.wasUpdated = false;
db.birthdayInitiated = false;

setInterval(async () => {
  if (db.wasUpdated) {
    await db.write();
    db.wasUpdated = false;
  }
}, 10000);

const tomorrow = dayjs()
  .add(1, "day")
  .hour(8)
  .minute(0)
  .second(0)
  .millisecond(0);
const timeToTomorrow = tomorrow.diff(dayjs());

const frequency = 24 * 60 * 60 * 1000;

setTimeout(async () => {
  const server = servers.find(({ name }) =>
    process.env.DEBUG === "yes" ? name === "test" : name === "prod"
  );
  const channel = await client.channels.fetch(server.randomfloodChannelId);

  console.log("hello, timeoutBirthday");

  wishBirthday(db, channel);

  setInterval(wishBirthday, frequency, db, channel); // 24 hours, in ms
}, timeToTomorrow);

// Create an instance of a Discord client
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
  ],
});

client.playlistCachedMessages = [];

client.db = db;
client.remindme = [];

if (process.env.USE_SPOTIFY === "yes") {
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: "http://localhost:3001",
  });
  generateSpotifyClient(spotifyApi);
  client.spotifyApi = spotifyApi;
}

const self = process.env.CLIENTID;

const PERSONNALITY = personnalities.normal;

const onMessageHandler = async (message) => {
  const { channel, author, content } = message;

  if (channel.type === "DM") {
    onPrivateMessage(message);
  } else {
    const currentServer = servers.find(
      ({ guildId }) => guildId === channel.guild.id
    );

    // ignoring message from himself
    if (
      author.id === self ||
      !currentServer ||
      (process.env.DEBUG === "yes" && currentServer.name === "prod")
    )
      return;

    const { playlistThreadId } = currentServer;

    reactionHandler(message, content, currentServer, client);

    if (process.env.USE_SPOTIFY === "yes" && channel.id === playlistThreadId) {
      checkIsOnThread(channel, playlistThreadId);

      //
      const foundLink = await parseLink(
        content,
        client,
        PERSONNALITY.spotify,
        currentServer
      );
      if (foundLink) {
        const { answer, songId } = foundLink;
        const newMessage = await message.reply(answer);
        if (songId) await newMessage.react(currentServer.removeEmoji);
        client.playlistCachedMessages = [
          ...client.playlistCachedMessages,
          { ...newMessage, songId },
        ];
      }
    }

    if (isUserMessagesCounted(client.db, author.id)) {
      addUserMessageCount(client.db, author.id, 1);
      sendCount(message, PERSONNALITY.commands, client);
    }

    const commandName = content.split(" ")[0];
    const command = commands
      .filter(({ admin }) => (admin && isAdmin(author.id)) || !admin)
      .find(({ name }) => commandName.slice(1) === name);
    if (command && isCommand(commandName)) {
      command.action(message, PERSONNALITY.commands, client, currentServer);
    }
  }
};

const onReactionHandler = async (messageReaction) => {
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
};

const onPrivateMessage = async (message) => {
  const { author, content } = message;

  // Tiitch id, Eccléria id
  if (!isAdmin(author.id)) return;

  const destinationChannelId = content.split(" ")[0];

  const newContent = content.split(" ").slice(1).join(" ");

  try {
    const channel = await client.channels.fetch(destinationChannelId);

    if (channel) {
      channel.sendTyping();
      setTimeout(() => {
        channel.send(newContent);
      }, 2000);
    }
  } catch (e) {
    console.log(e);
  }
};

// Create an event listener for messages
client.on("messageCreate", onMessageHandler);

client.on("messageReactionAdd", onReactionHandler);

//client.on("", onPrivateMessage);

client.once("ready", () => {
  console.log("I am ready!");
});

// Log our bot in using the token from https://discord.com/developers/applications
client.login(process.env.TOKEN);
