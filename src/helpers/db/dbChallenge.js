
const addChallenge = (db, channelId, messageId, authorId, title) => {
  const challenge = {
    channelId,
    id: messageId,
    authorId,
    title
  }
  db.data.challenges.push(challenge);
  db.wasUpdated = true
};

const removeChallenge = (db, messageId) => {
  db.data.challenges = db.data.challenges.filter((chlg) => chlg.id !== messageId);
  db.wasUpdated = true;
}

export { addChallenge, removeChallenge };
