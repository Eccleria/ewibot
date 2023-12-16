import { SlashCommandBuilder } from "discord.js";
import { PERSONALITY } from "../personality.js";
import { interactionReply } from "../helpers/index.js";

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getCommands().timeout.name)
  .setDescription(PERSONALITY.getCommands().timeout.description)
  .addUserOption((option) =>
    option
      .setName(PERSONALITY.getCommands().timeout.userOption.name)
      .setDescription(PERSONALITY.getCommands().timeout.userOption.description)
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
    .setName(PERSONALITY.getCommands().timeout.reasonOption.name)
    .setDescription(PERSONALITY.getCommands().timeout.reasonOption.description)
    .setMinLength(1)
    .setRequired(true)
  )
  .addNumberOption((option) =>
    option
      .setName(PERSONALITY.getCommands().timeout.daysOption.name)
      .setDescription(PERSONALITY.getCommands().timeout.daysOption.description)
      .setMinValue(1)
      .setMaxValue(28)
      .setRequired(false)
  )
  .addNumberOption((option) =>
    option
      .setName(PERSONALITY.getCommands().timeout.hoursOption.name)
      .setDescription(PERSONALITY.getCommands().timeout.hoursOption.description)
      .setMinValue(1)
      .setMaxValue(24)
      .setRequired(false)
  )
  .addNumberOption((option) =>
    option
      .setName(PERSONALITY.getCommands().timeout.minsOption.name)
      .setDescription(PERSONALITY.getCommands().timeout.minsOption.description)
      .setMinValue(1)
      .setMaxValue(60)
      .setRequired(false)
  );

const timeout = {
  //action,
  command,
  help: (interaction) => {
    const personality = PERSONALITY.getCommands().timeout;
    interactionReply(interaction, personality.help);
  },
  admin: true,
  releaseDate: null,
  sentinelle: true,
};

export default timeout;
