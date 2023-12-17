import { SlashCommandBuilder, time } from "discord.js";
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

const action = (interaction) => {
  const options = interaction.options;
  const perso = PERSONALITY.getCommands().timeout;

  let option
  option = options.getNumber(perso.daysOption.name, false);
  const days = option ? option : 0;
  option = options.getNumber(perso.hoursOption.name, false);
  const hours = option ? option : 0;
  option = options.getNumber(perso.minsOption.name, false);
  const minutes = option ? option : 0;

  //compute timeout in ms
  let timeout = 0;
  if (days || hours || minutes) {
    timeout = days ? (timeout + days) * 24 : timeout; //hours
    timeout = hours ? (timeout + hours) * 60 : timeout * 60; //minutes
    timeout = minutes ? (timeout + minutes) * 60 * 1000 : timeout * 60 * 1000; //ms
  }
  if (!timeout) {
    interactionReply(interaction, perso.errorNoTimeout);
    return;
  }
};

const timeout = {
  action,
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
