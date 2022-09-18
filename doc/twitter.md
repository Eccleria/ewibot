# Twitter

This doc covers all the part about Twitter-Discord links. This link was asked by Andarta Pictures for
a communication purpose. It aims to send in almost real-time all tweets sent by 
[Andarta Pictures](https://twitter.com/andartapictures) and
[La Qu�te d'Ewilan](https://twitter.com/laquetedewilan) Twitter accounts. 

This functionality uses the [twitter-api-v2](https://github.com/PLhery/node-twitter-api-v2) library, 
with v2 endpoints that are free to use. The old v1.1 is reserved for verified application and has 
more endpoints, but those are not necessary for Ewibot Twitter-Discord link.

> *Note:* In this doc, Discord App client is named as `client`. Twitter App client is named as 
> `twitter`.

- [Stream](#stream)
    - [Init](#init)
    - [Listeners](#listeners)
        - [onConnection - onConnectionClosed](#onconnection---onconnectionclosed)
        - [Tweet Handler](#tweet-handler)
        - [Other Listeners](#other-listeners)
    - [rules](#rules)
- [Commands](#commands)
    - [Compare](#compare)
    - [Share](#share)
    - [Stream](#stream-1)

For this feature, 4 files are used: 
- [admin twitter](../src/admin/twitter.js)
- [commands twitter](../src/commands/twitter.js)
- [dbHelper](../src/helpers/dbHelper.js) - *database helper*
- [bot](../src/bot.js)

## Stream

The stream is setup after `client` being ready. First the app connects to Twitter API, creating
`twitter`. Then, we setup `twitter` to be only `v2`, using `readOnly` mode. Then we save the 
Twitter client into the `client`, and we are ready to init the `stream`.
The `.isSending` is used for `db` verification.

```javascript
const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN); //login app
const twitter = twitterClient.v2.readOnly; //setup client to v2 API - read only mode
client.twitter = twitter; //save twitter into client
client.twitter.isSending = false;

initTwitterStream(client); //init Twitter stream with API
```

### Init

The `stream` is initialized according to `.env` configuration. 
- `INIT_TWITTER === "no"` means that a `stream` object is created, but the connection is set to `false`.
This way, the App is ready to connect the stream once an admin ask for it with the corresponding 
command. 
- `INIT_TWITTER === "yes"` creates and connects immediately the `stream`.

Once created, the `stream` have `listeners` and is linked to `client`. 

```javascript
export const initTwitterStream = async (client) => {
  const twitter = client.twitter; //get twitter client

  //stream
  let stream;
  if (process.env.INIT_TWITTER === "no")
    stream = twitter.searchStream({ expansions: "author_id", autoConnect: false });
  else
    stream = await twitter.searchStream({ expansions: "author_id" }); //create stream
  twitterListeners(stream, client); //add listeners to the stream
  client.twitter.stream = stream; //bind stream to client
  //...
```

After this, the `.autoReconnect` feature is enabled and set as `Infinity` retries, in order to 
limit connection error issue. 

```javascript
  //...
  // Enable reconnect feature
  stream.autoReconnect = true;
  stream.autoReconnectRetries = Infinity;
};
```

### Listeners

There are 2 types of listeners used for the `stream`:
- having an external function
- having only a `console.log()`

#### onConnection - onConnectionClosed

Listeners of `ETwitterStreamEvent.Connected` and `ETwitterStreamEvent.ConnectionClosed` are similar, 
so only the declaration of the first one is shown here.

```javascripts
export const twitterListeners = (stream, client) => {
  stream.on(ETwitterStreamEvent.Connected, async () => {
    onConnection(client)
  });
}
```

`onConnection` is used for both `interaction` reply and `console.log`. An `interaction` exists
when the associated command is called by a user, then it requires a reply. But it means that the
stream status is only know when `/twitter stream connect` is used. That is why there is the 
`console.log`.

```javascript
const onConnection = (client) => {
  //handle connection
  const interaction = client.twitter.interactions.connect; //get associated interaction
  const personality = PERSONALITY.getCommands().twitter; //get personality

  if (interaction) interaction.followUp({ content: personality.streamConnected, ephemeral: true });
  client.twitter.streamConnected = true; //for keeping twitter stream status

  console.log("Twitter Event:Connected");
};
```

#### Tweet Handler

This listener is dedicated to the recept and process of tweet data. 

```javascript
stream.on(
  // Emitted when a Twitter payload (a tweet or not, given the endpoint).
  ETwitterStreamEvent.Data,
  (eventData) => tweetHandler(eventData, client)
);
```

First we get tweet `data`, such as `tweetId` and `authorId`. With `authorId` it fetches the 
`userProfile` in order to get the `username`. `tweetId` and `username` are used to construct 
the tweet link `tLink` which will be send later.

```javascript
const tweetHandler = async (tweet, client) => {
  const { data } = tweet;
  const tweetId = data.id; //get tweet Id
  const authorId = data.author_id; //get author id

  //get author username
  const userProfile = await fetchUserProfile(client, authorId);
  const username = userProfile.data.username;

  const tLink = tweetLink(username, tweetId); //create tweet url
  //...
  ```

Then, according to the `matching_rules`, it fetches the appropriate `channel` where to send `tLink`.

```javascript
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
```

#### Other listeners

The 3 listeners under are the 3 types of listeners that exists in the code. The 3 of them use
`console.log`, but with different arguments:
- just the error code.
- the error `data`.
- a `JSON.stringify(error)` argument.

```javascript
export const twitterListeners = (stream, client) => {
  stream.on(ETwitterStreamEvent.ConnectionLost, async () => {
    console.log("Twitter Event:ConnectionLost");
  });

  stream.on(ETwitterStreamEvent.TweetParseError, async (data) => {
    console.log("Twitter Event:TweetParseError", data);
  });

  stream.on(ETwitterStreamEvent.Error, async (error) => {
    console.log(`Twitter Event:Error: ${JSON.stringify(error)}`);
  });
}
```

### Rules

Stream `rules` are required to filter all the tweets that the API will send. In this application, 
`rules` are simple.
> The aim is to get from Twitter and post on Discord the tweets from 2 different accounts. But we
> want only tweets, no retweets or replies.

There are 2 cases: `prod` and `test`. 
```javascript
"(from:1032989926000939008 OR from:1039418011260727296) -is:retweet -is:reply" //prod
"from:1511087619215609862 -is:retweet -is:reply" //test
```

> These parts of code are not use directly in the code, but only when changes are required.

For updating some rules, it needs the `.updateStreamRules` method. For deleting it requires the
`delete` arg, and `add` for adding rules.

```javascript
await twitter.updateStreamRules({
  delete: {
    ids: ["1559573815042129924", "1559905656416747521"],
  },
});
await twitter.updateStreamRules({
  add: [
    { value: "(from:1032989926000939008 OR from:1039418011260727296) -is:retweet -is:reply", tag: "prod" },
    { value: "from:1511087619215609862 -is:retweet -is:reply", tag: "test" }
  ]
})); //(laquetedewilan OR andarta) without retweets
```

## Commands

There's 5 commands that have been implemented, with the same prefix "twitter":
- `compare`
- `share`
- `stream connect`
- `stream close`
- `stream status`

> To understand how / commands are created, please refer to the [slash command](./slashCommands.md) doc.

`compare` and `share` commands are useful if the bot went down and somme tweets were sent during
the offline time. No user input is required. 

### Compare

The command is declared as a subcommand of `twitter command`.

```javascript
.addSubcommand((command) => 
  command
    .setName("compare")
    .setDescription("Compare les 5 derniers tweets avec la base de donn�e et envoie la diff�rence.")
) 
```

Compare checks user's Twitter Timelines and compare the results to `database`. If there is
any difference, the bot send it as a reply.
First, it gets usefull data, and then execute a loop for each Twitter user.

```javascript
const db = client.db;
const currentServer = commons.find(({ name }) =>
  process.env.DEBUG === "yes" ? name === "test" : name === "prod"
); //get data associated to current server

//compare tweets
const users = Object.entries(currentServer.twitterUserIds);
let tLinks = [];

for (const [username, userId] of users) {
  //...
```

 For each user, the code get the `db` data, and fetch user's last tweets ids. In this last array, 
 it looks for the tweet id stored in the `db`.

```javascript
  const dbData = getTwitterUser(userId, client.db); //fetch corresponding data in db
  const fetchedTweets = await fetchUserTimeline(client, userId); //timeline
  const tweetIds = fetchedTweets.data.data.map((obj) => obj.id); //tweet ids
  const idx = tweetIds.findIndex((id) => id === dbData.lastTweetId); //find tweet
```

Now we know if the tweet is the last or not: 
- `idx > 0` means some tweets are missing.
- `idx === 0` means that the db is up to date.
- `idx === -1` means that the tweet id in `db` is too old. The case should not happen thus
the code isn't really worth to be implemented.

```javascript
  if (idx > 0) {
    //some tweets are missing => get links + update db;
    const tweetsToSend = tweetIds.slice(0, idx);
    const newTLinks = tweetsToSend.reduceRight((acc, tweetId) => {
      const tLink = tweetLink(username, tweetId); //get tweet link
      return [...acc, tLink]; //return link for future process
    }, []); 
    tLinks = [...tLinks, newTLinks]; //regroup links

    //update db
    updateLastTweetId(userId, tweetIds[0], db); //update last tweet id
    addMissingTweets(newTLinks, db); //tweets links
  }
  //if idx === 0 => db up to date
  //if idx === -1 => issue
}
```

If there are tweets to send, the bot will join all the links together in one message and 
then will reply to the command. If no tweets, the bot answers that the db is up to date.

```javascript
//send tweets
if (tLinks.length !== 0) {
  const content = tLinks.join("\n");
  interaction.reply({ content: content }); //, ephemeral: true });
}
else interaction.reply({ content: "La db est � jour.", ephemeral: true });
return;
}
```

### Share

`share` declaration is similar to `compare` command. But the process is slightly different. 
First, we check if the bot is already sending tweets. If yes, then the command is canceled.

```javascript
const isSending = client.twitter.isSending;
if (isSending) {
  //if already sending tweets, return
  interaction.reply({ content: personality.isSending, ephemeral: true });
  return;
}
```

Then we need to fetch all the data required, like `db` or the `channel` where to send tweets.

```javascript
const db = client.db;
const missingTweets = db.data.twitter.missingTweets;

//get prod channel where to send tweets
const server = commons.find(({ name }) =>
  process.env.DEBUG === "yes" ? name === "test" : name === "prod"
); //get commons data
const channelId = server.twitter.prodChannelId;
const channel = await client.channels.fetch(channelId);
```

If there's no tweet to send, we can cancel the command.

```javascript
const lenght = missingTweets.lenght;
if (lenght === 0) {
  interaction.reply({ content: personality.noTweets, ephemeral: true });
  return;
}
```

Now, for each tweet the bot will create a `timeout` with a random waiting time between 1 and 3
minutes. After the `timeout`, the bot will send the tweet link in the desired channel.

```javascript
missingTweets.reduce((acc, cur, idx) => {
  //compute new waiting time
  const curWaitingTime = waitingTimeRadomizer(2, 1) * 60 * 1000;
  const newAcc = acc + curWaitingTime; //sum waiting times
  console.log("newAcc", newAcc);
  const isLast = idx === lenght - 1; //compute if is last Tweet

  timeoutTweets(cur, newAcc, channel, isLast, client); //set tweet Timeout before send
  return newAcc; //return sum of waiting times
}, 0);
```

And lastly, it answers to the command and update `client.isSending`.

```javascript
interaction.reply({
  content: personality.sendInProgress,
  ephemeral: true,
});
client.twitter.isSending = true;
return;
```

### Stream

The stream requires 3 commands to control it: `connect`, `close` and `status`.

```javascript
  //...
  .addSubcommandGroup((group) =>
    group
      .setName("stream")
      .setDescription("G�re le stream sur Twitter.")
      .addSubcommand((command) =>
        command
          .setName("connect")
          .setDescription("Lance une connexion avec Twitter.")
      )
      .addSubcommand((command) =>
        command
          .setName("close")
          .setDescription("Ferme une connexion avec Twitter.")
      )
      .addSubcommand((command) =>
        command
          .setName("status")
          .setDescription("Indique le status actuel de la connexion avec Twitter.")
      )
  );
  ```