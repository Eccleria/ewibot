/**
 * The Challenge instance is added to the CHALLENGE
 */
export class Challenge {
  constructor(challengeId, timeout) {
    this.challengeId = challengeId;
    this.timeout = timeout;
  }
}

class Challenges {
  constructor() {}

  addChallenge(challenge) {
    this[challenge.challengeId] = challenge;
    console.log("Challenges - addChallenge ", challenge.challengeId);
  }
}

export const CHALLENGES = new Challenges();
