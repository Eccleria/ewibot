import { pollsButtonHandler } from "./polls.js";

export const pollButtonCollector = (message) => {
  const filter = (customId) => {
    return typeof Number(customId[6]) == "number"
  };

  const collector = message.createMessageComponentCollector(
    { filter, componentType: "BUTTON", time: 10000 }
  );
  
  collector.on("collect", async (interaction) => {
    console.log("interaction collected");

    await interaction.deferReply({ephemeral: true}); //required because should be answered under 3s
    pollsButtonHandler(interaction);
  });

  collector.on("end", (collected) => {
      console.log(`Collected ${collected.size} interactions.`)
    }
  );
};