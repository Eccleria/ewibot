import { MessageActionRow, MessageSelectMenu } from "discord.js";
import { fetchPollMessage, interactionEditReply, refreshPollFields } from "./pollsUtils.js";
import { createButton, isSentinelle } from "../utils.js";
import { PERSONALITY } from "../../personality.js";
import { getPoll, resetPollVoters } from "../../helpers/index.js";
import { COMMONS } from "../../commons.js";

export const sendSettingsButtons = async (interaction) => {
  console.log("sendSettingsButtons");
  await interaction.deferReply({ ephemeral: true });

  //get personality
  const perso = PERSONALITY.getCommands().polls.settings;

  //check for Sentinelle or author
  const pollMessage = interaction.message;
  const dbPoll = getPoll(interaction.client.db, pollMessage.id);
  if (interaction.user.id !== dbPoll.authorId) {
    //if not poll author, check is sentinelle
    const currentServer = COMMONS.fetchGuildId(interaction.guildId);
    if (!isSentinelle(interaction.member, currentServer)) {
      //if not, no right to use this button
      interactionEditReply(interaction, perso.errorNotAuthor);
      return;
    }
  }

  //fetch embed
  const pollEmbed = pollMessage.embeds[0];

  //create buttons
  const refreshButton = createButton(
    "polls_set_refresh",
    "Actualiser",
    "PRIMARY"
  ); // refresh poll embed
  const updateButton = createButton("polls_set_update", "Modifier", "PRIMARY"); // update poll parameters
  const removeButton = createButton("polls_set_remove", "Retirer", "PRIMARY"); // remove poll choices
  const resetButton = createButton("polls_set_reset", "RAZ", "DANGER"); // reset poll votes
  const stopButton = createButton("polls_set_disable", "Stop", "DANGER"); //stop poll

  const firstButton = [
    updateButton,
    removeButton,
    resetButton,
    stopButton,
  ];

  //If stoped poll, disable most buttons
  if (pollEmbed.title.includes(perso.disable.title))
    firstButton.forEach((btn) => btn.setDisabled(true));
  const settingsButton = [refreshButton, ...firstButton];

  //create ActionRows
  const actionRow = new MessageActionRow().addComponents(settingsButton);

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

export const removePollButtonAction = async (interaction) => {
  await interaction.deferUpdate();

  const perso = PERSONALITY.getCommands().polls.settings.remove;

  //get poll from db
  const pollMessage = await fetchPollMessage(interaction);
  const dbPoll = getPoll(interaction.client.db, pollMessage.id);
  const maxToRemove = dbPoll.votes.length - 2;

  if (maxToRemove < 1)
    return interactionEditReply(interaction, {content: perso.errorNotEnoughToRemove, components: []});

  //create selectMenu
  const menu = new MessageSelectMenu()
    .setCustomId("polls_selectMenu_remove")
    .setPlaceholder("Choix des options à supprimer")
    .setMinValues(1)
    .setMaxValues(maxToRemove);

  //parse choices
  const fields = pollMessage.embeds[0].fields;
  const choices = fields.reduce((acc, cur, idx) => {
    const curChoice = { label: cur.name, value: "polls_" + idx.toString() }; // description: "Choix_" + idx.toString(),
    return [...acc, curChoice];
  }, []);
  menu.addOptions(choices);

  //send message
  const actionRow = new MessageActionRow().addComponents(menu);
  const payload = { components: [actionRow] };
  interactionEditReply(interaction, payload);
};

export const resetPollButtonAction = async (interaction) => {
  await interaction.deferUpdate();

  //get data
  const personality = PERSONALITY.getCommands().polls;
  const perso = personality.settings.reset; //personality
  const pollMessage = await fetchPollMessage(interaction); //db data
  const embed = pollMessage.embeds[0];

  //reset db
  resetPollVoters(interaction.client.db, pollMessage.id);

  //reset embed
  const black = personality.black;
  const newFields = embed.fields.map((field) => {
    return { name: field.name, value: black.repeat(10) + " 0% (0)\n" };
  });
  console.log("newFields", newFields);
  embed.setFields(newFields);

  //update message
  const editedPollMessage = { embeds: [embed] }; //update embed
  editedPollMessage.components = pollMessage.components; //get old buttons
  pollMessage.edit(editedPollMessage); //update message

  const editedInteractionMessage = {
    content: perso.reset,
    components: [],
    ephemeral: true,
  };
  interactionEditReply(interaction, editedInteractionMessage);
};

export const updatePollButtonAction = async (interaction) => {
  console.log("updatePollButtonAction");
  await interaction.deferUpdate();

  //get personality
  const perso = PERSONALITY.getCommands().polls.settings.update;

  //create selectMenu
  const selectMenu = new MessageSelectMenu()
    .setCustomId(perso.customId)
    .setPlaceholder(perso.placeholder)
    .setMaxValues(1);

  //parse choices
  const choices = perso.choices;
  selectMenu.addOptions(choices);

  //send message
  const actionRow = new MessageActionRow().addComponents(selectMenu);
  const payload = { components: [actionRow], ephemeral: true };
  interactionEditReply(interaction, payload);
};

export const refreshPollButtonAction = async (interaction) => {
  await interaction.update({
    content: "En cours",
    ephemeral: true,
    components: [],
  });

  const perso = PERSONALITY.getCommands().polls;
  const pollMessage = await fetchPollMessage(interaction);
  const embed = pollMessage.embeds[0];
  const dbPoll = getPoll(interaction.client.db, pollMessage.id);

  //disable actions during refresh
  const disabledComponents = pollMessage.components.reduce((acc, cur) => {
    cur.components.forEach((button) => button.setDisabled(true)); //disable buttons of cur actionRow
    return [...acc, cur];
  }, []);
  await pollMessage.edit({ components: disabledComponents });

  //create new fields objects from pollMessage
  const newFieldsInit = embed.fields.map((obj) => {
    return { name: obj.name, value: "" };
  }); //init with old names
  const newFields = refreshPollFields(dbPoll, newFieldsInit, perso.create);

  //update message
  embed.setFields(newFields);
  await pollMessage.edit({ embeds: [embed] });

  //reply and enable votes
  interactionEditReply(interaction, { ephemeral: true, content: "Effectué" });
  
  //enable actions during refresh
  if (!embed.title.includes(perso.settings.disable.title)) {
    //if not disabled, add again all buttons as enabled
    const enabledComponents = pollMessage.components.reduce((acc, cur) => {
      cur.components.forEach((button) => button.setDisabled(false)); //disable buttons of cur actionRow
      return [...acc, cur];
    }, []);
    pollMessage.edit({ components: enabledComponents });
  } else pollMessage.edit({ components: [] }); //else remove every button


};
