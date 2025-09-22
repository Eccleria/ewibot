import { ChannelType } from "discord.js";
import { roleAdd, roleRemove } from "./admin/role.js";
import {
  buttonHandler,
  modalHandler,
  selectMenuHandler,
} from "./commands/utils.js";
import {
  addEmojiData,
  addServerEmojiCount,
  addServerStatsData,
  interactionReply,
  isReleasedCommand,
  messageReply,
  removeReminder,
} from "./helpers/index.js";
import { COMMONS } from "./commons.js";
import { readContentAndReact } from "./fun.js";
import { emojiInContentHandler, statsGifCount } from "./stats.js";
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

  if (interaction.isModalSubmit()) {
    console.log("modal interaction received");
    modalHandler(interaction);
    return;
  }

  const client = interaction.client; //get client

  if (interaction.isContextMenuCommand()) {
    //context commands
    const contextCommands = client.contextCommands; //get commands

    const foundCommand = contextCommands.find(
      (cmd) => cmd.command.name === interaction.commandName,
    );

    if (foundCommand) foundCommand.action(interaction); //if found command, execute its action
    return;
  }

  const slashCommands = client.slashCommands;

  if (interaction.isAutocomplete()) {
    //interaction with autocomplete activated
    const autoCompleteCommands = slashCommands.filter(
      (cmd) => cmd.autocomplete,
    ); //get commands with autocomplete action
    const foundCommand = autoCompleteCommands
      ? autoCompleteCommands.find(
          (cmd) => cmd.command.name === interaction.commandName,
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
      (cmd) => cmd.command.name === interaction.commandName,
    );

    if (foundCommand && isReleasedCommand(foundCommand))
      foundCommand.action(interaction, "/");
    //if found command, execute its action
    else interactionReply(interaction, "La commande n'est pas disponible.");
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
    messageReaction.message.channel.guild.id,
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

  onRemoveReminderReaction(messageReaction, user, cmnShared);
};

export const onReactionRemove = async (messageReaction, user) => {
  const currentServer = COMMONS.fetchFromGuildId(
    messageReaction.message.channel.guild.id,
  );

  if (currentServer.cosmeticRoleHandle.messageId === messageReaction.message.id)
    await roleRemove(messageReaction, currentServer, user);
};

export const onThreadCreate = (thread, newlyCreated) => {
  if (!newlyCreated) return;

  if (thread.joinable && !thread.joined) thread.join();
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

  if (
    message.attachments.size &&
    message.channel.id === currentServer.catsThreadId
  )
    addServerStatsData(message.client.db, "cats");

  readContentAndReact(message, currentServer);
  statsGifCount(message);
  emojiInContentHandler(message);
};

export const onRemoveReminderReaction = (
  messageReaction,
  reactionUser,
  cmnShared,
) => {
  const { removeEmoji } = cmnShared;
  const { message, emoji, users, client } = messageReaction;

  const foundReminder = client.remindme.find(
    // found corresponding reminder message
    ({ botMessage }) => botMessage.id === message.id,
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
          const payload = { content: PERSONALITY.getPersonality().reminder.delete };
          messageReply(botMessage, payload);
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

//#endregion
