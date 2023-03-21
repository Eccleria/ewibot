import {
  isApologyUser,
  addApologyCount,
  //removeApologyCount,
} from "./db/dbApology.js";

import { addAdminLogs, getAdminLogs, removeAdminLogs } from "./db/dbAdmin.js";

import { addAlavirien, removeAlavirien } from "./db/dbAlavirien.js";

import {
  addBirthday,
  isBirthdayDate,
  removeBirthday,
} from "./db/dbBirthday.js";

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
  getTwitterUser,
  updateLastTweetId,
  addMissingTweets,
  removeMissingTweets,
} from "./db/dbTwitter.js";

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
  //removeApologyCount,
  //birthday
  addBirthday,
  isBirthdayDate,
  removeBirthday,
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
  isThisChoicePollVoter,
  getPollVoteIndexes,
  getThisChoicePollIndex,
  removePoll,
  removePollChoice,
  removePollIndex,
  resetPollVoters,
  updatePollParam,
  updatePollButtonId,
  //twitter
  getTwitterUser,
  updateLastTweetId,
  addMissingTweets,
  removeMissingTweets,
};
