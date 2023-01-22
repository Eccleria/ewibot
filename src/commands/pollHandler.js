import {
  addPollVoter,
  getPoll,
  getPollVoteIndexes,
  removePollIndex,
  getThisChoicePollIndex,
} from "../helpers/index.js";
import { PERSONALITY } from "../personality.js";
import { interactionReply } from "./utils.js";

const getFieldNumbers = (fields, newVoteIdx, oldVoteIdx) => {
  const results = fields.reduce(
    (acc, cur, idx) => {
      //"emotes ...*% (no)"
      const splited = cur.value.split(" ");
      //console.log("newVoteIdx", newVoteIdx, "oldVoteIdx", oldVoteIdx)
      //new ratio
      const ratio = Number(splited[1].slice(0, -1));

      //parse old value from fields
      const oldValue = splited[2].includes("\n")
        ? Number(splited[2].split("\n")[0].slice(1, -1)) //get Number in (Number)\n
        : Number(splited[2].slice(1, -1)); //get Number in (Number)

      //new value
      let value = oldValue;
      if (idx === newVoteIdx && idx === oldVoteIdx) value = oldValue - 1;
      else if (idx === newVoteIdx) value = oldValue + 1; //add 1 to voteIdx
      else if (idx === oldVoteIdx) value = oldValue - 1; //remove 1 to oldIndex
      //console.log("newValue", value);
      return { values: [...acc.values, value], ratios: [...acc.ratios, ratio] };
    },
    { values: [], ratios: [] }
  );
  return results;
};

export const voteButtonHandler = (interaction) => {
  // dipatch vote according to voteType
  const { message, client } = interaction;

  //get personality
  const perso = PERSONALITY.getCommands().polls;

  //get db data
  const db = client.db;
  const pollId = message.id;
  const dbPoll = getPoll(db, pollId); //get poll from db
  const { voteType } = dbPoll;

  /*if (voteType === perso.voteOption.choices[1].value) {
    //multiple
    multipleVoteType(interaction, dbPoll, perso);
  } else */ if (voteType === perso.voteOption.choices[0].value) {
    //unique
    uniqueVoteType(interaction, dbPoll, perso);
  } else interactionReply(perso.errorUnknownChoice);
};

/*
const multipleVoteType = async (interaction, dbPoll, perso) => {
  // voteType multiple : count vote, update db + embed
  const { customId, message, user, client } = interaction;

  //get data
  const currentVoteIdx = Number(customId.slice(6)); //field id to add 1 vote
  const userId = user.id;
  const pollId = message.id;

  //get db data
  const db = client.db;
  const isAnonymous = dbPoll.anonymous;
  const { voteType } = dbPoll;

  //handle db
  const hasVotedIndexes = getPollVoteIndexes(db, pollId, userId);
  const oldVoteStatus = hasVotedIndexes[currentVoteIdx];
  let toAddVoteIdx = currentVoteIdx, toRemoveIdx;
  if (oldVoteStatus) {
    //if already voted current vote, remove
    toRemoveIdx = currentVoteIdx;
    toAddVoteIdx = null;
    removePollIndex(db, pollId, userId, currentVoteIdx); 
  } else if (hasVotedIndexes.every((bool) => !bool)) {
    //new vote
    addPollVoter(db, pollId, userId, currentVoteIdx); 
  } else {
    //modify vote
    toRemoveIdx = hasVotedIndexes.findIndex((vote) => vote);
    removePollIndex(db, pollId, userId, toRemoveIdx); //remove old vote
    const voteNb = hasVotedIndexes.reduce((acc, cur) => cur ? acc + 1 : acc, 0);
    
    if (voteNb <= voteMax) {
      addPollVoter(db, pollId, userId, currentVoteIdx);
    } else {
      toAddVoteIdx = null;
      interactionReply(interaction, perso.errorMaxVote);
    }
  }
  console.log("getPollVoteIndexes", getPollVoteIndexes, "currentVoteIdx", currentVoteIdx);
 
};
*/

