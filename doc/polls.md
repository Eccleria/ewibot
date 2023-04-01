# Polls 

- [Commands](#commands)
  - [Create](#create)
  - [New choices](#create)
- [Buttons](#buttons)

Polls are a `5.0.0` feature, allowing Alavirien.nes to create interactive messages from which everyone 
can vote. Even if everyone is able to create polls, only poll's author and moderators have access to poll 
settings.

## Commands

There are 2 `/commands` available to create and modify polls.

Command group definition.
```js
const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getCommands().polls.name)
  .setDescription(PERSONALITY.getCommands().polls.description)
```

For both commands, the action functions it filters triggering people to Alavirien.nes only.

```js
const action = async (interaction) => {
  const options = interaction.options;
  const personality = PERSONALITY.getCommands().polls;
  const subcommand = options.getSubcommand();

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

Commands parameters:
- Mandatory:
  - _title_ Title of the poll.
  - _choices_ Choices of the poll.
- Optional:
  - _color_ Color of the mebed and the colorbar.
  - _description_ Description of the poll, to add details or context.
  - _anonymous_ If you want ot display or not each voter choice.s.
  - _max votes_ Max number of votes.

The following is the definition of the title argument of `/poll create` command.
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

Then, we create the `embed` object that will be used for the poll. Ther are some optionnal stuff here,
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

### New choices

## Buttons

