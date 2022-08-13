import { MessageEmbed } from "discord.js";
import { ETwitterStreamEvent } from 'twitter-api-v2';

// jsons import
import { readFileSync } from "fs";
const commons = JSON.parse(readFileSync("static/commons.json"));

export const fetchUserTimeline = async (client, userId) => {
  const twitter = client.twitter;

  let params = {
    max_results: 5,
    exclude: ["replies"]
  }; //params for api requests - used for timeline fetch

  return await twitter.userTimeline(userId, params);
}

export const fetchUserProfile = async (client, userId) => {
  const twitter = client.twitter;

  const params = {
    "user.fields": ["profile_image_url", "url", "username"]
  }; //used for user fetch

  return await twitter.user(userId, params); //fetch Andarta Pictures's Twitter profile
};

export const fetchTweets = async (client, tweetIds) => {
  const twitter = client.twitter;

  const params = {
    //"media.fields": ["duration_ms", "height", "media_key", "preview_image_url", "type", "url", "width", "public_metrics", "non_public_metrics", "organic_metrics", "promoted_metrics", "alt_text"," variants"]
    "expansions": ["attachments.media_keys"]
  }; //used for user fetch

  return await twitter.tweets(tweetIds, params); //fetch Andarta Pictures's Twitter profile
}

//https://twitter.com/andartapictures/status/1371839010755207176

const twitterIcon = "https://abs.twimg.com/icons/apple-touch-icon-192x192.png"; //link for twitter logo

export const setupTwitterEmbed = (name, iconUrl, url) => {
  //create tweet embed
  return new MessageEmbed()
    .setAuthor({ name: name, iconURL: iconUrl, url: url })
    //.addFields({ name: "Tweet", value: "insert tweet content here" })
    .setColor("#00ACEE")
    .setFooter({ text: "Twitter", iconURL: twitterIcon })
    .setTimestamp();
}

export const tweetLink = (username, id) => {
  return "https://twitter.com/" + username + "/status/" + id; //write tweet url
}

//embed.setDescription(`[Tweet link](${tweetLink})`); //add tweet url to embed

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
  console.log(await twitter.updateStreamRules({
    delete: {
      ids: ['1557837241409572864', '1557837241409572865', "1557837764422418434", "1557837764422418435", "1557839400448450562"],
    },
  }));

  console.log(await twitter.updateStreamRules({
    add: [
      { value: "from:953964541 OR from:1039418011260727296", tag: "from" }
    ]
  }));
  */
  const rules = await twitter.streamRules();
  console.log("rules", rules);
  //{expansions: "author_id"}
  // Awaits for a tweet
  stream.on(
    // Emitted when Node.js {response} emits a 'error' event (contains its payload).
    ETwitterStreamEvent.ConnectionError,
    err => console.log('Connection error!', err),
  );
  //twitter.
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

  /*const yawasay = await twitter.userByUsername("Yawasay");
  console.log("yawasay", yawasay);*/

  /*
  const id = "953964541";
  const andartaId = "1039418011260727296";
  const twitterUser = await fetchUserProfile(client, andartaId);
  const { url, name, profile_image_url, username } = twitterUser.data; //get usefull user data

  console.log("twitterUser", twitterUser);
  console.log("data", url, name, profile_image_url, username)
  const timeline = fetchUserTimeline(client, id);
  console.log("timeline", timeline);

  const embed = setupTwitterEmbed(name, profile_image_url, url);
  //const tLink = tweetLink(username, tweetId);
  const server = commons.find(({ name }) =>
    process.env.DEBUG === "yes" ? name === "test" : name === "prod"
  );
  */

  //embed.setDescription(`[Tweet link](${tLink})`); //add tweet url to embed

  /*
  const channel = await client.channels.fetch(server.randomfloodChannelId);

  channel.send({ embeds: [embed] });
  */
}
