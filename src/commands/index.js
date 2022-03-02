import {
  isIgnoredChannel,
  removeIgnoredChannel,
  addIgnoredChannel,
} from "../helpers/index.js";
import {
  addIgnoredUser,
  removeIgnoredUser,
  isAdmin,
} from "../helpers/index.js";
import reminder from "./reminder.js";
import birthday from "./birthday.js";
import personality from "./personality.js";
import { PERSONALITY } from "./personality.js";

const helloWorld = { // Is useful to verify is Ewibot is active or not.
  name: "ping",
  action: async (message, personality) => {
    await message.channel.send(personality.helloWorld.pong);
  },
  help: () => {
    return PERSONALITY.commands.helloWorld.help;
  },
  admin: false,
};

const ignore = { // Allows to add or remove users that Ewibot will (or not) react to their messages.
  name: "ignore",
  action: async (message, personality, client) => {
    const db = client.db;
    const authorId = message.author.id;
    if (db.data.ignoredUsersIds.includes(authorId)) {
      removeIgnoredUser(authorId, db);
      await message.channel.send(personality.ignore.notIgnored);
    } else {
      addIgnoredUser(authorId, db);
      await message.channel.send(personality.ignore.ignored);
    }
  },
  help: () => {
    return PERSONALITY.commands.ignore.help;
  },
  admin: false,
};

const ignoreChannel = { // ADMIN Allows to add or remove channels where Ewibot will (or not) react.
  name: "ignoreChannel",
  action: async (message, personality, client) => {
    const db = client.db;
    const ignoredChannelId =
      message.content.toLowerCase().split(" ")[1] || message.channel.id;
    if (isIgnoredChannel(db, ignoredChannelId)) {
      removeIgnoredChannel(db, ignoredChannelId);
      await message.reply(
        personality.ignoreChannel.notIgnored.concat(`<#${ignoredChannelId}>.`)
      );
    } else {
      addIgnoredChannel(db, ignoredChannelId);
      await message.reply(
        personality.ignoreChannel.ignored.concat(`<#${ignoredChannelId}>.`)
      );
    }
  },
  help: () => {
    return PERSONALITY.ignoreChannel.help;
  },
  admin: true,
};

const commands = [helloWorld, ignore, reminder, birthday, ignoreChannel, personality];

const help = {
  name: "help",
  action: async (message, personality) => {
    const words = message.content.split(" ");
    if (words.length === 1) {
      const baseText = personality.help.init;
      const helpText = commands.reduce((acc, cur) => {
        return `${cur.admin ? "_[admin]_ " : ""}${cur.name}, ${acc}`;
      }, "");
      await message.channel.send(`${baseText} - ${helpText.slice(0, -2)}`);
    } else {
      if (words[1] === "help") {
        await message.channel.send(help.help());
        return;
      }
      const command = commands.find(
        (cmd) => cmd.name === words[1]
      );
      if (!command || (!isAdmin(message.author.id) && command.admin)) {
        return;
      }
      await message.channel.send(command.help());
    }
  },
  help: () => {
    return PERSONALITY.commands.help.help;
  },
  admin: false,
};

export default [...commands, help]; // Regroups all commands
