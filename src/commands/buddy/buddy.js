import {
  ActionRowBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder,
  LabelBuilder,
  ModalBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  TextDisplayBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

import { COMMONS } from "../../classes/commons.js";
import { PERSONALITY } from "../../classes/personality.js";

import { createButton } from "../utils.js";
import { interactionEditReply } from "../polls/pollsUtils.js";
import { fetchSelectMenuReferenceMessage } from "../../helpers/utils.js";
import { interactionReply } from "ewilib";

export const firstReactToAccountabilityMessage = (message) => {
  const commons = COMMONS.getShared();

  if (message.content.includes(":"))
    message.react(commons.accountabilityBuddy.toDoEmoteId);
};

//#region Command

//COMMAND
const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getPersonality().buddy.command.name)
  .setDescription(PERSONALITY.getPersonality().buddy.command.description)

//#endregion

//#region Action

const action = async (interaction) => {
  //create the modal to get the buddy list
  const personality = PERSONALITY.getPersonality().buddy;
  const perso = personality.modal;

  //build modal components
  const textDisplay = new TextDisplayBuilder()
    .setContent(perso.textDisplay);
  
  const textInput = new TextInputBuilder()
    .setCustomId(perso.textInput.customId)
    .setPlaceholder(perso.textInput.placeholder)
    .setMinLength(1)
    .setMaxLength(2000)
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  const label = new LabelBuilder()
    .setLabel(perso.label)
    .setTextInputComponent(textInput);

  const modal = new ModalBuilder()
    .setTitle(perso.modal.title)
    .setCustomId(perso.modal.customId)
    .addTextDisplayComponents(textDisplay)
    .addLabelComponents(label);

  console.log("Showing buddy modal to ", interaction.user.id);
  try {
    interaction.showModal(modal);
  } catch (e) {
    console.error(e);
  }
};

export const accountabilityReactHandler = (messageReaction, user) => {
  messageReaction.remove(); //remove all users from this reaction

  //check user reacting to handle only message owner reaction
  const commons = COMMONS.getShared();
  const { message } = messageReaction;
  if (message.author.id != user.id) {
    //wrong reacting user
    message.react(commons.accountabilityBuddy.toDoEmoteId);
    return;
  }

  //correct user - now get data
  const perso = PERSONALITY.getPersonality().accountabilityBuddy;
  const aCmn = commons.accountabilityBuddy;
  const { content } = message;

  //process message content
  const lines = content.split("\n");
  console.log("lines", lines);
  const processed = lines.reduce((acc, cur) => {
    const trimmed = " " + cur.trim();

    if (cur.includes(":")) return [...acc, aCmn.starEmoteId + trimmed];
    else if (cur.length) return [...acc, aCmn.toDoEmoteId + trimmed];
    else return [...acc, cur];
  }, []);
  console.log("processed", processed);
  const newContent = processed.join("\n");

  //create embed
  const embed = new EmbedBuilder()
    .setAuthor({ name: user.username, iconURL: user.avatarURL() })
    .setColor(Colors.White)
    .setDescription(newContent)
    .setTimestamp();

  //create buttons
  const style = ButtonStyle.Secondary;
  const currentButton = createButton(
    perso.currentButton,
    null,
    style,
    aCmn.currentEmoteId
  );
  const pauseButton = createButton(
    perso.pauseButton,
    null,
    style,
    aCmn.pauseEmoteId
  );
  const doneButton = createButton(
    perso.doneButton,
    null,
    style,
    aCmn.doneEmoteId
  );
  const cancelButton = createButton(
    perso.cancelButton,
    null,
    style,
    aCmn.cancelEmoteId
  );

  const component = new ActionRowBuilder().addComponents(
    currentButton,
    pauseButton,
    doneButton,
    cancelButton
  );

  //send content
  message.reply({ embeds: [embed], components: [component] });
};

export const accountabilityButtonHandler = async (interaction) => {
  await interaction.deferReply({ ephemeral: true });
  const commons = COMMONS.getShared().accountabilityBuddy;

  //create selectMenu
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("aBuddy_selectMenu")
    .setMinValues(1);

  //set choices
  const message = await interaction.message.fetch();
  console.log("accountabilityButtonHandler", interaction);

  const buttonName = interaction.customId.split("_")[1];
  const choices = message.embeds[0].description
    .split("\n")
    .reduce((acc, cur, idx) => {
      console.log("cur", cur);
      const choice = { value: "aBuddy_selectMenu_" + `${buttonName}_${idx}` };
      if (!cur.length) return acc; //ignore empty line

      const splited = cur.split(" ");
      if (splited[0] === commons.starEmoteId) return acc; //ignore titles

      splited.shift(); //ignore value, it's an emote
      choice.label = splited.join(" ");
      return [...acc, choice];
    }, []);
  console.log("choices", choices);
  selectMenu.addOptions(...choices);

  //send message
  const actionRow = new ActionRowBuilder().addComponents(selectMenu);
  const payload = { components: [actionRow], ephemeral: true };
  interactionEditReply(interaction, payload);
};

export const accountabilitySelectMenuHandler = async (interaction) => {
  await interaction.deferReply({ ephemeral: true });
  const selected = interaction.values;
  console.log("selected", selected);
  //console.log("selectMenuInteraction", interaction);

  //fetch usefull data
  const commons = COMMONS.getShared().accountabilityBuddy;
  const message = await fetchSelectMenuReferenceMessage(interaction);
  const buddyEmbed = message.embeds[0];
  const embed = EmbedBuilder.from(buddyEmbed);

  //modify the lines required
  const splited = selected[0].split("_");
  const idxToModify = Number(splited[splited.length - 1]); //last element
  console.log("oldEmbed", buddyEmbed, "builder", embed);
  const lines = embed.data.description.split("\n");
  const words = lines[idxToModify].split(" ");
  console.log("idx", idxToModify, "lines", lines, "words", words);
  words[0] = commons[splited[2] + "EmoteId"];
  lines[idxToModify] = words.join(" ");
  embed.setDescription(lines.join("\n"));

  //update the message
  message.edit({ embeds: [embed] });
  interactionEditReply(interaction, { ephemeral: true, content: "completed" });
};

//#region Command Object

const buddy = {
  command,
  action,
  help: (interaction) => {
    const perso = PERSONALITY.getPersonality().buddy;
    interactionReply(interaction, perso.help);
  },
  admin: true,
};

export default buddy;
