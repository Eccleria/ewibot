import { MessageEmbed } from "discord.js";
import { removeBirthday, removeIgnoredUser, removeAlavirien } from "../helpers/index.js";

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
  return await eventObject.guild.channels.fetch(currentServer.logChannelId); //return the log channel
};

export const setupEmbed = (color, personality, object, type, auditPerso) => {
  //setup the embed object
  const embed = new MessageEmbed()
    .setColor(color)
    .setTitle(personality.title)
    .setDescription(personality.description)
    .setTimestamp();
  if (type === "tag") {
    //add the user tag if required
    embed.addField(personality.author, object.tag, true);
  } else if (type === "Partial") embed.addField(type, auditPerso.partial)
  else embed.addField(personality.author, object.name, true); //otherwise, add the object name (for channels, roles, ...)
  return embed;
};

export const endAdmin = (
  object,
  log,
  eventPerso,
  logPerso,
  embed,
  logChannel,
  reason,
  diff
) => {
  //if no AuditLog
  console.log("diff", diff)
  if (diff >= 5) {
    finishEmbed(eventPerso, logPerso.tooOld, embed, logChannel);
    return;
  }
  if (!log) {
    finishEmbed(eventPerso, logPerso.noLog, embed, logChannel, reason);
    return;
  }

  const { executor, target } = log;

  if (target.id === object.id) {
    //check if log report the correct kick
    finishEmbed(eventPerso, executor.tag, embed, logChannel, reason);
  } else {
    //if bot or author executed the kick
    finishEmbed(eventPerso, logPerso.noExec, embed, logChannel, reason);
  }
};

export const checkDB = (userId, client) => {
  //check if user is in db for removal
  const db = client.db;

  removeBirthday(userId, db);
  removeIgnoredUser(userId, db);
  removeAlavirien(userId, db);
};
