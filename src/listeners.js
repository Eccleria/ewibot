import { PERSONALITY } from "./personality.js";
import commands from "./commands/index.js";

// jsons imports
import { readFileSync } from "fs";
const commons = JSON.parse(readFileSync("./static/commons.json"));

import {
  isAdmin,
  isCommand,
  reactionHandler,
  checkIsOnThread,
  deleteSongFromPlaylist,
} from "./helpers/index.js";

import {
  fetchAuditLog,
  finishEmbed,
  getLogChannel,
  setupEmbed,
  endAdmin,
} from "./admin/utils.js";

export const onPrivateMessage = async (message, client) => {
  const { author, content } = message;

  if (!isAdmin(author.id)) return; // If not admin, no rigth to

  const destinationChannelId = content.split(" ")[0];

  const newContent = content.split(" ").slice(1).join(" ");

  try {
    const channel = await client.channels.fetch(destinationChannelId);

    if (channel) {
      channel.sendTyping(); // effect of Ewibot writing
      setTimeout(() => {
        channel.send(newContent);
      }, 2000); // duration
    }
  } catch (e) {
    console.log(e);
  }
};

export const onPublicMessage = (message, client, currentServer, self) => {
  const { author, content, channel } = message;
  if (
    author.id === self || // ignoring message from himself
    !currentServer || // ignoring if wrong guild
    (process.env.DEBUG === "yes" && currentServer.name === "prod") // ignoring if debug && prod
  )
    return;

  const { playlistThreadId } = currentServer;

  reactionHandler(message, currentServer, client);

  // check for command
  const commandName = content.split(" ")[0];
  const command = commands
    .filter(({ admin }) => (admin && isAdmin(author.id)) || !admin) //filter appropriate commands if user has or not admin rigths
    .find(({ name }) => commandName.slice(1) === name);
  if (command && isCommand(commandName)) {
    if (
      command.name === "spotify" &&
      process.env.USE_SPOTIFY === "yes" &&
      channel.id === playlistThreadId
    ) {
      // spotify stuff
      checkIsOnThread(channel, playlistThreadId); //add bot if not on thread
    }
    command.action(message, client, currentServer, self);
  }
};

export const onRemoveReminderReaction = (
  messageReaction,
  client,
  currentServer
) => {
  const { removeEmoji } = currentServer;
  const { message, emoji, users } = messageReaction;

  const foundReminder = client.remindme.find(
    // found corresponding reminder message
    ({ botMessage }) => botMessage.id === message.id
  );
  if (
    foundReminder &&
    emoji.name === removeEmoji &&
    users.cache // if user reacting is the owner of reminder
      .map((user) => user.id)
      .includes(message.mentions.users.first().id)
  ) {
    try {
      client.remindme = client.remindme.filter(({ botMessage, timeout }) => {
        if (botMessage.id === message.id) {
          // if it is the right message
          clearTimeout(timeout); //cancel timeout
          botMessage.reply(PERSONALITY.getCommands().reminder.delete);
          return false;
        }
        return true;
      });
      return;
    } catch (err) {
      console.log("reminderError", err);
    }
  }
};

export const onRemoveSpotifyReaction = async (
  messageReaction,
  client,
  currentServer
) => {
  //remove song from client cache and spotify playlist using react
  const { message, emoji, users } = messageReaction;
  const { removeEmoji } = currentServer;

  const foundMessageSpotify = client.playlistCachedMessages.find(
    // found corresponding spotify message
    ({ id }) => id === message.id
  );

  if (
    process.env.USE_SPOTIFY === "yes" &&
    foundMessageSpotify &&
    emoji.name === removeEmoji &&
    users.cache // if user reacting is the owner of spotify message
      .map((user) => user.id)
      .includes(message.mentions.users.first().id)
  ) {
    const { songId } = foundMessageSpotify;

    const result = await deleteSongFromPlaylist(
      songId,
      client,
      PERSONALITY.getSpotify()
    );
    client.playlistCachedMessages = client.playlistCachedMessages.filter(
      ({ id }) => id !== message.id
    );
    await message.reply(result);
  }
};

//ADMIN

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
  const messageDelete = personality.messageDelete;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, message); //get logChannel
  const embed = setupEmbed("DARK_RED", messageDelete, message.author, "tag"); //setup embed
  embed.addField(
    messageDelete.date,
    `${message.createdAt.toString().slice(4, 24)}`,
    true
  ); //date of message creation
  const deletionLog = await fetchAuditLog(message.guild, "MESSAGE_DELETE"); //get auditLog

  //get message data
  const content = message.content ? message.content : messageDelete.note;
  const attachments = message.attachments.reduce((acc, cur) => {
    return [...acc, cur.attachment];
  }, []);
  const embedAttached = message.embeds.reduce((acc, cur) => {
    return [...acc, cur];
  }, []);

  //if no AuditLog
  if (!deletionLog) {
    await finishEmbed(
      messageDelete,
      auditLog.noLog,
      embed,
      logChannel,
      content
    );
    if (embedAttached.length !== 0)
      await logChannel.send({ embeds: embedAttached });
    if (attachments.length) await logChannel.send({ files: attachments });
    return;
  }

  const { executor, target } = deletionLog;

  if (target.id === message.author.id) {
    //check if log report the correct user banned
    await finishEmbed(messageDelete, executor.tag, embed, logChannel, content);
    if (embedAttached.length !== 0)
      await logChannel.send({ embeds: embedAttached });
    if (attachments.length) await logChannel.send({ files: attachments });
  } else {
    //if bot or author deleted the message
    await finishEmbed(
      messageDelete,
      auditLog.inconclusive,
      embed,
      logChannel,
      content
    );
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
  if (!oldIsTimeout && newIsTimeout) return; // if no timeout added => return

  const personality = PERSONALITY.getAdmin(); //get personality
  const timeout = personality.timeout;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, newMember); //get logChannel
  const embed = setupEmbed("ORANGE", timeout, newMember.user); //setup embed
  const timeoutLog = await fetchAuditLog(newMember.guild, "MEMBER_ROLE_UPDATE"); //get auditLog
  const reason = timeoutLog.reason; //get ban reason

  const timeoutUntilDate = newMember.communicationDisabledUntil;
  console.log("timeoutUntilDate", timeoutUntilDate);
  const timeoutDuration = timeoutUntilDate.parse() - Date.now().parse();
  console.log("timeoutDuration", timeoutDuration);
  embed.addField(personality.timeout.duration, timeoutDuration, true); //date of message creation

  endAdmin(newMember.user, timeoutLog, timeout, auditLog, embed, logChannel, reason);
};

export const onGuildMemberRemove = async (userKick) => {
  //handle guildMember kicked or leaving the server
  console.log("member kicked from Discord Server");

  const personality = PERSONALITY.getAdmin(); //get personality
  const guildKick = personality.guildKick;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, userKick); //get logChannel
  const embed = setupEmbed("DARK_PURPLE", guildKick, userKick.user); //setup userKick
  const kickLog = await fetchAuditLog(userKick.guild, "MEMBER_KICK"); //get auditLog
  const reason = kickLog.reason; //get ban reason

  endAdmin(userKick.user, kickLog, guildKick, auditLog, embed, logChannel, reason);
};
