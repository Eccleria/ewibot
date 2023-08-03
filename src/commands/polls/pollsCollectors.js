import dayjs from "dayjs";
import "dayjs/locale/fr.js";
import Duration from "dayjs/plugin/duration.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
dayjs.locale("fr");
dayjs.extend(Duration);
dayjs.extend(relativeTime);

import { pollsButtonHandler } from "./pollsHandlers.js";
import { getPoll, getPolls } from "../../helpers/index.js";
import { stopPoll } from "./pollsUtils.js";
import { PERSONALITY } from "../../personality.js";

export const initPollsCollector = (client) => {
  // once startup, init polls lookup
  const db = client.db;
  const polls = getPolls(db);

  polls.forEach(async (poll) => {
    const channel = await client.channels.fetch(poll.channelId);
    const message = await channel.messages.fetch(poll.pollId);

    //compute new reminder waiting time
    const now = dayjs();
    const difference = dayjs(poll.pollDate).diff(now);
    const newTiming = difference > 0 ? difference : 10000; //if passed, waiting time of 10s

    pollButtonCollector(message, newTiming);
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

export const pollButtonCollector = (message, timeout) => {
  const filter = ({ customId }) => {
    return (
      !isNaN(Number(customId[6])) && typeof Number(customId[6]) == "number"
    );
  };

  console.log(timeout);
  const collector = message.createMessageComponentCollector({
    filter,
    componentType: "BUTTON",
    time: timeout,
  });

  collector.on("collect", async (interaction) => {
    await interaction.deferReply({ ephemeral: true }); //required because should be answered under 3s
    pollVoteBuffer(interaction);
  });

  collector.on("end", (collected) => {
    console.log(`Collected ${collected.size} interactions.`);
    const dbPoll = getPoll(message.client.db, message.id);
    const perso = PERSONALITY.getCommands().polls;
    stopPoll(dbPoll, message, perso);
  });
};
