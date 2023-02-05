//POLLS
const addPoll = (
  db,
  id,
  authorId,
  votes,
  anonymous,
  voteType,
  colorIdx,
  voteMax,
  title
) => {
  const poll = {
    pollId: id,
    authorId: authorId,
    anonymous: anonymous,
    colorIdx: colorIdx,
    voteMax: voteMax,
    voteType: voteType,
    votes: votes,
    title: title,
  };

  db.data.polls.push(poll);
  db.wasUpdated = true;
};

const getPoll = (db, pollId) => {
  return db.data.polls.find((poll) => poll.pollId === pollId);
};

const getPollFromTitle = (db, title) => {
  return db.data.polls.find((poll) => poll.title === title);
};

const getPollsTitles = (db) => {
  return db.data.polls.map((poll) => poll.title);
};

const addPollChoices = (db, pollId, choices) => {
  const data = getPoll(db, pollId);
  data.votes.push(...choices);
  db.wasUpdated = true;
};

const addPollVoter = (db, pollId, userId, choiceIdx) => {
  const data = getPoll(db, pollId);
  data.votes[choiceIdx].push(userId);
  db.wasUpdated = true;
};

const isThisChoicePollVoter = (db, pollId, userId, voteIdx) => {
  const data = getPoll(db, pollId);
  const choice = data.votes[voteIdx];
  if (choice) return choice.includes(userId);
  else return null;
};

const getPollVoteIndexes = (db, pollId, userId) => {
  //return index of userId vote
  const { votes } = getPoll(db, pollId);
  return votes.reduce((acc, cur) => [...acc, cur.includes(userId)], []);
};

const getThisChoicePollIndex = (db, pollId, userId, voteIdx) => {
  const { votes } = getPoll(db, pollId);
  console.log(
    "votes",
    votes,
    votes[voteIdx].findIndex((id) => id === userId)
  );
  return votes[voteIdx].findIndex((id) => id === userId);
};

const removePoll = (db, pollId) => {
  db.data.polls = db.data.polls.filter((poll) => poll.pollId !== pollId);
  db.wasUpdated = true;
};

const removePollIndex = (db, pollId, userId, voteIdx) => {
  const data = getPoll(db, pollId);
  data.votes[voteIdx] = data.votes[voteIdx].filter((id) => id !== userId);
  db.wasUpdated = true;
};

export {
  addPoll,
  getPoll,
  getPollFromTitle,
  getPollsTitles,
  addPollChoices,
  addPollVoter,
  isThisChoicePollVoter,
  getPollVoteIndexes,
  getThisChoicePollIndex,
  removePoll,
  removePollIndex,
};
