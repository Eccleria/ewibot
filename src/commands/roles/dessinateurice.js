import { SlashCommandBuilder } from "discord.js";
import { PERSONALITY } from "../../personality";

const creativityChoices = [
    ""
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
            )
            .addStringOption((option) =>
              option
                .setName(PERSONALITY.getCommands().roles.dessinateurice.creativity.choicesOption.name)
                .setDescription(PERSONALITY.getCommands().roles.dessinateurice.creativity.choicesOption.description)
                .setRequired(false)
                .setChoices(...creativityChoices)
            )
        )
    )