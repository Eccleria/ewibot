import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { SlashCommandBuilder } from "@discordjs/builders";

import twitter from "./twitter.js";
import saveLog from "./save-log.js";
import { PERSONALITY } from "../personality.js";
import { interactionReply } from "./utils.js";

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
  twitter,
]; //command + action

// HELP

const helpCommands = [...contextCommands, ...slashCommands];
/*const helpOptions = helpCommands.reduce((acc, cur) => {
  const cmd = cur.command;
  return [...acc, { name: cmd.name, value: cmd.name }];
}, []);*/

const help = {
  action: (interaction) => {
    const perso = PERSONALITY.getCommands().help;

    const userOption = interaction.options.getString(perso.stringOption.name); //get option given by user
    const foundCommand = helpCommands.find(
      (cmd) => cmd.command.name === userOption
    ); //find associated command

    if (foundCommand)
      foundCommand.help(interaction); //execute foundCommand help()
    else interactionReply(interaction, perso.notFound);
  },
  autocomplete: (interaction) => {
    const focusedValue = interaction.options.getFocused(); //get value which is currently user edited
    const choices = helpCommands.map((cmd) => cmd.command.name); //get all commands names
    const filtered = choices.filter((choice) =>
      choice.startsWith(focusedValue)
    ); //filter to corresponding commands names
    interaction.respond(
      filtered.map((choice) => ({ name: choice, value: choice }))
    );
  },
  command: new SlashCommandBuilder()
    .setName(PERSONALITY.getCommands().help.name)
    .setDescription(PERSONALITY.getCommands().help.description)
    .addStringOption((option) =>
      option
        .setName(PERSONALITY.getCommands().help.stringOption.name)
        .setDescription(PERSONALITY.getCommands().help.stringOption.description)
        .setRequired(true)
        .setAutocomplete(true)
    ),
  help: (interaction) => {
    const personality = PERSONALITY.getCommands().help.help;
    interactionReply(interaction, personality);
  },
};

helpCommands.push(help);
slashCommands.push(help);

// API

export const slashCommandsInit = async (self, guildId, client) => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationGuildCommands(self, guildId), {
      body: helpCommands.map((cmd) => cmd.command.toJSON()),
    }); //send commands jsons to API for command create/update

    console.log("Successfully reloaded application (/) commands.");

    //save commands in client
    client.slashCommands = slashCommands; //save slashCommands
    client.contextCommands = contextCommands; //save contextCommands
  } catch (error) {
    console.error(error);
  }
};
