import {
  sendSettingsButtons,
  disablePoll,
  removePollButtonAction,
  //addChoicePollModal,
} from "./pollsSettings.js";
import { multipleVoteType } from "./pollsTypeMultiple.js";
import { uniqueVoteType } from "./pollsTypeUnique.js";
import { interactionReply } from "../utils.js";
import { getPoll } from "../../helpers/index.js";
import { PERSONALITY } from "../../personality.js";

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
  const cPerso = perso.create;

  //get db data
  const db = client.db;
  const pollId = message.id;
  const dbPoll = getPoll(db, pollId); //get poll from db
  const { voteType } = dbPoll;

  if (voteType === cPerso.voteOption.choices[1].value) {
    //multiple
    multipleVoteType(interaction, dbPoll, perso, cPerso);
  } else if (voteType === cPerso.voteOption.choices[0].value) {
    //unique
    uniqueVoteType(interaction, dbPoll, perso, cPerso);
  } else interactionReply(perso.errorUnknownChoice);
};

export const settingsButtonHandler = async (interaction) => {
  // handle settings button
  const { customId } = interaction;
  if (customId.includes("settings")) sendSettingsButtons(interaction);
  else if (customId.includes("set_disable")) disablePoll(interaction);
  else if (customId.includes("set_remove")) removePollButtonAction(interaction);
};

/*
export const pollModalHandler = (interaction) => {
  // handle modals
  const { customId } = interaction;
  console.log("pollModalHandler");
  if (customId.includes("addChoice")) addChoicePollModal(interaction);
};
*/

export const pollSelectMenuHandler = (interaction) => {
  const { customId } = interaction;

  const perso = PERSONALITY.getCommands().polls;
  if (customId.includes("_remove")) {
    console.log("interaction", interaction);

    interaction.deferReply();
    const selected = interaction.values;
    console.log("values", selected);

  } else return interactionReply(interaction, perso.errorSelectMenuNotFound)
};