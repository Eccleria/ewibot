import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
//import { SlashCommandBuilder } from "@discordjs/builders";

import twitter from "./twitter.js";

const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

const helpCommands = [
  /*botMessage,
  birthday,
  concrete,
  ignore,
  ignoreChannel,
  ping,
  reminder,
  roll,*/
  twitter,
];
/*const helpOptions = helpCommands.reduce((acc, cur) => {
  const cmd = cur.command;
  return [...acc, { name: cmd.name, value: cmd.name }];
}, []);*/

const slashCommands = [...helpCommands];

export const slashCommandsInit = async (self, guildId, client) => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationGuildCommands(self, guildId), {
      body: slashCommands.map((cmd) => cmd.command.toJSON()),
    });

    console.log("Successfully reloaded application (/) commands.");

    client.slashCommands = slashCommands; //save in client
  } catch (error) {
    console.error(error);
  }
};
