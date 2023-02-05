import { MessageActionRow } from "discord.js";
import { fetchPollMessage, interactionEditReply } from "./pollsUtils.js";
import { createButton, isSentinelle } from "../utils.js";
import { PERSONALITY } from "../../personality.js";
import { getPoll } from "../../helpers/index.js";
import { COMMONS } from "../../commons.js";

export const sendSettingsButtons = async (interaction) => {
  console.log("sendSettingsButtons");
  await interaction.deferReply({ ephemeral: true });

  //get personality
  const perso = PERSONALITY.getCommands().polls.settings;

  //check for Sentinelle or author
  const pollMessage = interaction.message;
  const dbPoll = getPoll(interaction.client.db, pollMessage.id);
  if (!interaction.user.id === dbPoll.authorId) {
    const currentServer = COMMONS.fetchGuildId(interaction.guildId);
    if (!isSentinelle(interaction.member, currentServer)) {
      interactionEditReply(interaction, perso.errotNotAuthor);
    }
  }

  //fetch embed
  const pollEmbed = pollMessage.embeds[0];

  /*
  //create add button
  const addButton = createButton("polls_set_add", "ajouter", "PRIMARY");
  if (pollEmbed.title.includes(perso.disable.title))
    addButton.setDisabled(true);
  */

  //create stop button
  const stopButton = createButton("polls_set_disable", "stop", "DANGER");
  if (pollEmbed.title.includes(perso.disable.title))
    stopButton.setDisabled(true);

  //create ActionRows
  const actionRow = new MessageActionRow().addComponents([
    //addButton,
    stopButton,
  ]);

  //send buttons
  interactionEditReply(interaction, { components: [actionRow] });
};

export const disablePoll = async (interaction) => {
  console.log("disablePoll");
  await interaction.deferUpdate();

  //get personality
  const perso = PERSONALITY.getCommands().polls.settings;

  //fetch pollMessage
  const pollMessage = await fetchPollMessage(interaction);
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
  interactionEditReply(interaction, editedStopMessage);
  pollMessage.edit(editedPollMessage);
};
