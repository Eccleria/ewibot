import { creativityButton } from "./gamesButtons.js";

export const gamesButtonHandler = async (interaction) => {
  const { customId } = interaction;
  if (customId.includes("drawer")) drawerButtonHandler(interaction);
};

const drawerButtonHandler = (interaction) => {
  const { customId } = interaction;
  if (customId.includes("creativity")) creativityButton(interaction);
};
