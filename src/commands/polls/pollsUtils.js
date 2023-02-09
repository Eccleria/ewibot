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
        const emote = cur.split(",")[0];
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