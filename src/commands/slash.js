import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
//import { SlashCommandBuilder } from "@discordjs/builders";

import gift from "./gift.js";
import twitter from "./twitter.js";
import saveLog from "./save-log.js";

const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

const contextCommands = [saveLog];
const slashCommands = [
  /*botMessage,
  birthday,
  concrete,
  ignore,
  ignoreChannel,
  ping,
  reminder,
  roll,*/
  gift,
  twitter,
]; //command + action

const helpCommands = [...contextCommands, ...slashCommands];
/*const helpOptions = helpCommands.reduce((acc, cur) => {
  const cmd = cur.command;
  return [...acc, { name: cmd.name, value: cmd.name }];
}, []);*/

export const slashCommandsInit = async (self, guildId, client) => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationGuildCommands(self, guildId), {
      body: helpCommands.map((cmd) => cmd.command.toJSON()),
    });

    console.log("Successfully reloaded application (/) commands.");

    //save commands in client
    client.slashCommands = slashCommands; //save slashCommands
    client.contextCommands = contextCommands; //save contextCommands
  } catch (error) {
    console.error(error);
  }
};
