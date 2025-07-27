
export class Poll {
  constructor(pollId, collector, timeout) {
    this.pollId = pollId;
    this.collector = collector;
    this.timeout = timeout;
  }
}


class Polls {
  constructor(polls) {
    this.polls = polls;
  }

  addPoll(poll) {
    this[poll.id] = poll;
  }
  removePoll(pollId) {
    delete this.polls[pollId];
  }
  getPoll(pollId) {
    return this.polls[pollId];
  }
}

export const POLLS = new Polls({});
