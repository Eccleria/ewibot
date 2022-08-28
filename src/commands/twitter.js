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
  )
  .addSubcommandGroup((group) =>
    group
      .setName("stream")
      .setDescription("Gère le stream sur Twitter.")
      .addSubcommand((command) =>
        command
          .setName("connect")
          .setDescription("Lance une connexion avec Twitter.")
      )
      .addSubcommand((command) =>
        command
          .setName("close")
          .setDescription("Ferme une connexion avec Twitter.")
      )
  );

const action = async (interaction) => {
  const twitter = interaction.client.twitter;
  const stream = twitter.stream;
  const personality = PERSONALITY.getCommands().twitter;

  const options = interaction.options; //get interaction options
  const subcommand = options.getSubcommand();
  const subcommandGroup = options.getSubcommandGroup();

  console.log("subcommandGroup", subcommandGroup);
  console.log("subcommand", subcommand)

  if (subcommandGroup === "stream") {
    if (subcommand === "close") {
      stream.destroy();
      interaction.client.stream = null;
      interaction.reply({ content: personality.streamClose, ephemeral: true });
      return;
    } else if (subcommand === "connect") {
      if (!stream) {
        const newStream = await twitter.searchStream({ expansions: "author_id" }); //create stream
        interaction.client.twitter.stream = newStream;
        interaction.reply({ content: personality.streamConnect, ephemeral: true });
        return;
      } else {
        interaction.reply({ content: personality.streamExists, ephemeral: true });
        return;
      }
    }
  }

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