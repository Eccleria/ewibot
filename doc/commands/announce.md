# Announce

This command aims to program announce messages through Ewibot.
With Ewibot, the admin user can send `embeds`, contrary to Discord users.

- [Principe](#principe)
    - [`announce.js`](#announcejs)
        - [Message](#message)
        - [Command](#command)
    - [`announce.json`](#announcejson)

## Principe

The message should be created in both `announce.js` and `announce.json` files.
- The `.js` file is for the command definition and each announce code.
- The `.json` file store all the text that the announce message should contain.

*Note : in all this file, the message containing the announce is called `message`*

### `announce.js`

This file contains 2 parts:
- The 1st part is for each `message` definition. 
- The 2nd part is for the `command` declaration for the API and internal process.

#### Message 

The message is created through an `object`.
This `object` regroups the method fired once the message should be sent, and the associated `button` when sending confimation is required.

```js
const giftAnnounce = {
  action: giftAction, //method
  button: {
    name: "gift",
    value: "announce_gift",
  },
};
```

The method should handle everything from creating the message to sending it.
First, create the content of the message.
> Note that every message can be customed. For short messages, the `/message` command should be preferred. 

_Please see [Embed documentation](../embeds.md) for embed explanations._

```js
const giftAction = async (interaction) => {
  //action to fire once correct button is clicked
  const personality = PERSONALITY.getAnnounces().announce_gift;
  interactionReply(interaction, personality.sending);

  //create announce
  const fields = personality.fields; //get data from announce.json
  const embed = new EmbedBuilder()
    .setColor(Colors.DarkGreen)
    .setTimestamp()
    .setTitle(personality.title)
    .setDescription(personality.description)
    .setFooter({
      text: personality.footer,
      iconURL:
        "https://cdn.discordapp.com/avatars/691336942117453876/6d73900209e4d3bc35039f68f4aa9789.webp",
    })
    .addFields(Object.values(fields))
    .setThumbnail(
      "https://media.discordapp.net/attachments/959815577575256124/1041070360461852724/Ewilan_writing_cut.png?width=670&height=670"
    );
```

This way, each announce `message` is custom.

> The issue with this practice is that each `message`, when sent, is no longer usefull. It should be removed from this file. This creates a rather cumbersome system. 


Then, sending the `message`. We get the server data from `commons.json` file, where is stored the `id` of the announce `channel`.
Next, we fetch the `channel`, to be able to send the `message` in it (only the channel `id` isn't enough, the fetch is required).
Eventually, the `message` is sent.

```js
  //get channel
  const server = COMMONS.fetchGuildId(interaction.guildId);
  const channelId = server.announce.giftChannelId;
  const channel = await interaction.client.channels.fetch(channelId);

  //send gift announce
  channel.send({ embeds: [embed] });
};
```

#### Command

Now it's the command part, where the `command` is parsed for the API, and its behaviour is defined.
First, the users of this command are filtered, to be only the `bot admin`. This security is added to ensure that
no `message` is sent by accident.

```js
const action = (interaction) => {
  // handle announce command interaction

  const announceP = PERSONALITY.getCommands().announce; //get personality

  if (!isAdmin(interaction.user.id)) {
    //check for admin
    interactionReply(interaction, announceP.notAdmin);
    return;
  }
```

Next, as for each slash command, we need to retrieve the `options` the user gave when emitting the command interaction.
This time, the option allows to find the `message` personality.

```js
  //get interaction data
  const options = interaction.options;
  const whichAnnounce = options.getString(announceP.stringOption.name);
  const whichAnnounceP = PERSONALITY.getAnnounces()[whichAnnounce];
```

With this data, the confirm `button` can be created, to ensure the user wants to send this particular `message`.

```js
  //create confirm button
  const actionRow = new ActionRowBuilder().addComponents(
    createButton(whichAnnounceP.id, announceP.buttonLabel, ButtonStyle.Danger)
  );

  interaction.reply({
    content: whichAnnounceP.confirm,
    components: [actionRow],
    ephemeral: true,
  });
};
```

Here, we declare the list of all announces, regrouping each `message object` (see [message](#message) part).
Then, the `handler` of the confirm button is defined. This function find the corresponding `message object` from the button `id` and execute its `action`.
If no announce is found, the reply indicates it to the user.

```js
//list of announces
const announces = [giftAnnounce]; //list of all announces

//button action dispatcher
export const announceButtonHandler = (interaction) => {
  const whichButton = interaction.customId;
  const foundAnnounce = announces.find(
    (obj) => obj.button.value === whichButton
  );

  if (foundAnnounce) foundAnnounce.action(interaction);
  else
    interactionReply(interaction, PERSONALITY.getCommands().announce.notFound);
};
```

Lastly, the command is declared for Discord API, defining its `name`, `description`, `permissions` and `option`. 
> See [Slash Commands](./slashCommands.md) for more details.

```js
//announce command
const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getCommands().announce.name)
  .setDescription(PERSONALITY.getCommands().announce.description)
  .setDefaultMemberPermissions(0x0000010000000000)
  .addStringOption((option) =>
    option
      .setName(PERSONALITY.getCommands().announce.stringOption.name)
      .setDescription(
        PERSONALITY.getCommands().announce.stringOption.description
      )
      .addChoices(...announces.map((obj) => obj.button))
  );
```

Now, all is defined for the `command internal object`, which is exported.
> See [Slash Commands](./slashCommands.md) for more details.

```js
const announce = {
  action,
  command,
  help: (interaction) => {
    interactionReply(interaction, PERSONALITY.getCommands().announce.help);
  },
  admin: true,
  releaseDate: null,
  sentinelle: true,
};

export default announce;
```

### `announce.json`

As for other `Json` files, this one store announces `personality`.
It corresponds to each string that is meant to be displayed for any user.

Because of each `message` having its own sending method (`giftAction` for this example, see [Message](#message) part.), the mandatory attributes are limited to:
- `confirm`
- `id`

The `confirm` is the confirmation message displayed with the confirm button.
The `id` is the button customId used for internal recognition.
> Any other attribute is specific to the `message`.


```json
  "announce_gift": {
    "confirm": "Voulez-vous vraiment envoyer l'annonce `gift` ?",
    "description": "Salut les Ewinautes ! Une fois n'est pas coutume, c'est moi qui vous fais l'annonce <:Ewiyay:918249094391144469>.\n\n Après quelques semaines de développement, et sur une idée de la modération, voici venir votre **cadeau de Noël** ! <:DuomFetard:822479563077976065>. Enfin, **vos** cadeaux <:Ewinklan:841675143596212267>",
    "fields": {
      "field2": {
        "name": "\u200b",
        "value": "\u200b"
      }
    },
    "footer": "Merci à Arsenic qui a su maîtriser sa patience !",
    "id": "announce_gift",
    "notFound": "Désolé, l'annonce n'a pas été trouvée.",
    "sending": "L'annonce est en cours d'envoi.",
    "title": "Cadeaux de Noël"
  }
  ```

