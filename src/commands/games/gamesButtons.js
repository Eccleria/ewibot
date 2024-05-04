import { interactionReply } from "../../helpers/index.js";
import { PERSONALITY } from "../../personality.js";

export const creativityButton = (interaction) => {
  //get personality
  const personality = PERSONALITY.getCommands().games;
  const perso = personality.drawer.creativity;
  const bPerso = perso.buttons;

  //dispatch according to type
  const { customId } = interaction;
  if (customId.includes(bPerso.confirm[0])) {
    //confirm button

  } else if (customId.includes(bPerso.deny[0])) {
    //deny button

  } else {
    //wrong button
    interactionReply(interaction, bPerso.errorUnknownButton);
  }
};

export const hsaButtons = (interaction) => {
  //get variables
  const { customId, message, client } = interaction;
  const perso = PERSONALITY.getCommands().games.frontalier.hsa;
  //find corresponding hsa in client
  const clientData = client.games.frontalier.hsa.find((obj) => obj.messageId === message.id);

  if (!clientData) {
    interactionReply(perso.notFound);
    return;
  }

  //store vote in client
};
