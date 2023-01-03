import { PERSONALITY } from "./personality.js";

import {
  isAdmin,
  reactionHandler,
  deleteSongFromPlaylist,
} from "./helpers/index.js";

import { roleAdd, roleRemove } from "./admin/role.js";

import { octagonalLog } from "./admin/utils.js";
import { COMMONS } from "./commons.js";

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
  const { author } = message;

  if (
    author.id === self || // ignoring message from himself
    !currentServer || // ignoring if wrong guild
    (process.env.DEBUG === "yes" && currentServer.name === "prod") // ignoring if debug && prod
  )
    return;

  reactionHandler(message, currentServer, client);
};

export const onRemoveReminderReaction = (
  messageReaction,
  reactionUser,
  cmnShared
) => {
  const { removeEmoji } = cmnShared;
  const { message, emoji, users, client } = messageReaction;

  const foundReminder = client.remindme.find(
    // found corresponding reminder message
    ({ botMessage }) => botMessage.id === message.id
  );

  if (
    foundReminder &&
    emoji.name === removeEmoji &&
    (message.interaction
      ? reactionUser.id === message.interaction.user.id
      : users.cache
          .map((user) => user.id)
          .includes(message.mentions.users.first().id)) // if user reacting is the owner of reminder
  ) {
    try {
      client.remindme = client.remindme.filter(({ botMessage, timeout }) => {
        if (botMessage.id === message.id) {
          // if it is the right message
          clearTimeout(timeout); //cancel timeout
          botMessage.reply(PERSONALITY.getCommands().reminder.delete);
          console.log("reminder deleted");
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
  cmnShared
) => {
  //remove song from client cache and spotify playlist using react
  const { client, message, emoji, users } = messageReaction;
  const { removeEmoji } = cmnShared;

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
  const currentServer = COMMONS.fetchGuildId(messageReaction.message.channel.guild.id);
  const cmnShared = COMMONS.getShared();

  if (
    currentServer.cosmeticRoleHandle.messageId === messageReaction.message.id
  ) {
    roleAdd(messageReaction, currentServer, user);
    return;
  }

  if (currentServer.octagonalSign === messageReaction.emoji.name) {
    octagonalLog(messageReaction, user);
    return;
  }

  onRemoveSpotifyReaction(messageReaction, cmnShared);

  onRemoveReminderReaction(messageReaction, user, cmnShared);
};

export const onReactionRemove = async (messageReaction, user) => {

  const currentServer = COMMONS.fetchGuildId(messageReaction.message.channel.guild.id);

  if (currentServer.cosmeticRoleHandle.messageId === messageReaction.message.id)
    await roleRemove(messageReaction, currentServer, user);
};
