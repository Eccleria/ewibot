import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { SlashCommandBuilder } from "@discordjs/builders";

import { PERSONALITY } from "../personality.js";

const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

const personality = PERSONALITY.getCommands();

const ping = {
  command: new SlashCommandBuilder().setName("ping").setDescription("Ping !"),
  action: (interaction) => {
    interaction.reply(personality.helloWorld.pong);
  },
  help: (interaction) => {
    interaction.reply({
      content: personality.helloWorld.help,
      ephemeral: true,
    });
  },
};

const helpCommands = [ping];
const helpOptions = helpCommands.reduce((acc, cur) => {
  const cmd = cur.command;
  return [...acc, { name: cmd.name, value: cmd.name }];
}, []);

//console.log(helpOptions);
const help = {
  command: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Cette commande permet d'afficher l'aide d'une commande.")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("Choix de la commande dont l'aide sera affich�.")
        .addChoices(...helpOptions, { name: "help", value: "help" })
        .setRequired(true)
    ),
  action: (interaction) => {
    const userOption = interaction.options.getString("command"); //get option given by user
    const foundCommand = slashCommands.find(
      (cmd) => cmd.command.name === userOption
    ); //find associated command

    if (foundCommand) foundCommand.help(interaction); //execute foundCommand help()
  },
  help: (interaction) => {
    interaction.reply({ content: personality.help.help, ephemeral: true });
  },
};

const slashCommands = [ping, help]; //command + action

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
