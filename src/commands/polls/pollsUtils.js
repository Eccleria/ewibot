import { EmbedBuilder, MessageFlags } from "discord.js";
import { PERSONALITY } from "../../personality.js";
import { removePoll, removePunctuation } from "../../helpers/index.js";
import { POLLS } from "../../polls.js";

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
      else if (idx === newVoteIdx)
        value = oldValue + 1; //add 1 to voteIdx
      else if (idx === oldVoteIdx) value = oldValue - 1; //remove 1 to oldIndex
      return { values: [...acc.values, value], ratios: [...acc.ratios, ratio] };
    },
    { values: [], ratios: [] },
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
    interaction.message.reference.messageId,
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
  isEphemeral = true,
) => {
  const payloadObj =
    typeof payload == "string" ? { content: payload } : payload;
  if (isEphemeral) payloadObj.flags = MessageFlags.Ephemeral;
  await interaction.editReply(payloadObj);
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

      const replaced = cur.split("&")[1];
      console.log([cur], "replaced", [replaced]);
      if (cur.includes("&")) {
        //if choices includes emote
        const content = cur.split("&")[0].trim();
        console.log([content]);
        if (content.includes(":"))
          return {
            fields: [...acc.fields, replaced],
            emotes: [...acc.emotes, content],
          };

        const sanitizedContent = removePunctuation(content);
        console.log(
          [sanitizedContent],
          /\p{Extended_Pictographic}/u.test(sanitizedContent),
          /\W{2}/g.test(sanitizedContent),
        );
        if (
          (/\p{Extended_Pictographic}/u.test(sanitizedContent) &&
            !sanitizedContent.includes(" ")) ||
          /\W{2}/g.test(sanitizedContent)
        ) {
          console.log(
            /\p{Extended_Pictographic}/u.test(sanitizedContent),
            "&&",
            !sanitizedContent.includes(" "),
            "||",
            /\W{2}/g.test(sanitizedContent),
          );
          console.log(
            "Extended_Pictographic Emote found:",
            [sanitizedContent],
            sanitizedContent,
          );
          return {
            fields: [...acc.fields, replaced],
            emotes: [...acc.emotes, sanitizedContent],
          };
        }
      }
      //no or wrong emote => use bullet emote
      const emote = bullet[idx + totalSize];
      return {
        fields: [...acc.fields, cur.trim()],
        emotes: [...acc.emotes, emote],
      };
    },
    { fields: [], emotes: [] },
  );
  console.log("results", results);
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
  const max = values.reduce((acc, cur) => Math.max(acc, cur), 0); //get max count nb
  const ratios =
    max === 0
      ? dbPoll.votes.map(() => 0)
      : values.reduce(
          (acc, cur) => [...acc, Math.round((cur / max) * 100)],
          [],
        );

  //get progress bar color
  const colorIdx = dbPoll.colorIdx; //db data
  const emoteColor = PERSONALITY.getColors().progressBar[colorIdx]; //emoteId from personality
  const black = PERSONALITY.getPersonality().polls.black; //empty bar color

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
  const pollEmbed = pollMessage.embeds[0];
  const embed = EmbedBuilder.from(pollEmbed);

  //create new fields objects from pollMessage
  const newFieldsInit = pollEmbed.data.fields.map((obj) => {
    return { name: obj.name, value: "" };
  }); //init with old names
  const newFields = refreshPollFields(dbPoll, newFieldsInit);

  //update message
  embed.setFields(newFields);
  await pollMessage.edit({ embeds: [embed, ...pollMessage.embeds.slice(1)] });
};

/**
 * Stop poll and send confirmation in channel
 * @param {*} dbPoll poll data from db
 * @param {*} pollMessage Message with poll embed
 * @param {*} perso personality
 * @param {boolean} isFromCollector boolean indicating if fonction is called by collector end
 */
export const stopPoll = async (dbPoll, pollMessage, perso, isFromCollector) => {
  console.log("stop poll");
  const db = pollMessage.client.db;
  const editedPollMessage = {};
  const pollData = POLLS.getPoll(pollMessage.id);

  try {
    await pollMessage.fetch();
  } catch (e) {
    removePoll(db, pollMessage.id); //remove from db
    clearTimeout(pollData.timeout); //clear timeout
    if (!isFromCollector) pollData.collector.stop(); //stop collector if any
    POLLS.removePoll(pollMessage.id);
    console.log("pollMessage has been deleted, cannot reply 'stoped'", e);
    return;
  }

  //edit title
  const fetchedPollEmbed = pollMessage.embeds[0];
  const pollEmbed = EmbedBuilder.from(fetchedPollEmbed);
  pollEmbed.setTitle(pollEmbed.data.title + perso.stop.title);

  //refresh fields
  const newFieldsInit = pollEmbed.data.fields.map((obj) => {
    return { name: obj.name, value: "" };
  }); //init with old names
  const newFields = refreshPollFields(dbPoll, newFieldsInit);
  pollEmbed.setFields(newFields);
  editedPollMessage.embeds = [pollEmbed, ...pollMessage.embeds.slice(1)];
  editedPollMessage.components = []; //remove polls buttons

  //clear data
  removePoll(db, pollMessage.id); //remove from db
  if(!isFromCollector) pollData.collector.stop(); //stop collector if any
  clearTimeout(pollData.timeout); //clear timeout
  POLLS.removePoll(pollData.pollId);

  //edit original poll message
  pollMessage.edit(editedPollMessage); 

  //build poll summary message content
  const mPerso = perso.stop.message;
  const len = pollEmbed.data.title.length;
  const content =
    mPerso[0] + pollEmbed.data.title.slice(0, len - 14) + mPerso[1];
  pollMessage.reply({ content, embeds: [pollEmbed] });
};
