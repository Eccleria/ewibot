import { SlashCommandBuilder } from "discord.js";

import { drawerCreativityAction } from "./drawers.js";
import { frontalierAction } from "./hsa.js";

import { interactionReply } from "../../helpers/index.js";
import { PERSONALITY } from "../../personality.js";

const creativityChoices = [
  { name: "theme1", value: "0" },
  { name: "theme2", value: "1" },
];

export const gamesClientInit = (client) => {
  client.games = {};
  client.games.frontalier = {};
  client.games.frontalier.hsa = [];
};

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getCommands().games.name)
  .setDescription(PERSONALITY.getCommands().games.description)
  .addSubcommandGroup((group) =>
    group //drawers
      .setName(PERSONALITY.getCommands().games.drawer.name)
      .setDescription(PERSONALITY.getCommands().games.drawer.description)
      .addSubcommand((subcommand) =>
        subcommand //creativity
          .setName(PERSONALITY.getCommands().games.drawer.creativity.name)
          .setDescription(
            PERSONALITY.getCommands().games.drawer.creativity.description,
          )
          .addUserOption((option) =>
            option
              .setName(
                PERSONALITY.getCommands().games.drawer.creativity.userOption
                  .name,
              )
              .setDescription(
                PERSONALITY.getCommands().games.drawer.creativity.userOption
                  .description,
              )
              .setRequired(true),
          )
          .addStringOption((option) =>
            option //custom theme
              .setName(
                PERSONALITY.getCommands().games.drawer.creativity.customOption
                  .name,
              )
              .setDescription(
                PERSONALITY.getCommands().games.drawer.creativity.customOption
                  .description,
              )
              .setRequired(false)
              .setMinLength(1)
              .setMaxLength(225),
          )
          .addStringOption((option) =>
            option
              .setName(
                PERSONALITY.getCommands().games.drawer.creativity.choiceOption
                  .name,
              )
              .setDescription(
                PERSONALITY.getCommands().games.drawer.creativity.choiceOption
                  .description,
              )
              .setRequired(false)
              .setChoices(...creativityChoices),
          ),
      ),
  )
  .addSubcommandGroup((group) =>
    group //frontalier
      .setName(PERSONALITY.getCommands().games.frontalier.name)
      .setDescription(PERSONALITY.getCommands().games.frontalier.description)
      .addSubcommand((subcommand) =>
        subcommand //hsa
          .setName(PERSONALITY.getCommands().games.frontalier.hsa.name)
          .setDescription(
            PERSONALITY.getCommands().games.frontalier.hsa.description,
          )
          .addUserOption((option) =>
            option
              .setName(
                PERSONALITY.getCommands().games.frontalier.hsa.userOption.name,
              )
              .setDescription(
                PERSONALITY.getCommands().games.frontalier.hsa.userOption
                  .description,
              )
              .setRequired(false),
          ),
      ),
  );

const action = async (interaction) => {
  const personality = PERSONALITY.getCommands().games;
  const options = interaction.options;

  const group = options.getSubcommandGroup(false);
  console.log("group", group);
  const subcommand = options.getSubcommand(false);
  console.log("subcommand", subcommand);

  if (group === personality.drawer.name) {
    //drawer
    const dPerso = personality.drawer;

    if (subcommand === dPerso.creativity.name)
      drawerCreativityAction(interaction);
  } else if (group === personality.frontalier.name) {
    //frontalier

    frontalierAction(interaction);
  }
};

const games = {
  action,
  command,
  help: (interaction, userOption) => {
    const personality = PERSONALITY.getCommands().games;
    const helpToUse = userOption.includes(" ")
      ? personality[userOption.split(" ")[1]]
      : personality;
    interactionReply(interaction, helpToUse.help);
  },
  admin: false,
  releaseDate: null,
  sentinelle: false,
  subcommands: ["games", "games drawer", "games drawer creativity"],
};

export default games;
