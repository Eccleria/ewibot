import { interactionReply } from "../../helpers/index.js";
import { challengeParticipateButtonAction } from "./challengeButton.js";

export const challengeButtonHandler = (interaction) => {
  const { customId } = interaction;

  if (customId.includes("participate")) 
    challengeParticipateButtonAction(interaction);
  else interactionReply(interaction, "ERROR 404");
}
