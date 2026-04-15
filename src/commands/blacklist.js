import { SlashCommandBuilder } from "@discordjs/builders";
import { channelSend, fetchChannel, interactionReply } from "ewilib";

import { COMMONS } from "../classes/commons.js";
import { PERSONALITY } from "../classes/personality.js";

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getPersonality().blacklist.name)
  .setDescription(PERSONALITY.getPersonality().blacklist.description)
  .addSubcommand((subcommand) =>
    subcommand // add subcommand => add a user to the blacklist
      .setName(PERSONALITY.getPersonality().blacklist.add.name)
      .setDescription(PERSONALITY.getPersonality().blacklist.add.description)
      .addUserOption((option) =>
        option
          .setName(PERSONALITY.getPersonality().blacklist.add.userOption.name)
          .setDescription(
            PERSONALITY.getPersonality().blacklist.add.userOption.description,
          )
          .setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand // remove subcommand => remove a user from the blacklist
      .setName(PERSONALITY.getPersonality().blacklist.remove.name)
      .setDescription(PERSONALITY.getPersonality().blacklist.remove.description)
      .addUserOption((option) =>
        option
          .setName(PERSONALITY.getPersonality().blacklist.remove.userOption.name)
          .setDescription(
            PERSONALITY.getPersonality().blacklist.remove.userOption.description,
          )
          .setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand //get subcommand => returns the current blacklist state
      .setName(PERSONALITY.getPersonality().blacklist.get.name)
      .setDescription(PERSONALITY.getPersonality().blacklist.get.description),
  );

//TODO: continue implementation for the blacklist :ablobsweat:

const action = async (interaction) => {
  
  await interactionReply(interaction, "This is not yet implemented. Try again later ;)");
  return;
};

const blacklist = {
  // Allows sentinelles to blacklist users with whom Ewibot will not interact
  name: "blacklist",
  command: command,
  action,
  help: (interaction, userOption) => {
    const personality = PERSONALITY.getPersonality().blacklist;
    const helpToUse = userOption.includes(" ")
      ? personality[userOption.split(" ")[1]]
      : personality;
    interactionReply(interaction, helpToUse.help);
  },
  admin: true,
  releaseDate: null,
  sentinelle: true,
  subcommands: ["blacklist", "blacklist add", "blacklist remove", "blacklist get"],
};

export default blacklist;
