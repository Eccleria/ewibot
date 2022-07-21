import { PERSONALITY } from "../personality.js";
import {
  fetchAuditLog,
  finishEmbed,
  getLogChannel,
  setupEmbed,
  endAdmin,
  clientEventUpdateProcess,
  fetchMessage,
  gifRecovery,
} from "./utils.js";
import {
  hasApology,
  sanitizePunctuation,
  addApologyCount,
} from "../helpers/index.js"

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
  const perm = chnUp.permissionOverwrites;

  //basic operations
  const logChannel = await getLogChannel(commons, newChannel); //get logChannelId
  const embed = setupEmbed("DARK_AQUA", chnUp, newChannel, "tag"); //setup embed
  const chnLog = await fetchAuditLog(oldChannel.guild, "CHANNEL_UPDATE"); //get auditLog

  //check for permission overwrite
  const oldOverwrite = oldChannel.permissionOverwrites.cache;
  const newOverwrite = newChannel.permissionOverwrites.cache;
  const diffOverwrite = oldOverwrite.difference(newOverwrite);

  if (diffOverwrite.size !== 0) {
    //add/removed permission orverwrite
    const [oldDiffCol, newDiffCol] = diffOverwrite.partition((perm) =>
      oldOverwrite.has(perm.id)
    ); //separate old & new permissions

    if (oldDiffCol.size !== 0) {
      //removed permission overwrite
      const oldDiff = oldDiffCol.first();
      const id = oldDiff.id; //get PO target id
      const obj =
        oldDiff.type === "member"
          ? await oldChannel.guild.members.fetch(id)
          : await oldChannel.guild.roles.fetch(id);
      const name =
        oldDiff.type === "member" ? perm.userRemoved : perm.roleRemoved;

      embed.addField(name, obj.toString());
      finishEmbed(chnUp, null, embed, logChannel);
      return;
    } else if (newDiffCol.size !== 0) {
      //added permission overwrite
      const newDiff = newDiffCol.first();
      const id = newDiff.id; //get PO target id
      const obj =
        newDiff.type === "member"
          ? await newChannel.guild.members.fetch(id)
          : await newChannel.guild.roles.fetch(id);
      const name = newDiff.type === "member" ? perm.userAdded : perm.roleAdded;

      embed.addField(name, obj.toString());
      finishEmbed(chnUp, null, embed, logChannel);
      return;
    }
  }
  if (!oldOverwrite.equals(newOverwrite)) {
    //if permissionOverwrite changed without add/remove role/user
    //sort by id
    oldOverwrite.sort((a, b) => a.id - b.id);
    newOverwrite.sort((a, b) => a.id - b.id);

    //find PO difference by couple
    const diff = oldOverwrite.reduce((acc, cur) => {
      const newPO = newOverwrite.get(cur.id);
      if (
        cur.deny.bitfield !== newPO.deny.bitfield ||
        cur.allow.bitfield !== newPO.allow.bitfield
      )
        return [...acc, [cur, newPO]];
      else return acc;
    }, []);

    //get bit diff, write it along channel.toString()
    const modifs = await diff.reduce(async (acc, cur) => {
      //data: [[old, new], ...]
      const oldAllow = cur[0].allow.toArray();
      const oldDeny = cur[0].deny.toArray();
      const newAllow = cur[1].allow.toArray();
      const newDeny = cur[1].deny.toArray();

      //get permissions differences
      const allowRemoved = oldAllow.filter((perm) => !newAllow.includes(perm)); //if not in new => removed
      const allowAdded = newAllow.filter((perm) => !oldAllow.includes(perm)); //if not in old => added
      const denyRemoved = oldDeny.filter((perm) => !newDeny.includes(perm)); //if not in new => removed
      const denyAdded = newDeny.filter((perm) => !oldDeny.includes(perm)); //if not in old => added

      //get longer between combos
      //allowRemoved/denyAdded, allowAdded/denyRemoved
      const added =
        allowAdded.length >= denyRemoved.length ? allowAdded : denyRemoved;
      const removed =
        allowRemoved.length >= denyAdded.length ? allowRemoved : denyAdded;

      //get role or member having that PO
      const obj =
        cur[0].type === "member"
          ? await newChannel.guild.members.fetch(cur[0].id)
          : await newChannel.guild.roles.fetch(cur[0].id);

      //write text
      const textAdded = "\n" + added.join("\n");
      const textRemoved = "\n" + removed.join("\n");
      return (
        acc +
        "\n" +
        obj.toString() +
        "\n" +
        perm.permAdded +
        textAdded +
        "\n" +
        perm.permRemoved +
        textRemoved +
        "\n"
      );
    }, "");
    console.log("Channel Update modifs", [modifs])
    if (modifs.length !== 0) embed.addField(chnUp.text, modifs); //add modifs in embed
    finishEmbed(chnUp, null, embed, logChannel);
    return;
  }

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

    const timeout = channelUpdate ? channelUpdate.timeout : null;
    if (timeout) clearTimeout(timeout); //if timeout, clear it

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
  console.log("channelUpdate auditLog null");
  endAdmin(newChannel, chnLog, chnUp, auditLog, embed, logChannel);
};

