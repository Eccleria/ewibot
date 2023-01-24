import { getFieldNumbers } from "./pollHandler.js";
import {
    addPollVoter,
    getPollVoteIndexes,
    removePollIndex,
    getThisChoicePollIndex,
  } from "../../helpers/index.js";

export const multipleVoteType = async (interaction, dbPoll, perso) => {
    // voteType multiple : count vote, update db + embed
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

      const voteCount = hasVotedIndexes.reduce((acc, cur) => {
        console.log("cur", cur)
        if (cur) return acc + 1;
        else return acc;
      });
      console.log("voteCount", voteCount);

      if(voteCount < dbPoll.voteMax) 
        addPollVoter(db, pollId, userId, currentVoteIdx);
      else {
        interaction.editReply({ content: perso.errorMaxVote, ephemeral: true });
        return;
      }
    }/*
    console.log("hasVotedIndexes", hasVotedIndexes, "oldVoteStatus", oldVoteStatus);
    console.log("toAddVoteIdx", toAddVoteIdx, "toRemoveVoteIdx", toRemoveVoteIdx);
  */
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
  