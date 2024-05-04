import dotenv from "dotenv";
dotenv.config();

import dayjs from "dayjs";
import RelativeTime from "dayjs/plugin/relativeTime.js";
import "dayjs/locale/fr.js";
dayjs.extend(RelativeTime);
dayjs.locale("fr");

import { Client, GatewayIntentBits, Partials } from "discord.js";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

import { join } from "path";
import SpotifyWebApi from "spotify-web-api-node";

// listeners imports
import {
  onChannelCreate,
  onChannelDelete,
  onChannelUpdate,
  onThreadCreate,
  onThreadDelete,
  onRoleCreate,
  onRoleDelete,
  onRoleUpdate,
  onMessageDelete,
  onMessageUpdate,
  onGuildBanAdd,
  onGuildBanRemove,
  onGuildMemberAdd,
  onGuildMemberRemove,
  onGuildMemberUpdate,
} from "./admin/listeners.js";
import {
  onInteractionCreate,
  onMessageCreate,
  onReactionAdd,
  onReactionRemove,
} from "./listeners.js";

// admin inits
import { setupAlavirien } from "./admin/alavirien.js";
import { roleInit } from "./admin/role.js";
import { initAdminLogClearing } from "./admin/utils.js";

// commands import
import { gamesClientInit } from "./commands/games/games.js";
import { initPollsCollector } from "./commands/polls/pollsCollectors.js";
import { initBirthdays } from "./commands/birthday.js";
import { setGiftTimeoutLoop } from "./commands/gift.js";
import { initReminder } from "./commands/reminder.js";
import { slashCommandsInit } from "./commands/slash.js";

// helpers imports
import { generateSpotifyClient } from "./helpers/index.js";

// jsons import
import { COMMONS } from "./commons.js";

// fun imports
import { setActivity, updateActivity } from "./fun.js";

// DB
const file = join("db", "db.json"); // Use JSON file for storage
const adapter = new JSONFile(file);
const db = new Low(adapter, {});

db.read(); // Read data from JSON file, this will set db.data content
db.wasUpdated = false;

setInterval(async () => {
  // db updater loop, used to centralize db.write()
  if (db.wasUpdated) {
    await db.write();
    db.wasUpdated = false;
  }
}, 10000);

// Discord CLIENT
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
  ],
  partials: [
    Partials.Channel, // Required to receive DMs
    Partials.Message, // MESSAGE && REACTION for role handling
    Partials.Reaction,
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

// Create bot startup
client.once("ready", async () => {
  // Time variables
  const tomorrow = dayjs().add(1, "day").hour(8).minute(0).second(0);
  const tomorrowDiff = tomorrow.diff(dayjs()); //diff between tomorrow 8am and now in ms
  const frequency = 24 * 60 * 60 * 1000; // 24 hours in ms

  // Bot init
  console.log("I am ready!");
  roleInit(client); //role handler init
  setupAlavirien(client, tomorrow, frequency);

  //polls
  client.voteBuffers = {}; //init poll votes buffer
  initPollsCollector(client); //start db polls collectors

  //Ewibot activity
  setActivity(client);
  updateActivity(client);

  //slash commands
  const server =
    process.env.DEBUG === "yes" ? COMMONS.getTest() : COMMONS.getProd();
  const guildId = server.guildId;
  slashCommandsInit(guildId, client); //commands submit to API

  //LOGS
  const tomorrow2Am = tomorrow.hour(2); //tomorrow @ 2am
  const timeTo2Am = tomorrow2Am.diff(dayjs()); //10000; //waiting time in ms
  initAdminLogClearing(client, timeTo2Am); //adminLogs clearing init

  //gift
  setGiftTimeoutLoop(client); //gift timeout loop init

  //reminders
  initReminder(client);

  //birthdays
  initBirthdays(client, tomorrowDiff, frequency);

  //games
  gamesClientInit(client);
});

// Create an event listener for messages
client.on("messageCreate", onMessageCreate);
client.on("messageReactionAdd", onReactionAdd);
client.on("messageReactionRemove", onReactionRemove);

// listener for buttons/modals
client.on("interactionCreate", onInteractionCreate);

// listeners for LOGS
client.on("messageDelete", onMessageDelete);
client.on("messageUpdate", onMessageUpdate);

client.on("roleCreate", onRoleCreate);
client.on("roleDelete", onRoleDelete);
client.on("roleUpdate", onRoleUpdate);

client.on("channelCreate", onChannelCreate);
client.on("channelDelete", onChannelDelete);
client.on("channelUpdate", onChannelUpdate);

client.on("threadCreate", onThreadCreate);
client.on("threadDelete", onThreadDelete);

client.on("guildBanAdd", onGuildBanAdd);
client.on("guildBanRemove", onGuildBanRemove);

client.on("guildMemberAdd", onGuildMemberAdd);
client.on("guildMemberRemove", onGuildMemberRemove);
client.on("guildMemberUpdate", onGuildMemberUpdate);

// Log the bot in
client.login(process.env.TOKEN);
