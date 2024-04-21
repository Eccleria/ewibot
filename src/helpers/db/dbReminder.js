const isReminder = (db, botMessageId) => {
  return db.data.reminder
    .map((obj) => {
      return obj.answerId;
    })
    .includes(botMessageId);
};

const addReminder = (
  db,
  interaction,
  botMessage,
  endingTime,
  messageContent,
  toMention
) => {
  if (!isReminder(db, botMessage.id)) {
    db.data.reminder = [
      ...db.data.reminder,
      {
        authorId: interaction.member.id,
        answerId: botMessage.id,
        requestChannelId: interaction.channelId,
        answerChannelId: botMessage.channel.id,
        reminderTime: endingTime,
        content: messageContent,
        toMention: toMention,
      },
    ];
    db.wasUpdated = true;
  }
};

const addReminderUser = (db, answerId, userId) => {
  if (isReminder(db, answerId)) {
    db.data.reminder.forEach((element) => {
      if (element.answerId === answerId) {
        element.toMention = [...element.toMention, userId];
        db.wasUpdated = true;
      }
    })
  }
}

const removeReminder = (db, botMessageId) => {
  if (isReminder(db, botMessageId)) {
    db.data.reminder = db.data.reminder.filter(
      (element) => element.answerId !== botMessageId
    );
    db.wasUpdated = true;
  }
};

const updateReminderTime = (db, botMessageId, newReminderTime) => {
  db.data.reminder.map((element) => {
    if (element.answerId === botMessageId)
      element.reminderTime = newReminderTime;
  });
  db.wasUpdated = true;
};

export { isReminder, addReminder, addReminderUser, removeReminder, updateReminderTime };
