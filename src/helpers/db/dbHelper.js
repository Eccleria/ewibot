// ADMIN
const addAdminLogs = (db, messageId, type, index) => {
  const adminLogs = db.data.adminLogs;
  //{frequent: [[]...], userAD: [[]...]}
  const data = adminLogs[type]; // [[]...]

  data[index].push(messageId);
  db.wasUpdated = true;
};

const getAdminLogs = (db) => {
  return db.data.adminLogs;
};

const removeAdminLogs = (db, type) => {
  const adminLogs = db.data.adminLogs;
  //{frequent: [[]...], userAD: [[]...]}
  const data = adminLogs[type]; // [[]...]
  const sliced = data.slice(1); //remove first
  sliced.push([]); //add [] at the end

  db.data.adminLogs[type] = sliced;
  db.wasUpdated = true;
};

export { addAdminLogs, getAdminLogs, removeAdminLogs };

// APOLOGY COUNTING
const isApologyUser = (authorId, db) => {
  return db.data.apologiesCounting
    .map((obj) => {
      return obj.userId;
    })
    .includes(authorId);
};

const addApologyCount = (authorId, db) => {
  const { apologiesCounting } = db.data;

  if (isApologyUser(authorId, db)) {
    // If already in DB, add +1 to the counter
    for (const obj of apologiesCounting) {
      if (obj.userId === authorId) {
        obj.counter++;
      }
    }
  } else {
    // Else add user
    db.data.apologiesCounting = [
      ...db.data.apologiesCounting,
      { userId: authorId, counter: 1 },
    ];
  }
  db.wasUpdated = true;
};

const removeAppologyCount = (authorId, db) => {
  if (isApologyUser(authorId, db)) {
    db.data.apologiesCounting = db.data.apologiesCounting.filter(
      (cur) => cur.userId !== authorId
    );
    db.wasUpdated = true;
  }
};

export { isApologyUser, addApologyCount, removeAppologyCount };

// BIRTHDAY
const isBirthdayDate = (authorId, db) => {
  return db.data.birthdaysUsers
    .map((obj) => {
      return obj.userId;
    })
    .includes(authorId);
};

const addBirthday = (authorId, db, birthday) => {
  db.data.birthdaysUsers = [
    ...db.data.birthdaysUsers.filter(({ userId }) => userId !== authorId),
    { userId: authorId, birthdayDate: birthday },
  ];
  db.wasUpdated = true;
};

const removeBirthday = (authorId, db) => {
  if (isBirthdayDate(authorId, db)) {
    db.data.birthdaysUsers = db.data.birthdaysUsers.filter(
      ({ userId }) => userId !== authorId
    );
    db.wasUpdated = true;
  }
};

export { addBirthday, removeBirthday, isBirthdayDate };
