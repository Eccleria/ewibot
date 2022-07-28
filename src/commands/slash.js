import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { SlashCommandBuilder } from "@discordjs/builders";

import { PERSONALITY } from "../personality.js";


const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

/*
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
*/

const helloWorld = {
  command: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Ping !'),
  action: async (interaction) => {
    return interaction.reply(PERSONALITY.getCommands().helloWorld.pong);
  }
};

const commands = [helloWorld.command.toJSON()];

export const slashCommandsInit = async (self, guildId) => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(self, guildId),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
};