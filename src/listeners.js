import { PERSONALITY } from "./personality.js";
import commands from "./commands/index.js";
import commons from "../static/commons.json"
import {
  isAdmin,
  isCommand,
  reactionHandler,
  checkIsOnThread,
  deleteSongFromPlaylist,
} from "./helpers/index.js";

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

export const onEmoji = async (guildEmoji) => {
  console.log("emoji listener")
  const guild = await guildEmoji.guild.fetch();
  const currentServer = commons.find(
    ({ guildId }) => guildId === guild.id
  );
  console.log("currentServer", currentServer)
  const channel = currentServer.logChannelId;

  if (guildEmoji.available) {
    await channel.send(`Un emoji a été créé : ${guildEmoji.name}, ${guildEmoji.identifier} par ${guildEmoji.author.username}`)
  } else {
    await channel.send(`Un emoji a été supprimé : ${guildEmoji.name}, ${guildEmoji.identifier} par ${guildEmoji.author.username}`)
  }
};

export const onRoleCreate = async (role) => {
  console.log("role create")
  const guild = await role.guild.fetch();
  const currentServer = commons.find(
    ({ guildId }) => guildId === guild.id
  );
  //console.log("currentServer", currentServer)
  const logChannel = currentServer.logChannelId;
  const channel = await guild.channels.fetch(logChannel);
  await channel.send(`Un rôle a été créé : ${role.name}.`)
};

export const onRoleDelete = async (role) => {
  console.log("role delete")
  const guild = await role.guild.fetch();
  const currentServer = commons.find(
    ({ guildId }) => guildId === guild.id
  );
  //console.log("currentServer", currentServer)
  const logChannel = currentServer.logChannelId;
  const channel = await guild.channels.fetch(logChannel);
  await channel.send(`Un rôle a été supprimé : ${role.name}.`)
};

