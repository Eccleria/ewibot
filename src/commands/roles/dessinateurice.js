import { SlashCommandBuilder } from "@discordjs/builders";
import { PERSONALITY } from "../../personality.js";
import { interactionReply } from "../utils.js";

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

const action = (interaction) => {
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
