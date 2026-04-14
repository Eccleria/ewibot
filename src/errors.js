import { EmbedBuilder } from "discord.js";
import { channelSend, fetchGuild } from "ewilib";

import { client } from "./bot.js";
import { COMMONS } from "./classes/commons.js";
import { fetchSpamThread, parseIdsIntoPings } from "./helpers/index.js";

export const onUncaughtException = async (error) => {
  console.error("Uncaught exception:", error);
  console.log("message", error.message);
  console.log("name", error.name);
  console.log("cause", error.cause);
  
  //fetch required data
  const server = COMMONS.fetchFromEnv();
  const guild = await fetchGuild(client, server.guildId);
  const spamChannel = await fetchSpamThread(guild);
  const admins = COMMONS.getShared().admins;
  
  //build spam data
  const msg = "❌ Uncaught Exception: " + error + "\n**Shutting down**";
  const embed = new EmbedBuilder()
    .setColor(COMMONS.getKO())
    .setDescription(msg);

  //send a spam status if possible and exit
  try {
    if (spamChannel) {
      await channelSend(spamChannel, {
        content: parseIdsIntoPings(admins),
        embeds: [embed],
      });
    }
  } catch(e) {
    console.error(e);
  } finally {
    //exit whereas status sent or not
    //cannot continue the process with an error of this magnitude
    process.exit();
  }
};
