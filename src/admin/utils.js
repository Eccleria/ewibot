import { MessageEmbed } from "discord.js";

export const fetchAuditLog = async (guild, auditType) => {
  const fetchedLogs = await guild.fetchAuditLogs({
    limit: 1,
    type: auditType,
  });
  return fetchedLogs.entries.first();
};

export const finishEmbed = async (
  personalityEvent,
  fieldValue,
  embed,
  logChannel,
  text
) => {
  embed.addField(personalityEvent.executor, fieldValue, true);
  if (text) embed.addField(personalityEvent.text, text, false);
  await logChannel.send({ embeds: [embed] });
};

export const getLogChannel = async (commons, eventObject) => {
  const currentServer = commons.find(
    ({ guildId }) => guildId === eventObject.guild.id
  );
  return await eventObject.guild.channels.fetch(currentServer.logChannelId);
};

export const setupEmbed = (color, personality, user) => {
  return new MessageEmbed()
    .setColor(color)
    .setTitle(personality.title)
    .setDescription(personality.description)
    .addField(personality.author, user.tag, true);
};
