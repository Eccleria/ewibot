import { EmbedBuilder } from "discord.js";
import { client } from "../bot.js";
import { COMMONS } from "../commons.js";
import { channelSend, fetchGuild, fetchSpamThread, parseIdsIntoPings } from "./index.js";

export const onUncaughtException = async (error) => {
  console.error("Uncaught exception:", error);

  //build spam data
  const server = COMMONS.fetchFromEnv();
  const guild = await fetchGuild(client, server.guildId);
  const spamChannel = await fetchSpamThread(guild);
  console.log(spamChannel);
  const msg = "❌ Uncaught Exception: " + error + "\n**Shutting down**";
  const embed = new EmbedBuilder()
    .setColor(COMMONS.getKO())
    .setDescription(msg);
  const admins = COMMONS.getShared().admins;
  //send a spam status and exit
  await channelSend(spamChannel, {
    content: parseIdsIntoPings(admins),
    embeds: [embed],
  });
  process.exit(); //cannot continue the process with an error of this magnitude
};
