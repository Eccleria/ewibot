import dayjs from "dayjs";
import CustomParseFormat from "dayjs/plugin/customParseFormat.js";
import "dayjs/locale/fr.js";
dayjs.locale("fr");
dayjs.extend(CustomParseFormat);

import { PERSONALITY } from "../personality.js";
import {
  fetchAuditLog,
  finishEmbed,
  getLogChannel,
  setupEmbed,
  endAdmin,
  checkDB,
} from "./utils.js";
import { roleRemove, roleAdd } from "./role.js"
import {
  addAlavirien,
} from "../helpers/index.js"
import {
  onRemoveReminderReaction,
  onRemoveSpotifyReaction,
} from "../listeners.js"

// jsons imports
import { readFileSync } from "fs";
const commons = JSON.parse(readFileSync("./static/commons.json"));

export const onChannelCreate = async (channel) => {
  const type = channel.type;
  if (type === "DM") return;

  const personality = PERSONALITY.getAdmin(); //get personality
  const chnCr = personality.channelCreate;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, channel); //get logChannelId
  const embed = setupEmbed("DARK_AQUA", chnCr, channel); //setup embed
  const chnLog = await fetchAuditLog(channel.guild, "CHANNEL_CREATE"); //get auditLog

  endAdmin(channel, chnLog, chnCr, auditLog, embed, logChannel);
};

export const onChannelDelete = async (channel) => {
  const type = channel.type;
  if (type === "DM") return;

  const personality = PERSONALITY.getAdmin(); //get personality
  const chnDe = personality.channelDelete;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, channel); //get logChannelId
  const embed = setupEmbed("DARK_AQUA", chnDe, channel); //setup embed
  const chnLog = await fetchAuditLog(channel.guild, "CHANNEL_DELETE"); //get auditLog

  endAdmin(channel, chnLog, chnDe, auditLog, embed, logChannel);
};

export const onChannelUpdate = async (oldChannel, newChannel) => {
  //handle channel update event
  const personality = PERSONALITY.getAdmin(); //get personality
  const chnUp = personality.channelUpdate;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, newChannel); //get logChannelId
  const embed = setupEmbed("DARK_AQUA", chnUp, newChannel); //setup embed
  const chnLog = await fetchAuditLog(oldChannel.guild, "CHANNEL_UPDATE"); //get auditLog

  //if position change, no AuditLog
  const changePos = [
    "rawPosition",
    oldChannel.rawPosition,
    newChannel.rawPosition,
  ];
  if (changePos[1] !== changePos[2]) {
    const text = `- ${changePos[0]} : ${changePos[1]} => ${changePos[2]}\n`;
    await finishEmbed(chnUp, auditLog.noLog, embed, logChannel, text);
    return;
  }

  const changes = chnLog.changes.map((obj) => [obj.key, obj.old, obj.new]);
  const text = changes.reduce((acc, cur) => {
    //create log to send
    return acc + `- ${cur[0]} : ${cur[1]} => ${cur[2]}\n`;
  }, "");

  endAdmin(newChannel, chnLog, chnUp, auditLog, embed, logChannel, text);
};

export const onRoleCreate = async (role) => {
  const personality = PERSONALITY.getAdmin(); //get personality
  const roleCr = personality.roleCreate;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, role); //get logChannelId
  const embed = setupEmbed("DARK_GOLD", roleCr, role); //setup embed
  const roleLog = await fetchAuditLog(role.guild, "ROLE_CREATE"); //get auditLog

  endAdmin(role, roleLog, roleCr, auditLog, embed, logChannel);
};

export const onRoleDelete = async (role) => {
  const personality = PERSONALITY.getAdmin(); //get personality
  const roleDe = personality.roleDelete;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, role); //get logChannelId
  const embed = setupEmbed("DARK_GOLD", roleDe, role); //setup embed
  const roleLog = await fetchAuditLog(role.guild, "ROLE_DELETE"); //get auditLog

  endAdmin(role, roleLog, roleDe, auditLog, embed, logChannel);
};

export const onRoleUpdate = async (oldRole, newRole) => {
  //handle role update event

  const personality = PERSONALITY.getAdmin(); //get personality
  const roleUp = personality.roleUpdate;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, newRole); //get logChannelId
  const embed = setupEmbed("DARK_GOLD", roleUp, newRole); //setup embed
  const roleLog = await fetchAuditLog(newRole.guild, "ROLE_UPDATE"); //get auditLog

  //get all data to compare
  const changes = roleLog.changes.map((obj) => {
    if (obj.key === "permissions")
      return [
        obj.key,
        oldRole.permissions.missing(newRole.permissions),
        newRole.permissions.missing(oldRole.permissions),
      ];
    //compare both roles to get only changes and not all data.
    else return [obj.key, obj.old, obj.new];
  });

  //create log to send
  const text = changes.reduce((acc, cur) => {
    //if permissions, get permissions removed and added
    if (cur[0] === "permissions") {
      const draft1 =
        cur[1].length === 0 ? "" : `${roleUp.new} ${cur[1].join(", ")}`; //[new permissions]
      const draft2 =
        cur[2].length === 0 ? "" : `${roleUp.old} ${cur[2].join(", ")}`; //[removed permissions]
      return acc + `${roleUp.permission}` + `${draft1}` + `${draft2}\n`;
    } else return acc + `- ${cur[0]} : ${cur[1]} => ${cur[2]}\n`;
  }, "");

  endAdmin(newRole, roleLog, roleUp, auditLog, embed, logChannel, text);
};

