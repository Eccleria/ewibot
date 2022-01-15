//eslint-disable-next-line
require("dotenv").config();

import { Client, Intents } from "discord.js";
import SpotifyWebApi from "spotify-web-api-node";
import {
  MessageHandler,
  whichEmote,
  parseLink,
  checkIsOnThread,
  deleteSongFromPlaylist,
} from "./helpers";
import { generateSpotifyClient } from "./spotifyHelper";
import servers from "./servers";

// Create an instance of a Discord client
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

client.playlistCachedMessages = [];

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

const onMessageHandler = async (message) => {
  const { channel, author, content } = message;

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

  MessageHandler(message, content);

  checkIsOnThread(channel, playlistThreadId);

  if (process.env.USE_SPOTIFY === "yes" && channel.id === playlistThreadId) {
    //
    const foundLink = await parseLink(content, client);
    if (foundLink) {
      const { answer, songId } = foundLink;
      const newMessage = await message.reply(answer);
      client.playlistCachedMessages = [
        ...client.playlistCachedMessages,
        { ...newMessage, songId },
      ];
    }
  }
};

const onReactionHandler = async (messageReaction) => {
  const { message, emoji, users } = messageReaction;
  const currentServer = servers.find(
    ({ guildId }) => guildId === message.channel.guild.id
  );

  const { removeFromPlaylistEmoji } = currentServer;

  const foundMessage = client.playlistCachedMessages.find(
    ({ id }) => id === message.id
  );

  if (
    process.env.USE_SPOTIFY === "yes" &&
    foundMessage &&
    emoji.name === removeFromPlaylistEmoji &&
    users.cache
      .map((user) => user.id)
      .includes(message.mentions.users.first().id)
  ) {
    const { songId } = foundMessage;

    const result = await deleteSongFromPlaylist(songId, client);
    client.playlistCachedMessages = client.playlistCachedMessages.filter(
      ({ id }) => id !== message.id
    );
    await message.reply(result);
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
