const isGiftUser = (db, userId) => {
  return db.data.gift.users.includes(userId);
};

const addGiftUser = (db, userId) => {
  if (!isGiftUser(db, userId)) {
    db.data.gift.users.push(userId);
    db.wasUpdated = true;
  }
};

const removeGiftUser = (db, userId) => {
  const data = db.data.gift.users;
  if (isGiftUser(db, userId)) {
    db.data.gift.users = data.filter((id) => id !== userId);
    db.wasUpdated = true;
  }
};

export { isGiftUser, addGiftUser, removeGiftUser };

const isMessageRecipient = (db, recipientId) => {
  return db.data.gift.messages.map((obj) => obj.userId).includes(recipientId);
};

const addGiftMessage = (db, recipientId, content, senderId) => {
  const data = db.data.gift.messages;
  const toPush = { senderId: senderId, message: content };

  if (!isMessageRecipient(db, recipientId)) {
    //ad user to db + message
    data.push({ userId: recipientId, messages: [toPush] });
  } else {
    const foundObject = data.find((obj) => obj.userId === recipientId);
    foundObject.messages.push(toPush); //add message
  }
  db.wasUpdated = true;
};

const removeGiftMessage = (db, senderId, recipientId = null) => {
  const data = db.data.gift.messages;
  if (recipientId) {
    if (isMessageRecipient(db, recipientId)) {
      //if is in appriopriate db
      const userData = data.find((obj) => obj.userId === recipientId);

      const results = userData.messages.reduce(
        (acc, cur) => {
          //{ userId: , messages: [{ senderId:, message: }] }
          if (cur.senderId === senderId)
            return { new: acc.new, removed: [...acc.removed, cur.message] };
          else return { new: [...acc.new, cur], removed: acc.removed };
        },
        { new: [], removed: [] }
      );

      //update db
      userData.messages = results.new;
      db.wasUpdated = true;

      return results.removed; //return messages for feedback
    } else return null;
  } else {
    return data.reduce((senderAcc, recipientObj) => {
      //recipientObj = {userId, messages}
      const foundMessages = recipientObj.messages.reduce(
        (acc, cur) => {
          //[{ senderId:, message: }, ...]
          if (cur.senderId === senderId)
            return { new: acc.new, removed: [...acc.removed, cur.message] };
          else return { new: [...acc.new, cur], removed: acc.removed };
        },
        { new: [], removed: [] }
      );

      //add foundMessages to overall found messages
      if (foundMessages.removed.length !== 0) {
        //update db
        recipientObj.messages = foundMessages.new;
        db.wasUpdated = true;
        return [
          ...senderAcc,
          { recipientId: recipientObj.userId, messages: foundMessages.removed },
        ];
      } else return senderAcc;
    }, []);
  }
};

const getGiftMessage = (db, senderId, recipientId = null) => {
  const data = db.data.gift.messages;

  if (recipientId) {
    const userData = data.find((obj) => obj.userId === recipientId);

    if (userData) {
      const messages = userData.messages.reduce((acc, cur) => {
        if (cur.senderId === senderId) return [...acc, cur.message];
        else return acc;
      }, []);
      if (messages.length !== 0)
        return [{ recipientId: recipientId, messages: messages }];
    }
    return [];
  } else {
    return data.reduce((senderAcc, recipientObj) => {
      //{userId, messages}
      const foundMessages = recipientObj.messages.reduce((acc, cur) => {
        //{senderId, message}
        if (cur.senderId == senderId) return [...acc, cur.message];
        else return acc;
      }, []);
      if (foundMessages.length !== 0)
        return [
          ...senderAcc,
          { recipientId: recipientObj.userId, messages: foundMessages },
        ];
      else return senderAcc;
    }, []);
  }
};

const addGiftSeparator = (db, separator) => {
  const data = db.data.gift.messages;
  data.forEach((obj) => {
    //{userId, messages}
    obj.messages.push({ senderId: null, message: separator });
  });
};

export {
  addGiftMessage,
  removeGiftMessage,
  isMessageRecipient,
  getGiftMessage,
  addGiftSeparator,
};
