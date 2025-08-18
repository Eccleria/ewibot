import { ContainerBuilder, SectionBuilder, TextDisplayBuilder } from "discord.js";
import { addChallengeParticipation, getChallengeParticipationCount } from "../../helpers/index.js";
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

const challengeParticipateModalHandler = async (interaction) => {
  const perso = PERSONALITY.getPersonality().challenge;
  const pPerso = perso.participate;
  const cPerso = perso.challenge;

  const text = interaction.fields.getTextInputValue(pPerso.textInput.customId);
  const title = interaction.fields.getTextInputValue(pPerso.titleInput.customId);
  console.log("challenge modal userInput text", [text], [title]);

  //store the participation
  const client = interaction.client;
  const message = interaction.message;
  addChallengeParticipation(client.db, message.id, interaction.user.id, text, title);

  //update the participant count on the challenge message
  const participantsNumber = getChallengeParticipationCount(client.db, message.id);
  const components = message.components;
  const container = new ContainerBuilder(components[0].toJSON());
  const section = new SectionBuilder(container.components[2].toJSON());
  const participantCountText = new TextDisplayBuilder().setContent(
    cPerso.participantCount[0] + `${participantsNumber}` + cPerso.participantCount[1],
  ); //update the count in the textDisplay
  section.spliceTextDisplayComponents(2, 1, participantCountText); //update the section with the new text
  container.spliceComponents(2, 1, section); //update the container with the new section

  //edit the challenge message with the new count
  await message.edit({
    components: [container, components[1]]
  })
  
  //reply to the modal
  interactionReply(interaction, pPerso.sent);
}
