const action = async (message, client, currentServer) => {
  const { channel, content, author } = message;
  const words = content.split(" ");
  const wordTiming = words[1];
  let timing = 0;
  for (let i = 2, j = 0; i >= 0; i--, j += 3)
    timing += parseInt(wordTiming.slice(j, j + 2)) * 60 ** i;
  timing *= 1000;
  const timeoutObj = setTimeout(
    async (client) => {
      await channel.send(words.slice(2).join(" "));
      client.remindme.splice(
        client.remindme.findIndex((element) => element.authorId === author.id),
        1
      );
    },
    timing,
    client
  );
  const answer = await message.reply(
    `Le reminder a été créé. Vous pouvez react avec \
${currentServer.removeEmoji} pour annuler cet ajout !`
  );
  answer.react(currentServer.removeEmoji);
  client.remindme.push({
    authorId: author.id,
    botMessage: answer,
    timeout: timeoutObj,
  });
};

const reminder = {
  name: "reminder",
  action,
  help: "Tape $reminder --h--m-- *contenu* pour avoir un rappel avec \
le *contenu* au bout du délai indiqué.\nPour supprimer un reminder\
, clique sur la reac ❌. Si tu as demandé plusieurs reminder, seul \
le premier sera supprimé",
};

export default reminder;
