# Admin

This documentation covers all the parts associated to the administrative part of Ewibot.
The folder contains all the files required for the administrative part of Ewibot. It can be divided in
3 parts : the `listeners`, the `roles` and the `utils`.

> For `Twitter` part, please see [twitter documentation](./twitter.md)

- [Alavirien](#alavirien)
- [Listeners](#listeners)
  - [File architecture](#how-the-file-is-divided)
  - [Listeners design](#listeners-design)
    - [General Listeners](#general-listeners)
    - [Unusual Listeners](#unusual-listeners)
    - [Interactions](#interactions)
- [Roles](#roles)
  - [Pronouns](#pronouns)
- [Utils](#utils)
- [Logs](#logs)
  - [Permanent Logs](#permanent-logs)
    - [Octagonal logs](#octagonal-logs)
  - [Temporary Logs](#temporary-logs)
    - [logsRemover](#logsremover)
    - [initAdminLogClearing](#initadminlogclearing)


## Alavirien
_[alavirien.js](./src/admin/alavirien.js)_ dispatch the already named role to elligible users.

## Listeners

_[listeners.js](../src/admin/listeners.js)_ is a file regrouping all functions associated to the events
Ewibot is responding to. These events are affiliated to moderation stuff, like message update/delete,
timeout, kick, ban and so on.
Those events are listened to, for sending logs of modification in a dedicated Discord channel. The aim
is to facilitate the job of Moderators.

### How the file is divided

First, it's all the functions/libraries that the file need, such as:

```javascript
import { PERSONALITY } from "../personality.js"; //function from personality.js
//other imports
import dayjs from "dayjs"; //dayjs library
```

Then, there are all the export functions used as listeners to Discord API events. They are fired when
the corresponding event is triggered.

```javascript
//in bot.js file
client.on("messageDelete", onMessageDelete); //event, listener
```

### Listeners design

There are 2 main types of listeners : general listeners and unusual ones.

#### General Listeners

The first one is general listeners one. As an example, the `onChannelCreate` listener is presented:

```javascript
export const onChannelCreate = async (channel) => {
  if (channel.type === "DM") return; //short uncommon part

  //the following is a common part to basic listeners
  const logType = "CHANNEL_CREATE"; //AuditLog type
  const perso = "channelCreate"; //Ewibot personality
  generalEmbed(perso, channel, "DARK_AQUA", logType, 1, null, "tag");
};
```

`generalEmbed` is a function that regroups all the operations shared by every general listeners, such
as

- get the missing `personality`.
- fetch the `channel` where logs are send.
- setup the `embed` that will be in the log message.
- get the `AuditLog` corresponding to the event.

#### Unusual Listeners

These listeners are much more complex functions than general listeners, up to 180 lines of code. It is
mostly because of how many changes can be done in the corresponding Discord objects.

For example, the `onChannelUpdate` can manage changes that are present in `AuditLog` an those which are
not. The following code is explained after it.

```javascript
export const onChannelUpdate = async (oldChannel, newChannel) => {
  //get personality - basic operations
  //simplified for example

  //check for permission overwrite
  const oldOverwrite = oldChannel.permissionOverwrites.cache;
  const newOverwrite = newChannel.permissionOverwrites.cache;
  const diffOverwrite = oldOverwrite.difference(newOverwrite);
  //simplified for example

  //check for change of position
  const changePos = ["position", oldChannel.position, newChannel.position];
  //simplified for example

  //finish embed - explained after
  //simplified for example
  if (chnLog) {
    const changes = chnLog.changes.map((obj) => [obj.key, obj.old, obj.new]);
    const text = changes.reduce((acc, cur) => {
      return acc + `- ${cur[0]} : ${cur[1]} => ${cur[2]}\n`; //create text to send
    }, "");

    const logCreationDate = dayjs(chnLog.createdAt);
    const diff = dayjs().diff(logCreationDate, "s");
    endCasesEmbed(channel, personality, embed, logChn, text, diff);
  }
};
```

The next examples covers changes not logged by `AuditLogs`:

- `permissionOverwrites` that represents channel-wide permissions, that are different from guild-wide
  and role-wide permissions. It is used for making channel difference of permission for a role, or a
  member. This allows flexibility.
- `position` which correspond to channel `position` in the guild, which can be changed and fire
  `onChannelUpdate` for all the channels that are affected by the `position` change.

An example of changes that are logged: `name`, `topic`, `rate_limit_per_user`,
`default_auto_archive_duration`.

#### Interactions

This particular listener is used to handle all the integrations allowed by Discord API. For the moment,
in this code it concerns only the `Buttons`. But nearly, it will include the (/) Slash commands and
Modals.

```javascript
export const onInteractionCreate = (interaction) => {
  if (interaction.isButton()) buttonHandler(interaction);
};
```

`buttonHandler` is a function used for pronouns attribution. This requires the onInteractionCreate
listener, explaining its usage in this file.

```javascript
import { buttonHandler } from "./pronouns.js";
```

## Roles

The roles part correspond to role attribution to users. It concerns cosmetic roles, but also
peonouns/agreements roles.

- _[pronouns.js](../src/admin/pronouns.js)_ is used for attribution of roles of pronouns and
  agreements.
- _[role.js](../src/admin/role.js)_ is used to dispatch cosmetic roles among users.

### Pronouns

This file has only one function, `buttonHandler` that allow the bot to get which pronouns/agreement
the user wants, and to give it to they.

First it gets usefull data from bot files (commons & personality) and client (user data).
Then determines which action it should do, based on `button` & member's `roles`.

```javascript
//is simplified
export const buttonHandler = async (interaction) => {
  //get usefull data
  const rolesJson = [...pronounsJson, ...agreementsJson]; //[[button name, role id]]
  const guildMember = interaction.member; //get guildMember

  //handle roles
  if (json[1] !== "Annuler") {
    if (!roles.cache.has(json[1])) {
      guildMember.roles.add(json[1]); //if do not have, add role

      const content = pronounsP.text.replyAdd; //get reply message content
      interaction.reply({ content: content, ephemeral: true }); //reply to interaction
    } else //already has role
  }
  else {
    //is cancel
    if (toRemove.length !== 0) roles.remove(toRemove); //if have any, remove it/them
  }
};
```

## Utils

_[utils](../src/admin/utils.js)_ is regrouping all the functions used in one or many files of the admin
folder, but also of commands, helpers and src folders.

As an example, here is `finishEmbed`. This common function is used to finish an admin embed with usual
data and then send it in the correct log channel.

```javascript
export const finishEmbed = async (
  personalityEvent,
  executor,
  embed,
  logChannel,
  text,
  attachments
) => {
  //check for prod/test situation.
  const currentServer = commons.find(({ name }) => name === "test"); //get test data
  if (
    process.env.DEBUG === "no" &&
    logChannel.guildId === currentServer.guildId //If prod, shouln't care about test server.
  ) {
    //Ewibot detects test in test server => return
    console.log("Ewibot log in Test server", personalityEvent.title);
    return;
  }

  if (embed.author !== null) {
    //if is an array, embed.author is undefined !== null
    //if contains multiple embeds, the 1st is the log
    if (personalityEvent.executor && executor !== null)
      embed[0].addField(personalityEvent.executor, executor.toString(), true); //add the executor section
    if (text) embed[0].addField(personalityEvent.text, text, false); //if any text (reason or content), add it

    //now trying to send messages
    try {
      const message = await logChannel.send({
        embeds: embed,
        allowed_mentions: { parse: [] },
      }); //send
      if (attachments && attachments.length !== 0) {
        const gifMessage = await logChannel.send({ files: attachments }); //if attachments, send new message
        return [message, gifMessage];
      }
      return [message];
    } catch (e) {
      console.log(
        "finishEmbed list error\n",
        personalityEvent.title,
        new Date(),
        e
      );
    }
    return [];
  }
  //the rest of the function is the same, but using embed not as a list
};
```

The argument `allowed_mentions: { parse: [] }` allows to send embed objects like when mentioning a member, but
without actually pinging. It's really usefull to get quickly user profile or channels when there's a need for
moderation action.
`console.log()` are used as debug, in order to see where the code went wrong.
The `[message]` returned is used for the `logsRemover` and `initAdminLogClearing` process which will be seen
later.

## Logs

The logs are separated into 2 parts: permanent and temporary logs. The permanent logs are logs from server
modification or moderation action. Temporary ones come from messageUpdate/Delete and users arriving/leaving.

### Permanent Logs

Permanent logs are logs that archive every server modification done by moderators. It includes 
- roles
- channels
- threads

But also users' modification because of moderation:
- timeouts
- bans
- kicks

The bot also look for this emote 🛑, because of it moderation purpose. Its usage creates `octagonal logs`.


These logs, when created, are sent by Ewibot in the #logs channel.

#### Octagonal logs

The octagonal sign 🛑 is used as a moderation tool. This is an emote that can be sent by any user when they are
at the slightest inconvenience/discomfort about a content. 
To facilitate and make quicker reaction from moderators, Ewibot is designed to report any 🛑 usage, as in message
content or reaction.

First, we need to detect the emote, the presented code is about in-message detection.
Once a public message is sent, the bot fires `reactionHandler` function, that analyse message `content`, looking
for emotes.

```javascript
export const onPublicMessage = (message, client, currentServer, self) => {
  //not used constants
  reactionHandler(message, currentServer, client);
  //...

export const reactionHandler = async (message, currentServer, client) => {
  //not used constants

  const loweredContent = message.content.toLowerCase(); //get text in Lower Case
  if (hasOctagonalSign(loweredContent, currentServer)) octagonalLog(message); //if contains octagonal_sign, log it
```

The other way is to look for a reaction:

```javascript
export const onReactionAdd = async (messageReaction, user) => {
  // Function triggered for each reaction added
  const currentServer = commons.find(
    ({ guildId }) => guildId === messageReaction.message.channel.guild.id
  );
  //useless if for this purpose

  if (currentServer.octagonalSign === messageReaction.emoji.name) {
    octagonalLog(messageReaction, user);
    return;
  }
```

For both ways, if the 🛑 is the emote used as a reaction, `octagonalLog` is fired.

Now, we can log the emote usage. First, the bot get the personality required for log text.

```javascript
export const octagonalLog = async (object, user) => {
  //get personality
  const personality = PERSONALITY.getAdmin();
  const octaPerso = personality.octagonalSign;
  //...
```

Then, it needs to verify if the target message is a partial one. If `.partial`, the bot fetch
it to get all message data. 
As `object` can be a `message` or a `messageReaction`, the `message` property is not at the same 
place. Because the `user` object is sent only for a `messageReaction`, the bot can deduce where 
`message` property is.

```javascript
  let message = user ? object.message : object;
  if (message.partial) await message.fetch();
  //...
```

Now the bot can do the basic stuff of logs: fetch the `logChannel` and setup the `embed`.

```javascript
  //basic operations
  const logChannel = await getLogChannel(commons, message); //get logChannelId
  const embed = setupEmbed(
    "LUMINOUS_VIVID_PINK",
    octaPerso,
    message.author,
    "tag"
  ); //setup embed
  //...
```

Once this is done, the bot the target message properties, such as: 
- message sending `date`
- `channel` where the message was sent
- message `content`
- `executor`, ie the person who sent the target message
- message `link`, for moderation easier intervention

```javascript
  //add more info to embed
  const executor = user
    ? await message.guild.members.fetch(user.id)
    : object.author; //get executor
  const date = message.createdAt.toString().slice(4, 24);
  embed.addFields(
    { name: octaPerso.date, value: `${date}`, inline: true }, //date of message creation
    { name: octaPerso.channel, value: `<#${message.channelId}>`, inline: true }, //message channel
    { name: octaPerso.text, value: message.content }, //message content
    { name: octaPerso.executor, value: executor.toString(), inline: true }, //emote sent by
    {
      name: octaPerso.linkName,
      value: `[${octaPerso.linkMessage}](${message.url})`,
      inline: true,
    } //get message link
    //...
  );
```

Eventualy, the log can be sent to the proper channel. For `finishEmbed` explanation, please see
[finishEmbed](#utils)

```javascript
  finishEmbed(octaPerso, null, embed, logChannel);
};
```

### Temporary Logs

Temporary logs are logs that will be deleted after a short period, depending on log type. The process is 
the same as permanent logs, but adding the deletion code part.

In order to delete all messageDelete/Update logs when they are no longer usefull for moderation, 2 main
functions are used for this: `logsRemover` and `initAdminLogClearing`.
In the future, the bot will also delete logs associated to users leaving.

Temporary logs are stored in Ewibot `database` as their message ids. From these ids, when the time as come,
logs are bulk deleted together, and the bot send a log in the console for debug purpose.

Those logs, when created, are sent by Ewibot in #frequent-log thread channel.

#### logsRemover

`logsRemover` is the function called to `bulkDelete` all the temporary logs using their ids. First all the
ids are fetched from the `db`. Then the code handle differently `"frequent"` and `"userAD"` logs, because
of the duration of log conservation, but the process is similar.

```javascript
let type = "frequent"; //differentiate process for "frequent" and "userAD" logs
const dbData = getAdminLogs(db);
let data = dbData[type][0]; //get corresponding data
```

If there is data in the `db`, the bot fetch the corresponding `threadChannel` where the logs were sent.
Then, the bot `bulkDelete` all the logs and get all the messages ids where the process went smooth. Then it
prints in the console the `result` of the process, and remove log message ids from `db`.

```javascript
if (data.length !== 0) {
  const threadChannel = await client.channels.fetch(server.logThreadId);
  const result = await threadChannel.bulkDelete(data); //bulkDelete and get ids where it was okay
  console.log("result1", result.keys(), "data", data); //log for debug
}
removeAdminLogs(db, type); //remove from db
```

#### initAdminLogClearing

This function setup the timeouts used for logRemoval. `setTimeout` is used as a `waitingTime` before
creating the loop of `logsRemover`. This `waitingTime` is less than a full day.

```javascript
export const initAdminLogClearing = (client, waitingTime) => {
  setTimeout(
    () => {
      logsRemover(client);
      setInterval(); //see after for definition
    },
    waitingTime,
    client
  );
};
```

Then, the loop is created using `setInterval`, with a full day of waiting time in `ms`.

```javascript
SetInterval(
  () => {
    logsRemover(client);
  },
  24 * 3600 * 1000, //1 day in ms
  client //client for client.db
);
```
