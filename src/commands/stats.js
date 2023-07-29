import { SlashCommandBuilder } from "@discordjs/builders";
import { interactionReply } from "./utils.js";
import { isStatsUser, addStatsUser, removeStatsUser } from "../helpers/index.js";
import { PERSONALITY } from "../personality.js";
import { dbReturnType } from "../helpers/db/dbStats.js";

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
        let ret = isStatsUser(db, userId);
        if (ret === dbReturnType.isIn) {
          //if already user, remove
          removeStatsUser(db, userId);
          interactionReply(interaction, useP.isNotUser);
        } else if (ret === dbReturnType.isNotIn) {
          //if not user, add
          ret = addStatsUser(db, userId);
          console.log(ret);
          interactionReply(interaction, useP.isUser);
        }
        else {
          console.log("Invalid isStatsUser returned value: ", ret)
          interactionReply(interaction, useP.errorDb);
        }
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