const uniqueVoteType = async (interaction, dbPoll, perso) => {
  // voteType unique : count vote, update db + embed
  const { customId, message, user, client } = interaction;

  //get data
  const currentVoteIdx = Number(customId.slice(6)); //field id to add 1 vote
  const userId = user.id;
  const pollId = message.id;

  //get db data
  const db = client.db;
  const isAnonymous = dbPoll.anonymous;

  //handle db
  const hasVotedIndexes = getPollVoteIndexes(db, pollId, userId);
  const oldVoteStatus = hasVotedIndexes[currentVoteIdx];

  let toAddVoteIdx = currentVoteIdx,
    toRemoveVoteIdx = -1;
  if (oldVoteStatus) {
    //if already voted current vote, remove
    console.log("already voted => remove");
    toRemoveVoteIdx = currentVoteIdx;
    toAddVoteIdx = null;
  } else if (hasVotedIndexes.every((bool) => !bool)) {
    //new vote
    console.log("new vote");
    addPollVoter(db, pollId, userId, currentVoteIdx);
  } else {
    //modify vote
    console.log("modify vote");
    toRemoveVoteIdx = hasVotedIndexes.findIndex((vote) => vote);
    addPollVoter(db, pollId, userId, currentVoteIdx);
  }
  console.log("hasVotedIndexes", hasVotedIndexes, "oldVoteStatus", oldVoteStatus);
  console.log("toAddVoteIdx", toAddVoteIdx, "toRemoveVoteIdx", toRemoveVoteIdx);

  const oldVoteRemoveIdx =
  !isAnonymous && toRemoveVoteIdx !== -1
    ? getThisChoicePollIndex(db, pollId, userId, toRemoveVoteIdx)
    : -1; //get user embed position if not anonymous && has voted this choice
  if (toRemoveVoteIdx !== -1)  removePollIndex(db, pollId, userId, toRemoveVoteIdx); //remove old vote
  console.log("oldVoteRemoveIdx", !isAnonymous && toRemoveVoteIdx !== -1, oldVoteRemoveIdx);

  //get fields
  const pollEmbed = message.embeds[0];
  const fields = pollEmbed.fields; //get embed fields

  //get new values and old ratios for each field
  const fieldNumbers = getFieldNumbers(fields, toAddVoteIdx, toRemoveVoteIdx);
  console.log("fieldNumbers", fieldNumbers);

  //compute new ratios
  const values = fieldNumbers.values;
  const total = values.reduce((acc, cur) => acc + cur, 0); //get total count nb
  const newRatios = 
    total === 0 
      ? values.map(() => 0) 
      : values.map((value) => Math.round((value / total) * 100)); //emote ratio

  //get progress bar color
  const colorIdx = dbPoll.colorIdx; //db data
  const emoteColor = perso.colorOption.colors.progress_bar[colorIdx]; //emoteId from personality
  const black = perso.colorOption.black; //empty bar color

  //write new fields
  //const toChangeFieldIdx = [toAddVoteIdx, toRemoveVoteIdx];
  const newFields = newRatios.reduce((acc, cur, idx) => {
    const oldField = fields[idx];

    //update values
    const nb = Math.floor(cur / 10);
    const newColorBar =
      emoteColor.repeat(nb) +
      black.repeat(10 - nb) +
      ` ${cur}% (${values[idx]})`; //new colorBar

    //update voters + send
    if (isAnonymous)
      return [...acc, { value: newColorBar, name: oldField.name }];
    else {
      //need to handle users' embeds
      //cases
      //\n
      //\n<@...> <@...>

      //need to change when toAddVoteIdx, toRemoveIdx !== null
      //get old field data
      const oldValue = oldField.value; //get oldField
      const oldVoters = oldValue.includes("\n") ? oldValue.split("\n")[1] : ""; //get old users' embeds

      //remove older user vote from embeds, if any
      const filteredUsersEmbeds =
        oldVoteRemoveIdx !== -1 && toRemoveVoteIdx === idx
          ? " " +
            oldVoters
              .split(" ")
              .slice(1)
              .filter((voter) => voter !== user.toString())
              .join(" ")
          : oldVoters;

      //add current user vote to embeds, if any
      const updatedUsersEmbeds =
        toAddVoteIdx === idx
          ? filteredUsersEmbeds + ` ${user.toString()}`
          : filteredUsersEmbeds;

      //merge text into future field value
      const newFieldValue = newColorBar + "\n" + updatedUsersEmbeds;
      
      console.log("oldValue", [oldValue]);
      console.log("oldVotersSplited", oldVoters.split(" "));
      console.log("oldVoteRemoveIdx !== -1 && toRemoveVoteIdx === idx", oldVoteRemoveIdx !== -1, toRemoveVoteIdx === idx);
      console.log('oldVoters.split(" ").slice(1)', oldVoters.split(" ").slice(1));
      console.log("oldVotersSplitedFiltered", oldVoters.split(" ").slice(1).filter((voter) => voter !== user.toString()));
      console.log("filteredUsersEmbeds", [filteredUsersEmbeds]);
      console.log("updatedUsersEmbeds", [updatedUsersEmbeds]);
      console.log("newFieldValue", [newFieldValue]);
      return [...acc, { value: newFieldValue, name: oldField.name }];
    }
  }, []);
  console.log("newFields", newFields);

  //update embed
  pollEmbed.setFields(...newFields);
  await message.edit({ embeds: [pollEmbed], components: message.components });
  interaction.editReply({ content: perso.counted, ephemeral: true });
};
