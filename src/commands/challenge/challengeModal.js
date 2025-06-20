import { interactionReply } from "../../helpers/utils.js";
import { PERSONALITY } from "../../personality.js";
import { createChallenge } from "./challenge.js";

export const challengeModalHandler = (interaction) => {
  const { customId } = interaction;
  console.log("challengeModalHandler");

  if (customId.includes("_userInput"))
    challengeUserInputModalHandler(interaction);
};

const challengeUserInputModalHandler = (interaction) => {
  const perso = PERSONALITY.getPersonality().challenge.userInput;

  const userInput = interaction.fields.getTextInputValue(perso.input.customId);
  console.log("userInput modal", [userInput]);

  //now the input is given, let's start the challenge
  createChallenge(interaction, userInput);

  //reply to the modal
  interactionReply(interaction, perso.sent);
};
