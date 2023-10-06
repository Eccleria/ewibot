import { SlashCommandBuilder } from "@discordjs/builders";
import { interactionReply } from "../helpers/index.js";
import {
  isStatsUser,
  addStatsUser,
  removeStatsUser,
} from "../helpers/index.js";
import { PERSONALITY } from "../personality.js";
import { dbReturnType } from "../helpers/index.js";

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
      addStatsUser(db, userId);
      interactionReply(interaction, useP.isUser);
    } else {
      console.log("Invalid isStatsUser returned value: ", ret);
      interactionReply(interaction, useP.errorDb);
    }
  }
};

const stats = {
  name: "stats",
  command: command,
  action,
  help: (interaction, userOption) => {
    const personality = PERSONALITY.getCommands().stats;
    const helpToUse = userOption.includes(" ")
      ? personality[userOption.split(" ")[1]]
      : personality;
    interactionReply(interaction, helpToUse.help);
  },
  admin: false,
  releaseDate: null,
  sentinelle: false,
  subcommands: ["stats", "stats use"],
};

export default stats;
