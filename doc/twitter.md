# Twitter


**NOTE : Because of Eon Musk changes to Twitter, this feature is disabled**

This doc covers all the part about Twitter-Discord links. This link was asked by Andarta Pictures for
a communication purpose. It aims to send all tweets sent by 
[Andarta Pictures](https://twitter.com/andartapictures) and
[La Quête d'Ewilan](https://twitter.com/laquetedewilan) Twitter accounts on the appropriate Discord
channel. 

This functionality uses the [twitter-api-v2](https://github.com/PLhery/node-twitter-api-v2) library, 
with v2 endpoints that are free to use. The old v1.1 is reserved for verified application and has 
more endpoints, but those are not necessary for Ewibot Twitter-Discord link.

> *Note:* In this doc, Discord App client is named as `client`. Twitter App client is named as 
> `twitter`.

- [Connection](#connection)
- [Commands](#commands)
    - [Compare](#compare)
    - [Share](#share)

For this feature, 6 files are used: 
- [admin twitter](../src/admin/twitter.js)
- [commands twitter](../src/commands/twitter.js)
- [dbHelper](../src/helpers/dbHelper.js) - *database helper*
- [bot](../src/bot.js)
- [personality](../src/personality.js)
- [personalities](../static/personalities.json)

## Connection

First the app connects to Twitter API, creating `twitter`. Then, we setup `twitter` to 
be only `v2`, using `readOnly` mode. Then we save the Twitter client into the `client`.
The `.isSending` is used for `db` verification in `twitter share` command.

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

> To understand how / commands are created, please refer to the [slash command](./commands/slashCommands.md) doc.

`compare` and `share` commands are useful if the bot went down and somme tweets were sent during
the offline time. No user input is required. 

### Compare

The command is declared as a subcommand of `twitter command`.

```javascript
  .addSubcommand((command) =>
    command
      .setName(personality.twitter.compare.name)
      .setDescription(personality.twitter.compare.description)
  ) 
```

`compare` checks each user's Twitter Timeline and compare the results to `database`. If there is
any difference, the bot send it as a reply.

> As the following code is mostly the same for the setInterval fetch, the command action code 
> is regrouped in [admin twitter](../src/admin/twitter.js) file.

First, it gets usefull data, and then execute a loop for each Twitter user.

```javascript
export const tweetCompare = async (client, interaction) => {
  const db = client.db;
  const currentServer = commons.find(({ name }) =>
    process.env.DEBUG === "yes" ? name === "test" : name === "prod"
  );

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
      tLinks = newTLinks; //regroup links

      //update db
      updateLastTweetId(userId, tweetIds[0], db); //update last tweet id
      addMissingTweets(newTLinks, db); //tweets links
    }
    //if idx === 0 => db up to date
    //if idx === -1 => too many tweets or issue
  }
```

Now, we have to define if the bot is replying to a command or just the setInterval loop.
If there are tweets to send: 
- if its a command (then it has an interaction), the bot will join all links together and reply to the command. 
- else, Ewibot send it in the appropriate channel defined in `commons`.
If no tweets:
- command: the bot answers that the db is up to date.
- setInterval: nothing to do

```javascript
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
  } else if (interaction)
    interaction.reply({ content: PERSONALITY.getCommands().twitter.dbUpToDate, ephemeral: true });
};
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
