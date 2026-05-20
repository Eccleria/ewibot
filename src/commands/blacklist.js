import { SlashCommandBuilder } from "@discordjs/builders";
import { channelSend, fetchChannel, interactionReply } from "ewilib";

import {
  addBlacklist, 
  removeBlacklist,
  getBlacklist,
} from "../helpers/index.js"
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

const action = async (interaction) => {
  const authorId = interaction.member.id;
  const db = interaction.client.db;

  const whichCommand = interaction.options.getSubcommand();
  const bPerso = PERSONALITY.getPersonality().blacklist;
  switch (whichCommand) {
    case bPerso.add.name:
      const toAdd = interaction.options
        .getUser(bPerso.add.userOption.name).id; // get user ID
      var res = addBlacklist(db, toAdd);
      if (res) {
        await interactionReply(interaction, bPerso.add.response_pos);
      } else {
        await interactionReply(interaction, bPerso.add.response_neg);
      }
      break;
    case bPerso.get.name:
      var allIds = [];
      getBlacklist(db).forEach(element => {
          allIds.push(toMention(element));
        })
      await interactionReply(interaction, 
        bPerso.get.response.concat(allIds.join('\n')));
      break;
    case bPerso.remove.name:
      const toRemove = interaction.options
        .getUser(bPerso.remove.userOption.name).id;
      var res = removeBlacklist(db, toRemove);
      if (res) {
        await interactionReply(interaction, bPerso.remove.response_pos);
      } else {
        await interactionReply(interaction, bPerso.remove.response_neg);
      }
      break;
    default:
      await interactionReply(interaction, bPerso.error);
  }
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

// Util method to get user mention under the form <@UserId>
const toMention = ((userId) => `- <@${userId}>`);

export default blacklist;
