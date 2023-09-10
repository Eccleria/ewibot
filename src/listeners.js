import { ChannelType } from "discord.js";

import {
  readContentAndReact,
  deleteSongFromPlaylist,
  interactionReply,
  isReleasedCommand,
  removeReminder,
} from "./helpers/index.js";

import { presentationHandler } from "./admin/alavirien.js";
import { roleAdd, roleRemove } from "./admin/role.js";
import { octagonalLog } from "./admin/utils.js";

import { buttonHandler, selectMenuHandler } from "./commands/utils.js";

import { COMMONS } from "./commons.js";
import { PERSONALITY } from "./personality.js";

//#region Listeners
export const onInteractionCreate = (interaction) => {
  if (interaction.isButton()) {
    buttonHandler(interaction);
    return;
  }

  if (interaction.isStringSelectMenu()) {
    console.log("selectMenu interaction detected");
    selectMenuHandler(interaction);
    return;
  }

  const client = interaction.client; //get client

  if (interaction.isContextMenuCommand()) {
    //context commands
    const contextCommands = client.contextCommands; //get commands

    const foundCommand = contextCommands.find(
      (cmd) => cmd.command.name === interaction.commandName
    );

    if (foundCommand) foundCommand.action(interaction); //if found command, execute its action
    return;
  }

  const slashCommands = client.slashCommands;

  if (interaction.isAutocomplete()) {
    //interaction with autocomplete activated
    const autoCompleteCommands = slashCommands.filter(
      (cmd) => cmd.autocomplete
    ); //get commands with autocomplete action
    const foundCommand = autoCompleteCommands
      ? autoCompleteCommands.find(
          (cmd) => cmd.command.name === interaction.commandName
        )
      : null; //find command that fired onInteractionCreate
    if (foundCommand && isReleasedCommand(foundCommand))
      foundCommand.autocomplete(interaction);
    else interaction.respond([]); //if not found, return no choices
  } else if (interaction.isCommand()) {
    //slash commands
    const client = interaction.client; //get client
    const slashCommands = client.slashCommands; //get commands

    const foundCommand = slashCommands.find(
      (cmd) => cmd.command.name === interaction.commandName
    );

    if (foundCommand && isReleasedCommand(foundCommand))
      foundCommand.action(interaction, "/");
    //if found command, execute its action
    else
      interactionReply(
        interaction,
        PERSONALITY.getAdmin().commands.notReleased
      );
  }
};

export const onMessageCreate = async (message) => {
  // Function triggered for each message sent
  const { channel } = message;

  if (channel.type === ChannelType.DM) return;
  else {
    const currentServer = COMMONS.fetchFromGuildId(channel.guildId);
    onPublicMessage(message, currentServer);
  }
};

export const onReactionAdd = async (messageReaction, user) => {
  // Function triggered for each reaction added
  const currentServer = COMMONS.fetchFromGuildId(
    messageReaction.message.channel.guild.id
  );
  const cmnShared = COMMONS.getShared();

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
  const currentServer = COMMONS.fetchFromGuildId(
    messageReaction.message.channel.guild.id
  );

  if (currentServer.cosmeticRoleHandle.messageId === messageReaction.message.id)
    await roleRemove(messageReaction, currentServer, user);
};

//#endregion

//#region Listeners helpers

const onPublicMessage = (message, currentServer) => {
  const { author } = message;

  if (
    author.id === process.env.CLIENTID || // ignoring message from himself
    !currentServer || // ignoring if wrong guild
    (process.env.DEBUG === "yes" && currentServer.name === "prod") // ignoring if debug && prod
  )
    return;

  readContentAndReact(message, currentServer);
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

//#endregion
