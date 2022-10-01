# Twitter

This doc covers all the part about Twitter-Discord links. This link was asked by Andarta Pictures for
a communication purpose. It aims to send in almost real-time all tweets sent by 
[Andarta Pictures](https://twitter.com/andartapictures) and
[La Quête d'Ewilan](https://twitter.com/laquetedewilan) Twitter accounts. 

This functionality uses the [twitter-api-v2](https://github.com/PLhery/node-twitter-api-v2) library, 
with v2 endpoints that are free to use. The old v1.1 is reserved for verified application and has 
more endpoints, but those are not necessary for Ewibot Twitter-Discord link.

> *Note:* In this doc, Discord App client is named as `client`. Twitter App client is named as 
> `twitter`.

- [Stream](#stream)
- [Commands](#commands)
    - [Compare](#compare)
    - [Share](#share)

For this feature, 4 files are used: 
- [admin twitter](../src/admin/twitter.js)
- [commands twitter](../src/commands/twitter.js)
- [dbHelper](../src/helpers/dbHelper.js) - *database helper*
- [bot](../src/bot.js)

## Stream

First the app connects to Twitter API, creating `twitter`. Then, we setup `twitter` to 
be only `v2`, using `readOnly` mode. Then we save the Twitter client into the `client`.
The `.isSending` is used for `db` verification.

```javascript
const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN); //login app
const twitter = twitterClient.v2.readOnly; //setup client to v2 API - read only mode
client.twitter = twitter; //save twitter into client
client.twitter.isSending = false;
```

## Commands

There's 2 commands that have been implemented, with the same prefix "twitter":
- `compare`
- `share`

> To understand how / commands are created, please refer to the [slash command](./slashCommands.md) doc.

`compare` and `share` commands are useful if the bot went down and somme tweets were sent during
the offline time. No user input is required. 

### Compare

The command is declared as a subcommand of `twitter command`.

```javascript
.addSubcommand((command) => 
  command
    .setName("compare")
    .setDescription("Compare les 5 derniers tweets avec la base de donnée et envoie la différence.")
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
else interaction.reply({ content: "La db est à jour.", ephemeral: true });
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
