const isTimeoutUser = (db, userId) => {
  return db.data.timeout.map((obj) => obj.userId).includes(userId);
};

const getTimeoutUser = (db, userId) => {
  return db.data.timeout.find((user) => user.userId === userId);
}

const addTimeoutUser = (db, userId, currentDelay, totalDelay, spentDelay, reason) => {
  if (!isTimeoutUser(db, userId)) {
    db.data.timeout = [...db.data.timeout, 
      {
        userId,
        reason,
        currentDelay,
        spentDelay,
        totalDelay,
      }
    ]
  }
};

const removeTimeoutUser = (db, userId) => {
  const data = db.data.timeout
  const returned = data.reduce((acc, cur, idx) => {
    if (cur.userId === userId) {
      acc.removed = cur;
      acc.newDb = db.data.timeout.splice(idx, 1);
    }
    return acc;
  }, {newDb: [], removed: undefined});
  
  db.data.timeout = returned.newDb;
  db.wasUpdated = true;
  return returned.removed
};

const updateTimeoutUser = (db, userId, param, value) => {
  const data = getTimeoutUser(db, userId);
  data[param] = value;
  db.wasUpdated = true;
}

export { isTimeoutUser, getTimeoutUser, addTimeoutUser, removeTimeoutUser, updateTimeoutUser };