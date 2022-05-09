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

export const onChannelCreate = async (channel) => {
  const type = channel.type;
  if (type === "DM") return;

  const logChannel = await getLogChannel(commons, channel); //get logChannelId

  logChannel.send(
    PERSONALITY.getAdmin().channelCreate[0] +
      `"${channel.name}"` +
      PERSONALITY.getAdmin().channelCreate[1] +
      `"${type}"` +
      PERSONALITY.getAdmin().channelCreate[2] +
      `<#${channel.parentId}>`
  ); //send log
};

export const onChannelDelete = async (channel) => {
  const type = channel.type;
  if (type === "DM") return;

  const logChannel = await getLogChannel(commons, channel); //get logChannelId

  logChannel.send(
    PERSONALITY.getAdmin().channelDelete[0] +
      `"${channel.name}"` +
      PERSONALITY.getAdmin().channelDelete[1] +
      `"${type}"` +
      PERSONALITY.getAdmin().channelDelete[2] +
      `<#${channel.parentId}>`
  ); //send log
};

export const onChannelUpdate = async (oldChannel, newChannel) => {
  const dataToCompare = [
    [oldChannel.type, newChannel.type],
    [oldChannel.name, newChannel.name],
    [oldChannel.parentId, newChannel.parentId],
    [oldChannel.rawPosition, newChannel.rawPosition],
  ];

  const logChannel = await getLogChannel(commons, newChannel); //get logChannelId

  const text = dataToCompare.reduce((acc, cur, idx) => {
    //create log to send
    if (cur[0] !== cur[1])
      return (
        acc +
        `${PERSONALITY.getAdmin().channelUpdate.features[idx]} ${cur[0]} => ${
          cur[1]
        }`
      );
    else return acc;
  }, PERSONALITY.getAdmin().channelUpdate.text[0] + `"${oldChannel.name}"` + PERSONALITY.getAdmin().channelUpdate.text[1]);
  logChannel.send(text); //send log
};

export const onRoleCreate = async (role) => {
  const logChannel = await getLogChannel(commons, role); //get logChannelId
  logChannel.send(PERSONALITY.getAdmin().roleCreate + `${role.name}.`); //send log
};

export const onRoleDelete = async (role) => {
  const logChannel = await getLogChannel(commons, role); //get logChannelId
  logChannel.send(PERSONALITY.getAdmin().roleDelete + `${role.name}.`); //send log
};

export const onRoleUpdate = async (oldRole, newRole) => {
  //handle role update event

  const personality = PERSONALITY.getAdmin(); //get personality
  const roleUpdate = personality.roleUpdate;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, newRole); //get logChannelId
  const embed = setupEmbed("DARK_GOLD", roleUpdate, newRole); //setup embed
  const roleLog = await fetchAuditLog(newRole.guild, "ROLE_UPDATE"); //get auditLog

  //get all data to compare
  const changes = roleLog.changes.map((obj) => {
    if (obj.key === "permissions")
      return [
        obj.key,
        oldRole.permissions.missing(newRole.permissions),
        newRole.permissions.missing(oldRole.permissions),
      ];
    else return [obj.key, obj.old, obj.new];
  });

  //create log to send
  const text = changes.reduce((acc, cur) => {
    //if permissions, get permissions removed and added
    if (cur[0] === "permissions") {
      const draft1 =
        cur[1].length === 0
          ? ""
          : `${roleUpdate.permissionAR[0]} ${cur[1].join(", ")}`; //[new permissions]
      const draft2 =
        cur[2].length === 0
          ? ""
          : `${roleUpdate.permissionAR[1]} ${cur[2].join(", ")}`; //[removed permissions]
      return acc + `${roleUpdate.permission}` + `${draft1}` + `${draft2}\n`;
    } else return acc + `- ${cur[0]} : ${cur[1]} => ${cur[2]}\n`;
  }, "");

  //if no AuditLog
  if (!roleLog)
    await finishEmbed(roleUpdate, auditLog.noLog, embed, logChannel, text);

  const { executor, target } = roleLog;

  if (target.id === newRole.id) {
    //check if log report the correct role update
    await finishEmbed(roleUpdate, executor.tag, embed, logChannel, text);
  } else {
    //if bot or author deleted the message
    await finishEmbed(
      roleUpdate,
      auditLog.inconclusive,
      embed,
      logChannel,
      text
    );
  }
};

export const onMessageDelete = async (message) => {
  // handle message deleted event
  if (!message.guild) return; //Ignore DM

  const personality = PERSONALITY.getAdmin(); //get personality
  const messageDelete = personality.roleUpdate;
  const auditLog = personality.auditLog;

  const logChannel = await getLogChannel(commons, message); //get logChannel
  const embed = setupEmbed("DARK_RED", messageDelete, message.author); //setup embed
  embed.addField(
    messageDelete.date,
    `${message.createdAt.toString().slice(4, 24)}`,
    true
  ); //date of message creation
  const deletionLog = await fetchAuditLog(message.guild, "MESSAGE_DELETE"); //get auditLog

  //get message data
  const content = message.content;
  const attachments = message.attachments.reduce((acc, cur) => {
    return [...acc, cur.attachment];
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
    if (attachments.length) await logChannel.send({ files: attachments });
  }

  const { executor, target } = deletionLog;

  if (target.id === message.author.id) {
    //check if log report the correct user banned
    await finishEmbed(messageDelete, executor.tag, embed, logChannel, content);
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

  //if no AuditLog
  if (!banLog) {
    finishEmbed(guildBan, auditLog.noLog, embed, logChannel, reason);
  }

  const { executor, target } = banLog;

  if (target.id === userBan.user.id) {
    //check if log report the correct message deleted
    finishEmbed(guildBan, executor.tag, embed, logChannel, reason);
  } else {
    //if bot or author deleted the message
    finishEmbed(guildBan, auditLog.inconclusive, embed, logChannel, reason);
  }
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

  //if no AuditLog
  if (!timeoutLog)
    finishEmbed(timeout, auditLog.noLog, embed, logChannel, reason);

  const { executor, target } = timeoutLog;

  if (target.id === newMember.user.id) {
    //check if log report the correct message deleted
    finishEmbed(timeout, executor.tag, embed, logChannel, reason);
  } else {
    //if bot or author deleted the message
    finishEmbed(timeout, auditLog.inconclusive, embed, logChannel, reason);
  }
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

  //if no AuditLog
  if (!kickLog) {
    finishEmbed(guildKick, auditLog.noLog, embed, logChannel, reason);
  }

  const { executor, target } = kickLog;

  if (target.id === userKick.user.id) {
    //check if log report the correct kick
    finishEmbed(guildKick, executor.tag, embed, logChannel, reason);
  } else {
    //if bot or author executed the kick
    finishEmbed(guildKick, auditLog.inconclusive, embed, logChannel, reason);
  }
};
