import { PERSONALITY } from "../../personality.js";
import { removePoll } from "../../helpers/index.js";

/**
 * Extract votes values and ratios from poll embed fields
 * @param {list} fields Poll embed fields
 * @param {number} newVoteIdx Current vote button index
 * @param {number} oldVoteIdx Precedent user vote index, from database
 * @returns Object with new vote values and old ratios
 */
export const getFieldNumbers = (fields, newVoteIdx, oldVoteIdx) => {
  const results = fields.reduce(
    (acc, cur, idx) => {
      //"emotes ...*% (no)"
      const splited = cur.value.split(" ");
      //new ratio
      const ratio = Number(splited[1].slice(0, -1));

      //parse old value from fields
      const oldValue = splited[2].includes("\n")
        ? Number(splited[2].split("\n")[0].slice(1, -1)) //get Number in (Number)\n
        : Number(splited[2].slice(1, -1)); //get Number in (Number)

      //new value
      let value = oldValue;
      if (idx === newVoteIdx && idx === oldVoteIdx) value = oldValue - 1;
      else if (idx === newVoteIdx) value = oldValue + 1; //add 1 to voteIdx
      else if (idx === oldVoteIdx) value = oldValue - 1; //remove 1 to oldIndex
      return { values: [...acc.values, value], ratios: [...acc.ratios, ratio] };
    },
    { values: [], ratios: [] }
  );
  return results;
};

/**
 * Get poll message from buttonInteraction
 * @param {object} poll button settings interaction
 * @returns Poll message
 */
export const fetchPollMessage = async (interaction) => {
  const pollMessage = await interaction.channel.messages.fetch(
    interaction.message.reference.messageId
  );
  return pollMessage;
};

/**
 * Edit the reply to an interaction after being defered, using payload as content
 * @param {object} interaction Interaction to edit the reply.
 * @param {object|string} payload Content of the reply, can be only a string.
 * @param {?boolean} isEphemeral To send reply only to author, true by default.
 */
export const interactionEditReply = async (
  interaction,
  payload,
  isEphemeral = true
) => {
  if (typeof payload == "string")
    await interaction.editReply({ content: payload, ephemeral: isEphemeral });
  else {
    payload.ephemeral = isEphemeral;
    await interaction.editReply(payload);
  }
};

const bullet = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

/**
 * Parse future poll fields with text and emotes, corresponding to input data
 * @param {list} content Text from commands to parse, splited with ";"
 * @param {?number} totalSize Precedent poll size to get correct bullet emote, default 0
 * @returns Object with fields and emotes lists
 */
export const parsePollFields = (content, totalSize = 0) => {
  const results = content.reduce(
    (acc, cur, idx) => {
      if (cur.length === 0) return acc; //filter empty choice

      const replaced = cur.replace(",", "");
      if (cur.includes(",")) {
        //if choices includes emote
        const emote = cur.split(",")[0].trim();
        return {
          fields: [...acc.fields, replaced],
          emotes: [...acc.emotes, emote],
        };
      } else {
        const emote = bullet[idx + totalSize];
        const text = idx === 0 ? emote + " " + replaced : emote + replaced;
        return {
          fields: [...acc.fields, text],
          emotes: [...acc.emotes, emote],
        };
      }
    },
    { fields: [], emotes: [] }
  );
  return results;
};

/**
 * Compute each of poll embed fields according to db data
 * @param {object} dbPoll poll message data from db
 * @param {list} newFieldsInit init value for new fields
 * @returns {list} List of new fields objects [{name: , value: }, ...]
 */
export const refreshPollFields = (dbPoll, newFieldsInit) => {
  //compute ratios
  const values = dbPoll.votes.map((obj) => obj.votes.length);
  const totalValues = values.reduce((acc, cur) => acc + cur, 0);
  const ratios =
    totalValues === 0
      ? dbPoll.votes.map(() => 0)
      : values.reduce(
          (acc, cur) => [...acc, Math.round((cur / totalValues) * 100)],
          []
        );

  //get progress bar color
  const colorIdx = dbPoll.colorIdx; //db data
  const emoteColor = PERSONALITY.getColors().progressBar[colorIdx]; //emoteId from personality
  const black = PERSONALITY.getCommands().polls.black; //empty bar color

  //return new fields
  return newFieldsInit.map((field, idx) => {
    //update values
    const nb = Math.floor(ratios[idx] / 10);
    const newColorBar =
      emoteColor.repeat(nb) +
      black.repeat(10 - nb) +
      ` ${ratios[idx]}% (${values[idx]})\n`; //new colorBar

    const votersEmbed = dbPoll.anonymous
      ? ""
      : dbPoll.votes[idx].votes.map((userId) => ` <@${userId}>`).join("");
    return { name: field.name, value: newColorBar + votersEmbed };
  });
};

export const pollRefreshEmbed = async (pollMessage, dbPoll) => {
  const embed = pollMessage.embeds[0];

  //create new fields objects from pollMessage
  const newFieldsInit = embed.fields.map((obj) => {
    return { name: obj.name, value: "" };
  }); //init with old names
  const newFields = refreshPollFields(dbPoll, newFieldsInit);

  //update message
  embed.setFields(newFields);
  await pollMessage.edit({ embeds: [embed] });
};

/**
 * Stop poll
 * @param {*} dbPoll poll data from db
 * @param {*} pollMessage Message with poll embed
 * @param {*} perso personality
 */
export const stopPoll = async (dbPoll, pollMessage, perso) => {
  console.log("stop poll");

  const db = pollMessage.client.db;
  const editedPollMessage = {};

  //edit title
  const pollEmbed = pollMessage.embeds[0];
  pollEmbed.setTitle(pollEmbed.title + perso.stop.title);

  //refresh fields
  const newFieldsInit = pollEmbed.fields.map((obj) => {
    return { name: obj.name, value: "" };
  }); //init with old names
  const newFields = refreshPollFields(dbPoll, newFieldsInit);
  pollEmbed.setFields(newFields);
  editedPollMessage.embeds = [pollEmbed];
  editedPollMessage.components = []; //remove polls buttons

  removePoll(db, pollMessage.id); //remove from db

  pollMessage.edit(editedPollMessage); //edit poll message
};
