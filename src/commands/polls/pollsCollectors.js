import { ComponentType } from "discord.js"
import { pollsButtonHandler } from "./pollsHandlers.js";
import { getPolls } from "../../helpers/index.js";

export const initPollsCollector = (client) => {
  // once startup, init polls lookup
  const db = client.db;
  const polls = getPolls(db);

  polls.forEach(async (poll) => {
    const channel = await client.channels.fetch(poll.channelId);
    const message = await channel.messages.fetch(poll.pollId);

    pollButtonCollector(message);
  });
};

const pollBufferLoop = async (client, pollMessageId) => {
  const clientData = client.voteBuffers[pollMessageId];
  for (const interaction of clientData.votes)
    await pollsButtonHandler(interaction);

  //clear client
  delete client.voteBuffers[pollMessageId];
};

const pollVoteBuffer = (interaction) => {
  // store poll vote interaction data in a buffer
  //get data
  const client = interaction.client;
  const pollMessageId = interaction.message.id;

  //get old buffer data
  const bufferData = client.voteBuffers[pollMessageId]
    ? client.voteBuffers[pollMessageId]
    : { timeout: null, votes: [] };
  bufferData.votes.push(interaction);

  //handle timeout
  if (bufferData.timeout) clearTimeout(bufferData.timeout);
  const newTimeout = setTimeout(pollBufferLoop, 3000, client, pollMessageId);
  bufferData.timeout = newTimeout;

  //update client
  client.voteBuffers[pollMessageId] = bufferData;
};

export const pollButtonCollector = (message) => {
  const filter = ({ customId }) => {
    return (
      !isNaN(Number(customId[6])) && typeof Number(customId[6]) == "number"
    );
  };

  const collector = message.createMessageComponentCollector({
    filter,
    componentType: ComponentType.Button,
    time: 2147483647,
  });

  collector.on("collect", async (interaction) => {
    await interaction.deferReply({ ephemeral: true }); //required because should be answered under 3s
    pollVoteBuffer(interaction);
  });

  collector.on("end", (collected) => {
    console.log(`Collected ${collected.size} interactions.`);
  });
};
