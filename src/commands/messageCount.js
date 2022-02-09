import {
  isCountUserMessage,
  addCountUserMessage,
  removeCountUserMessage,
} from "../helpers/dbHelper.js"

const sendCount = async (message, client) => {
  const authorId = message.author.id;
  const db = client.db;

  const user = db.data.messageCount.filter(({ userId }) => userId === authorId);
  if (user.messageCount % 1000 === 0) await message.reply(`Et hop, 1000 messages de plus ! \
Cela vous en fait ${user.messageCount}`);
};

const addTotalCount = (message, client) => {
  const authorId = message.author.id;
  const db = client.db;
  let count = 0;
  client.channels.cache.forEach(async (channel) => {
    if (channel.type === 'GUILD_TEXT') {
      let loop = 0;
      let lastId = "";
      do {
        let foundMessages = 0;
        if (!loop) {
          foundMessages = await channel.messages.fetch({ limit: 100 });
        } else {
          foundMessages = await channel.messages.fetch({ limit: 100, after: lastId});
        }
        const foundMessagesSize = foundMessages.size;
        if (foundMessagesSize != 0) {
          lastId = foundMessages.at(foundMessagesSize - 1).id;
          console.log("size", foundMessagesSize, "lastId", lastId, "message", foundMessages.at(foundMessagesSize - 1).content);
          const authorMessages = foundMessages.filter(({ author }) => author.id === authorId);
          const messageLen = authorMessages.size;
          count += messageLen;
          console.log("authorMessagesSize", messageLen, "channel", channel.name, "count", count);
          loop++;
        } else (loop = 0);
      } while (loop);
    }
  });
  const authorCount = db.data.messageCount.filter(({ userId }) => userId === authorId);
  if (authorCount) {
    authorCount.messageCount += count;
    db.wasUpdated = true;
  }
  return count;
};

const messageCount = {
  name: "messageCount",
  action: async (message, client) => {
    const db = client.db;
    const authorId = message.author.id;
    if (isCountUserMessage(db, authorId)) {
      removeCountUserMessage(db, authorId);
      await message.reply("Je ne compterai plus le nombre de vos messages.");
      db.wasUpdated = true;
    } else {
      addCountUserMessage(db, authorId);
      console.log(addTotalCount(message, client));
      await message.reply("Je vais compter le nombre de vos messages.");
      db.wasUpdated = true;
    }
  },
  help: "en construction",
  admin: false,
};

export { sendCount, addTotalCount, messageCount };