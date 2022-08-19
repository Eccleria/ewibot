import { REST } from "@discordjs/rest";
import { ChannelType, Routes } from "discord-api-types/v9";
import { SlashCommandBuilder } from "@discordjs/builders";

import {
  //dbHelper
  addIgnoredChannel,
  isIgnoredChannel,
  removeIgnoredChannel,
  addIgnoredUser,
  isIgnoredUser,
  removeIgnoredUser,
  //utils
  //isAdmin,
} from "../helpers/index.js";

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

const roll = {
  command: new SlashCommandBuilder()
    .setName("roll")
    .setDescription("Lancer de dés")
    .addIntegerOption((option) =>
      option
        .setName("dés")
        .setDescription("Nombre de dés à lancer")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(20)
    )
    .addIntegerOption((option) =>
      option
        .setName("faces")
        .setDescription("Nombre de faces à chaque dé")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),
  action: async (interaction) => {
    const dice = interaction.options.getInteger("dés");
    const faces = interaction.options.getInteger("faces");
    if (dice && faces) {
      //if enough args
      const dicesArray = Array.from(new Array(dice)); //create an array with enough dices
      const { total, details } = dicesArray.reduce(
        (acc) => {
          const value = Math.round((faces - 1) * Math.random()) + 1;
          return {
            total: acc.total + value,
            details: [...acc.details, value],
          };
        },
        { total: 0, details: [] }
      ); //compute total + each dices values

      await interaction.reply({
        content: `${total} (${details.join(", ")})`,
        ephemeral: true,
      });
    }
  },
  help: (interaction) => {
    interaction.reply({
      content: personality.helloWorld.help,
      ephemeral: true,
    });
  },
};

const ignore = {
  command: new SlashCommandBuilder()
    .setName("ignore")
    .setDescription("Lancer de dés"),
  action: (interaction) => {
    const db = interaction.client.db;
    const authorId = interaction.member.id;

    //check for command argument
    if (isIgnoredUser(authorId)) {
      removeIgnoredUser(authorId, db);
      interaction.reply({
        content: personality.ignore.notIgnored,
        ephemeral: true,
      })
    } else {
      addIgnoredUser(authorId, db);
      interaction.reply({
        content: personality.ignore.ignored,
        ephemeral: true,
      })
    }
  },
  help: (interaction) => {
    interaction.reply({
      content: personality.ignore.help,
      ephemeral: true,
    });
  },
  admin: false,
};

const ignoreChannel = {
  command: new SlashCommandBuilder()
    .setName("ignorechannel")
    .setDescription("Ewibot ignore ou non le channel.")
    .setDefaultMemberPermissions("0")
    .addChannelOption((option) =>
      option
        .setName("salon")
        .setDescription("Salon concerné")
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildText)
    ),
  action: (interaction) => {
    const db = interaction.client.db;
    const ignoredChannel =
      interaction.options.getChannel("salon") || interaction.channel;
    const ignoredChannelId = ignoredChannel.id;
    if (isIgnoredChannel(db, ignoredChannelId)) {
      removeIgnoredChannel(db, ignoredChannelId);
      interaction.reply({
        content: personality.ignoreChannel.notIgnored +
          `<#${ignoredChannelId}>.`,
        ephemeral: true
      });
    } else {
      addIgnoredChannel(db, ignoredChannelId);
      interaction.reply({
        content: personality.ignoreChannel.ignored +
          `<#${ignoredChannelId}>.`,
        ephemeral: true
      });
    }
  },
  help: (interaction) => {
    interaction.reply({
      content: personality.ignoreChannel.help,
      ephemeral: true,
    });
  },
};

const helpCommands = [ignore, ignoreChannel, ping, roll];
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

const slashCommands = [...helpCommands, help]; //command + action

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
