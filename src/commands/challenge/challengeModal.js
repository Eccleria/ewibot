import { addChallengeParticipation } from "../../helpers/index.js";
import { interactionReply } from "../../helpers/utils.js";
import { PERSONALITY } from "../../personality.js";
import { createChallenge } from "./challenge.js";

export const challengeModalHandler = (interaction) => {
  const { customId } = interaction;
  console.log("challengeModalHandler");

  if (customId.includes("_userInput"))
    challengeUserInputModalHandler(interaction);
  else if (customId.includes("_participate"))
    challengeParticipateModalHandler(interaction);
};

const challengeUserInputModalHandler = (interaction) => {
  const perso = PERSONALITY.getPersonality().challenge.userInput;

  const text = interaction.fields.getTextInputValue(perso.textInput.customId);
  const title = interaction.fields.getTextInputValue(perso.titleInput.customId)
  console.log("challenge modal userInput text", [text]);

  //now the input is given, let's start the challenge
  createChallenge(interaction, title, text);

  //reply to the modal
  interactionReply(interaction, perso.sent);
};

const challengeParticipateModalHandler = (interaction) => {
  const perso = PERSONALITY.getPersonality().challenge.participate;

  const text = interaction.fields.getTextInputValue(perso.textInput.customId);
  const title = interaction.fields.getTextInputValue(perso.titleInput.customId);
  console.log("challenge modal userInput text", [text], [title]);

  //store the participation
  addChallengeParticipation(interaction.client.db, interaction.message.id, interaction.user.id, text, title);

  //update the participant count on the challenge message
  const message = interaction.message;
  console.log("participation message", message);

  //reply to the modal
  interactionReply(interaction, perso.sent);
}
