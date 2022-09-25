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
import { interactionReply } from "./utils.js";

import birthday from "./birthday.js";
import botMessage from "./botMessage.js";
import concrete from "./concrete.js";
import reminder from "./reminder.js";
import { reverse, reverseTranslator } from "./reverse.js";
import twitter from "./twitter.js";
import saveLog from "./save-log.js";
import spotify from "./spotify.js";

import { PERSONALITY } from "../personality.js";

const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

const personality = PERSONALITY.getCommands();

const ping = {
  command: new SlashCommandBuilder().setName("ping").setDescription("Ping !"),
  action: (interaction) => {
    interaction.reply(personality.helloWorld.pong);
  },
  help: (interaction) => {
    interactionReply(interaction, personality.helloWorld.help);
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

      interactionReply(interaction, `${total} (${details.join(", ")})`);
    }
  },
  help: (interaction) => {
    interactionReply(interaction, personality.helloWorld.help);
  },
};

const ignore = {
  command: new SlashCommandBuilder()
    .setName("ignore")
    .setDescription(
      "Permet de choisir si Ewibot réagira à vos messages ou non."
    ),
  action: (interaction) => {
    const db = interaction.client.db;
    const authorId = interaction.member.id;
    const iPerso = personality.ignore;

    //check for command argument
    if (isIgnoredUser(authorId, db)) {
      removeIgnoredUser(authorId, db);
      interactionReply(interaction, iPerso.notIgnored);
    } else {
      addIgnoredUser(authorId, db);
      interactionReply(interaction, iPerso.ignored);
    }
  },
  help: (interaction) => {
    interactionReply(interaction, personality.ignore.help);
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
    const iPerso = personality.ignoreChannel;
    if (isIgnoredChannel(db, ignoredChannelId)) {
      removeIgnoredChannel(db, ignoredChannelId);
      const content = iPerso.notIgnored + `<#${ignoredChannelId}>.`;
      interactionReply(interaction, content);
    } else {
      addIgnoredChannel(db, ignoredChannelId);
      const content = iPerso.ignored + `<#${ignoredChannelId}>.`;
      interactionReply(interaction, content);
    }
  },
  help: (interaction) => {
    interactionReply(interaction, personality.ignoreChannel.help);
  },
};

//regroup all commands
const contextCommands = [reverseTranslator, saveLog]; //context commands (message, channel, user)
const slashCommands = [
  birthday,
  botMessage,
  concrete,
  ignore,
  ignoreChannel,
  ping,
  reminder,
  reverse,
  reverseTranslator,
  roll,
  spotify,
  twitter,
]; //slash commands

// HELP
const helpCommands = [...contextCommands, ...slashCommands]; //get all commands for help command
const helpOptions = helpCommands.reduce((acc, cur) => {
  const cmd = cur.command;
  return [...acc, { name: cmd.name, value: cmd.name }]; //command option
}, []); //regroup help commands as command options

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
    interactionReply(interaction, personality.help.help);
  },
};

slashCommands.push(help); //add help as a Slash command

// COMMANDS SENDING TO API
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
