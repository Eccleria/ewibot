import { SlashCommandBuilder } from "@discordjs/builders";
import { interactionReply } from "./utils.js";
import { PERSONALITY } from "../personality.js";

const command = new SlashCommandBuilder()
    .setName(PERSONALITY.getCommands().stats.name)
    .setDescription(PERSONALITY.getCommands().stats.description)
    .addSubcommand((command) => 
        command
            .setName(PERSONALITY.getCommands().stats.use.name)
            .setDescription(PERSONALITY.getCommands().stats.use.description)
    );

const action = (interaction) => {
    const options = interaction.options; //get interaction options
    const subcommand = options.getSubcommand();
    const db = interaction.client.db;
  
    const perso = PERSONALITY.getCommands(); //get personality
    const useP = perso.stats.use;

    if (subcommand === "use") {
        const userId = interaction.member.id;
        if (isStatsUser(userId, db)) {
          //if already user, remove
          removeStatsUser(userId, db);
          interactionReply(interaction, useP.isNotUser);
        } else {
          //if not user, add
          addStatsUser(userId, db);
          interactionReply(interaction, useP.isUser);
        }
        return;
    }
}

const stats = {
    name: "stats",
    command: command,
    action,
    help: (interaction) => {
      const content = PERSONALITY.getCommands().stats.help;
      interactionReply(interaction, content);
    },
    admin: false,
    releaseDate: null,
    sentinelle: false,
};

export default stats;
