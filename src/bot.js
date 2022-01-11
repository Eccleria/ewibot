//eslint-disable-next-line
require("dotenv").config();

import { Client, Intents } from "discord.js";

import SpotifyWebApi from "spotify-web-api-node";

import { isApologies, isYoutubeLink } from "./helpers";
import { generateSpotifyClient } from "./spotifyHelper";

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: "http://localhost:3001",
});

// Create an instance of a Discord client
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

generateSpotifyClient(spotifyApi);

client.spotifyApi = spotifyApi;

const envs = [
  {
    // test env
    name: "test",
    guildId: "926909708072284170",
    playlistThreadId: "926909785117429861",
    panDuomReactId: "😊",
  },
  {
    name: "prod",
    guildId: "816961245743808582",
    playlistThreadId: "892785771541585980",
    panDuomReactId: "826036478672109588",
  },
];

const self = process.env.CLIENTID;

const onMessageHandler = async (message) => {
  const { channel, author, content } = message;

  const currentEnv = envs.find(({ guildId }) => guildId === channel.guild.id);

  // ignoring message from himself
  if (
    author.id === self ||
    !currentEnv ||
    (process.env.DEBUG === "yes" && currentEnv.name === "prod")
  )
    return;

  const { panDuomReactId, playlistThreadId } = currentEnv;

  if (isApologies(content.toLowerCase())) {
    message.react(panDuomReactId);
  }

  const thread = channel.isThread
    ? null
    : channel.threads.cache.find((x) => x.id === playlistThreadId);
  if (thread && thread.joinable) await thread.join();

  if (channel.id === playlistThreadId) {
    //
    const foundLink = await isYoutubeLink(content, client);
    if (foundLink) message.reply(`${foundLink}`);
  }
};

// Create an event listener for messages
client.on("messageCreate", onMessageHandler);

client.once("ready", () => {
  console.log("I am ready!");
});

// Log our bot in using the token from https://discord.com/developers/applications
client.login(process.env.TOKEN);
