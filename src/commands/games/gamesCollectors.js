import { ComponentType } from "discord.js";
import { PERSONALITY } from "../../personality";

const gamesHSACollector = (message, timeout) => {
  const filter = ({ customId }) => {
    return (
      !isNaN(Number(customId[6])) && typeof Number(customId[6]) == "number"
    );
  };

  console.log(timeout);
  const collector = message.createMessageComponentCollector({
    filter,
    componentType: ComponentType.Button,
    time: timeout,
  });

  collector.on("collect", async (interaction) => {
    await interaction.deferReply({ ephemeral: true }); //required because should be answered under 3s
    pollBufferVotes(interaction);
  });

  collector.on("end", (collected) => {
    console.log(`Collected ${collected.size} interactions.`);
    const dbPoll = getPoll(message.client.db, message.id);
    if (dbPoll) {
      const perso = PERSONALITY.getCommands().polls;
      stopPoll(dbPoll, message, perso);
    }
  });
};

const gamesHSABuffer = () => {

};
