const isAlavirien = (db, authorId) => {
  return db.data.alavirien
    .map((obj) => {
      return obj.userId;
    })
    .includes(authorId);
};

const addAlavirienNumber = (db, authorId, number) => {
  db.data.alavirien.forEach((user) => {
    if (user.userId === authorId) {
      user.messageNumber += number;
      db.wasUpdated = true;
    }
  })
};

const addAlavirien = (db, authorId, number, date) => {
  if (!isAlavirien(db, authorId)) {
    db.data.alavirien.push({ userId: authorId, messageNumber: number, joinAt: date});
    db.wasUpdated = true;
  } else {
    addAlavirienNumber(db, authorId, number);
  }
};

const removeAlavirien = (db, authorId) => {
  if (isAlavirien(db, authorId)) {
    db.data.alavirien = db.data.alavirien.filter(
      ({ userId }) => userId !== authorId
    );
    db.wasUpdated = true;
  }
};

export { isAlavirien, addAlavirienNumber, addAlavirien, removeAlavirien};
