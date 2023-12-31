import { interactionReply } from "../../helpers";
import { PERSONALITY } from "../../personality";

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
