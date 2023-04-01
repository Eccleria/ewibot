# Commands

Commands are interactions that users can have with the bot or other users.

- [Organisation](#organisation)
- [Command types](#commandtypes)
  - [Text commands](#textcommands)
  - [Slash commands](#slashcommands)
  - [Context commands](#contextcommands)
    - [save-log](#save-log)

## Organisation

If the commands are not complex, they are written in the [slash file](../src/commands/slash.js). Otherwise, they are
separated from the rest in a dedicated file, like the [reminder command](../src/commands/reminder.js). Then they are
imported in the slash file and regrouped for the main bot file usage.

## Command types

Commands can exist in different forms: text, slash and contextual commands.

### Text commands

> Text commands are replaced by slash commands since September the 1st, 2022. But for unverified bots,
> text commands are still possible.

> **Note: Text commands are now deprecated since (5.0.0)[https://github.com/Eccleria/ewibot/releases/tag/5.0.0].**

### Slash commands

Slash commands are commands that can be used using the `/` prefix. It makes appear a list of all
`/` commands available. 

> For `SlashCommands` doc, please see (Slash Commands Doc)[./slashCommands.md].

### Context commands

Context commands are commands that can be used on a message, a channel or a user. It cannot have any args. 

Context commands are declared as an object with 3 properties:

- _action_ is the associated function fired when the command is called by a user.
- _command_ is the declaration of the command using `discordjs builders`.
- _help_ is the message the bot should send when calling `/help function`.
- _admin_ define if the command should be used only by bot admins.
- _releaseDate_ is used if a command should not be accessed before a release date.
- _sentinelle_ define if the command should be accessible only to Sentinelles.

```js
const saveLog = {
  action,
  command,
  help: (interaction) => {
    const personality = PERSONALITY.getCommands().saveLog;
    interactionReply(interaction, personality.help);
  },
  admin: true,
  releaseDate: null,
  sentinelle: true,
};
```

#### Save-log

`save-log` is a moderation context command, used for archive a `frequent-log` that served in a 
moderation action.

First we create the command declaration for Discord API using `ContextMenuCommandBuilder`. As it is a command for log 
archive, the command is dedicated to messages: `type 3`. The command must be used by moderation, thus it requires the
appropriate permission to use it.

```javascript
const command = new ContextMenuCommandBuilder()
  .setName("save-log")
  .setType(3)
  .setDefaultMemberPermissions(0x0000010000000000); //MODERATE_MEMBERS bitwise
```

Now we can setup the `action` the command will do once fired. 

```javascript
const action = async (interaction) => {
  const message = interaction.targetMessage; //get message
  const embeds = message.embeds; //get embeds

  const personality = PERSONALITY.getCommands(); //get personality
  const admin = PERSONALITY.getAdmin();
  const messageDe = admin.messageDelete;
  const saveLogP = personality.saveLog;
  //...
```

There are some check to be sure that the command is called at the rigth thread on appropriate 
messages. These need to have `embeds`, corresponding to `frequent logs`

```javascript
  //check for thread channel
  const isLogThread = commons.some(
    ({ logThreadId }) => logThreadId === message.channelId
  ); //get server local data
  if (!isLogThread) {
    interactionReply(interaction, saveLogP.wrongChannel);
    return
  }

  //check for containing embeds
  if (embeds.length === 0) {
    interactionReply(interaction, saveLogP.noEmbed);
    return;
  }

  //check for messageUpdate/Delete log
  const titleTest = [messageDe.title, admin.messageUpdate.title];
  const isCorrectEmbed = titleTest.includes(embeds[0].title);
  if (!isCorrectEmbed) {
    interactionReply(interaction, saveLogP.wrongMessage);
    return;
  }
  //...
```

Once checks are done, we can effectively save the log. This is done by first adding
the person that have fired the command to the embed fields and then send the log.

```javascript
  const logChannel = await getLogChannel(commons, interaction); //get logChannel

  //add executor of saveLog
  const member = interaction.member;
  embeds[0].addFields(
    { name: saveLogP.author, value: member.toString(), inline: true }
  );

  await logChannel.send({ embeds: embeds, allowed_mentions: { parse: [] } }); //Send log
  interactionReply(interaction, saveLogP.sent);  //reply to interaction
  //...
```

After this, the bot need to send any gif that was in the log content. For now, it only 
handles gifs that are in `messageDelete` logs. 
We get the field containing the message content.

```javascript
  //handle gifs
  const contentTest = [messageDe.text, messageDe.textAgain]; //get text field names
  const fields = embeds[0].fields; //get embed fields
  const foundFields = fields.filter((obj) => contentTest.includes(obj.name)); //get corresponding fields
  //...
```

Once found, we get each gif link and send them in different messages, if they are separated
by `" "`. 
> For more details, please see `gifRecovery` help section (TBAdded)

```javascript
  let gifs = [];
  if (foundFields.length !== 0) {
    //if any foundFields, find gifs
    gifs = foundFields.reduce((acc, field) => {
      const gif = gifRecovery(field.value);
      if (gif !== null) return [...acc, ...gif];
      return acc;
    }, [])
  }

  if (gifs.length !== 0) gifs.forEach((gif) => logChannel.send(gif));
};
```
