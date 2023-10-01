import {
  sendSettingsButtons,
  stopPollButtonAction,
  removePollButtonAction,
  resetPollButtonAction,
  updatePollButtonAction,
  refreshPollButtonAction,
} from "./pollsButton.js";
import { interactionEditReply } from "./pollsUtils.js";
import { pollVoteHandler } from "./pollsVote.js";
import { interactionReply } from "../utils.js";
import { getPoll } from "../../helpers/index.js";
import { PERSONALITY } from "../../personality.js";

export const pollsButtonHandler = async (interaction) => {
  // Dispatch button action to corresponding functions
  const { customId } = interaction;

  const sixNumber = Number(customId[6]);
  const voteButtonTest = !isNaN(sixNumber) && typeof sixNumber == "number";
  if (voteButtonTest) await voteButtonHandler(interaction);
};

export const voteButtonHandler = async (interaction) => {
  // dipatch vote according to voteMax
  const { message, client } = interaction;

  //get personality
  const perso = PERSONALITY.getCommands().polls;
  const cPerso = perso.create;

  //get db data
  const db = client.db;
  const pollId = message.id;
  const dbPoll = getPoll(db, pollId); //get poll from db
  if (!dbPoll) {
    await interactionEditReply(interaction, perso.stopped);
    return;
  }
  const { voteMax } = dbPoll;

  if (voteMax > 1 || voteMax === 1)
    await pollVoteHandler(interaction, dbPoll, perso, cPerso);
  else await interactionReply(interaction, perso.errorUnknownChoice);
};

export const settingsButtonHandler = async (interaction) => {
  // handle settings button
  const { customId } = interaction;
  if (customId.includes("settings")) sendSettingsButtons(interaction);
  else if (customId.includes("set_stop")) stopPollButtonAction(interaction);
  else if (customId.includes("set_remove")) removePollButtonAction(interaction);
  else if (customId.includes("set_reset")) resetPollButtonAction(interaction);
  else if (customId.includes("set_update")) updatePollButtonAction(interaction);
  else if (customId.includes("set_refresh"))
    refreshPollButtonAction(interaction);
};
