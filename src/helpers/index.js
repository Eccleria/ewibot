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
  isStatsUser,
  addStatsData,
  addStatsUser,
  removeStatsUser,
  statsKeys,
  dbReturnType,
  addServerStatsData,
} from "./db/dbStats.js";

import {
  generateSpotifyClient,
  parseLink,
  deleteSongFromPlaylist,
} from "./spotifyHelper.js";

import {
  sanitizePunctuation,
  isAdmin,
  hasApology,
  reactionHandler,
  hasOctagonalSign,
  setActivity,
  updateActivity,
  parseEmoji,
} from "./utils.js";

export {
  // utils
  sanitizePunctuation,
  isAdmin,
  hasApology,
  reactionHandler,
  hasOctagonalSign,
  setActivity,
  updateActivity,
  parseEmoji,
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
  //stats
  isStatsUser,
  addStatsUser,
  removeStatsUser,
  addStatsData,
  statsKeys,
  dbReturnType,
  addServerStatsData,
};
