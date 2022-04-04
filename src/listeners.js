import { PERSONALITY } from "./personality.js";
import commands from "./commands/index.js";
import commons from "../static/commons.json"

import {
  isAdmin,
  isCommand,
  reactionHandler,
  checkIsOnThread,
  deleteSongFromPlaylist,
  PMContent,
} from "./helpers/index.js";

//DM Handler
const onPMChannel = async (client, message, args, attachments) => {
  //handling the channel function
  const destinationChannelId = args.length > 1 ? args[1] : null;
  try {
    const channel = await client.channels.fetch(destinationChannelId); //get the channel

    if (channel) {
      const currentServer = commons.find(
        ({ guildId }) => guildId === channel.guild.id
      );
      const content = PMContent(currentServer, args); //get the content to send

      channel.sendTyping(); //simulate Ewibot is writing
      setTimeout(() => {
        if (content.length > 0)
          //if content to send
          channel.send({
            content: content,
            files: attachments,
          });
        else channel.send({ files: attachments }); //if no content
      }, 3000);
    }
  } catch (e) {
    //channel not found
    console.log("catch PMChannel");
    message.reply("Exception");
  }
};

const onPMReply = async (client, message, args, attachments) => {
  //handling the reply function
  const messageReplyId = args.length >= 2 ? args[1] : null; //get message to reply Id

  //Find channel and message
  const fetchIDs = client.channels.cache.map((element) => element.id); //get all channels ids from every guild
  let foundMessage = null;
  let foundChannel = null;
  for (let id of fetchIDs) {
    const channel = await client.channels.fetch(id);
    if (channel.type === "GUILD_TEXT") {
      try {
        foundMessage = await channel.messages.fetch(messageReplyId); //try to find the message in channel
        foundChannel = channel;
      } catch (e) {
        //if message not found => crash => catch
        //nothing to do
      }
    }
  }

  if (foundChannel && foundMessage) {
    const currentServer = commons.find(
      ({ guildId }) => guildId === foundChannel.guild.id
    );
    const content = PMContent(currentServer, args); //get the content to send

    foundChannel.sendTyping(); //simulate Ewibot is writing
    setTimeout(() => {
      if (content.length > 0)
        //if content to send, even though no attachment
        foundMessage.reply({
          content: content,
          files: attachments,
        });
      else foundMessage.reply({ files: attachments }); //if no content
    }, 3000);
  } else { //if channel or message not found
    console.log("catch PMReply");
    message.reply(`Erreur, message non trouvé`);
  }
};

export const onPrivateMessage = async (message, client) => {
  const { author, content } = message;

  if (!isAdmin(author.id)) return; // If not admin, no rigth to

  const args = content.split(" ");
  const commandCheck = args[0];
  const attachments = message.attachments.reduce((acc, cur) => {
    return [...acc, cur.attachment];
  }, []);

    // Check if there is content to send
    if (args.length === 2 && attachments.length === 0) { //if no text && no attachments
      message.reply("Wrong input");
      return;
    }

  if (commandCheck === "channel") {
    onPMChannel(client, message, args, attachments);
  } else if (commandCheck === "reply") {
    onPMReply(client, message, args, attachments);
  } else await message.reply("Erreur de commande.");
};

//Public Handler
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
    command.action(message, client, currentServer, self); //anytime
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
