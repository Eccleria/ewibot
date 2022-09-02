import { ETwitterStreamEvent } from "twitter-api-v2";

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
/*
export const fetchTweets = async (client, tweetIds) => {
  const twitter = client.twitter;

  const params = {
    //"media.fields": ["duration_ms", "height", "media_key", "preview_image_url", "type", "url", "width", "public_metrics", "non_public_metrics", "organic_metrics", "promoted_metrics", "alt_text"," variants"]
    "expansions": ["attachments.media_keys"]
  }; //used for user fetch

  return await twitter.tweets(tweetIds, params); //fetch Andarta Pictures's Twitter profile
}
*/

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

const onConnectionClosed = async () => {
  //client) => {
  //handle connection closed
  console.log("Twitter Event:ConnectionClosed");
  //await initTwitter(client);
};

export const initTwitter = async (client) => {
  const twitter = client.twitter;
  /*
  let fetchedTweets = await fetchUserTimeline(client, "1032989926000939008"); //laquetedewilan
  console.log("fetchedTweets", fetchedTweets);
  const tweets = fetchedTweets.data;
  console.log("tweets", tweets);
  console.log("data", tweets.data);

  fetchedTweets = await fetchUserTimeline(
    client,
    "1032989926000939008",
    "7140dibdnow9c7btw421dwur8597a561mnql6z9q5iddl"
  );
  const nextTweets = fetchedTweets.data;
  console.log("nextTweets", nextTweets);
  */
  //stream
  const stream = process.env.USE_TWITTER === "no"
    ? twitter.searchStream({ expansions: "author_id", autoConnect: false })
    : await twitter.searchStream({ expansions: "author_id" }); //create stream
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

  // Awaits for a tweet

  stream.on(ETwitterStreamEvent.Connected, async () => {
    console.log("Twitter Event:Connected");
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

  /*stream.on(ETwitterStreamEvent.DataKeepAlive, async () => {
    console.log('Twitter Event:DataKeepAlive');
  });*/

  // Enable reconnect feature
  stream.autoReconnect = true;
  stream.autoReconnectRetries = Infinity;
};

/*
Twitter has sent something: {
  data: {
    author_id: '1511087619215609862',
    id: '1559653598266523649',
    text: 'On teste le code'
  },
  includes: { users: [[Object]] },
  matching_rules: [{ id: '1559652578438402048', tag: 'test' }]
}
includes {
  users: [
    {
      id: '1511087619215609862',
      name: 'Eccl�ria Alesta',
      username: 'eccleria'
    }
  ]
}*/
