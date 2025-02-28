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
      },
    ];
    db.wasUpdated = true;
  }
};

const removeReminder = (db, botMessageId) => {
  if (isReminder(db, botMessageId)) {
    db.data.reminder = db.data.reminder.filter(
      (element) => element.answerId !== botMessageId,
    );
    db.wasUpdated = true;
  }
};

const updateReminder = (db, botMessageId, newReminderTime) => {
  db.data.reminder.map((element) => {
    if (element.answerId === botMessageId)
      element.reminderTime = newReminderTime;
  });
  db.wasUpdated = true;
};

export { isReminder, addReminder, removeReminder, updateReminder };
