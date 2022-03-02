import dotenv from "dotenv";
dotenv.config();

import dayjs from "dayjs";
import RelativeTime from "dayjs/plugin/relativeTime.js";
import "dayjs/locale/fr.js";
dayjs.extend(RelativeTime);
dayjs.locale("fr");

import personalities from "./jsons/personalities.json";

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
} from "./helpers/index.js";
import commons from "./jsons/commons.json";
import commands from "./commands/index.js";
import { join } from "path";
import { Low, JSONFile } from "lowdb";
import { wishBirthday } from "./commands/birthday.js";

// DB
const file = join("db", "db.json"); // Use JSON file for storage
const adapter = new JSONFile(file);
const db = new Low(adapter);

db.read(); // Read data from JSON file, this will set db.data content

db.wasUpdated = false;
db.birthdayInitiated = false;

setInterval(async () => { // db updater loop
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
const timeToTomorrow = tomorrow.diff(dayjs());
const frequency = 24 * 60 * 60 * 1000;  // 24 hours in ms

setTimeout(async () => {
  const server = commons.find(({ name }) =>
    process.env.DEBUG === "yes" ? name === "test" : name === "prod"
  );
  const channel = await client.channels.fetch(server.randomfloodChannelId);

  console.log("hello, timeoutBirthday");

  wishBirthday(db, channel);

  setInterval(wishBirthday, frequency, db, channel); // Next birthday check
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
  ],
});

client.playlistCachedMessages = []; // Spotify messages cache

client.db = db;   // db cache
client.remindme = [];   // reminders cache

if (process.env.USE_SPOTIFY === "yes") {  // Spotify API cache
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: "http://localhost:3001",
  });
  generateSpotifyClient(spotifyApi);
  client.spotifyApi = spotifyApi;
}

const self = process.env.CLIENTID;

// Bot PERSONALITY
const PERSONALITY = personalities.normal;

// Bot event FUNCTIONS
const onMessageHandler = async (message) => {
  const { channel, author, content } = message;

  if (channel.type === "DM") {
    onPrivateMessage(message);
  } else {
    const currentServer = commons.find(
      ({ guildId }) => guildId === channel.guild.id
    );

    if (
      author.id === self ||   // ignoring message from himself
      !currentServer ||       // ignoring if wrong guild
      (process.env.DEBUG === "yes" && currentServer.name === "prod")  // ignoring if debug && prod
    )
      return;

    const { playlistThreadId } = currentServer;

    reactionHandler(message, content, currentServer, client); 

    // spotify stuff
    if (process.env.USE_SPOTIFY === "yes" && channel.id === playlistThreadId) {
      checkIsOnThread(channel, playlistThreadId); //add bot if not on thread

      const foundLink = await parseLink(
        content,
        client,
        PERSONALITY.spotify,
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

    // check for command
    const commandName = content.split(" ")[0];
    const command = commands
      .filter(({ admin }) => (admin && isAdmin(author.id)) || !admin) //filter appropriate commands if user has or not admin rigths
      .find(({ name }) => commandName.slice(1) === name);
    if (command && isCommand(commandName)) {
      command.action(message, PERSONALITY.commands, client, currentServer);
    }
  }
};

const onReactionHandler = async (messageReaction) => {
  const { message, emoji, users } = messageReaction;
  const currentServer = commons.find(
    ({ guildId }) => guildId === message.channel.guild.id
  );

  const { removeEmoji } = currentServer;

  const foundMessageSpotify = client.playlistCachedMessages.find(  // found corresponding spotify message
    ({ id }) => id === message.id
  );

  const foundReminder = client.remindme.find( // found corresponding reminder message
    ({ botMessage }) => botMessage.id === message.id
  );

  if (
    foundReminder &&
    emoji.name === removeEmoji &&
    users.cache     // if user reacting is the owner of reminder
      .map((user) => user.id)
      .includes(message.mentions.users.first().id)
  ) {
    try {
      console.log("coucou");
      client.remindme = client.remindme.filter(({ botMessage, timeout }) => {
        if (botMessage.id === message.id) { // if it is the right message
          console.log("salut")
          clearTimeout(timeout);  //cancel timeout
          botMessage.reply(PERSONALITY.commands.reminder.delete);
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
      .map((user) => user.id) // if user reacting is the owner of spotify message
      .includes(message.mentions.users.first().id)
  ) {
    const { songId } = foundMessageSpotify;

    const result = await deleteSongFromPlaylist(
      songId,
      client,
      PERSONALITY.spotify
    );
    client.playlistCachedMessages = client.playlistCachedMessages.filter(
      ({ id }) => id !== message.id
    );
    await message.reply(result);
  }
};

const onPrivateMessage = async (message) => {
  const { author, content } = message;

  if (!isAdmin(author.id)) return;   // If not admin, no rigth to

  const destinationChannelId = content.split(" ")[0];

  const newContent = content.split(" ").slice(1).join(" ");

  try {
    const channel = await client.channels.fetch(destinationChannelId);

    if (channel) {
      channel.sendTyping(); // effect of Ewibot writing
      setTimeout(() => {
        channel.send(newContent);
      }, 2000); // duration
    }
  } catch (e) {
    console.log(e);
  }
};

// Create an event listener for messages
client.on("messageCreate", onMessageHandler);

client.on("messageReactionAdd", onReactionHandler);

client.once("ready", () => {
  console.log("I am ready!");
});

// Log our bot in using the token from https://discord.com/developers/applications
client.login(process.env.TOKEN);
