import { ETwitterStreamEvent } from 'twitter-api-v2';

// jsons import
import { readFileSync } from "fs";
const commons = JSON.parse(readFileSync("static/commons.json"));

/*
export const fetchUserTimeline = async (client, userId) => {
  const twitter = client.twitter;

  let params = {
    max_results: 5,
    exclude: ["replies"]
  }; //params for api requests - used for timeline fetch

  return await twitter.userTimeline(userId, params);
}

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
    "user.fields": ["profile_image_url", "url", "username"]
  }; //used for user fetch

  return await twitter.user(userId, params); //fetch Andarta Pictures's Twitter profile
};

//https://twitter.com/andartapictures/status/1371839010755207176
//twitter color "#00ACEE"
//const twitterIcon = "https://abs.twimg.com/icons/apple-touch-icon-192x192.png"; //link for twitter logo

export const tweetLink = (username, id) => {
  return "https://twitter.com/" + username + "/status/" + id; //write tweet url
}

const tweetHandler = async (tweet, client) => {
  console.log('Twitter has sent something:', tweet);
  console.log('includes', tweet.includes);

  const { data } = tweet;
  const tweetId = data.id; //get tweet Id
  const authorId = data.author_id; //get author id

  //get author username
  const userProfile = await fetchUserProfile(client, authorId);
  const username = userProfile.data.username;
  console.log("authorId", authorId);
  console.log("username", username);
  const tLink = tweetLink(username, tweetId);
  console.log("tLink", tLink);

  const server = commons.find(({ name }) =>
    process.env.DEBUG === "yes" ? name === "test" : name === "prod"
  );
  const channel = await client.channels.fetch(server.randomfloodChannelId);

  channel.send({ content: tLink });
}

export const initTwitter = async (client) => {
  const twitter = client.twitter;
  const stream = await twitter.searchStream({ expansions: "author_id" });

  /*
  console.log("delete rules result", await twitter.updateStreamRules({
    delete: {
      ids: ["1559652578438402048"],
    },
  }));
  */
  /*
  console.log("add rules", await twitter.updateStreamRules({
    add: [
      //{ value: "(from:1032989926000939008 OR from:1039418011260727296) -is:retweet", tag: "prod" },
      { value: "from:1511087619215609862 -is:retweet", tag: "test" }
    ]
  })); //(laquetedewilan OR andarta) without retweets
  //rule id : prod "1559573815042129924", test "1559905656416747521"
  */
  /*
  const rules = await twitter.streamRules();
  console.log("rules", rules);
  */

  // Awaits for a tweet
  stream.on(
    // Emitted when Node.js {response} emits a 'error' event (contains its payload).
    ETwitterStreamEvent.ConnectionError,
    err => console.log('Connection error!', err),
  );

  stream.on(
    // Emitted when Node.js {response} is closed by remote or using .close().
    ETwitterStreamEvent.ConnectionClosed,
    () => console.log('Connection has been closed.'),
  );

  stream.on(
    // Emitted when a Twitter payload (a tweet or not, given the endpoint).
    ETwitterStreamEvent.Data,
    (eventData) => tweetHandler(eventData, client),
  );

  stream.on(
    // Emitted when a Twitter sent a signal to maintain connection active
    ETwitterStreamEvent.DataKeepAlive,
    () => console.log('Twitter has a keep-alive packet.'),
  );

  // Enable reconnect feature
  stream.autoReconnect = true;
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
      name: 'Eccléria Alesta',
      username: 'eccleria'
    }
  ]
}*/
