import dayjs from "dayjs";
import {
  SlashCommandBuilder,
  ContextMenuCommandBuilder,
} from "@discordjs/builders";
import {
  interactionReply,
} from "../helpers/index.js";
import { PERSONALITY } from "../personality.js";

const reverseStr = (string) => {
  let reversed = "";
  let isInMentionable = false;
  let mention = "";

  for (const char of string) {
    if (char === "<") isInMentionable = true;
    if (!isInMentionable) reversed = char + reversed;
    if (isInMentionable) mention = mention + char;
    if (char === ">") {
      isInMentionable = false;
      reversed = mention + reversed;
      mention = "";
    }
  }
  return reversed;
};

// SLASH COMMAND

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getPersonality().reverse.name)
  .setDescription(PERSONALITY.getPersonality().reverse.description)
  .addStringOption((option) =>
    option
      .setName(PERSONALITY.getPersonality().reverse.stringOption.name)
      .setDescription(
        PERSONALITY.getPersonality().reverse.stringOption.description,
      )
      .setRequired(true),
  )
  .addBooleanOption((option) =>
    option
      .setName(PERSONALITY.getPersonality().reverse.booleanOption.name)
      .setDescription(
        PERSONALITY.getPersonality().reverse.booleanOption.description,
      )
      .setRequired(false),
  );

const action = (interaction) => {
  const options = interaction.options;
  const personality = PERSONALITY.getPersonality().reverse;
  const string = options.getString(personality.stringOption.name);
  const toCrossOut = options.getBoolean(personality.booleanOption.name);

  const reversed = reverseStr(string);
  const content = toCrossOut ? "`~~" + reversed + "~~`" : reversed;

  interactionReply(interaction, content);
};

const reverse = {
  action,
  command,
  help: (interaction) => {
    const personality = PERSONALITY.getPersonality().reverse;
    interactionReply(interaction, personality.help);
  },
  admin: false,
  releaseDate: dayjs("12-08-2022", "MM-DD-YYYY"),
  sentinelle: false,
};

// CONTEXT COMMAND

const contextCommand = new ContextMenuCommandBuilder()
  .setName(PERSONALITY.getPersonality().reverseTranslator.name)
  .setType(3);

const contextAction = async (interaction) => {
  const message = interaction.targetMessage; //get message
  const rTPerso = PERSONALITY.getPersonality().reverseTranslator;

  const string = message.content; //get message content

  if (string.length !== 0) {
    const reversed = reverseStr(string); //reverse message content
    const content = reversed.startsWith("~~")
      ? reversed.slice(2, -2)
      : reversed;

    interactionReply(interaction, content);
  } else interactionReply(interaction, rTPerso.noContent);
};

const reverseTranslator = {
  action: contextAction,
  command: contextCommand,
  help: (interaction) => {
    const personality = PERSONALITY.getPersonality().reverseTranslator;
    interactionReply(interaction, personality.help);
  },
  admin: false,
  releaseDate: dayjs("12-16-2022", "MM-DD-YYYY"),
  sentinelle: false,
};

export { reverse, reverseTranslator };