export const onMessageDelete = async (message) => {
  // handle message deleted event
  if (!message.guild) return; //Ignore DM

  const personality = PERSONALITY.getAdmin(); //get personality
  const messageDel = personality.messageDelete;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, message); //get logChannel
  if (message.partial) {
    //if the message is partial and deleted, no possibility to fetch
    //so only partial data
    const embed = setupEmbed("DARK_RED", messageDel, null, "Partial", auditLog); //setup embed
    if (message.createdAt) embed.addField(
      messageDel.date,
      `${message.createdAt.toString().slice(4, 24)}`,
      true
    ); //date of message creation
    await logChannel.send({ embeds: [embed] }); //send
    return;
  }
  const embed = setupEmbed("DARK_RED", messageDel, message.author, "tag"); //setup embed
  embed.addField(
    messageDel.date,
    `${message.createdAt.toString().slice(4, 24)}`,
    true
  ); //date of message creation
  const deletionLog = await fetchAuditLog(message.guild, "MESSAGE_DELETE"); //get auditLog

  //get message data
  const content = message.content ? message.content : messageDel.note;
  const attachments = message.attachments.reduce((acc, cur) => {
    return [...acc, cur.attachment];
  }, []);
  const embedAttached = message.embeds.reduce((acc, cur) => {
    return [...acc, cur];
  }, []);

  //if no AuditLog
  if (!deletionLog) {
    await finishEmbed(messageDel, auditLog.noLog, embed, logChannel, content);
    if (embedAttached.length !== 0)
      await logChannel.send({ embeds: embedAttached });
    if (attachments.length) await logChannel.send({ files: attachments });
    return;
  }

  const { executor, target } = deletionLog;

  if (target.id === message.author.id) {
    //check if log report the correct user banned
    await finishEmbed(messageDel, executor.tag, embed, logChannel, content);
    if (embedAttached.length !== 0)
      await logChannel.send({ embeds: embedAttached });
    if (attachments.length) await logChannel.send({ files: attachments });
  } else {
    //if bot or author deleted the message
    await finishEmbed(messageDel, auditLog.noExec, embed, logChannel, content);
    if (embedAttached.length !== 0)
      await logChannel.send({ embeds: embedAttached });
    if (attachments.length) await logChannel.send({ files: attachments });
  }
};

export const onGuildBanAdd = async (userBan) => {
  console.log("member banned from Discord Server");

  const personality = PERSONALITY.getAdmin(); //get personality
  const guildBan = personality.guildBan;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, userBan); //get logChannel
  const embed = setupEmbed("DARK_NAVY", guildBan, userBan.user); //setup embed
  const banLog = await fetchAuditLog(userBan.guild, "MEMBER_BAN_ADD"); //get auditLog
  const reason = userBan.reason; //get ban reason

  endAdmin(userBan, banLog, guildBan, auditLog, embed, logChannel, reason);
};

export const onGuildMemberUpdate = async (oldMember, newMember) => {
  //check if timeout added or removed
  const oldIsTimeout = oldMember.isCommunicationDisabled();
  const newIsTimeout = newMember.isCommunicationDisabled();
  console.log(oldIsTimeout, newIsTimeout);
  if (!newIsTimeout) return; // if no timeout added => return

  const user = newMember.user;

  const personality = PERSONALITY.getAdmin(); //get personality
  const timeout = personality.timeout;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, newMember); //get logChannel
  const embed = setupEmbed("ORANGE", timeout, user, "tag"); //setup embed
  const timeoutLog = await fetchAuditLog(newMember.guild, "MEMBER_UPDATE"); //get auditLog
  const reason = timeoutLog.reason; //get ban reason

  const timeoutUntil = dayjs(newMember.communicationDisabledUntil);
  const timeoutDuration = timeoutUntil.diff(dayjs(), "s");
  embed.addField(timeout.duration, timeoutDuration.toString(), true); //date of message creation

  endAdmin(user, timeoutLog, timeout, auditLog, embed, logChannel, reason);
};

export const onGuildMemberRemove = async (memberKick) => {
  //handle guildMember kicked or leaving the server
  console.log("member kicked from Discord Server");

  const userKick = memberKick.user;

  const personality = PERSONALITY.getAdmin(); //get personality
  const guildKick = personality.guildKick;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, memberKick); //get logChannel
  const embed = setupEmbed("DARK_PURPLE", guildKick, userKick, "tag"); //setup embed
  const kickLog = await fetchAuditLog(memberKick.guild, "MEMBER_KICK"); //get auditLog
  const reason = kickLog.reason; //get ban reason

  const logCreationDate = dayjs(kickLog.createdAt);
  const diff = dayjs().diff(logCreationDate, "s");

  endAdmin(userKick, kickLog, guildKick, auditLog, embed, logChannel, reason, diff);

  checkDB(userKick.id, memberKick.client);
};

export const onReactionAdd = async (messageReaction, user) => {
  // Function triggered for each reaction added
  const currentServer = commons.find(
    ({ guildId }) => guildId === messageReaction.message.channel.guild.id
  );

  if (currentServer.roleHandle.messageId === messageReaction.message.id)
    await roleAdd(messageReaction, currentServer, user);

  onRemoveSpotifyReaction(messageReaction, currentServer);

  onRemoveReminderReaction(messageReaction, currentServer);
};

export const onReactionRemove = async (messageReaction, user) => {
  const currentServer = commons.find(
    ({ guildId }) => guildId === messageReaction.message.channel.guild.id
  );

  if (currentServer.roleHandle.messageId === messageReaction.message.id)
    await roleRemove(messageReaction, currentServer, user);
};

export const onGuildMemberAdd = async (guildMember) => {
  const db = guildMember.client.db;
  const authorId = guildMember.id;
  const date = guildMember.joinedAt.toISOString()
  addAlavirien(db, authorId, 0, date);
}
