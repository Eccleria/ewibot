import { MessageEmbed } from "discord.js";

export const fetchAuditLog = async (guild, auditType) => {
  //fetch the first corresponding audit log
  const fetchedLogs = await guild.fetchAuditLogs({
    limit: 1,
    type: auditType,
  }); //fetch logs
  return fetchedLogs.entries.first(); //return the first
};

export const finishEmbed = async (
  personalityEvent,
  executor,
  embed,
  logChannel,
  text
) => {
  //Finish the embed and send it the embed
  embed.addField(personalityEvent.executor, executor, true); //add the executor section
  if (text) embed.addField(personalityEvent.text, text, false); //if any text (reason or content), add it
  await logChannel.send({ embeds: [embed] }); //send
};

export const getLogChannel = async (commons, eventObject) => {
  const currentServer = commons.find(
    ({ guildId }) => guildId === eventObject.guild.id
  ); //get server local data
  return await eventObject.guild.channels.fetch(currentServer.logChannelId); //return text-channel
};

export const setupEmbed = (color, personality, user, type) => {
  //setup the embed object
  const embed = new MessageEmbed()
    .setColor(color)
    .setTitle(personality.title)
    .setDescription(personality.description)
    .setTimestamp();
  if (type === "tag") embed.addField(personality.author, user.tag, true);
  else embed.addField(personality.author, user.name, true);
  return embed;
};
