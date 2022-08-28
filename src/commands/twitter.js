import { SlashCommandBuilder } from "@discordjs/builders";

import { PERSONALITY } from "../personality.js";

const command = new SlashCommandBuilder()
  .setName("twitter")
  .setDescription("Commandes de gestions du lien Twitter-Discord.")
  .setDefaultMemberPermissions(0)
  .addSubcommand((command) => 
    command
      .setName("checktweets")
      .setDescription("Compare les derniers tweets avec la base de donnée et envoie la différence.")
  )
  .addSubcommand((command) =>
    command
      .setName("status")
      .setDescription("Indique le status de la connexion avec Twitter.")
  );

const action = async (interaction) => {
  const twitter = interaction.client.twitter;
  const stream = twitter.stream;
  const personality = PERSONALITY.getCommands().twitter;

  const options = interaction.options; //get interaction options
  const subcommand = options.getSubcommand();
  const subcommandGroup = options.getSubcommandGroup();

  console.log("subcommandGroup", subcommandGroup);
  console.log("subcommand", subcommand);

};

const twitter = {
  action,
  command,
  help: (interaction) => {
    interaction.reply({ content: PERSONALITY.getCommands().twitter.help, ephemeral: true })
  },
  admin: true,
};

export default twitter;