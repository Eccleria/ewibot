import { PERSONALITY } from "./personality.js";

import {
  reactionHandler,
  deleteSongFromPlaylist,
  removeReminder,
  addEmojiData,
  addServerStatsData,
} from "./helpers/index.js";

import {
  checkRollingGif,
  emojiInContentHandler,
  statsGifCount,
} from "./stats.js";

import { presentationHandler } from "./admin/alavirien.js";
import { roleAdd, roleRemove } from "./admin/role.js";

import { octagonalLog } from "./admin/utils.js";
import { COMMONS } from "./commons.js";
import { addServerEmojiCount } from "./helpers/index.js";

export const onPublicMessage = async (message, client, currentServer) => {
  const { author } = message;

  if (
    author.id === process.env.CLIENTID || // ignoring message from himself
    !currentServer || // ignoring if wrong guild
    (process.env.DEBUG === "yes" && currentServer.name === "prod") // ignoring if debug && prod
  )
    return;

  if (
    message.attachments.size &&
    message.channel.id === currentServer.catsThreadId
  )
    addServerStatsData(client.db, "cats");

  reactionHandler(message, currentServer, client);
  statsGifCount(message);
  emojiInContentHandler(message);
  checkRollingGif(message);
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
          removeReminder(client.db, botMessage.id);
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

export const onRemoveSpotifyReaction = async (messageReaction, cmnShared) => {
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
  const currentServer = COMMONS.fetchGuildId(
    messageReaction.message.channel.guild.id
  );
  const cmnShared = COMMONS.getShared();

  //stats
  const emote = messageReaction.emoji; //get emote
  const emoteGuild = emote.guild ? emote.guild : null; //get emote guild if any
  if (emoteGuild && currentServer.guildId === emoteGuild.id) {
    //if is a guildEmote and belongs to current server, count
    const db = messageReaction.client.db;
    addEmojiData(db, user.id, emote.id); //user stat
    addServerEmojiCount(db, emote.id); //server stat
    return;
  }

  if (
    currentServer.cosmeticRoleHandle.messageId === messageReaction.message.id
  ) {
    roleAdd(messageReaction, currentServer, user);
    return;
  }

  if (cmnShared.octagonalSignEmoji === messageReaction.emoji.name) {
    octagonalLog(messageReaction, user);
    return;
  }

  if (
    messageReaction.message.channel.id ===
      currentServer.presentationChannelId &&
    currentServer.presentationReactId === messageReaction.emoji.name
  ) {
    console.log("detected");
    presentationHandler(currentServer, messageReaction, user);
    return; //no command in presentation channel
  }

  onRemoveSpotifyReaction(messageReaction, cmnShared);

  onRemoveReminderReaction(messageReaction, user, cmnShared);
};

export const onReactionRemove = async (messageReaction, user) => {
  const currentServer = COMMONS.fetchGuildId(
    messageReaction.message.channel.guild.id
  );

  if (currentServer.cosmeticRoleHandle.messageId === messageReaction.message.id)
    await roleRemove(messageReaction, currentServer, user);
};
