import { buttonHandler } from "./pronouns.js";

export const onInteractionCreate = (interaction) => {
  //console.log(interaction);
  if (interaction.isButton()) buttonHandler(interaction);
};
