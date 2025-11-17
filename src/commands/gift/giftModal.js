import { addGiftMessage, interactionReply } from "../../helpers/index.js";
import { PERSONALITY } from "../../personality.js";

export const giftModalHandler = (interaction) => {
  const { customId } = interaction;

  if (customId.includes("send_")) giftModalSendMessage(interaction);
  else {
    console.warn("gift modal handler not found!", interaction);
    interactionReply(interaction, "ERROR - contactez une Sentinelle.");
  }
};

const giftModalSendMessage = (interaction) => {
  const db = interaction.client.db;
  const author = interaction.member;
  const personality = PERSONALITY.getPersonality().gift;
  const sPerso = personality.send;
  const mPerso = sPerso.modal;

  //get targetId from modal customId
  const targetId = interaction.customId.split("=")[1]; //customId="[...]_id={id}"
  const content = interaction.fields.getTextInputValue(
    mPerso.textInput.customId,
  ); //get gift content

  //check content size
  if (content.length > 1900) {
    console.log(`gift modal - sent content size ${content.length} > 1900`);
    interactionReply(interaction, sPerso.errorTooLong);
    return;
  }

  //store message and reply
  addGiftMessage(db, targetId, content, author.id); //add to db
  interactionReply(interaction, sPerso.saved);
};
