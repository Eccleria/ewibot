# Polls 

- [Commands](#commands)
  - [Create](#create)
    - [Parameters](#parameters)
    - [Code explanation](#code-explanation)
  - [New choices](#create)
    - [Parameters](#parameters-1)
    - [Code explanation](#code-explanation-1)
- [Buttons](#buttons)
- [Stop](#stop)
  - [Timeout](#timeout)

Polls are a `5.0.0` feature, allowing Alavirien.nes to create interactive messages from which everyone can vote.
Even if everyone is able to create polls, only poll's author and moderators have access to poll settings.

## Commands

There are 2 `/commands` available to create and modify polls.

Command group definition.
```js
const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getCommands().polls.name)
  .setDescription(PERSONALITY.getCommands().polls.description)
```

For both commands, the action functions filters triggering people to Alavirien.nes only.

```js
  //check for alavirien.ne role
  const guildMember = await interaction.member.fetch();
  const currentServer = COMMONS.fetchGuildId(interaction.guildId);
  if (!guildMember.roles.cache.has(currentServer.alavirienRoleId)) {
    interactionReply(interaction, personality.errorNotAlavirien);
    return;
  }
```

### Create

The major command is the `/polls create` one. It allows to create a new poll and customise it. 

#### Parameters

- Mandatory:
  - _title_ Title of the poll. Minimum 1 character, maximum 225.
  - _choices_ Choices of the poll. You **must** follow the notation. 
    - Two choices are separated by a **semi-colon `;`**. 
    - If you want to specify an emote for a choice, you must separate the emote from the choice text using a **comma `,`**. 
    - The last choice **does not** require a *semi-colon*.  
    Eg: `🥖, bread; 🧈, butter`
- Optional:
  - _color_ Color of the embed and the colorbar. You can choose using the choices list, and filter selection by starting typing the color you want. Default: blue.
  - _description_ Description of the poll, to add details or context.
  - _anonymous_ If you want ot display or not each voter choice.s. Default: **not** displayed.
  - _max votes_ Max number of votes. Cannot be more than the number of choices. Default: 1.

#### Code explanation

The following is the definition of the title argument of `/poll create` command.
> Note: this is only an extract, the command has many options declared.

```js
  .addSubcommand((command) =>
    command //create
      .setName(PERSONALITY.getCommands().polls.create.name)
      .setDescription(PERSONALITY.getCommands().polls.create.description)
      .addStringOption((option) =>
        option //title
          .setName(PERSONALITY.getCommands().polls.create.titleOption.name)
          .setDescription(
            PERSONALITY.getCommands().polls.create.titleOption.description
          )
          .setRequired(true)
          .setMinLength(1)
          .setMaxLength(225)
      )
```

After defining the command, it `action` time. First, it regroups all the basic data required for 
the whole process, such as the personality and interaction options (input data from user).

```js
if (subcommand === personality.create.name) {
    //create poll subcommand
    const perso = personality.create;

    //get options
    const title = options.getString(perso.titleOption.name);
    const choices = options.getString(perso.choiceOption.name);

    const description = options.getString(perso.descOption.name, false);

    let option = options.getBoolean(perso.hideOption.name, false); //anonymous
    const anonymous = option == null ? true : option; //if true, no name displayed

    option = options.getNumber(perso.maxOption.name, false); //max
    const voteMax = option == null ? 1 : option;

    option = options.getString(perso.colorOption.name, false); //color
    const color =
      option == null ? perso.colorOption.colors.choices[4].value : option;
```

The first filter is to verify that there are not too many choices to vote to. 

```js
    //check if not too many choices
    const splited = choices.split(";");
    if (splited.length > 10) {
      interactionReply(interaction, personality.errorChoicesNumber);
      return;
    }
```

Then, we create the `embed` object that will be used for the poll. There are some optionnal stuff here,
such as the `footer` which depends of vote type (unique or multiple), and if there is any description.

```js
    //create embed
    const embed = new MessageEmbed()
      .setTitle(title)
      .setTimestamp()
      .setColor(color);

    //write footer according to voteMax
    const footerText =
      voteMax === 1
        ? perso.footer.unique + perso.footer.options
        : perso.footer.multiple + ` (${voteMax})` + perso.footer.options;
    embed.setFooter({ text: footerText });

    // Optionnal parameters
    if (description) embed.setDescription(description);
```

Next phase is to write each choice in the `embed`. For this, it needs to parse user input into `embed.fields`.
The `results` object regroup `fields` names and `emotes`, if provided by the user.

```js
    //parse choices text
    const results = parsePollFields(splited);

    //write choices in embed
    const black = personality.black;
    results.fields.forEach((field, idx) => {
      const name = results.emotes[idx] + " " + field;
      embed.addFields({ name, value: black.repeat(10) + " 0% (0)\n" });
    });
```

After the `embed`, it's `button` creation. It loops over `emotes`, creating buttons attributes according to
buttons `index` and `ActionRow` restrictions. At the same time, it create the objects that will be stored in the `db`.

```js
//create vote buttons
    const components = results.emotes.reduce(
      (acc, cur, idx) => {
        //create button
        const buttonId = "polls_" + idx.toString();
        const button = createButton(buttonId, null, "SECONDARY", cur);
        const newDbVotesValue = { votes: [], buttonId: buttonId }; //create db choice storage

        //handle actionRow maxe size of 5 components.
        if (idx === 0 || acc.size === 5) {
          //if first button or last AR is full
          const newRow = new MessageActionRow().addComponents(button);
          return {
            actionRows: [...acc.actionRows, newRow],
            size: 1,
            dbVotes: [...acc.dbVotes, newDbVotesValue],
          };
        } else {
          //add button to last AR
          const lastAR = acc.actionRows[acc.actionRows.length - 1];
          lastAR.addComponents(button);
          return {
            actionRows: acc.actionRows,
            size: acc.size + 1,
            dbVotes: [...acc.dbVotes, newDbVotesValue],
          };
        }
      },
      { actionRows: [], size: 0, dbVotes: [] }
    );
```

After votes button, we add the `settings button` according to last AR status. If full, it creates a new
AR, else it add the settings button to the last AR.

```js
    //add setting button
    const settingId = "polls_" + "settings";
    const settingButton = createButton(settingId, null, "SECONDARY", "⚙️");
    if (components.size === 5) {
      //if actionRow is full, create one more
      const newRow = new MessageActionRow().addComponents(settingButton);
      components.actionRows.push(newRow);
    } else
      components.actionRows[components.actionRows.length - 1].addComponents(
        settingButton
      );
```

Everything is created, so now it's time to send and save the content created. The poll is sent, the data
is saved in db. Plus, a `MessageComponentCollector` is created, to listen to any button interaction on the
poll message. It can be votes or setting buttons.

```js
    //send poll
    try {
      const pollMsg = await interaction.channel.send({
        embeds: [embed],
        components: components.actionRows,
      });
      pollButtonCollector(pollMsg); //start listening to interactions
      interactionReply(interaction, perso.sent);

      //save poll
      const colorIdx = perso.colorOption.colors.choices.findIndex(
        (obj) => obj.value === color
      ); //find color index from personality
      addPoll(
        interaction.client.db,
        pollMsg.id,
        pollMsg.channelId,
        interaction.user.id,
        components.dbVotes,
        anonymous,
        colorIdx,
        voteMax,
        title
      ); //add to db
    } catch (e) {
      console.log("/polls create error\n", e);
    }
```

### New choices

This command allows to add a new choice to an already sent poll. 
This is cool if one choice is missing.

#### Parameters

- Mandatory:
  - _sondage_ Poll choice from its name, using a list.
  - _choices_ Choices of the poll. You **must** follow the notation. 
    - Two choices are separated by a **semi-colon `;`**. 
    - If you want to specify an emote for a choice, you must separate the emote from the choice text using a **comma `,`**. 
    - The last choice **does not** require a *semi-colon*.  
    Eg: `🥖, bread; 🧈, butter`

#### Code explanation

Most of the process of options here is the same for `/polls create`. First, it is gathered and checked.
```js
} else if (subcommand === personality.addChoice.name) {
    //addChoice poll subcommand
    const perso = personality.addChoice;

    //get options
    const pollInput = options.getString(perso.pollOption.name);
    const choices = options.getString(perso.choiceOption.name);

    //check if not too many choices
    const splited = choices.split(";");
    if (splited.length > 10) {
      interactionReply(interaction, personality.errorChoicesNumber);
      return;
    }
```
Then, the poll to modify must be retrieved. 
Some checks are done to ensure that the command will not go wrong.

```js
    //fetch db data
    const dbPoll = getPollFromTitle(interaction.client.db, pollInput);
    if (!dbPoll) {
      interactionReply(interaction, perso.errorNoPoll);
      return;
    }

    //get pollMessage
    const pollMessage = await interaction.channel.messages.fetch(dbPoll.pollId);
    const embed = EmbedBuilder.from(pollMessage.embeds[0]);
    const fields = embed.data.fields;

    //check for choices number
    if (fields.length + splited.length > 10) {
      interactionReply(interaction, perso.errorChoicesNumber);
      return;
    }
```

Now, the code executes the same tasks as for `/polls create`.
It parse the choices, create the buttons and then update the poll.
> To see that code, please refer to the [`create` part](#code-explanation)

## Buttons

A lot of buttons are used with this functionality. Some are dedicated to votes,
others to modify the poll. To dispatch buttons interactions, some handlers functions
are used in `pollsHandlers`.

```js
export const pollsButtonHandler = async (interaction) => {
  // Dispatch button action to corresponding functions
  const { customId } = interaction;

  const sixNumber = Number(customId[6]);
  const voteButtonTest = !isNaN(sixNumber) && typeof sixNumber == "number";
  if (voteButtonTest) await voteButtonHandler(interaction);
};
```

This method filter `poll` `interactions` to keep only `vote` related `interaction`.
> Note: the filter impose that the maximum number of choices to be a one digit number.

The following dispatch `settings` buttons according to their `customId`:
```js
export const settingsButtonHandler = async (interaction) => {
  // handle settings button
  const { customId } = interaction;
  if (customId.includes("settings")) sendSettingsButtons(interaction);
  else if (customId.includes("set_stop")) stopPollButtonAction(interaction);
  else if (customId.includes("set_remove")) removePollButtonAction(interaction);
  else if (customId.includes("set_reset")) resetPollButtonAction(interaction);
  else if (customId.includes("set_update")) updatePollButtonAction(interaction);
  else if (customId.includes("set_refresh"))
    refreshPollButtonAction(interaction);
};
```

## Stop

There are 3 ways to stop a poll.
- `timeout` expiration.
- `/polls stop` command.
- `stop` settings button.

### Timeout

Once creating a poll, you can specify when the poll will stop. This use the `setTimeout` function which execute some code after a delay.
If you do not specify a timeout (using `hour` and `minutes` options), a default value is set for each.

```js
    option = options.getNumber(perso.hourOption.name, false); //hours
    const hours = option == null ? 48 : option;
    option = options.getNumber(perso.minuteOption.name, false); //minutes
    const minutes = option == null ? 59 : option;
    const timeout = (hours * 60 + minutes) * 60 * 1000; //poll duration in miliseconds
    const pollDate = dayjs().millisecond(timeout).toISOString();
```

## Command

The `/polls stop` command allows to chose a poll to stop and stop it.
The choice is done using poll title.

```js
    //fetch db data
    const dbPoll = getPollFromTitle(db, pollInput);
    if (!dbPoll) {
      interactionReply(interaction, perso.errorNoPoll);
      return;
    }

    //get pollMessage
    const channel = await interaction.client.channels.fetch(dbPoll.channelId);
    const pollMessage = await channel.messages.fetch(dbPoll.pollId);

    await stopPoll(dbPoll, pollMessage, personality);
```
The `options` are fetched and then the poll data in `db`.
After this, the poll `message` is required, to stop the `poll` and write it.
The function `stopPoll` is common to the `command stop` and the `button stop`.

## Button

```js
  //get data
  const perso = PERSONALITY.getCommands().polls;
  const sPerso = perso.settings;
  const pollMessage = await fetchPollMessage(interaction);
  const dbPoll = getPoll(db, pollMessage.id);
  if (!dbPoll) {
    interactionEditReply(interaction, { content: perso.errorNoDb });
    return;
  }
  await stopPoll(dbPoll, pollMessage, sPerso);
```

The same process is done by the `button stop`.
