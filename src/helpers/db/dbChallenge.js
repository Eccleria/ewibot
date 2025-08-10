import { dbReturnType } from "./dbStats.js";

//#region Challenge

const isChallenge = (db, challengeId) => {
  const result = db.data.challenges.map((chlg) => chlg.challengeId).includes(challengeId);
  if (result) return dbReturnType.isIn;
  else return dbReturnType.isNotIn;
}

const addChallenge = (db, authorId, challengeId, title) => {
  db.data.challenges.push({
    authorId,
    challengeId,
    participations: [],
    title,
  });
  db.wasUpdated = true;
};

const getChallenge = (db, challengeId) => {
  if (isChallenge(db, challengeId)) {
    const result = db.data.challenges.find((chlg) => chlg.challengeId === challengeId);
    return result
  }
}

const removeChallenge = (db, challengeId) => {
  const data = db.data.challenges;
  db.data.challenges = data.filter((chlg) => chlg.challengeId !== challengeId);
  db.wasUpdated = true;
}

export { addChallenge, isChallenge, removeChallenge };

//#endregion

//#region Participation

const addChallengeParticipation = (db, challengeId, authorId, text, title) => {
  const challenge = getChallenge(db, challengeId);
  if (challenge) {
    challenge.participations.push({authorId, text, title});
    db.wasUpdated = true;
    return dbReturnType.isOk;
  } else return dbReturnType.isNotOk;
};

export { addChallengeParticipation };

//#endregion

//#region Utils

const getChallengeParticipationCount = (db, challengeId) => {
  const count = getChallenge(db, challengeId).participations.length;
  return count
}

export { getChallengeParticipationCount };
