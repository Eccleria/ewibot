import { SlashCommandBuilder } from "@discordjs/builders";

import {} from "./utils.js";
import { interactionReply, parseLink } from "../helpers/index.js";
import { COMMONS } from "../commons.js";
import { PERSONALITY } from "../personality.js";

const spotifyReply = async (link, interaction, client, cmnShared) => {
  // Ewibot reply for command query
  if (link) {
    const { answer, songId } = link;
    const newMessage = await interactionReply(interaction, answer, false);
    console.log(newMessage);
    //if (songId) await newMessage.react(cmnShared.removeEmoji);

    client.playlistCachedMessages = [
      ...client.playlistCachedMessages,
      { ...newMessage, songId },
    ];
  }
};

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getCommands().spotify.name)
  .setDescription(PERSONALITY.getCommands().spotify.description)
  .addSubcommand((command) =>
    command
      .setName(PERSONALITY.getCommands().spotify.add.name)
      .setDescription(PERSONALITY.getCommands().spotify.add.description)
      .addStringOption((option) =>
        option
          .setName(PERSONALITY.getCommands().spotify.add.linkOption.name)
          .setDescription(PERSONALITY.getCommands().spotify.add.linkOption.description)
          .setRequired(true)
          .setMinLength(10)
      )
  );

const action = async (interaction) => {
  const options = interaction.options;
  const subcommand = options.getSubcommand();
  const personality = PERSONALITY.getCommands().spotify;

  if (subcommand === personality.add.name) {
    const perso = personality.add;
    console.log(subcommand);
    const client = interaction.client;
    const cmnShared = COMMONS.getShared();
    const link = interaction.options.getString(perso.linkOption.name);
    console.log("link", [link]);

    const foundLink = await parseLink(
      link,
      client,
      PERSONALITY.getSpotify(),
      cmnShared
    );

    console.log("foundLink", foundLink);

    await spotifyReply(foundLink, interaction, client, cmnShared);
  }
};
  
const spotify = {
  action,
  command,
  help: (interaction) => {
    const perso = PERSONALITY.getCommands().spotify.help;
    interactionReply(interaction, perso);
  },
};

export default spotify;
