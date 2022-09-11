import { PERSONALITY } from "./personality.js";

import commands from "./commands/index.js";

import {
  isAdmin,
  isCommand,
  reactionHandler,
  checkIsOnThread,
  deleteSongFromPlaylist,
  emojiStat,
  addStatData,
  catAndDogsCount,
  isUseStatsUser,
} from "./helpers/index.js";

import { roleAdd, roleRemove } from "./admin/role.js";

// jsons imports
import { readFileSync } from "fs";
import { octagonalLog } from "./admin/utils.js";
const commons = JSON.parse(readFileSync("./static/commons.json"));

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
  const { author, content, channel, attachments } = message;
  const authorId = author.id;
  const db = client.db;

  if (
    authorId === self || // ignoring message from himself
    !currentServer || // ignoring if wrong guild
    (process.env.DEBUG === "yes" && currentServer.name === "prod") // ignoring if debug && prod
  )
    return;

  //console.log(message);

  const { playlistThreadId, catThreadId, dogThreadId } = currentServer;

  if (attachments) {
    if (channel.id === catThreadId) catAndDogsCount(client, attachments, "cats", "add");
    else if (channel.id === dogThreadId)
      catAndDogsCount(client, attachments, "dogs", "add");
  }

  reactionHandler(message, currentServer, client);

  if (isUseStatsUser(db, authorId)) addStatData(authorId, db, "message"); //add message count to db;

  // check for command
  const commandName = content.split(" ")[0];
  const command = commands
    .filter(({ admin }) => (admin && isAdmin(authorId)) || !admin) //filter appropriate commands if user has or not admin rigths
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

export const onRemoveReminderReaction = (messageReaction, currentServer) => {
  const { removeEmoji } = currentServer;
  const { message, emoji, users, client } = messageReaction;

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
  currentServer
) => {
  //remove song from client cache and spotify playlist using react
  const { client, message, emoji, users } = messageReaction;
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

// Partial ADMIN

export const onReactionAdd = async (messageReaction, user) => {
  // Function triggered for each reaction added
  const currentServer = commons.find(
    ({ guildId }) => guildId === messageReaction.message.channel.guild.id
  );

  const emote = messageReaction.emoji; //get emote
  const emoteGuild = emote.guild ? emote.guild : null; //get emote guild
  if (emoteGuild && currentServer.guildId === emoteGuild.id) {
    //if is a guildEmote and belongs to current server
    const db = messageReaction.client.db;
    if (isUseStatsUser(db, user.id)) emojiStat(emote.id, user, "add", "react");
    return;
  }

  if (
    currentServer.cosmeticRoleHandle.messageId === messageReaction.message.id
  ) {
    //handle cosmetic role attribution
    roleAdd(messageReaction, currentServer, user); 
    return;
  }

  if (currentServer.octagonalSign === messageReaction.emoji.name) {
    octagonalLog(messageReaction, user);
    return;
  }

  onRemoveSpotifyReaction(messageReaction, currentServer); //handle spotify related emote

  onRemoveReminderReaction(messageReaction, currentServer); //handle reminder related emote
};

export const onReactionRemove = async (messageReaction, user) => {
  const currentServer = commons.find(
    ({ guildId }) => guildId === messageReaction.message.channel.guild.id
  );

  if (currentServer.cosmeticRoleHandle.messageId === messageReaction.message.id)
    await roleRemove(messageReaction, currentServer, user);

  const emote = messageReaction.emoji; //get emote
  const emoteGuild = emote.guild ? emote.guild : null; //get emote guild
  if (emoteGuild && currentServer.guildId === emoteGuild.id) {
    //if is a guildEmote and belongs to current server
    const db = messageReaction.client.db;
    if (isUseStatsUser(db, user.id)) emojiStat(emote.id, user);
  }
};

export const onEmojiCreate = (guildEmoji) => {
  const client = guildEmoji.client; //get client
  const emotes = client.emotes;
  const { id, name } = guildEmoji; //get emote data

  //if client.emotes, add data. Else init client.
  if (emotes.length !== 0)
    client.emotes = [...emotes, { id: id, name: name }]; //add new emote
  else client.emotes = [{ id: id, name: name }]; //init client with emote
  console.log("onEmojiCreate client", client.emotes);
};

export const onEmojiDelete = (guildEmoji) => {
  const client = guildEmoji.client; //get client
  const id = guildEmoji.id; //get emote id

  //if client.emotes, filter data. Else init client.
  client.emotes
    ? (client.emotes = client.emotes.filter((obj) => obj.id !== id))
    : (client.emotes = []);
  console.log("onEmojiDelete client", client.emotes);
};

export const onEmojiUpdate = (oldEmoji, newEmoji) => {
  console.log("old", oldEmoji.id, oldEmoji.name);
  console.log("new", newEmoji.id, newEmoji.name);
  const client = oldEmoji.client; //get client

  //get emotes data
  const oldId = oldEmoji.id;
  const oldName = oldEmoji.name;
  const newId = newEmoji.id;
  const newName = newEmoji.name;

  const hasIdChanged = oldId !== newId;
  const hasNameChanged = oldName !== newName;

  if (!hasIdChanged && !hasNameChanged) return; //nothing to change
  //same id, different name
  if (!hasIdChanged && hasNameChanged) {
    //update client
    const foundIdx = client.emotes.findIndex((emoji) => emoji.id === oldId); //get oldEmoji index in client
    if (foundIdx !== -1) client.emotes[foundIdx].name = newName; //if found, update data
  }
  console.log("onEmojiUpdate", client.emotes);
};
