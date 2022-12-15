import dotenv from "dotenv";
dotenv.config();

import {
  //dbHelper
  isIgnoredChannel,
  removeIgnoredChannel,
  addIgnoredChannel,
  addIgnoredUser,
  removeIgnoredUser,
  //utils
  isAdmin,
} from "../helpers/index.js";

import reminder from "./reminder.js";
import concrete from "./concrete.js";
import spotify from "./spotify.js";
import leaderboardApology from "./leadApo.js";
import pronouns from "./pronouns.js";
import { PERSONALITY } from "../personality.js";

const helloWorld = {
  // Is useful to verify is Ewibot is active or not.
  name: "ping",
  action: async (message) => {
    await message.channel.send(PERSONALITY.getCommands().helloWorld.pong);
  },
  help: () => {
    return PERSONALITY.getCommands().helloWorld.help;
  },
  admin: false,
};

const roll = {
  // Allow to get the total and each individual results for dice rolls.
  name: "roll",
  action: async (message) => {
    const args = message.content.toLowerCase().split(" ");
    if (args[1]) {
      //if enough args
      const diceNumbers = args[1].split("d").map((nb) => Number(nb));
      if (isNaN(diceNumbers[0]) || isNaN(diceNumbers[1]))
        await message.reply(PERSONALITY.getCommands().roll.parsingError);
      else if (
        diceNumbers[0] > 20 ||
        diceNumbers[1] > 100 ||
        diceNumbers[0] <= 0 ||
        diceNumbers[1] <= 0
      ) {
        await message.reply(PERSONALITY.getCommands().roll.numberError);
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
    return PERSONALITY.getCommands().roll.help;
  },
  admin: false,
};

const commands =
  process.env.USE_SPOTIFY === "yes"
    ? [
        helloWorld,
        leaderboardApology,
        pronouns,
        reminder,
        roll,
        spotify,
      ]
    : [
        helloWorld,
        leaderboardApology,
        pronouns,
        reminder,
        roll,
      ];

const help = {
  name: "help",
  action: async (message) => {
    const words = message.content.split(" ");
    if (words.length === 1) {
      //$help
      const baseText = PERSONALITY.getCommands().help.init;
      const helpText = commands.reduce((acc, cur) => {
        return `${cur.admin ? "_[admin]_ " : ""}${cur.name}, ${acc}`;
      }, "");
      await message.channel.send(`${baseText} - ${helpText.slice(0, -2)}`);
    } else {
      //$help help
      if (words[1] === "help") {
        await message.channel.send(help.help());
        return;
      }
      //$help command
      const command = commands.find((cmd) => cmd.name === words[1]);
      if (!command || (!isAdmin(message.author.id) && command.admin)) {
        //if user doesn't have the rigths
        return;
      }
      const commandName = command.command ? command.command.name : command.name;
      const personality = PERSONALITY.getCommands()[commandName];
      await message.channel.send({
        content: personality.help,
        allowed_mentions: { parse: [] },
      });
    }
  },
  help: () => {
    return PERSONALITY.getCommands().help.help;
  },
  admin: false,
};

export default [...commands, help]; // Regroups all commands
