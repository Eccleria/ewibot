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

import birthday from "./birthday.js";
import botMessage from "./botMessage.js";
import concrete from "./concrete.js";
import reminder from "./reminder.js";
import { reverse, reverseTranslator } from "./reverse.js";
import twitter from "./twitter.js";
import saveLog from "./save-log.js";
import spotify from "./spotify.js";

import { interactionReply } from "./utils.js";

import { PERSONALITY } from "../personality.js";

const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

const ping = {
  command: new SlashCommandBuilder().setName("ping").setDescription("Ping !"),
  action: (interaction) => {
    const personality = PERSONALITY.getCommands();
    interaction.reply(personality.helloWorld.pong);
  },
  help: (interaction) => {
    const personality = PERSONALITY.getCommands();
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
    const personality = PERSONALITY.getCommands();
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
    const iPerso = PERSONALITY.getCommands().ignore;

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
    const personality = PERSONALITY.getCommands();
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
    const iPerso = PERSONALITY.getCommands().ignoreChannel;

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
    const personality = PERSONALITY.getCommands();
    interactionReply(interaction, personality.ignoreChannel.help);
  },
};

//regroup all commands
const contextCommands = [reverseTranslator, saveLog]; //context commands (message, channel, user)
const slashCommands = [
  //botMessage,
  birthday,
  botMessage,
  concrete,
  ignore,
  ignoreChannel,
  ping,
  reminder,
  reverse,
  roll,
  spotify,
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
