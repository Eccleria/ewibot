import { PERSONALITY } from "../personality.js";
import {
  fetchAuditLog,
  finishEmbed,
  getLogChannel,
  setupEmbed,
  endAdmin,
  clientEventUpdateProcess,
} from "./utils.js";

import dayjs from "dayjs";

// jsons imports
import { readFileSync } from "fs";
const commons = JSON.parse(readFileSync("./static/commons.json"));

//LISTENERS

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
  //get personality

  const personality = PERSONALITY.getAdmin();
  const chnUp = personality.channelUpdate;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, newChannel); //get logChannelId
  const embed = setupEmbed("DARK_AQUA", chnUp, newChannel); //setup embed
  const chnLog = await fetchAuditLog(oldChannel.guild, "CHANNEL_UPDATE"); //get auditLog

  //console.log(chnLog);
  console.log(chnLog.target.permissionOverwrites.cache);

  //get client
  const client = newChannel.client;
  const channelUpdate = client.channelUpdate;

  const changePos = [
    "rawPosition",
    oldChannel.rawPosition,
    newChannel.rawPosition,
  ];
  if (changePos[1] !== changePos[2]) {
    //if position change, no AuditLog
    //if timeout, clear it
    const timeout = channelUpdate ? channelUpdate.timeout : null;
    if (timeout) clearTimeout(timeout);

    clientEventUpdateProcess(
      client,
      oldChannel,
      newChannel,
      chnUp,
      auditLog,
      logChannel,
      embed,
      "channel"
    ); //update client data
    return;
  }

  if (chnLog) {
    const changes = chnLog.changes.map((obj) => [obj.key, obj.old, obj.new]);
    const text = changes.reduce((acc, cur) => {
      //create text to send
      return acc + `- ${cur[0]} : ${cur[1]} => ${cur[2]}\n`;
    }, "");

    const logCreationDate = dayjs(chnLog.createdAt);
    const diff = dayjs().diff(logCreationDate, "s");

    endAdmin(
      newChannel,
      chnLog,
      chnUp,
      auditLog,
      embed,
      logChannel,
      text,
      diff
    );
    return;
  }
  endAdmin(newChannel, chnLog, chnUp, auditLog, embed, logChannel);
};

export const onThreadCreate = async (thread, newly) => {
  //handle thread creation
  if (!newly) return; // if not new return

  if (thread.joinable && !thread.joined) await thread.join(); //join thread created

  const personality = PERSONALITY.getAdmin(); //get personality
  const thrCr = personality.threadCreate;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, thread); //get logChannelId
  const embed = setupEmbed("DARK_GREY", thrCr, thread, "tag"); //setup embed
  const thrLog = await fetchAuditLog(thread.guild, "THREAD_CREATE"); //get auditLog

  endAdmin(thread, thrLog, thrCr, auditLog, embed, logChannel);
};

export const onThreadDelete = async (thread) => {
  //handle thread deletion
  const personality = PERSONALITY.getAdmin(); //get personality
  const thrDe = personality.threadDelete;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, thread); //get logChannelId
  const embed = setupEmbed("DARK_GREY", thrDe, thread); //setup embed
  const thrLog = await fetchAuditLog(thread.guild, "THREAD_DELETE"); //get auditLog

  endAdmin(thread, thrLog, thrDe, auditLog, embed, logChannel);
}

export const onThreadUpdate = async (oldThread, newThread) => {
  //handle thread update
  const personality = PERSONALITY.getAdmin(); //get personality
  const thrUp = personality.threadUpdate;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, newThread); //get logChannelId
  const embed = setupEmbed("DARK_GREY", thrUp, newThread); //setup embed
  const thrLog = await fetchAuditLog(newThread.guild, "THREAD_UPDATE"); //get auditLog

  endAdmin(newThread, thrLog, thrUp, auditLog, embed, logChannel);
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

  //get client
  const client = newRole.client;
  const roleUpdate = client.roleUpdate;

  const changePos = [
    "rawPosition",
    oldRole.rawPosition,
    newRole.rawPosition,
  ];
  if (changePos[1] !== changePos[2]) {
    //if position change, no AuditLog
    //if timeout, clear it
    const timeout = roleUpdate ? roleUpdate.timeout : null;
    if (timeout) clearTimeout(timeout);

    clientEventUpdateProcess(
      client,
      oldRole,
      newRole,
      roleUp,
      auditLog,
      logChannel,
      embed,
      "role"
    ); //update client data
    return;
  }

  const roleLog = await fetchAuditLog(newRole.guild, "ROLE_UPDATE"); //get auditLog

  if (roleLog !== null) {
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

    //get log creation date and compare to now
    const logCreationDate = dayjs(roleLog.createdAt);
    const diff = dayjs().diff(logCreationDate, "s");

    endAdmin(newRole, roleLog, roleUp, auditLog, embed, logChannel, text, diff);
  }
  endAdmin(newRole, roleLog, roleUp, auditLog, embed, logChannel);
};

