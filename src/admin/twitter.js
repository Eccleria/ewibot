import {
  getTwitterUser,
  updateLastTweetId,
  addMissingTweets,
  removeMissingTweets,
} from "../helpers/index.js";

import { PERSONALITY } from "../personality.js";
import { COMMONS } from "../commons.js";

export const fetchUserTimeline = async (client, userId, pageToken) => {
  const twitter = client.twitter;

  let params = {
    max_results: 5,
    exclude: ["replies", "retweets"],
  }; //params for api requests - used for timeline fetch
  if (pageToken) params.pagination_token = pageToken;

  return await twitter.userTimeline(userId, params);
};

export const fetchUserProfile = async (client, userId) => {
  const twitter = client.twitter;

  const params = {
    "user.fields": ["profile_image_url", "url", "username"],
  }; //used for user fetch

  return await twitter.user(userId, params); //fetch Andarta Pictures's Twitter profile
};

//https://twitter.com/andartapictures/status/1371839010755207176
//twitter color "#00ACEE"
//const twitterIcon = "https://abs.twimg.com/icons/apple-touch-icon-192x192.png"; //link for twitter logo

export const tweetLink = (username, id) => {
  return "https://twitter.com/" + username + "/status/" + id; //write tweet url
};

export const tweetCompare = async (client, interaction) => {
  const db = client.db;
  const currentServer = process.env.DEBUG === "yes" ? COMMONS.getTest() : COMMONS.getProd();
  const cmnShared = COMMONS.getShared();

  //compare tweets
  const users = Object.entries(cmnShared.twitterUserIds);
  let tLinks = [];

  for (const [username, userId] of users) {
    const dbData = getTwitterUser(userId, client.db); //fetch corresponding data in db
    const fetchedTweets = await fetchUserTimeline(client, userId); //timeline
    const tweetIds = fetchedTweets.data.data.map((obj) => obj.id); //tweet ids
    const idx = tweetIds.findIndex((id) => id === dbData.lastTweetId); //find tweet

    if (idx > 0) {
      //some tweets are missing => get links + update db;
      const tweetsToSend = tweetIds.slice(0, idx);
      const newTLinks = tweetsToSend.reduceRight((acc, tweetId) => {
        const tLink = tweetLink(username, tweetId); //get tweet link
        return [...acc, tLink]; //return link for future process
      }, []);
      tLinks = newTLinks; //regroup links

      //update db
      updateLastTweetId(userId, tweetIds[0], db); //update last tweet id
      addMissingTweets(newTLinks, db); //tweets links
    }
    //if idx === 0 => db up to date
    //if idx === -1 => too many tweets or issue
  }

  //send tweets
  if (tLinks.length !== 0) {
    console.log("tLinks", tLinks);
    //if tweets to send
    if (interaction) {
      //if is command
      const content = tLinks.join("\n");
      interaction.reply({ content: content }); //, ephemeral: true });
    } else {
      const channelId = currentServer.twitter.prodChannelId;
      const channel = await client.channels.fetch(channelId);
      tLinks.forEach(async (link) => await channel.send(link));
    }
    removeMissingTweets(tLinks, db);
  } else if (interaction)
    interaction.reply({
      content: PERSONALITY.getCommands().twitter.dbUpToDate,
      ephemeral: true,
    });
};

export const initTwitterLoop = async (client) => {
  console.log("initTwitterLoop");

  setInterval(
    (client) => {
      tweetCompare(client);
    },
    10 * 60 * 1000,
    client
  );
};

//rule id : prod "1561102350546247683", test "1561102350546247684"
