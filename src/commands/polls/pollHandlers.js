import { multipleVoteType } from "./pollsTypeMultiple.js";
import { uniqueVoteType } from "./pollsTypeUnique.js";
import { interactionReply } from "../utils.js";
import { getPoll } from "../../helpers/index.js";
import { PERSONALITY } from "../../personality.js";

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

export const pollsButtonHandler = (interaction) => {
  // Dispatch button action to corresponding functions
  const { customId } = interaction;

  const sixNumber = Number(customId[6]);
  const voteButtonTest = !isNaN(sixNumber) && typeof sixNumber == "number";
  if (voteButtonTest) voteButtonHandler(interaction);
};

export const voteButtonHandler = (interaction) => {
  // dipatch vote according to voteType
  const { message, client } = interaction;

  //get personality
  const perso = PERSONALITY.getCommands().polls;

  //get db data
  const db = client.db;
  const pollId = message.id;
  const dbPoll = getPoll(db, pollId); //get poll from db
  const { voteType } = dbPoll;

  if (voteType === perso.voteOption.choices[1].value) {
    //multiple
    multipleVoteType(interaction, dbPoll, perso);
  } else if (voteType === perso.voteOption.choices[0].value) {
    //unique
    uniqueVoteType(interaction, dbPoll, perso);
  } else interactionReply(perso.errorUnknownChoice);
};
