const isBirthdayDate = (db, authorId) => {
  return db.data.birthdaysUsers
    .map((obj) => {
      return obj.userId;
    })
    .includes(authorId);
};

const addBirthday = (db, authorId, birthday) => {
  db.data.birthdaysUsers = [
    ...db.data.birthdaysUsers.filter(({ userId }) => userId !== authorId),
    { userId: authorId, birthdayDate: birthday },
  ];
  db.wasUpdated = true;
};

const removeBirthday = (db, authorId) => {
  if (isBirthdayDate(db, authorId)) {
    db.data.birthdaysUsers = db.data.birthdaysUsers.filter(
      ({ userId }) => userId !== authorId,
    );
    db.wasUpdated = true;
  }
};

export { addBirthday, isBirthdayDate, removeBirthday };
