
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