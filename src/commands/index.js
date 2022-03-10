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

const helloWorld = {
  // Is useful to verify is Ewibot is active or not.
  name: "ping",
  action: async (message, personality) => {
    await message.channel.send(personality.helloWorld.pong);
  },
  help: () => {
    return PERSONALITY.commands.helloWorld.help;
  },
  admin: false,
};

const ignore = {
  // Allows to add or remove users that Ewibot will (or not) react to their messages.
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

const ignoreChannel = {
  // ADMIN Allows to add or remove channels where Ewibot will (or not) react.
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

const roll = {
  name: "roll",
  action: async (message, personality) => {
    const args = message.content.toLowerCase().split(" ");
    if (args[1]) {
      const diceNumbers = args[1].split("d").map((nb) => Number(nb));
      if (isNaN(diceNumbers[0]) || isNaN(diceNumbers[1]))
        await message.reply(personality.roll.parsingError);
      else if (
        diceNumbers[0] > 20 ||
        diceNumbers[1] > 100 ||
        diceNumbers[0] <= 0 ||
        diceNumbers[1] <= 0
      ) {
        await message.reply(personality.roll.numberError);
      } else {
        const diceNumber = diceNumbers[0];
        const diceValue = diceNumbers[1];
        const { total, details } = Array.from(new Array(diceNumber)).reduce(
          (acc) => {
            const value = Math.round((diceValue - 1) * Math.random()) + 1;
            return {
              total: acc.total + value,
              details: [...acc.details, value],
            };
          },
          {
            total: 0,
            details: [],
          }
        );

        await message.reply(`${total} (${details.join(", ")})`);
      }
    }
  },
  help: () => {
    return personnalities.normal.commands.roll.help;
  },
  admin: false,
};

const commands = [helloWorld, ignore, reminder, birthday, ignoreChannel, roll];

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
      const command = commands.find((cmd) => cmd.name === words[1]);
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