export const onMessageDelete = async (message) => {
  // handle message deleted event
  if (!message.guild) return; //Ignore DM

  const personality = PERSONALITY.getAdmin(); //get personality
  const messageDel = personality.messageDelete;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, message); //get logChannel
  const date = message.createdAt.toString().slice(4, 24);
  if (message.partial) {
    //if the message is partial and deleted, no possibility to fetch
    //so only partial data
    console.log("partial message deleted", date);
    return;
  }

  const embed = setupEmbed("DARK_RED", messageDel, message.author, "tag"); //setup embed
  embed.addField(messageDel.date, `${date}`, true); //date of message creation
  embed.addField(messageDel.channel, `<#${message.channelId}>`, true); //message channel
  const deletionLog = await fetchAuditLog(message.guild, "MESSAGE_DELETE"); //get auditLog

  //get message data
  const content = message.content ? message.content : messageDel.note;
  const attachments = message.attachments.reduce((acc, cur) => {
    return [...acc, cur.attachment];
  }, []);
  const embeds = message.embeds.reduce(
    (acc, cur) => {
      return [...acc, cur];
    },
    [embed]
  );

  //if no AuditLog
  if (!deletionLog) {
    await finishEmbed(
      messageDel,
      auditLog.noLog,
      embeds,
      logChannel,
      content,
      attachments
    );
    return;
  }

  const { executor, target } = deletionLog;

  if (target.id === message.author.id) {
    //check if log report the correct user banned
    await finishEmbed(
      messageDel,
      executor.tag,
      embeds,
      logChannel,
      content,
      attachments
    );
  } else {
    //if bot or author deleted the message
    await finishEmbed(
      messageDel,
      auditLog.noExec,
      embeds,
      logChannel,
      content,
      attachments
    );
  }
};

export const onMessageUpdate = async (oldMessage, newMessage) => {
  //handle message update event
  if (!oldMessage.guild) return; //Ignore DM

  //check for thread creation from message
  if (!oldMessage.hasThread && newMessage.hasThread) {
    const message = await newMessage.fetch(); //fetch the message for thread data
    onThreadCreate(message.thread, true); //use dedicated listener
    return;
  }

  const personality = PERSONALITY.getAdmin(); //get personality
  const messageU = personality.messageUpdate;

  const logChannel = await getLogChannel(commons, newMessage); //get logChannel
  const date = oldMessage.createdAt.toString().slice(4, 24);

  if (oldMessage.partial || newMessage.partial) {
    //if message partial and deleted, unfetchable, only partial data
    console.log("partial message modified", date);
    return;
  }

  const embed = setupEmbed("DARK_GREEN", messageU, newMessage.author, "tag"); //setup embed
  //no auditLog when message update

  //add creation date + channel
  embed.addField(messageU.date, `${date}`, true); //date of message creation
  embed.addField(messageU.channel, `<#${oldMessage.channelId}>`, true); //message channel

  //check for content modif
  const oldContent = oldMessage.content;
  const newContent = newMessage.content;

  //filter changes, if < 2 length => return
  if (Math.abs(oldContent.length - newContent.length) <= 2) return;

  if (oldContent !== newContent) {
    console.log("oldContent", [oldContent], "newContent", [newContent]);
    if (oldContent.length !== 0)
      embed.addField(messageU.contentOld, oldContent);
    if (newContent.length !== 0)
      embed.addField(messageU.contentNew, newContent);
  }

  //check for objects changes
  const attachments = oldMessage.attachments.reduce((acc, cur) => {
    if (newMessage.attachments.findKey((obj) => obj.id === cur.id) !== cur.id)
      return [...acc, cur.attachment];
  }, []); //check for attachments

  const oldEmbeds = oldMessage.embeds;
  const newEmbeds = newMessage.embeds;

  let embeds;
  try {
    embeds = oldEmbeds.length !== 0 && newEmbeds.length !== 0
      ? oldEmbeds.reduce(
        (acc, cur, idx) => {
          if (!cur.equals(newMessage.embeds[idx])) return [...acc, cur];
          return acc;
        },
        [embed]
      )
      : [embed]; //check for embeds. It includes link integration
  }
  catch (e) {
    console.log("onMessageUpdate", e)
    embeds = [embed];
  }

  //add message link
  const link = `[${messageU.linkMessage}](${newMessage.url})`;
  embed.addField(messageU.linkName, link);
  finishEmbed(messageU, null, embeds, logChannel, null, attachments);
};

