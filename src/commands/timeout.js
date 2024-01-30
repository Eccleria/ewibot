import { Colors, SlashCommandBuilder } from "discord.js";
import { PERSONALITY } from "../personality.js";
import {
  fetchLogChannel,
  interactionReply,
  setupEmbed,
} from "../helpers/index.js";
import dayjs from "dayjs";

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getCommands().timeout.name)
  .setDescription(PERSONALITY.getCommands().timeout.description)
  .setDefaultMemberPermissions(0x0000010000000000) //MODERATE_MEMBERS bitwise
  .addUserOption((option) =>
    option
      .setName(PERSONALITY.getCommands().timeout.userOption.name)
      .setDescription(PERSONALITY.getCommands().timeout.userOption.description)
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName(PERSONALITY.getCommands().timeout.reasonOption.name)
      .setDescription(
        PERSONALITY.getCommands().timeout.reasonOption.description
      )
      .setMinLength(1)
      .setRequired(true)
  )
  .addNumberOption((option) => 
    option
      .setName(PERSONALITY.getCommands().timeout.weeksOption.name)
      .setDescription(PERSONALITY.getCommands().timeout.weeksOption.description)
      .setMinValue(1)
      .setMaxValue(20)
      .setRequired(false)
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

const action = async (interaction) => {
  const options = interaction.options;
  const perso = PERSONALITY.getCommands().timeout;

  //get timeout values
  let option;
  option = options.getNumber(perso.weeksOption.name, false);
  const weeks = option ? option : 0;
  option = options.getNumber(perso.daysOption.name, false);
  const days = option ? option : 0;
  option = options.getNumber(perso.hoursOption.name, false);
  const hours = option ? option : 0;
  option = options.getNumber(perso.minsOption.name, false);
  const minutes = option ? option : 0;

  //compute timeout in ms
  let timeout = 0;
  if (weeks || days || hours || minutes) {
    timeout = weeks ? (timeout + weeks) * 7 : timeout; //weeks
    timeout = days ? (timeout + days) * 24 : timeout; //hours
    timeout = hours ? (timeout + hours) * 60 : timeout * 60; //minutes
    timeout = minutes ? (timeout + minutes) * 60 * 1000 : timeout * 60 * 1000; //ms
  }
  if (!timeout) {
    interactionReply(interaction, perso.errorMissingDelay);
    return;
  }

  //get reason
  const reason = options.getString(perso.reasonOption.name);

  //get guildMember to timeout
  const user = options.getUser(perso.userOption.name);
  const member = await interaction.guild.members.fetch(user.id);

  //compute timestamp for timeout
  const today = dayjs();
  const timestamp = today.add(timeout, "ms");

  //send command use log
  const logChannel = await fetchLogChannel(interaction);
  const tPerso = PERSONALITY.getAdmin().timeout.command;
  const embed = setupEmbed(Colors.Orange, tPerso, interaction.user, "tag");
  logChannel.send({ embeds: [embed] });

  //timeout guildMember
  try {
    await member.disableCommunicationUntil(timestamp, reason);
  } catch (e) {
    console.error(e);

    if (e.rawError.code === 50013)
      //Missing permission
      interactionReply(interaction, perso.errorMissingPermission);
    else interactionReply(interaction, perso.errorUnknown);
    return;
  }

  interactionReply(interaction, perso.ok);
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
