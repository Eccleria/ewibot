import { SlashCommandBuilder, ButtonStyle } from "discord.js";
import { PERSONALITY } from "../../personality.js";
import { createButton, interactionReply } from "../utils.js";
import { ActionRowBuilder } from "@discordjs/builders";
import { COMMONS } from "../../commons.js";

const creativityChoices = [
    {name: "theme1", value: "0"},
    {name: "theme2", value: "1"}
]

const command = new SlashCommandBuilder()
    .setName(PERSONALITY.getCommands().roles.name)
    .setDescription(PERSONALITY.getCommands().roles.description)
    .addSubcommandGroup((group) => 
      group
        .setName(PERSONALITY.getCommands().roles.dessinateurice.name)
        .setDescription(PERSONALITY.getCommands().roles.dessinateurice.description)
        .addSubcommand((subcommand) => 
          subcommand
            .setName(PERSONALITY.getCommands().roles.dessinateurice.creativity.name)
            .setDescription(PERSONALITY.getCommands().roles.dessinateurice.creativity.description)
            .addUserOption((option) => 
              option
                .setName(PERSONALITY.getCommands().roles.dessinateurice.creativity.userOption.name)
                .setDescription(PERSONALITY.getCommands().roles.dessinateurice.creativity.userOption.description)
                .setRequired(true)
            )
            .addStringOption((option) => 
              option //custom theme
                .setName(PERSONALITY.getCommands().roles.dessinateurice.creativity.customOption.name)
                .setDescription(PERSONALITY.getCommands().roles.dessinateurice.creativity.customOption.description)
                .setRequired(false)
                .setMinLength(1)
                .setMaxLength(225)
            )
            .addStringOption((option) =>
              option
                .setName(PERSONALITY.getCommands().roles.dessinateurice.creativity.choiceOption.name)
                .setDescription(PERSONALITY.getCommands().roles.dessinateurice.creativity.choiceOption.description)
                .setRequired(false)
                .setChoices(...creativityChoices)
            )
        )
    );

const action = async (interaction) => {
  const personality = PERSONALITY.getCommands().roles;
  const options = interaction.options;

  const group = options.getSubcommandGroup(false);
  console.log("group", group);
  const subcommand = options.getSubcommand(false);
  console.log("subcommand", subcommand);

  if (group === personality.dessinateurice.name) {
    //dessinateurice
    const dPerso = personality.dessinateurice;
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

      //create defi message with content + button
      const bPerso = perso.buttons;
      const confirmButton = createButton(...bPerso.confirm, ButtonStyle.Primary);
      const denyButton = createButton(...bPerso.deny, ButtonStyle.Danger);
      const ActionRow = new ActionRowBuilder().addComponents(confirmButton, denyButton);
      
      const content = interaction.member.toString() + perso.message[0] + target.toString() + perso.message[1];
      const server = COMMONS.fetchGuildId(interaction.guildId);
      const channel = await interaction.guild.channels.fetch(server.randomfloodChannelId);
      if (channel) {
        try {
          const message = channel.send({components: [ActionRow], content})
          if (message) interactionReply(interaction, perso.sent);
          else interactionReply(interaction, perso.errorNotSent);
        } catch (e) {
          console.log("roles dessinateurice creativity send error", e);
          return;
        }
      }
    }
  }
};

const roles = {
  action,
  command,
  help: (interaction, userOption) => {
    const personality = PERSONALITY.getCommands().roles;
    const helpToUse = userOption.includes(" ")
      ? personality[userOption.split(" ")[1]]
      : personality;
    interactionReply(interaction, helpToUse.help);
  },
  admin: false,
  releaseDate: null,
  sentinelle: false,
  subcommands: ["roles", "roles dessinateurice", "roles dessinateurice creativity"],
};

export default roles;
