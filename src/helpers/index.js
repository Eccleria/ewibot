import {
  addBirthday,
  removeBirthday,
  isBirthdayDate,
  isApologyUser,
  addApologyCount,
  removeAppologyCount,
} from "./db/dbHelper.js";

import {
  addAdminLogs,
  getAdminLogs,
  removeAdminLogs,
} from "./db/dbAdmin.js";

import {
  addAlavirien,
  removeAlavirien,
} from "./db/dbAlavirien.js";

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
  addAdminLogs,
  getAdminLogs,
  removeAdminLogs,
  //ignore
  addIgnoredChannel,
  isIgnoredChannel,
  removeIgnoredChannel,
  addIgnoredUser,
  isIgnoredUser,
  removeIgnoredUser,
  addBirthday,
  removeBirthday,
  isBirthdayDate,
  isApologyUser,
  addApologyCount,
  removeAppologyCount,
  getTwitterUser,
  updateLastTweetId,
  addMissingTweets,
  removeMissingTweets,
  //gift
  addGiftUser,
  removeGiftUser,
  isGiftUser,
  isMessageRecipient,
  addGiftMessage,
  removeGiftMessage,
  getGiftMessage,
  addGiftSeparator,
  //alavirien
  addAlavirien,
  removeAlavirien,
};
