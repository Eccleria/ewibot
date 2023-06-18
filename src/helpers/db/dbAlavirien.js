const isAlavirien = (db, authorId) => {
  return db.data.alavirien.users
    .map((obj) => {
      return obj.userId;
    })
    .includes(authorId);
};

const addAlavirienNumber = (db, authorId, number) => {
  const data = db.data.alavirien;
  data.users.forEach((user) => {
    if (user.userId === authorId) {
      user.messageNumber += number;
      data.toUpdateIds.push(authorId);
      db.wasUpdated = true;
    }
  });
};

const addAlavirien = (db, authorId, number, date) => {
  if (!isAlavirien(db, authorId)) {
    db.data.alavirien.users.push({
      userId: authorId,
      messageNumber: number,
      joinAt: date,
    });
    db.wasUpdated = true;
  } else {
    addAlavirienNumber(db, authorId, number);
  }
};

const removeAlavirien = (db, authorId) => {
  if (isAlavirien(db, authorId)) {
    const data = db.data.alavirien;
    data.users = data.users.filter(({ userId }) => userId !== authorId);
    data.toUpdateIds = data.toUpdateIds.filter((id) => id !== authorId);
    db.wasUpdated = true;
  }
};

export { isAlavirien, addAlavirienNumber, addAlavirien, removeAlavirien };
