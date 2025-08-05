/**
 * The object Poll is the content added to the Polls unique instance.
 */
export class Poll {
  /**
   * Create a Poll instance, storing collector and timeout objects.
   * @param {string} pollId The id of the poll message.
   * @param {object} collector The collector object associated to this poll.
   * @param {object} timeout The timeout object associated to this poll.
   */
  constructor(pollId, collector, timeout) {
    this.pollId = pollId;
    this.collector = collector;
    this.timeout = timeout;
  }
}

/**
 * Class storing poll data that cannot be stored in db
 * such as timeout and collector objects.
 */
class Polls {
  /**
   * Polls unique instance is an empty object when instanciated.
   */
  constructor() {}

  /**
   * Add a poll as a property.
   * @param {Poll} poll Poll object to add
   */
  addPoll(poll) {
    this[poll.pollId] = poll;
    console.log("Polls - addPoll", poll.pollId);
  }

  /**
   * Remove a poll.
   * @param {string} pollId The id of the poll to remove
   */
  removePoll(pollId) {
    delete this[pollId];
    console.log("Polls - removePoll", pollId);
  }

  /**
   * Get a poll.
   * @param {string} pollId 
   * @returns Poll
   */
  getPoll(pollId) {
    return this[pollId];
  }
}

//Unique instance of Polls class, used in all files
export const POLLS = new Polls();
