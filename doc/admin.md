﻿# Admin

This documentation covers all the parts associated to the administrative part of Ewibot.
The folder contains all the files required for the administrative part of Ewibot. It can be divided in
3 parts : the `listeners`, the `roles` and the `utils`.

> For `Twitter` part, please see [twitter documentation](./twitter.md)

- [Listeners](#listeners)
  - [File architecture](#how-the-file-is-divided)
  - [Listeners design](#listeners-design)
    - [General Listeners](#general-listeners)
    - [Unusual Listeners](#unusual-listeners)
    - [Interactions](#interactions)
- [Roles](#roles)
  - [Pronouns](#pronouns)
- [Utils](#utils)


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
  eventPerso,
  executor,
  logEmbed,
  logChannel,
  text,
  attachments
) => {
  const currentServer = COMMONS.getTest(); //get test data
  if (
    process.env.DEBUG === "no" &&
    logChannel.guildId === currentServer.guildId
  ) {
    //Ewibot detects test in test server => return
    console.log("Ewibot log in Test server", eventPerso.title);
    return null;
  }

  const embed = logEmbed.length >= 0 ? logEmbed[0] : logEmbed; //if contains multiple embeds, the 1st is the log

  if (eventPerso.executor && executor !== null)
    embed.addFields({
      name: eventPerso.executor,
      value: executor.toString(),
      inline: true,
    }); //add the executor section
  if (text)
    embed.addFields({
      name: eventPerso.text,
      value: text,
    }); //if any text (reason or content), add it

  try {
    const message = await logChannel.send({
      embeds: [embed, ...logEmbed.slice(1)],
      allowed_mentions: { parse: [] },
    }); //send
    if (attachments && attachments.length !== 0) {
      const gifMessage = await message.reply({ files: attachments }); //if attachments, send new message
      return [message, gifMessage];
    }
    return [message];
  } catch (e) {
    console.log("finishEmbed error\n", eventPerso.title, new Date(), e);
    return [];
  }
};
```

The argument `allowed_mentions: { parse: [] }` allows to send embed objects like when mentioning a member, but
without actually pinging. It's really usefull to get quickly user profile or channels when there's a need for
moderation action.
`console.log()` are used as debug, in order to see where the code went wrong.
The `[message]` returned is used for the `logsRemover` and `initAdminLogClearing` process which will be seen
later.
