# Commands

Commands are interactions that users can have with the bot or other users.

- [Organisation](#organisation)
- [Command types](#commandtypes)
  - [Text commands](#textcommands)
  - [Slash commands]()
  - [Context commands]()
- [Commands]()
  - [Small commands]()
  - [Complex commands]()

## Organisation

If the commands are not complex, they are written in the [index file](../src/commands/index.js). Otherwise, they are
separated from the rest in a dedicated file, like the [reminder command](../src/commands/reminder.js). Then they are
imported in the [index file](./src/commands/index.js) and regrouped for the main bot file usage.

## Command types

Commands can exist in different forms: text, slash and contextual commands.

> Text commands are replaced by slash commands since September the 1st, 2022. But for unverified bots,
> text commands are still possible.

### Text commands

A text command is a command that is fire by the user with a text message. In the code, it's an object divided in 4
arguments:

- _name_ is for the recognition of the command in an user message.
- _action_ is the associated function to use when the command is called by a user.
- _help_ is the message the bot should send when calling `$help function`.
- _admin_ is the argument distinguishing if the command may only be used by bot admins or by all users.

```javascript
const helloWorld = {
  name: "ping",
  action: async (message) => {
    await message.channel.send(PERSONALITY.getCommands().helloWorld.pong);
  },
  help: () => {
    return PERSONALITY.getCommands().helloWorld.help;
  },
  admin: false,
};
```

An admin is a bot developer.

```javascript
const ADMINS = ["141962573900808193", "290505766631112714"]; // Ewibot Admins' Ids

export const isAdmin = (authorId) => {
  // Check if is admin users
  return ADMINS.includes(authorId);
};
```

### Slash commands

Slash commands are commands that can be used using the `/` prefix. It makes appear a list of all
`/` commands available. 
