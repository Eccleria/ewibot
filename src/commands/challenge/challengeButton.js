import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { PERSONALITY } from "../../personality.js"

export const challengeParticipateButtonAction = (interaction) => {
  //create and send the participation modal
  const perso = PERSONALITY.getPersonality().challenge.participate;

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
    .setRequired(false);

  const titleActionRow = new ActionRowBuilder().addComponents(titleInput);
  const textActionRow = new ActionRowBuilder().addComponents(textInput);

  const modal = new ModalBuilder()
    .setCustomId(perso.modal.customId)
    .setTitle(perso.modal.title)
    .addComponents(titleActionRow, textActionRow);

  interaction.showModal(modal);
}

/*export const challengeSendSettingsButtonAction = (interaction) => {

}*/
