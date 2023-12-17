import dotenv from "dotenv";
dotenv.config();
import dayjs from "dayjs";
import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { ChannelType, Routes } from "discord-api-types/v9";

import announce from "./announce.js";
import birthday from "./birthday.js";
import botEmote from "./botEmote.js";
import botMessage from "./botMessage.js";
import concrete from "./concrete.js";
import eventRoles from "./eventRoles.js";
import gift from "./gift.js";
import leaderboardApology from "./leadApo.js";
import personality from "./personality.js";
import polls from "./polls/polls.js";
import reminder from "./reminder.js";
import { reverse, reverseTranslator } from "./reverse.js";
import roles from "./roles/dessinateurice.js";
import saveLog from "./save-log.js";
import shuffle from "./shuffle.js";
import spotify from "./spotify.js";
import stats from "./stats.js";
import vest from "./vest.js";
import {
  //dbHelper
  addIgnoredChannel,
  isIgnoredChannel,
  removeIgnoredChannel,
  addIgnoredUser,
  isIgnoredUser,
  removeIgnoredUser,
  //utils
  interactionReply,
  isAdmin,
  isReleasedCommand,
  isSentinelle,
} from "../helpers/index.js";
import { COMMONS } from "../commons.js";
import { PERSONALITY } from "../personality.js";

const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

const ping = {
  command: new SlashCommandBuilder()
    .setName(PERSONALITY.getCommands().helloWorld.name)
    .setDescription(PERSONALITY.getCommands().helloWorld.description),
  action: (interaction) => {
    const personality = PERSONALITY.getCommands();
    interaction.reply(personality.helloWorld.pong);
  },
  help: (interaction) => {
    const personality = PERSONALITY.getCommands();
    interactionReply(interaction, personality.helloWorld.help);
  },
  admin: false,
  releaseDate: dayjs("12-21-2022", "MM-DD-YYYY"),
  sentinelle: false,
};

const roll = {
  command: new SlashCommandBuilder()
    .setName(PERSONALITY.getCommands().roll.name)
    .setDescription(PERSONALITY.getCommands().roll.description)
    .addIntegerOption((option) =>
      option
        .setName(PERSONALITY.getCommands().roll.diceOption.name)
        .setDescription(PERSONALITY.getCommands().roll.diceOption.description)
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(20)
    )
    .addIntegerOption((option) =>
      option
        .setName(PERSONALITY.getCommands().roll.facesOption.name)
        .setDescription(PERSONALITY.getCommands().roll.facesOption.description)
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),
  action: async (interaction) => {
    const personality = PERSONALITY.getCommands().roll;
    const dice = interaction.options.getInteger(personality.diceOption.name);
    const faces = interaction.options.getInteger(personality.facesOption.name);
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

      interactionReply(interaction, `${total} (${details.join(", ")})`, false);
    } else interactionReply(interaction, personality.parsingError);
  },
  help: (interaction) => {
    const personality = PERSONALITY.getCommands().roll;
    interactionReply(interaction, personality.help);
  },
  admin: false,
  releaseDate: dayjs("12-13-2022", "MM-DD-YYYY"),
  sentinelle: false,
};

const ignoreUser = {
  command: new SlashCommandBuilder()
    .setName(PERSONALITY.getCommands().ignoreUser.name)
    .setDescription(PERSONALITY.getCommands().ignoreUser.description),
  action: (interaction) => {
    const db = interaction.client.db;
    const authorId = interaction.member.id;
    const iPerso = PERSONALITY.getCommands().ignoreUser;

    //check for command argument
    if (isIgnoredUser(db, authorId)) {
      removeIgnoredUser(db, authorId);
      interactionReply(interaction, iPerso.notIgnored);
    } else {
      addIgnoredUser(db, authorId);
      interactionReply(interaction, iPerso.ignored);
    }
  },
  help: (interaction) => {
    const personality = PERSONALITY.getCommands();
    interactionReply(interaction, personality.ignoreUser.help);
  },
  admin: false,
  releaseDate: null,
  sentinelle: false,
};

