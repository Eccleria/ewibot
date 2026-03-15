import { interactionReply } from "ewilib";

export const buddyModalHandler = (interaction) => {
  const { customId } = interaction;

  if (customId.includes("send_")) buddyModalSendMessage(interaction);
  else {
    console.warn("buddy modal handler not found!", interaction);
    interactionReply(interaction, "ERROR - contactez une Sentinelle.");
  }
}

export const buddyModalSendMessage = async (interaction) => {

}
