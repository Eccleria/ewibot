//import needle from "needle";

/*
export const getTwitterUserID = async () => {

//return curl --request GET 'https://api.twitter.com/2/tweets/search/recent?query=from:twitterdev' --header 'Authorization: Bearer '
  curl https://api.twitter.com/2/tweets/search/recent?query=from:twitterdev --header 'Authorization: Bearer '
}*/
/*
export const getTwitterFeed = async () => {
  await getUserTweets();
}

const AndartaID = "1039418011260727296";

// Get User Tweet timeline by user ID
// https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/quick-start


// this is the ID for @TwitterDev
//const userId = "2244994945";
const url = `https://api.twitter.com/2/users/${AndartaID}/tweets`;

// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'
const bearerToken = process.env.TWITTER_BEARER_TOKEN;

const getUserTweets = async () => {
  let userTweets = [];

  // we request the author_id expansion so that we can print out the user name later
  let params = {
    "max_results": 100,
    "tweet.fields": "created_at",
    "expansions": "author_id"
  }

  const options = {
    headers: {
      "User-Agent": "v1UserTweetsJS",
      "authorization": `Bearer ${bearerToken}`
    }
  }

  let hasNextPage = true;
  let nextToken = null;
  let userName;
  console.log("Retrieving Tweets...");

  while (hasNextPage) {
    let resp = await getPage(params, options, nextToken);
    if (resp && resp.meta && resp.meta.result_count && resp.meta.result_count > 0) {
      userName = resp.includes.users[0].username;
      if (resp.data) {
        userTweets.push.apply(userTweets, resp.data);
      }
      if (resp.meta.next_token) {
        nextToken = resp.meta.next_token;
      } else {
        hasNextPage = false;
      }
    } else {
      hasNextPage = false;
    }
  }

  console.dir(userTweets, {
    depth: null
  });
  console.log(`Got ${userTweets.length} Tweets from ${userName} (user ID ${AndartaID})!`);

}

const getPage = async (params, options, nextToken) => {
  if (nextToken) {
    params.pagination_token = nextToken;
  }

  try {
    const resp = await needle('get', url, params, options);

    if (resp.statusCode != 200) {
      console.log(`${resp.statusCode} ${resp.statusMessage}:\n${resp.body}`);
      return;
    }
    return resp.body;
  } catch (err) {
    throw new Error(`Request failed: ${err}`);
  }
}
*/

/*
import { TwitterApi } from 'twitter-api-v2';

// Instanciate with desired auth type (here's Bearer v2 auth)
const twitterClient = new TwitterApi('<YOUR_APP_USER_TOKEN>');

// Tell typescript it's a readonly app
const roClient = twitterClient.readOnly;

export const getTwitterUser = async () => {
  // Play with the built in methods
  return await roClient.v2.userByUsername('andartapictures');
}
*/

