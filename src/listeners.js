import { PERSONALITY } from "./personality.js";

import commands from "./commands/index.js";

import {
  //utils
  isAdmin,
  isCommand,
  reactionHandler,
  checkIsOnThread,
  //SpotifyHelper
  deleteSongFromPlaylist,
  //db
  removeReminder,
} from "./helpers/index.js";

import { roleAdd, roleRemove } from "./admin/role.js";

// jsons imports
import { readFileSync } from "fs";
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
    //if spotify command, .env ok && in right thread
    if (
      command.name === "spotify" &&
      process.env.USE_SPOTIFY === "yes" &&
      channel.id === playlistThreadId
    ) {
      //add bot if not on thread
      checkIsOnThread(channel, playlistThreadId); 
    }
    command.action(message, client, currentServer, self);
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
  const { channel } = messageReaction.message;

  if (channel.type === "DM") {
    onRemoveReminderReaction(messageReaction, user);
    return;
  }

  const currentServer = commons.find(
    ({ guildId }) => guildId === messageReaction.message.channel.guild.id
  );

  if (
    currentServer.cosmeticRoleHandle.messageId === messageReaction.message.id
  ) {
    roleAdd(messageReaction, currentServer, user);
    return;
  }

  onRemoveSpotifyReaction(messageReaction, currentServer);

  onRemoveReminderReaction(messageReaction, user, currentServer);
};

export const onReactionRemove = async (messageReaction, user) => {
  const currentServer = commons.find(
    ({ guildId }) => guildId === messageReaction.message.channel.guild.id
  );

  if (currentServer.cosmeticRoleHandle.messageId === messageReaction.message.id)
    await roleRemove(messageReaction, currentServer, user);
  };

  
export const onRemoveReminderReaction = (
  messageReaction,
  user,
  currentServer
) => {
  //handle reminder removal triggered by user reaction
  const { message, emoji, client } = messageReaction;
  const removeEmoji = currentServer ? currentServer.removeEmoji : commons.find(({ name }) => name === "test").removeEmoji;
  const userId = user.id;

  const foundReminder = client.remindme.find(
    // find corresponding reminder message
    ({ botMessage }) => botMessage.id === message.id
  );
  if (
    foundReminder &&
    emoji.name === removeEmoji &&
    userId === foundReminder.authorId // if user reacting is the owner of reminder
  ) {
    try {
      client.remindme = client.remindme.filter(({ botMessage, timeout }) => {
        if (botMessage.id === message.id) {
          // if it is the right message
          clearTimeout(timeout); //cancel timeout
          botMessage.reply(PERSONALITY.getCommands().reminder.delete);
          removeReminder(client.db, botMessage.id); //remove from db
          return false; //remove from client
        }
        return true;
      });
      return;
    } catch (err) {
      console.log("reminderError", err);
    }
  }
};

/*
export const onDMReactionHandler = async (
  messageReaction,
  client,
  currentServer,
  self
) => {
  const removeEmoji = currentServer.removeEmoji;
  const { emoji, message, users } = messageReaction;

  const foundReminder = client.remindme.filter(
    (reminder) => reminder.botMessageId === message.id
  ); //find reminder in client
  const usersCollection = await users.fetch(); //get all users that reacted
  if (
    foundReminder &&
    emoji.name === removeEmoji &&
    usersCollection.first().id != self
  ) {
    try {
      client.remindme = client.remindme.filter(
        async ({ authorId, botMessage, timeout }) => {
          if (botMessage.id === message.id) {
            clearTimeout(timeout);
            try {
              await botMessage.reply(PERSONALITY.getCommands().reminder.delete);
            } catch {
              console.log(
                `Reminder confidentiality error - user: ${authorId}`
              );
            }
            removeReminder(client.db, botMessage.id);
            return false;
          }
          return true;
        }
      );
      return;
    } catch (err) {
      console.log("reminderError", err);
    }
  }
};
*/