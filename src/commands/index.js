import dotenv from "dotenv";
dotenv.config();

import {
  //utils
  isAdmin,
} from "../helpers/index.js";

import reminder from "./reminder.js";
import spotify from "./spotify.js";
import leaderboardApology from "./leadApo.js";
import pronouns from "./pronouns.js";
import { PERSONALITY } from "../personality.js";

const commands =
  process.env.USE_SPOTIFY === "yes"
    ? [
        leaderboardApology,
        pronouns,
        reminder,
        spotify,
      ]
    : [
        leaderboardApology,
        pronouns,
        reminder,
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
