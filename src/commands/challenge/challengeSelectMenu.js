import {
  ActionRowBuilder,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { PERSONALITY } from "../../personality.js";
import { interactionReply } from "../../helpers/index.js";

export const challengeSelectMenuHandler = async (interaction) => {
  const { customId } = interaction;
  console.log("challengeSelectMenuHandler");
  const personality = PERSONALITY.getPersonality().challenge;

  if (customId.includes("_userInput"))
    challengeUserInputSelectMenuHandler(interaction);
  else
    return interactionReply(interaction, personality.errorSelectMenuNotFound);
};

const challengeUserInputSelectMenuHandler = (interaction) => {
  console.log("challengeUserInputSelectMenuHandler");
  const values = interaction.values;
  const selected = values[0].split("userInput")[1];
  console.log("selected", selected);

  if (selected.includes("_userChallenge"))
    challengeUserSelectMenuHandler(interaction);
  else if (selected.includes("_defaultChallenge"))
    challengeDefaultSelectMenuHandler(interaction);
};

const challengeUserSelectMenuHandler = (interaction) => {
  console.log("userChallengeSelectMenuHandler");
  const perso = PERSONALITY.getPersonality().challenge.userInput;

  //create the modal for user input
  const textInput = new TextInputBuilder()
    .setCustomId(perso.textInput.customId)
    .setLabel(perso.textInput.label)
    .setPlaceholder(perso.textInput.placeholder)
    .setStyle(TextInputStyle.Paragraph)
    .setMinLength(1)
    .setRequired(true);
  const titleInput = new TextInputBuilder()
    .setCustomId(perso.titleInput.customId)
    .setLabel(perso.titleInput.label)
    .setPlaceholder(perso.titleInput.placeholder)
    .setStyle(TextInputStyle.Short)
    .setMinLength(1)
    .setRequired(true);

  const titleActionRow = new ActionRowBuilder().addComponents(titleInput);
  const textActionRow = new ActionRowBuilder().addComponents(textInput);

  const modal = new ModalBuilder()
    .setCustomId(perso.modal.customId)
    .setTitle(perso.modal.title)
    .addComponents(titleActionRow, textActionRow);

  interaction.showModal(modal);
};

const challengeDefaultSelectMenuHandler = async (interaction) => {
  console.log("defaultChallengeSelectMenuHandler");
  await interaction.deferUpdate({ flags: MessageFlags.Ephemeral });
};
