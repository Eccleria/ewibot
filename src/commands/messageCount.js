import {
  isUserMessagesCounted,
  addUserMessageCount,
  removeUserMessageCount,
} from "../helpers/dbHelper.js";

import personnalities from "../personnalities.json";

const getUserMessageCount = (db, authorId) => {
  return db.data.messageCount.filter(( user ) => user.userId === authorId);
};

const sendCount = async (message, personality, client) => {
  const authorId = message.author.id;
  const db = client.db;

  const user = getUserMessageCount(db, authorId)[0];
  if (user.messageNumber % 1000 === 0)
    await message.reply(personality.messageCount.notification +
      `${user.messageNumber}.`);
};

const action = async (message, personality, client) => {
  const db = client.db;
  const authorId = message.author.id;
  const args = message.content.split(" ");

  if (args.length > 1) {
    if (args[1] === "add") {
      const number = args.length > 2 ? Number(args[2]) : -1;

      if (number === -1) {
        await message.reply(personality.messageCount.errorNumber);
        return;
      } else if (isUserMessagesCounted(db, authorId)) { // already exists
        addUserMessageCount(db, authorId, number);
        await message.reply(personality.messageCount.countModified +
          `${getUserMessageCount(db, authorId)[0].messageNumber}.`);
      } else { // does not exist
        addUserMessageCount(db, authorId, number);
        await message.reply(personality.messageCount.addUser);
      }
    } else if (args[1] === "remove") {
      if (isUserMessagesCounted(db, authorId)) {
        removeUserMessageCount(db, authorId);
        await message.reply(personality.messageCount.removeUser);
      }
    }
  } else { // no args
    if (isUserMessagesCounted(db, authorId))
      await message.reply(
        personality.messageCount.number[0] +
          `${getUserMessageCount(db, authorId)[0].messageNumber}` +
          personality.messageCount.number[1]
      );
    else await message.reply(personality.messageCount.userNotFound);
  }
};

const messageCount = {
  name: "messageCount",
  action,
  help: () => {
    return personnalities.normal.commands.messageCount.help;
  },
  admin: false,
};

export { sendCount, messageCount };
