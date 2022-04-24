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

import { MessageEmbed } from "discord.js";

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

  //get logChannelId
  const currentServer = commons.find(
    ({ guildId }) => guildId === channel.guildId
  );
  const logChannel = await channel.client.channels.fetch(
    currentServer.logChannelId
  );

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

  //get logChannelId
  const currentServer = commons.find(
    ({ guildId }) => guildId === channel.guildId
  );
  const logChannel = await channel.client.channels.fetch(
    currentServer.logChannelId
  );

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

  //get logChannelId
  const currentServer = commons.find(
    ({ guildId }) => guildId === newChannel.guildId
  );
  const logChannel = await newChannel.client.channels.fetch(
    currentServer.logChannelId
  );

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
  //get logChannelId
  const currentServer = commons.find(
    ({ guildId }) => guildId === role.guild.id
  );
  const logChannel = await role.client.channels.fetch(
    currentServer.logChannelId
  );

  //send log
  logChannel.send(PERSONALITY.getAdmin().roleCreate + `${role.name}.`);
};

export const onRoleDelete = async (role) => {
  //get logChannelId
  const currentServer = commons.find(
    ({ guildId }) => guildId === role.guild.id
  );
  const logChannel = await role.guild.channels.fetch(
    currentServer.logChannelId
  );

  //send log
  logChannel.send(PERSONALITY.getAdmin().roleDelete + `${role.name}.`);
};

export const onRoleUpdate = async (oldRole, newRole) => {
  //get logChannel
  const currentServer = commons.find(
    ({ guildId }) => guildId === oldRole.guild.id
  );
  const logChannel = await oldRole.guild.channels.fetch(
    currentServer.logChannelId
  );

  //get all data to compare
  const dataToCompare = [
    [oldRole.color, newRole.color],
    [oldRole.hoist, newRole.hoist],
    [oldRole.icon, newRole.icon],
    [oldRole.unicodeEmoji, newRole.unicodeEmoji],
    [oldRole.name, newRole.name],
    [
      oldRole.permissions.missing(newRole.permissions), //[new permissions]
      newRole.permissions.missing(oldRole.permissions),
    ], //[removed permissions]
  ];

  const text = dataToCompare.reduce((acc, cur, idx) => {
    //create log to send
    if (idx === 5) {
      //if permissions, get permissions removed and added
      const draft1 = cur[0].lenght === 0 ? "" : cur[0].join(", ");
      const draft2 = cur[1].lenght === 0 ? "" : cur[1].join(", ");
      return (
        acc +
        `${PERSONALITY.getAdmin().roleUpdate.features[idx]}` +
        `${PERSONALITY.getAdmin().roleUpdate.text[2]}` +
        `${draft1}` +
        `${PERSONALITY.getAdmin().roleUpdate.text[3]}` +
        `${draft2}`
      );
    }
    if (cur[0] !== cur[1])
      //if different => modified => log
      return (
        acc +
        `${PERSONALITY.getAdmin().roleUpdate.features[idx]}${cur[0]} => ${
          cur[1]
        }\n`
      );
    else return acc;
  }, PERSONALITY.getAdmin().roleUpdate.text[0] + `"${oldRole.name}"` + PERSONALITY.getAdmin().roleUpdate.text[1]);

  logChannel.send(text); //send log
};

export const onMessageDelete = async (message) => {
  console.log("messageDeleted")
  if (!message.guild) return; //Ignore DM

  //get logChannel
  const currentServer = commons.find(
    ({ guildId }) => guildId === message.guildId
  );
  const logChannel = await message.guild.channels.fetch(
    currentServer.logChannelId
  );

  //get data to send
  const personality = PERSONALITY.getAdmin();

  //setup embed
  const embed = new MessageEmbed()
    .setColor("DARK_RED")
    .setTitle(personality.messageDelete.title)
    .setDescription(personality.messageDelete.description)
    .addFields(
      { name: personality.messageDelete.author, value: message.author.tag, inline: true }, // messageDeleted's Author
      { name: personality.messageDelete.date, value: `${message.createdAt.toString().slice(4, 24)}`, inline: true } //date of message creation
    );

  //get auditLog
  const fetchedLogs = await message.guild.fetchAuditLogs({
    limit: 1,
    type: "MESSAGE_DELETE",
  });
  const deletionLog = fetchedLogs.entries.first();

  //get message data
  const content = message.content;
  const attachments = message.attachments.reduce((acc, cur) => {
    return [...acc, cur.attachment];
  }, []);
  console.log("attachments", attachments);

  //if no AuditLog
  if (!deletionLog) {
    embed.addField(personality.messageDelete.executor, personality.auditLog.noLog, true);
    if (content) embed.addField(personality.messageDelete.content, content, false);
    await logChannel.send({ embeds: [embed] });
    await logChannel.send({ files: attachments });
  }

  const { executor, target } = deletionLog;
  console.log(content)
  if (target.id === message.author.id) {
    //check if log report the correct message deleted 
    embed.addField(personality.messageDelete.executor, executor.tag, true);
    if (content) embed.addField(personality.messageDelete.content, content, false);
    await logChannel.send({ embeds: [embed] });
    await logChannel.send({ files: attachments });
  } else {
    //if bot or author deleted the message
    embed.addField(personality.messageDelete.executor, personality.auditLog.inconclusive, true);
    if (content) embed.addField(personality.messageDelete.content, content, false);
    await logChannel.send({ embeds: [embed]});
    await logChannel.send({files: attachments });
  }
};

export const onGuildBanAdd = async (guildBan) => {
  //get logChannel
  const currentServer = commons.find(
    ({ guildId }) => guildId === guildBan.guild.id
  );
  const logChannel = await guildBan.guild.channels.fetch(
    currentServer.logChannelId
  );

  //get personality
  const personality = PERSONALITY.getAdmin();

  //setup embed
  const embed = new MessageEmbed()
    .setColor("DARK_NAVY")
    .setTitle(personality.guildBan.title)
    .setDescription(personality.guildBan.description)
    .addField(personality.guildBan.author, guildBan.user.tag, true);

  //get auditLog
  const fetchedLogs = await guildBan.guild.fetchAuditLogs({
    limit: 1,
    type: "MEMBER_BAN_ADD",
  });
  const banLog = fetchedLogs.entries.first();

  //get ban reason
  const reason = guildBan.reason;

  //if no AuditLog
  if (!banLog) {
    embed.addField(personality.guildBan.executor, personality.auditLog.noLog, true);
    if (reason) embed.addField(personality.guildBan.reason, reason, false);
    await logChannel.send({ embeds: [embed] });
  }

  const { executor, target } = banLog;

  if (target.id === guildBan.user.id) {
    //check if log report the correct message deleted 
    embed.addField(personality.guildBan.executor, executor.tag, true);
    if (reason) embed.addField(personality.guildBan.reason, reason, false);
    await logChannel.send({ embeds: [embed] });
  } else {
    //if bot or author deleted the message
    embed.addField(personality.guildBan.executor, personality.auditLog.inconclusive, true);
    if (reason) embed.addField(personality.guildBan.reason, reason, false);
    await logChannel.send({ embeds: [embed] });
  }
};
