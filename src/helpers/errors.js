import { EmbedBuilder } from "discord.js";
import { client } from "../bot.js";
import { COMMONS } from "../commons.js";
import { channelSend, fetchGuild, fetchSpamThread } from "./index.js";

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

  //send a spam status and exit
  await channelSend(spamChannel, {
    content: "<@290505766631112714>",
    embeds: [embed],
  });
  process.exit(); //cannot continue the process with an error of this magnitude
};
