import dayjs from "dayjs";
import "dayjs/locale/fr.js";
import Duration from "dayjs/plugin/duration.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
dayjs.locale("fr");
dayjs.extend(Duration);
dayjs.extend(relativeTime);

import { ComponentType, MessageFlags } from "discord.js";
import { pollsButtonHandler } from "./pollsHandlers.js";
import { stopPoll } from "./pollsUtils.js";
import { getPoll, getPolls, messageReply, removePoll } from "../../helpers/index.js";
import { PERSONALITY } from "../../personality.js";
import { Poll, POLLS } from "../../polls.js";

export const initPollsCollector = (client) => {
  // once startup, init polls lookup
  const db = client.db;
  const polls = getPolls(db);

  polls.forEach(async (poll) => {
    const channel = await client.channels.fetch(poll.channelId);
    let message;
    try {
      message = await channel.messages.fetch(poll.pollId);
    } catch (e) {
      console.log("pollMessage deleted, cannot start Collector. Db updated", e);
      removePoll(db, poll.pollId);
      return; //same as continue in forEach
    }

    //compute new reminder waiting time
    const now = dayjs();
    const difference = dayjs(poll.pollDate).diff(now);
    const newTiming = difference > 0 ? difference : 10000; //if passed, waiting time of 10s

    //create the 1h timeout if required
    let timeout = null;
    if (newTiming >= 3600000) {
      timeout = setTimeout(
        (message) => {
          const perso = PERSONALITY.getPersonality().polls;
          const payload = { content: perso.create.reminder};
          messageReply(message, payload);
        },
        newTiming - 3600000,
        message,
      );
    }

    //create collector
    const collector = pollButtonCollector(message, newTiming);

    //update POLLS
    const pollInstance = new Poll(poll.pollId, collector, timeout);
    POLLS.addPoll(pollInstance);
  });
};

/**
 * Loop over votes and handle the interactions
 * @param {object} client Bot client
 * @param {string} pollMessageId The id of the message containing the poll
 */
const pollBufferLoop = async (client, pollMessageId) => {
  const clientData = client.voteBuffers[pollMessageId];
  if (clientData) {
    for (const interaction of clientData.votes)
      await pollsButtonHandler(interaction);

    delete client.voteBuffers[pollMessageId]; //clear client
  }
};

/**
 * Store votes interaction in client and reset timeout
 * @param {object} interaction vote interaction
 */
const pollBufferVotes = (interaction) => {
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
    componentType: ComponentType.Button,
    time: timeout,
  });

  collector.on("collect", async (interaction) => {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral }); //required because should be answered under 3s
      pollBufferVotes(interaction);
    } catch (error) {
      console.log("vote collect failed");
      console.log(error);
    }
  });

  collector.on("end", (collected) => {
    console.log(`Collected ${collected.size} interactions.`);
    const dbPoll = getPoll(message.client.db, message.id);
    if (dbPoll) {
      const perso = PERSONALITY.getPersonality().polls;
      stopPoll(dbPoll, message, perso, true);
    }
  });

  return collector;
};
