import { MessageActionRow, Modal, TextInputComponent } from "discord.js";
import {
  createChoicesStorage,
  fetchPollMessage,
  interactionEditReply,
  parsePollFields,
} from "./pollsUtils.js";
import { createButton, interactionReply, isSentinelle } from "../utils.js";
import { PERSONALITY } from "../../personality.js";
import { addPollChoices, getPoll } from "../../helpers/index.js";
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

  //create add button
  const addButton = createButton("polls_set_add", "ajouter", "PRIMARY");
  if (pollEmbed.title.includes(perso.disable.title))
    addButton.setDisabled(true);

  //create stop button
  const stopButton = createButton("polls_set_disable", "stop", "DANGER");
  if (pollEmbed.title.includes(perso.disable.title))
    stopButton.setDisabled(true);

  //create ActionRows
  const actionRow = new MessageActionRow().addComponents([
    addButton,
    stopButton,
  ]);

  //send buttons
  interactionEditReply(interaction, { components: [actionRow] });
};

export const addChoicePollButton = async (interaction) => {
  const modal = new Modal()
    .setTitle("Ajouter un choix au sondage")
    .setCustomId("polls_modal_addChoice");

  const newChoiceInput = new TextInputComponent()
    .setCustomId("choiceInput")
    .setLabel("Nouveau choix")
    .setMinLength(1)
    .setMaxLength(50)
    .setStyle("SHORT");

  const actionRow = new MessageActionRow().addComponents(newChoiceInput);

  modal.addComponents(actionRow);

  interaction.showModal(modal);
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

export const addChoicePollModal = async (interaction) => {
  const inputs = interaction.fields.getTextInputValue("choiceInput");
  console.log("inputs", [inputs]);
  //get perso
  const perso = PERSONALITY.getCommands().polls;

  //get pollMessage
  const pollMessage = await fetchPollMessage(interaction);
  const embed = pollMessage.embeds[0];
  const fields = embed.fields;

  //check for multiple inputs
  if (inputs.includes(";")) {
    interactionReply(interaction, perso.errorMultipleInput);
    return;
  }
  //check for choices number
  if (fields.length + 1 > 10) {
    interactionReply(interaction, perso.errorChoicesNumber);
    return;
  }

  //add to embed
  const results = parsePollFields([inputs]);
  console.log("results", results);
  const black = perso.colorOption.black;
  results.fields.forEach((field) => {
    embed.addFields({ name: field, value: black.repeat(10) + " 0% (0)\n" });
  });

  //edit original data
  const payload = {embeds: [embed]};
  payload.components = pollMessage.components;
  pollMessage.edit(payload); //edit message
  addPollChoices(interaction.client.db, pollMessage.id, createChoicesStorage(results.fields)); //edit db
  interactionReply(interaction, perso.settings.add.done);
};
