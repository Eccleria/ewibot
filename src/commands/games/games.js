import { SlashCommandBuilder, ButtonStyle } from "discord.js";
import { ActionRowBuilder } from "@discordjs/builders";

import { createButton, interactionReply } from "../utils.js";
import { COMMONS } from "../../commons.js";
import { PERSONALITY } from "../../personality.js";


const creativityChoices = [
    {name: "theme1", value: "0"},
    {name: "theme2", value: "1"}
]

const command = new SlashCommandBuilder()
    .setName(PERSONALITY.getCommands().games.name)
    .setDescription(PERSONALITY.getCommands().games.description)
    .addSubcommandGroup((group) => 
      group
        .setName(PERSONALITY.getCommands().games.drawer.name)
        .setDescription(PERSONALITY.getCommands().games.drawer.description)
        .addSubcommand((subcommand) => 
          subcommand
            .setName(PERSONALITY.getCommands().games.drawer.creativity.name)
            .setDescription(PERSONALITY.getCommands().games.drawer.creativity.description)
            .addUserOption((option) => 
              option
                .setName(PERSONALITY.getCommands().games.drawer.creativity.userOption.name)
                .setDescription(PERSONALITY.getCommands().games.drawer.creativity.userOption.description)
                .setRequired(true)
            )
            .addStringOption((option) => 
              option //custom theme
                .setName(PERSONALITY.getCommands().games.drawer.creativity.customOption.name)
                .setDescription(PERSONALITY.getCommands().games.drawer.creativity.customOption.description)
                .setRequired(false)
                .setMinLength(1)
                .setMaxLength(225)
            )
            .addStringOption((option) =>
              option
                .setName(PERSONALITY.getCommands().games.drawer.creativity.choiceOption.name)
                .setDescription(PERSONALITY.getCommands().games.drawer.creativity.choiceOption.description)
                .setRequired(false)
                .setChoices(...creativityChoices)
            )
        )
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
    if (subcommand === dPerso.creativity.name) {
      const perso = dPerso.creativity;
      //get options
      const target = options.getUser(perso.userOption.name);
      const customTheme = options.getString(perso.customOption.name);
      const choiceTheme = options.getString(perso.choiceOption.name);

      //check for theme error
      if (!customTheme && !choiceTheme) {
        interactionReply(interaction, perso.errorNoTheme);
        return;
      }
      const theme = customTheme ? customTheme : choiceTheme;

      //create defi message with content + button
      const bPerso = perso.buttons;
      const confirmButton = createButton(...bPerso.confirm, ButtonStyle.Primary);
      const denyButton = createButton(...bPerso.deny, ButtonStyle.Danger);
      const ActionRow = new ActionRowBuilder().addComponents(confirmButton, denyButton);

      const content = interaction.member.toString() + perso.message[0] + target.toString() + perso.message[1] + theme;
      const server = COMMONS.fetchFromGuildId(interaction.guildId);
      const channel = await interaction.guild.channels.fetch(server.randomfloodChannelId);
      if (channel) {
        try {
          const message = channel.send({components: [ActionRow], content})
          if (message) interactionReply(interaction, perso.sent);
          else interactionReply(interaction, perso.errorNotSent);
        } catch (e) {
          console.log("games drawer creativity send error", e);
          return;
        }
      }
    }
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
