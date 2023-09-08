import {
  isApologyUser,
  addApologyCount,
  removeApologyCount,
} from "./db/dbApology.js";

import { addAdminLogs, getAdminLogs, removeAdminLogs } from "./db/dbAdmin.js";

import { addAlavirien, removeAlavirien } from "./db/dbAlavirien.js";

import {
  addBirthday,
  isBirthdayDate,
  removeBirthday,
} from "./db/dbBirthday.js";

import {
  getEventRoles,
  addEventRole,
  updateEventRoleMessageId,
} from "./db/dbEventRoles.js";

import {
  addGiftUser,
  removeGiftUser,
  isGiftUser,
  isMessageRecipient,
  addGiftMessage,
  removeGiftMessage,
  getGiftMessage,
  addGiftSeparator,
} from "./db/dbGift.js";

import {
  addIgnoredChannel,
  isIgnoredChannel,
  removeIgnoredChannel,
  addIgnoredUser,
  isIgnoredUser,
  removeIgnoredUser,
} from "./db/dbIgnore.js";

import {
  addPoll,
  getPoll,
  getPolls,
  getPollFromTitle,
  addPollChoices,
  addPollVoter,
  isPollEmptyVotes,
  isThisChoicePollVoter,
  getPollVoteIndexes,
  getThisChoicePollIndex,
  removePoll,
  removePollChoice,
  removePollIndex,
  resetPollVoters,
  updatePollParam,
  updatePollButtonId,
} from "./db/dbPolls.js";

import {
  addReminder,
  removeReminder,
  updateReminder,
} from "./db/dbReminder.js";

import {
  generateSpotifyClient,
  parseLink,
  deleteSongFromPlaylist,
} from "./spotifyHelper.js";

import {
  sanitizePunctuation,
  isAdmin,
  hasApology,
  readContentAndReact,
  hasOctagonalSign,
} from "./utils.js";

export {
  // utils
  sanitizePunctuation,
  isAdmin,
  hasApology,
  readContentAndReact,
  hasOctagonalSign,
  // spotifyHelper
  generateSpotifyClient,
  parseLink,
  deleteSongFromPlaylist,
  // dbHelper
  //admin
  addAdminLogs,
  getAdminLogs,
  removeAdminLogs,
  //alavirien
  addAlavirien,
  removeAlavirien,
  //apology
  isApologyUser,
  addApologyCount,
  removeApologyCount,
  //birthday
  addBirthday,
  isBirthdayDate,
  removeBirthday,
  //eventRoles
  getEventRoles,
  addEventRole,
  updateEventRoleMessageId,
  //gift
  addGiftUser,
  removeGiftUser,
  isGiftUser,
  isMessageRecipient,
  addGiftMessage,
  removeGiftMessage,
  getGiftMessage,
  addGiftSeparator,
  //ignore
  addIgnoredChannel,
  isIgnoredChannel,
  removeIgnoredChannel,
  addIgnoredUser,
  isIgnoredUser,
  removeIgnoredUser,
  //polls
  addPoll,
  getPoll,
  getPolls,
  getPollFromTitle,
  addPollChoices,
  addPollVoter,
  isPollEmptyVotes,
  isThisChoicePollVoter,
  getPollVoteIndexes,
  getThisChoicePollIndex,
  removePoll,
  removePollChoice,
  removePollIndex,
  resetPollVoters,
  updatePollParam,
  updatePollButtonId,
  //reminder
  addReminder,
  removeReminder,
  updateReminder,
};
