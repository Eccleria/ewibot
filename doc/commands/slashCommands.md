# Slash commands

> For `polls`, please see [Polls Documentation](./polls.md).

A slash command is a Discord feature allowing bots to create Discord integrated commands using the `/` prefix.
[Here is the Discord Developer Portal about Slash Commands.](https://discord.com/developers/docs/interactions/application-commands#slash-commands)

The command can have multiple `groups`, `subcommands` and `options`. This enable the creation of really complex commands.

- [API](#api)
  - [Definition](#definition)
  - [Send](#send)
- [Internal](#internal)
  - [Object](#object)
  - [Recognition](#recognition)

## API


### Definition

To define a command, there are some mandatory attributes:
- name
- description

The other stuff is optional and defined by developer's needs. In the following example, the command have `name`, `description` and `defaultPermission` set.

```js
const personality = PERSONALITY.getCommands().shuffle; //for simplification

const command = new SlashCommandBuilder()
  .setName(personality.name)
  .setDescription(personality.description)
  .setDefaultMemberPermissions(0x0000010000000000)
```

Among the optional setup, there are `subcommands`, which requires the mandatory name and description. In this example, the `subcommand` have also a `NumberOption`, with mandatory and `setRequired` option.

```js
  .addSubcommand((subcommand) =>
    /* subcommand stuff */
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName(personality.set.name)
      .setDescription(personality.set.description)
      .addNumberOption((option) =>
        option
          .setName(personality.set.numberOption.name)
          .setDescription(
            personality.set.numberOption.description
          )
          .setRequired(true)
      )
  );
```


### Send

The command requires to be sent to the API in order to work. It's done in this bot with the following code:

```js
// COMMANDS SENDING TO API
export const slashCommandsInit = async (guildId, client) => {
  try {
    console.log("Started refreshing application (/) commands.");

    const self = process.env.CLIENTID; //get self Discord Id
    await rest.put(Routes.applicationGuildCommands(self, guildId), {
      body: helpCommands.map((cmd) => cmd.command.toJSON()),
    }); //send commands jsons to API for command create/update

    console.log("Successfully reloaded application (/) commands.");

    //save commands in client
    client.slashCommands = slashCommands; //save slashCommands
    client.contextCommands = contextCommands; //save contextCommands
  } catch (error) {
    console.error(error);
  }
};
```

Within a block of `logs`, every commands definition are sent to the API with a rest PUT request. All commands are also saved inside the `client` object, for further recognition when the command is used by a user.

With the `Routes.applicationGuildCommands`, the commands are declared specificaly for the current guild, and are not global. This means that commands can be declared to be used on any server.
This allows to not have both bots (Ewidev for dev purpose, Ewibot in La Quête d'Ewilan server) commands on each server, simplifying the dev process. 

## Internal

For internal use, the command is an object with mandatory and optional elements. 


### Object

The mandatory are:
- API definition, named as `command`,
- method fired when used by a user, named as `action`,
- `help` method, used when a user search for the specific help for this command,
- `admin` attribute, which define if the command is designed to be used only for the **bot admin**,
- `releaseDate`, which is usefull when the command is planned for a specific date. Otherwise, it is set as `null`,
- `sentinelle` attribute, with the same aim as `admin`, but for server **moderators**

Among the optional stuff:
- `subcommands`, an optional attribute for `help` command purpose. It's used to look for a `subcommand help` (see [Gift command source file](../../src/commands/gift.js) for example). 

```js
const shuffle = {
  command,
  action,
  help: (interaction) => {
    const content = PERSONALITY.getCommands().shuffle.help;
    interactionReply(interaction, content);
  },
  admin: true,
  releaseDate: null, //dayjs("01-01-2023", "MM-DD-YYYY"),
  sentinelle: false,
};
```


### Recognition

_How commands are found when used ?_

When used, the `API` send a `interactionCreate` event, which can be caught.

```js
client.on("interactionCreate", onInteractionCreate);
```

> An `interactionCreate` event can be fired for a command, but also when a button, a drop-down list or a modal is used.

Then, a filter considering iteraction type is useful.

*Please note that the following codes are simplified. Only the `slashCommand` part is detailed.*

```js
export const onInteractionCreate = (interaction) => {
  if (interaction.isButton()) { /*simplified*/ }

  if (interaction.isStringSelectMenu()) { /*simplified*/ }
```

After this, the new filter is about the type of command fired.
- A `ContextMenuCommand` is a command accessible by right-clicking on a `message`, a `user` or a `channel`. 
- Some options can have an `autocomplete` process, to help users chose a value. For more details, see [Autocomplete](#autocomplete).
- A slash command is a `Command`.

```js
  if (interaction.isContextMenuCommand()) { /*simplified*/ }

  const slashCommands = client.slashCommands;

  if (interaction.isAutocomplete()) { /*simplified*/ } 
  else if (interaction.isCommand()) {
    //slash commands
    const client = interaction.client; //get client
    const slashCommands = client.slashCommands; //get commands

    const foundCommand = slashCommands.find(
      (cmd) => cmd.command.name === interaction.commandName
    );

    if (foundCommand && isReleasedCommand(foundCommand))
      foundCommand.action(interaction, "/");
    //if found command, execute its action
    else
      interactionReply(
        interaction,
        PERSONALITY.getAdmin().commands.notReleased
      );
  }
};
```

If the interaction has the correct type, the next stage is to find which one is fired. To find it, a comparison between `interaction.commandName` and command list. The command list is stored inside the `client`. 
If the command is found and released (cf [Object](#object) part), its `action` is fired. Else, an error message is replied.

### Autocomplete

To `autocomplete` an option, the code needs to find the corresponding command, and then the `autocomplete method` associated. The autocomplete requires as reply specific data: a list with the responses. If no responses, an empty list is returned.

```js
  if (interaction.isAutocomplete()) {
    //interaction with autocomplete activated
    
    const autoCompleteCommands = slashCommands.filter(
      (cmd) => cmd.autocomplete
    ); //get commands with autocomplete action
    
    const foundCommand = autoCompleteCommands
      ? autoCompleteCommands.find(
          (cmd) => cmd.command.name === interaction.commandName
        )
      : null; //find command that fired onInteractionCreate
    
    if (foundCommand && isReleasedCommand(foundCommand))
      foundCommand.autocomplete(interaction);
    else interaction.respond([]); //if not found, return no choices
  } 
```

