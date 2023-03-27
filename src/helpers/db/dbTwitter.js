const isTwitterUser = (db, authorId) => {
  return db.data.twitter.users
    .map((obj) => {
      return obj.userId;
    })
    .includes(authorId);
};

const getTwitterUser = (db, authorId) => {
  const twitter = db.data.twitter.users;
  if (isTwitterUser(db, authorId)) {
    for (const obj of twitter) {
      if (obj.userId === authorId) {
        return obj;
      }
    }
  }
};

const updateLastTweetId = (db, authorId, tweetId) => {
  const twitter = db.data.twitter.users;
  if (isTwitterUser(db, authorId)) {
    for (const obj of twitter) {
      if (obj.userId === authorId) {
        obj.lastTweetId = tweetId;
      }
    }
    db.wasUpdated = true;
  }
};

const addMissingTweets = (db, tweetIds) => {
  if (typeof tweetIds === "string")
    db.data.twitter.missingTweets.push(tweetIds);
  else db.data.twitter.missingTweets.push(...tweetIds);
  db.wasUpdated = true;
};

const removeMissingTweets = (db, tweetIds) => {
  const missingTweets = db.data.twitter.missingTweets;
  if (typeof tweetIds === "string")
    db.data.twitter.missingTweets = missingTweets.filter(
      (id) => tweetIds !== id
    );
  else
    db.data.twitter.missingTweets = missingTweets.filter(
      (id) => !tweetIds.includes(id)
    );
  db.wasUpdated = true;
};

export {
  getTwitterUser,
  updateLastTweetId,
  addMissingTweets,
  removeMissingTweets,
};