export const onThreadCreate = async (thread, newly) => {
  //handle thread creation
  if (!newly) return; // if not new return
  //console.log("thread", thread);

  if (thread) {
    //sometimes thread is null
    if (thread.joinable && !thread.joined) await thread.join(); //join thread created

    const personality = PERSONALITY.getAdmin(); //get personality
    const thrCr = personality.threadCreate;
    const auditLog = personality.auditLog;

    const logChannel = await getLogChannel(commons, thread); //get logChannelId
    const embed = setupEmbed("DARK_GREY", thrCr, thread, "tag"); //setup embed
    const thrLog = await fetchAuditLog(thread.guild, "THREAD_CREATE"); //get auditLog

    endAdmin(thread, thrLog, thrCr, auditLog, embed, logChannel);
  }
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
};

export const onThreadUpdate = async (oldThread, newThread) => {
  //handle thread update
  const personality = PERSONALITY.getAdmin(); //get personality
  const thrUp = personality.threadUpdate;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, newThread); //get logChannelId
  const embed = setupEmbed("DARK_GREY", thrUp, newThread); //setup embed
  const thrLog = await fetchAuditLog(newThread.guild, "THREAD_UPDATE"); //get auditLog

  console.log("oldThread", oldThread, "newThread", newThread)

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

  const changePos = ["rawPosition", oldRole.rawPosition, newRole.rawPosition];
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

  const logChannel = await getLogChannel(commons, message, "thread"); //get logChannel
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
  const attachments = message.attachments.reduce((acc, cur) => {
    return [...acc, cur.attachment];
  }, []);
  const embeds = message.embeds.reduce(
    (acc, cur) => {
      if (cur.type !== "gifv") return [...acc, cur]; //remove gif embed
      return acc;
    },
    [embed]
  );

  //handle gifs
  let content = message.content ? message.content : messageDel.note;
  const gifs = gifRecovery(content);

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
    if (gifs !== null) {
      const content = gifs.join("\n");
      logChannel.send(content);
    }
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
    if (gifs !== null) {
      const content = gifs.join("\n");
      logChannel.send(content);
    }
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
    if (gifs !== null) {
      const content = gifs.join("\n");
      logChannel.send(content);
    }
  }
};

