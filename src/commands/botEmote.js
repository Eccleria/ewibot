import { SlashCommandBuilder } from "discord.js";
import { interactionReply } from "../helpers/index.js";
import { PERSONALITY } from "../personality.js";
import { isAdmin } from "../helpers/utils.js";

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getPersonality().botEmote.name)
  .setDescription(PERSONALITY.getPersonality().botEmote.description)
  .setDefaultMemberPermissions(0x0000010000000000)
  .addStringOption((option) =>
    option
      .setName(PERSONALITY.getPersonality().botEmote.messageOption.name)
      .setDescription(
        PERSONALITY.getPersonality().botEmote.messageOption.description,
      )
      .setRequired(true)
      .setMinLength(1),
  )
  .addStringOption((option) =>
    option
      .setName(PERSONALITY.getPersonality().botEmote.emoteOption.name)
      .setDescription(
        PERSONALITY.getPersonality().botEmote.emoteOption.description,
      )
      .setRequired(true)
      .setAutocomplete(true),
  );

const action = async (interaction) => {
  const perso = PERSONALITY.getPersonality().botEmote;
  if (!isAdmin(interaction.user.id)) {
    interactionReply(interaction, perso.errorNotAdmin);
    console.log(`${interaction.user.id} tried to use /reaction`);
    return;
  }

  //get options
  const options = interaction.options;
  const messageId = options.getString(perso.messageOption.name);
  const emoteId = options.getString(perso.emoteOption.name);

  //fetch message
  let message;
  try {
    message = await interaction.channel.messages.fetch(messageId);
  } catch (e) {
    console.log("/reaction error - message not found", e);
    interactionReply(interaction, perso.errorMessageNotFound);
    return;
  }

  //get emote
  const emote = interaction.guild.emojis.cache.get(emoteId);

  //react
  const result = await message.react(emote);
  if (result) interactionReply(interaction, perso.react);
  else interactionReply(interaction, perso.errorNotReact);
};

const autocomplete = (interaction) => {
  const value = interaction.options.getFocused(); //get value which is currently user edited
  const focusedValue = value.toLowerCase();
  const emotesCache = interaction.guild.emojis.cache;

  //build list
  const emotes = emotesCache.map((cur) => {
    return { name: cur.name.toLowerCase(), value: cur.id };
  });
  const filtered = emotes.filter((cur) => cur.name.startsWith(focusedValue)); //filter to corresponding emotes names
  const sliced = filtered.length > 24 ? filtered.slice(0, 24) : filtered;

  interaction.respond(sliced);
};

const botEmote = {
  command,
  action,
  autocomplete,
  help: (interaction) => {
    const perso = PERSONALITY.getPersonality().botEmote;
    interactionReply(interaction, perso.help);
  },
  admin: true,
  sentinelle: false,
};

export default botEmote;
