// IGNORED USERS
const addIgnoredUser = async (authorId, db) => {
  if (!db.data.ignoredUsersIds.includes(authorId)) {
    db.data.ignoredUsersIds.push(authorId);
  }
  db.wasUpdated = true;
};

const removeIgnoredUser = async (authorId, db) => {
  if (db.data.ignoredUsersIds.includes(authorId)) {
    db.data.ignoredUsersIds = db.data.ignoredUsersIds.filter(
      (id) => id !== authorId
    );
  }
  db.wasUpdated = true;
};

const isUserIgnored = async (authorId, db) => {
  return db.data.ignoredUsersIds.includes(authorId);
};

const getIgnoredUsers = (db) => {
  console.log(db);
  return db.data.ignoredUsersIds;
};

// APOLOGIES

const getApologyUsers = (db) => {
  return db.data.apologiesCounting;
};

const isApologyUser = (authorId, db) => {
  return getApologyUsers(db)
    .map((obj) => {
      return obj.userId;
    })
    .includes(authorId);
};

const addApologyCount = async (authorId, db) => {
  const { apologiesCounting } = db.data;

  if (isApologyUser(authorId, db)) {
    for (const obj of apologiesCounting) {
      if (obj.userId === authorId) {
        obj.counter++;
      }
    }
  } else {
    db.data.apologiesCounting = [
      ...db.data.apologiesCounting,
      { userId: authorId, counter: 1 },
    ];
  }
  db.wasUpdated = true;
};

const resetApologyCount = async (db) => {
  db.data.apologiesCounting = [];
  db.wasUpdated = true;
};
export {
  getApologyUsers,
  isApologyUser,
  addApologyCount,
  resetApologyCount,
  addIgnoredUser,
  removeIgnoredUser,
  getIgnoredUsers,
  isUserIgnored,
};
