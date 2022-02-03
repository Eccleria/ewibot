import {
  isIgnoredChannel,
  removeIgnoredChannel,
  addIgnoredChannel,
} from "../helpers/dbHelper.js";
import {
  addIgnoredUser,
  removeIgnoredUser,
  getIgnoredUsers,
  whichPersonality,
} from "../helpers/index.js";
import reminder from "./reminder.js";

const helloWorld = {
  name: "ping",
  action: async (message, personality) => {
    await message.channel.send(personality.helloWorld.pong);
  },
  help: () => { return whichPersonality().commands.helloWorld.help },
  admin: false,
};

const ignore = {
  name: "ignore",
  action: async (message, personality, client) => {
    const db = client.db;
    const authorId = message.author.id;
    if (getIgnoredUsers(db).includes(authorId)) {
      removeIgnoredUser(authorId, db);
      await message.channel.send(personality.ignore.notIgnored);
    } else {
      addIgnoredUser(authorId, db);
      await message.channel.send(personality.ignore.ignored);
    }
  },
  help: () => { return whichPersonality().commands.ignore.help },
  admin: false,
};

const ignoreChannel = {
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
  help: () => { return " " },
  admin: true,
};

const commands = [helloWorld, ignore, reminder, ignoreChannel];

const help = {
  name: "help",
  action: async (message, personality) => {
    const words = message.content.split(" ");
    if (words.length === 1) {
      const baseText = personality.help.init;
      const helpText = commands.reduce((acc, cur) => {
        return acc.concat(`, ${cur.admin ? "_[admin]_ " : ""}${cur.name}`);
      }, baseText);
      await message.channel.send(helpText);
    } else {
      const command = commands.find(
        (cmd) => !cmd.admin && cmd.name === words[1]
      );
      if (!command) {
        return;
      }
      await message.channel.send(command.help());
    }
  },
  help: () => { return whichPersonality().commands.help.help},
  admin: false,
};

export default [...commands, help];