const ignoreChannel = {
  command: new SlashCommandBuilder()
    .setName(PERSONALITY.getCommands().ignoreChannel.name)
    .setDescription(PERSONALITY.getCommands().ignoreChannel.description)
    .setDefaultMemberPermissions(0x0000010000000000)
    .addChannelOption((option) =>
      option
        .setName(PERSONALITY.getCommands().ignoreChannel.channelOption.name)
        .setDescription(
          PERSONALITY.getCommands().ignoreChannel.channelOption.description
        )
        .setRequired(false)
        .addChannelTypes(ChannelType.GuildText)
    ),
  action: (interaction) => {
    const db = interaction.client.db; // get db
    const iPerso = PERSONALITY.getCommands().ignoreChannel; //get personality

    //get corresponding channel data
    const ignoredChannel =
      interaction.options.getChannel(iPerso.channelOption.name) ||
      interaction.channel;
    const ignoredChannelId = ignoredChannel.id;

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
  admin: true,
  releaseDate: null,
  sentinelle: true,
};

//regroup all commands
const contextCommands = [reverseTranslator, saveLog]; //context commands (message, channel, user)
const slashCommands = [
  announce,
  birthday,
  botEmote,
  botMessage,
  concrete,
  eventRoles,
  gift,
  ignoreChannel,
  ignoreUser,
  leaderboardApology,
  personality,
  ping,
  polls,
  reminder,
  reverse,
  roles,
  roll,
  shuffle,
  spotify,
  stats,
  vest,
]; //command + action

// HELP

const helpCommands = [...contextCommands, ...slashCommands];

const help = {
  action: (interaction) => {
    const perso = PERSONALITY.getCommands().help;

    const userOption = interaction.options.getString(perso.stringOption.name); //get option given by user
    const foundCommand = helpCommands.find((cmd) =>
      userOption.startsWith(cmd.command.name)
    ); //find associated command

    if (foundCommand) {
      const member = interaction.member;

      const currentServer = COMMONS.fetchFromGuildId(interaction.guildId);
      const isModo = isSentinelle(interaction.member, currentServer);
      const isAdminUser = isAdmin(member.id);

      if (isModo && foundCommand.sentinelle)
        foundCommand.help(interaction, userOption);
      //execute sentinelle commands help
      else if (isAdminUser) foundCommand.help(interaction, userOption);
      //execute admin foundCommand help
      else if (
        isReleasedCommand(foundCommand) &&
        (!foundCommand.sentinelle || !foundCommand.admin)
      )
        foundCommand.help(interaction, userOption);
      //execute released foundCommand help
      else interactionReply(interaction, perso.notFound);
    } else interactionReply(interaction, perso.notFound);
  },
  autocomplete: (interaction) => {
    const focusedValue = interaction.options.getFocused(); //get value which is currently user edited
    const member = interaction.member;
    const currentServer = COMMONS.fetchFromGuildId(interaction.guildId);

    const isModo = isSentinelle(member, currentServer);
    const isDev = isAdmin(member.id);
    const commands = helpCommands.reduce((acc, cmd) => {
      if (isModo && cmd.sentinelle) return [...acc, cmd];
      else if (isDev) return [...acc, cmd];
      else if (isReleasedCommand(cmd) && !cmd.sentinelle && !cmd.admin)
        return [...acc, cmd];
      else return acc;
    }, []);

    const helpOptions = commands.reduce((acc, cur) => {
      const name = cur.subcommands ? cur.subcommands : [cur.command.name];
      return [...acc, ...name];
    }, []);

    const filtered = helpOptions.filter((choice) =>
      choice.startsWith(focusedValue)
    ); //filter to corresponding commands names

    const sliced = filtered.length > 24 ? filtered.slice(0, 24) : filtered;
    interaction.respond(
      sliced.map((choice) => ({ name: choice, value: choice }))
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
  admin: false,
  releaseDate: null,
  sentinelle: false,
};

helpCommands.push(help);
slashCommands.push(help);

// API

// COMMANDS SENDING TO API
export const slashCommandsInit = async (guildId, client) => {
  try {
    console.log("Started refreshing application (/) commands.");

    const self = process.env.CLIENTID; //get self Discord Id
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
