import { ETwitterStreamEvent } from "twitter-api-v2";

import { PERSONALITY } from "../personality.js";

// jsons import
import { readFileSync } from "fs";
const commons = JSON.parse(readFileSync("static/commons.json"));

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

const tweetHandler = async (tweet, client) => {
  console.log("Twitter has sent something:", tweet);
  console.log("includes", tweet.includes);

  const { data } = tweet;
  const tweetId = data.id; //get tweet Id
  const authorId = data.author_id; //get author id

  //get author username
  const userProfile = await fetchUserProfile(client, authorId);
  const username = userProfile.data.username;

  const tLink = tweetLink(username, tweetId); //create tweet url

  //get rules tag;
  const tag = tweet.matching_rules[0].tag;

  //get tag corresponding channel
  const server = commons.find(({ name }) =>
    process.env.DEBUG === "yes" ? name === "test" : name === "prod"
  ); //get commons data
  const channelId =
    tag === "test"
      ? server.twitter.testChannelId
      : server.twitter.prodChannelId;

  const channel = await client.channels.fetch(channelId);

  channel.send({ content: tLink });
};

const onConnection = (client) => {
  const interaction = client.twitter.interaction;
  const personality = PERSONALITY.getCommands().twitter; //get personality

  if (interaction) interaction.followUp({ content: personality.streamConnect, ephemeral: true });
  console.log("Twitter Event:Connected");
};

const onConnectionClosed = async () => {
  //handle connection closed
  console.log("Twitter Event:ConnectionClosed");
};

export const twitterListeners = (stream, client) => {
  stream.on(ETwitterStreamEvent.Connected, async () => {
    onConnection(client)
  });
  stream.on(ETwitterStreamEvent.ConnectionLost, async () => {
    console.log("Twitter Event:ConnectionLost");
  });
  stream.on(ETwitterStreamEvent.ConnectionError, async (data) => {
    console.log("Twitter Event:ConnectionError", data);
  });
  stream.on(ETwitterStreamEvent.ConnectionClosed, async () => {
    onConnectionClosed(client);
  });

  stream.on(
    // Emitted when a Twitter payload (a tweet or not, given the endpoint).
    ETwitterStreamEvent.Data,
    (eventData) => tweetHandler(eventData, client)
  );
  stream.on(ETwitterStreamEvent.TweetParseError, async (data) => {
    console.log("Twitter Event:TweetParseError", data);
  });

  stream.on(ETwitterStreamEvent.Error, async (error) => {
    console.log(`Twitter Event:Error: ${JSON.stringify(error)}`);
  });

  stream.on(ETwitterStreamEvent.ReconnectAttempt, async (data) => {
    console.log("Twitter Event:ReconnectAttempt", data);
  });
  stream.on(ETwitterStreamEvent.Reconnected, async () => {
    console.log("Twitter Event:Reconnected");
  });
  stream.on(ETwitterStreamEvent.ReconnectError, async (data) => {
    console.log("Twitter Event:ReconnectError", data);
  });
  stream.on(ETwitterStreamEvent.ReconnectLimitExceeded, async () => {
    console.log("Twitter Event:ReconnectLimitExceeded");
  });

  stream.on(ETwitterStreamEvent.DataKeepAlive, async () => {
    console.log('Twitter Event:DataKeepAlive');
  });
}

export const initTwitterStream = async (client) => {
  const twitter = client.twitter;

  //stream
  let stream;
  if (process.env.INIT_TWITTER === "no")
    stream = twitter.searchStream({ expansions: "author_id", autoConnect: false });
  else {
    stream = await twitter.searchStream({ expansions: "author_id" }); //create stream
    twitterListeners(stream, client); //add listeners to the stream
  }
  client.twitter.stream = stream; //bind stream to client

  /*
  console.log("delete rules result", await twitter.updateStreamRules({
    delete: {
      ids: ["1559573815042129924", "1559905656416747521"],
    },
  }));
  */
  /*
  console.log("add rules", await twitter.updateStreamRules({
    add: [
      { value: "(from:1032989926000939008 OR from:1039418011260727296) -is:retweet -is:reply", tag: "prod" },
      { value: "from:1511087619215609862 -is:retweet -is:reply", tag: "test" }
    ]
  })); //(laquetedewilan OR andarta) without retweets
  //rule id : prod "1561102350546247683", test "1561102350546247684"
  */
  /*
  const rules = await twitter.streamRules();
  console.log("rules", rules);
  */

  // Enable reconnect feature
  stream.autoReconnect = true;
  stream.autoReconnectRetries = Infinity;
};
