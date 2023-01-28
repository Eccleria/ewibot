export const getFieldNumbers = (fields, newVoteIdx, oldVoteIdx) => {
  const results = fields.reduce(
    (acc, cur, idx) => {
      //"emotes ...*% (no)"
      const splited = cur.value.split(" ");
      //console.log("newVoteIdx", newVoteIdx, "oldVoteIdx", oldVoteIdx)
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
      //console.log("newValue", value);
      return { values: [...acc.values, value], ratios: [...acc.ratios, ratio] };
    },
    { values: [], ratios: [] }
  );
  return results;
};

/**
 * get Poll message from buttonInteraction 
 * @param {object} poll button settings interaction 
 * @returns Poll message
 */
export const fetchPollMessage = async (interaction) => {
  const pollMessage = await interaction.channel.messages.fetch(
    interaction.message.reference.messageId
  );
  return pollMessage;
};