export const onGuildBanAdd = async (userBan) => {
  console.log("member banned from Discord Server");

  const personality = PERSONALITY.getAdmin(); //get personality
  const guildBan = personality.guildBan;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, userBan); //get logChannel
  const embed = setupEmbed("DARK_NAVY", guildBan, userBan.user, "tag"); //setup embed
  const banLog = await fetchAuditLog(userBan.guild, "MEMBER_BAN_ADD"); //get auditLog
  const reason = userBan.reason; //get ban reason

  endAdmin(userBan, banLog, guildBan, auditLog, embed, logChannel, reason);
};

export const onGuildBanRemove = async (userBan) => {
  console.log("member unbanned from Discord Server");

  const personality = PERSONALITY.getAdmin(); //get personality
  const guildUnban = personality.guildUnban;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, userBan); //get logChannel
  const embed = setupEmbed("DARK_NAVY", guildUnban, userBan.user, "tag"); //setup embed
  const banLog = await fetchAuditLog(userBan.guild, "MEMBER_BAN_REMOVE"); //get auditLog
  const reason = userBan.reason; //get ban reason

  endAdmin(userBan, banLog, guildUnban, auditLog, embed, logChannel, reason);
};

export const onGuildMemberUpdate = async (oldMember, newMember) => {
  //check if timeout added or removed
  //const oldIsTimeout = oldMember.isCommunicationDisabled();
  const newIsTimeout = newMember.isCommunicationDisabled();

  if (!newIsTimeout) return; // if no timeout added => return
  console.log("member timeout add");

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
  console.log("member kicked from/left Discord Server");

  const userKick = memberKick.user;

  const personality = PERSONALITY.getAdmin(); //get personality
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, memberKick); //get logChannel
  const kickLog = await fetchAuditLog(memberKick.guild, "MEMBER_KICK"); //get auditLog
  const reason = kickLog ? kickLog.reason : null; //get ban reason
  console.log("kickLog", kickLog)

  //get log creation date and compare to now
  const logCreationDate = kickLog ? dayjs(kickLog.createdAt) : null;
  const diff = logCreationDate !== null ? dayjs().diff(logCreationDate, "s") : null;

  //get user roles
  const roles = memberKick.roles.cache;
  const textRoles = roles.size !== 0 ? roles.reduce((acc, cur) => `${acc}${cur.toString()}\n`, "") : null;

  if (diff >= 5) {
    //log too old => not kicked but left
    const guildKick = personality.guildKick.leave;
    const embed = setupEmbed("DARK_PURPLE", guildKick, userKick, "tag"); //setup embed
    if (textRoles) embed.addField(guildKick.roles, textRoles, true); //add user roles if any
    endAdmin(userKick, kickLog, guildKick, auditLog, embed, logChannel);
    return;
  }

  const guildKick = personality.guildKick.kick;
  const embed = setupEmbed("DARK_PURPLE", guildKick, userKick, "tag"); //setup embed
  if (textRoles) embed.addField(guildKick.roles, textRoles); //add user roles if any
  endAdmin(
    userKick,
    kickLog,
    guildKick,
    auditLog,
    embed,
    logChannel,
    reason,
    diff
  );
};
