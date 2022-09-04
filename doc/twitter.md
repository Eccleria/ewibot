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

For this feature, 3 files are used: 
- [admin twitter]()
- [commands twitter]()
- [dbHelper]() - *database helper*
- [bot]()

- [Stream]()
    - [Init]()
    - [Listeners]()
- [Commands]()

## Stream

The stream is setup after `client` being ready. First the app connects to Twitter API, creating
`twitter`. Then, we setup `twitter` to be only `v2`, using `readOnly` mode. Then we save the 
Twitter client into the `client`, and we are ready to init the `stream`.
The `.isSending` is used for db verification.

```javascript
const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN); //login app
const twitter = twitterClient.v2.readOnly; //setup client to v2 API - read only mode
client.twitter = twitter; //save twitter into client
client.twitter.isSending = false;

initTwitterStream(client); //init Twitter stream with API ``
```

### Init

The `stream` is initialized according to .env configuration. 
- `INIT_TWITTER === "no"` means that a `stream` object is created, but the connection is set to false.
This way, the App is ready to connect the stream once an admin ask for it with the corresponding 
command. 
- `INIT_TWITTER === "yes"` creates and connects immediately the `stream`.

Once created, the `stream` is linked to `client`. 

```javascript
export const initTwitterStream = async (client) => {
  const twitter = client.twitter; //get twitter client

  //stream
  let stream;
  if (process.env.INIT_TWITTER === "no")
    stream = twitter.searchStream({ expansions: "author_id", autoConnect: false });
  else {
    stream = await twitter.searchStream({ expansions: "author_id" }); //create stream
    twitterListeners(stream, client); //add listeners to the stream
  }
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



## Commands