import { MessageActionRow } from "discord.js";
import { createButton } from "../utils.js";
import { PERSONALITY } from "../../personality.js";

export const sendSettingsButtons = async (interaction) => {
  console.log("sendSettingsButtons");
  await interaction.deferReply({ ephemeral: true });
  //get personality
  const perso = PERSONALITY.getCommands().polls.settings;

  //fetch embed
  const pollMessage = interaction.message;
  const pollEmbed = pollMessage.embeds[0];

  //create stop button
  const stopButton = createButton("polls_set_disable", "stop", "DANGER");
  if (pollEmbed.title.includes(perso.disable.title))
    stopButton.setDisabled(true);

  //create ActionRows
  const actionRow = new MessageActionRow().addComponents(stopButton);

  //send buttons
  interaction.editReply({ components: [actionRow], ephemeral: true });
};

export const disablePoll = async (interaction) => {
  console.log("disablePoll");
  await interaction.deferUpdate();

  //get personality
  const perso = PERSONALITY.getCommands().polls.settings;

  //fetch pollMessage
  const pollMessage = await interaction.channel.messages.fetch(
    interaction.message.reference.messageId
  );
  const editedPollMessage = {};

  //edit title
  const pollEmbed = pollMessage.embeds[0];
  pollEmbed.title = pollEmbed.title + perso.disable.title;
  editedPollMessage.embeds = [pollEmbed];

  //edit poll buttons
  const components = pollMessage.components;
  const lastActionRow = components[components.length - 1];
  const settingButton =
    lastActionRow.components[lastActionRow.components.length - 1];
  const newActionRow = new MessageActionRow().addComponents(settingButton);
  editedPollMessage.components = [newActionRow];

  //edit poll message
  const editedStopMessage = {
    content: perso.disable.disabled,
    components: [],
    ephemeral: true,
  };
  interaction.editReply(editedStopMessage);
  pollMessage.edit(editedPollMessage);
};
