const addPoll = (
  db,
  id,
  channelId,
  authorId,
  votes,
  anonymous,
  colorIdx,
  voteMax,
  title,
  pollDate,
) => {
  const poll = {
    pollId: id,
    channelId: channelId,
    authorId: authorId,
    anonymous: anonymous,
    colorIdx: colorIdx,
    voteMax: voteMax,
    votes: votes,
    title: title,
    pollDate: pollDate,
  };

  db.data.polls.push(poll);
  db.wasUpdated = true;
};

const getPoll = (db, pollId) => {
  return db.data.polls.find((poll) => poll.pollId === pollId);
};

const getPolls = (db) => {
  return db.data.polls;
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
  data.votes[choiceIdx].votes.push(userId);
  db.wasUpdated = true;
};

const isThisChoicePollVoter = (db, pollId, userId, voteIdx) => {
  const data = getPoll(db, pollId);
  const choice = data.votes[voteIdx];
  if (choice) return choice.votes.includes(userId);
  else return null;
};

const isPollEmptyVotes = (db, pollId) => {
  const data = getPoll(db, pollId);
  return data.votes.every((obj) => obj.votes.length === 0);
};

const getPollVoteIndexes = (db, pollId, userId) => {
  //return index of userId vote
  const { votes } = getPoll(db, pollId);
  return votes.reduce((acc, cur) => [...acc, cur.votes.includes(userId)], []);
};

const getThisChoicePollIndex = (db, pollId, userId, voteIdx) => {
  const { votes } = getPoll(db, pollId);
  return votes[voteIdx].votes.findIndex((id) => id === userId);
};

const removePoll = (db, pollId) => {
  db.data.polls = db.data.polls.filter((poll) => poll.pollId !== pollId);
  db.wasUpdated = true;
};

const removePollChoice = (db, pollId, buttonId) => {
  const data = getPoll(db, pollId);
  data.votes = data.votes.filter((choice) => choice.buttonId !== buttonId);
  db.wasUpdated = true;
};

const removePollIndex = (db, pollId, userId, voteIdx) => {
  const data = getPoll(db, pollId);
  data.votes[voteIdx].votes = data.votes[voteIdx].votes.filter(
    (id) => id !== userId,
  );
  db.wasUpdated = true;
};

const resetPollVoters = (db, pollId) => {
  const data = getPoll(db, pollId);
  const newVoters = data.votes.map((obj) => {
    return { votes: [], buttonId: obj.buttonId };
  });
  data.votes = newVoters;
  db.wasUpdated = true;
};

const updatePollParam = (db, pollId, param, newValue) => {
  const data = getPoll(db, pollId);
  data[param] = newValue;
  db.wasUpdated = true;
};

const updatePollButtonId = (db, pollId, oldId, newId) => {
  const data = getPoll(db, pollId);
  const idx = data.votes.findIndex((choice) => choice.buttonId === oldId);

  data.votes[idx].buttonId = newId;
  db.wasUpdated = true;
};

export {
  addPoll,
  getPoll,
  getPolls,
  getPollFromTitle,
  getPollsTitles,
  addPollChoices,
  addPollVoter,
  isThisChoicePollVoter,
  isPollEmptyVotes,
  getPollVoteIndexes,
  getThisChoicePollIndex,
  removePoll,
  removePollChoice,
  removePollIndex,
  resetPollVoters,
  updatePollParam,
  updatePollButtonId,
};
