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
  getGiftUsers,
  isGiftUser,
  removeGiftUser,
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
  getPollsTitles,
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
  addEmojiData,
  addStatsUser,
  removeStatsUser,
  statsKeys,
  dbReturnType,
  addServerStatsData,
  addServerEmojiCount,
} from "./db/dbStats.js";

import {
  isTimeoutUser, 
  getTimeoutUser,
  addTimeoutUser, 
  removeTimeoutUser,
  updateTimeoutUser,
} from "./db/dbTimeout.js";

import {
  generateSpotifyClient,
  parseLink,
  deleteSongFromPlaylist,
} from "./spotifyHelper.js";

import {
  checkEmbedContent,
  fetchLogChannel,
  gifParser,
  gifRecovery,
  hasApology,
  hasOctagonalSign,
  interactionReply,
  isAdmin,
  isReleasedCommand,
  isSentinelle,
  parseEmoji,
  parseUnixTimestamp,
  removeEmote,
  removePunctuation,
  setupEmbed,
} from "./utils.js";

export {
  // utils
  checkEmbedContent,
  fetchLogChannel,
  gifParser,
  gifRecovery,
  hasApology,
  hasOctagonalSign,
  interactionReply,
  isAdmin,
  isReleasedCommand,
  isSentinelle,
  parseEmoji,
  parseUnixTimestamp,
  removeEmote,
  removePunctuation,
  setupEmbed,
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
  getGiftUsers,
  isGiftUser,
  removeGiftUser,
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
  getPollsTitles,
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
  addEmojiData,
  removeStatsUser,
  addStatsData,
  statsKeys,
  dbReturnType,
  addServerStatsData,
  addServerEmojiCount,
  //timeout
  isTimeoutUser, 
  getTimeoutUser,
  addTimeoutUser, 
  removeTimeoutUser,
  updateTimeoutUser,
};
