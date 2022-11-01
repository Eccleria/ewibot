import { SlashCommandBuilder } from "@discordjs/builders";

import { interactionReply } from "./utils.js";
import { isGiftUser, addGiftUser, removeGiftUser } from "../helpers/index.js";
import { PERSONALITY } from "../personality.js";

const command = new SlashCommandBuilder()
    .setName(PERSONALITY.getCommands().gift.name)
    .setDescription(PERSONALITY.getCommands().gift.description)
    .addSubcommand((subcommand) => //user authorisation command
        subcommand
            .setName(PERSONALITY.getCommands().gift.user.name)
            .setDescription(PERSONALITY.getCommands().gift.user.description)
    )
    .addSubcommand((subcommand) => //send message command
        subcommand
            .setName(PERSONALITY.getCommands().gift.send.name)
            .setDescription(PERSONALITY.getCommands().gift.send.description)
            .addUserOption((option) =>
                option
                    .setName(PERSONALITY.getCommands().gift.userOption.name)
                    .setDescription(PERSONALITY.getCommands().gift.send.userOption.description)
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName(PERSONALITY.getCommands().gift.textOption.name)
                    .setDescription(PERSONALITY.getCommands().gift.send.textOption.description)
                    .setRequired(true)
            )
    )



const action = async (interaction) => {
  const subcommand = interaction.options.subcommand;
  const author = interaction.member;

  const personality = PERSONALITY.getCommands().gift;
  if (subcommand === personality.use.name) {
    const db = interaction.client.db;

    if (isGiftUser(db, author.id)) {
      removeGiftUser(db, author.id);
      interactionReply(interaction, personality.use.isNotAccepting);
    } else {
      addGiftUser(db, author.id);
      interactionReply(interaction, personality.use.isAccepting);
    }
  }
};

const gift = {
    action,
    command,
    help: (interaction) => {
        const personality = PERSONALITY.getCommands().gift;
        interactionReply(interaction, personality.help);
    },
};

export default gift;