export const onMessageUpdate = async (oldMessage, newMessage) => {
  //handle message update event

  let oMessage = oldMessage;
  let nMessage = newMessage;
  if (oldMessage.partial) {
    const message = await fetchMessage(oldMessage);
    oMessage = message === null ? oldMessage : message;
  }
  if (newMessage.partial) {
    const message = await fetchMessage(newMessage);
    nMessage = message === null ? newMessage : message;
  }

  if (!oMessage.guild) return; //Ignore DM

  //check for thread creation from message
  if (!oMessage.hasThread && nMessage.hasThread) {
    onThreadCreate(nMessage.thread, true); //use dedicated listener
    return;
  }

  //get personality
  const personality = PERSONALITY.getAdmin(); 
  const messageU = personality.messageUpdate;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, nMessage, "thread"); //get logChannel
  const date = oMessage.createdAt.toString().slice(4, 24);

  const embed = setupEmbed("DARK_GREEN", messageU, nMessage.author, "tag"); //setup embed
  //no auditLog when message update

  //check for un/pinned
  if (oMessage.pinned && !nMessage.pinned) {
    const unpinLog = await fetchAuditLog(nMessage.guild, "MESSAGE_UNPIN"); //get auditLog
    const unpinned = messageU.unpinned;
    embed.addField(unpinned.title, unpinned.text, true); //add unpinned text

    //add message link
    const link = `[${messageU.linkMessage}](${nMessage.url})`;
    embed.addField(messageU.linkName, link);

    endAdmin(nMessage, unpinLog, messageU, auditLog, embed, logChannel)
    return
  }
  if (!oMessage.pinned && nMessage.pinned) {
    const pinLog = await fetchAuditLog(nMessage.guild, "MESSAGE_PIN"); //get auditLog
    const pinned = messageU.pinned;
    embed.addField(pinned.title, pinned.text, true); //add unpinned text

    //add message link
    const link = `[${messageU.linkMessage}](${nMessage.url})`;
    embed.addField(messageU.linkName, link);

    endAdmin(nMessage, pinLog, messageU, auditLog, embed, logChannel);
    return
  }

  //add creation date + channel
  embed.addField(messageU.date, `${date}`, true); //date of message creation
  embed.addField(messageU.channel, `<#${oMessage.channelId}>`, true); //message channel

  //check for content modif
  const oldContent = oMessage.content;
  const newContent = nMessage.content;

  //filter changes, if < 2 length => return
  const isLengthy = Math.abs(oldContent.length - newContent.length) >= 2;
  if (oldContent !== newContent && isLengthy) {
    const oLen = oldContent.length !== 0;
    const nLen = newContent.length !== 0;

    if (oLen)      
      embed.addField(messageU.contentOld, oldContent); //to not add empty strings
    if (nLen)
      embed.addField(messageU.contentNew, newContent);

    if (oLen && nLen) {
      //check for apology
      const oSanitized = sanitizePunctuation(oldContent.toLowerCase()); //remove punctuation
      const nSanitized = sanitizePunctuation(newContent.toLowerCase());

      if (!hasApology(oSanitized) && hasApology(nSanitized)) {
        //in new message && not in old message
        const db = oMessage.client.db; //get db 
        const currentServer = commons.find(
          ({ guildId }) => guildId === nMessage.guildId
        ); //get commons.json data
        addApologyCount(nMessage.author.id, db); //add data to db
        await nMessage.react(currentServer.panDuomReactId); //add message reaction
      }
    }
  }

  //check for objects changes
  const attachments = oMessage.attachments.reduce((acc, cur) => {
    if (nMessage.attachments.findKey((obj) => obj.id === cur.id) !== cur.id)
      return [...acc, cur.attachment];
    return acc;
  }, []); //check for attachments

  const oldEmbeds = oMessage.embeds;
  const newEmbeds = nMessage.embeds;
  let embeds;
  try {
    embeds =
      oldEmbeds.length !== 0 && newEmbeds.length !== 0
        ? newEmbeds.reduce(
            (acc, cur, idx) => {
            if (!cur.equals(nMessage.embeds[idx]) && cur.type !== "gifv") //exclude gifs embed which cannot be sent by bot
              return [...acc, cur];
            return acc;
            },
            [embed]
          )
        : [embed]; //check for embeds. It includes link integration
  } catch (e) {
    console.log("onMessageUpdate embeds", e);
    embeds = [embed];
  }

  if (!isLengthy && embeds.length === 1 && attachments.length === 0) return; //if no apparent modif, return

  //add message link
  const link = `[${messageU.linkMessage}](${nMessage.url})`;
  embed.addField(messageU.linkName, link);
  await finishEmbed(messageU, null, embeds, logChannel, null, attachments);
 /* if (gifs !== null) {
    const content = gifs.join("\n");
    logChannel.send(content);
  }*/
};

export const onGuildBanAdd = async (userBan) => {
  console.log("member banned from Discord Server");

  const personality = PERSONALITY.getAdmin(); //get personality
  const guildBan = personality.guildBan;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, userBan); //get logChannel
  const embed = setupEmbed("DARK_NAVY", guildBan, userBan.user, "tag"); //setup embed
  const banLog = await fetchAuditLog(userBan.guild, "MEMBER_BAN_ADD"); //get auditLog
  const reason = banLog.reason; //get ban reason

  endAdmin(userBan.user, banLog, guildBan, auditLog, embed, logChannel, reason);
};

export const onGuildBanRemove = async (userBan) => {
  console.log("member unbanned from Discord Server");

  const personality = PERSONALITY.getAdmin(); //get personality
  const guildUnban = personality.guildUnban;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, userBan); //get logChannel
  const embed = setupEmbed("DARK_NAVY", guildUnban, userBan.user, "tag"); //setup embed
  const banLog = await fetchAuditLog(userBan.guild, "MEMBER_BAN_REMOVE"); //get auditLog

  endAdmin(userBan.user, banLog, guildUnban, auditLog, embed, logChannel);
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

  //get log creation date and compare to now
  const logCreationDate = kickLog ? dayjs(kickLog.createdAt) : null;
  const diff =
    logCreationDate !== null ? dayjs().diff(logCreationDate, "s") : null;

  //get user roles
  const roles = memberKick.roles.cache;
  const textRoles =
    roles.size !== 0
      ? roles.reduce((acc, cur) => `${acc}${cur.toString()}\n`, "")
      : null;

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
  if (textRoles) embed.addField(guildKick.roles, textRoles, true); //add user roles if any
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
