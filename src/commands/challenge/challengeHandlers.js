import { interactionReply } from "../../helpers/index.js";
import { challengeParticipateButtonAction, challengeSendSettingsButtonAction } from "./challengeButton.js";

export const challengeButtonHandler = (interaction) => {
  const { customId } = interaction;

  if (customId.includes("participate")) 
    challengeParticipateButtonAction(interaction);
  else if (customId.includes("settings"))
    challengeSendSettingsButtonAction(interaction); 
  else interactionReply(interaction, "ERROR 404");
}
