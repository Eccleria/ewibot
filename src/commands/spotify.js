import dayjs from "dayjs";
import "dayjs/locale/fr.js";
import Duration from "dayjs/plugin/duration.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
dayjs.locale("fr");
dayjs.extend(Duration);
dayjs.extend(relativeTime);

import { SlashCommandBuilder } from "@discordjs/builders";

import {} from "./utils.js";
import { interactionReply, parseLink } from "../helpers/index.js";
import { COMMONS } from "../commons.js";
import { PERSONALITY } from "../personality.js";

const spotifyReply = async (link, interaction, client, cmnShared) => {
  // Ewibot reply for command query
  if (link) {
    const { answer, songId } = link;
    const newMessage = await interactionReply(interaction, answer);

    if (songId) await newMessage.react(cmnShared.removeEmoji);

    client.playlistCachedMessages = [
      ...client.playlistCachedMessages,
      { ...newMessage, songId },
    ];
  }
};

const action = async (interaction) => {
  const options = interaction.options;
  const subcommand = options.getSubcommand();

  if (subcommand === "ajouter") {
    const link = interaction.options.getString("lien");
    const client = interaction.client;

    const cmnShared = COMMONS.getShared();

    const foundLink = await parseLink(
      link,
      client,
      PERSONALITY.getSpotify(),
      cmnShared
    );

    console.log("spotify", foundLink);

    await spotifyReply(foundLink, interaction, client, cmnShared);
  }
};

const command = new SlashCommandBuilder()
  .setName("spotify")
  .setDescription("Permet d'interagir avec Spotify.")
  .addSubcommand((command) =>
    command
      .setName("ajouter")
      .setDescription("Ajout d'une musique dans la playlist du server.")
      .addStringOption((option) =>
        option
          .setName("lien")
          .setDescription("lien spotify de la musique � ajouter")
      )
  );

const spotify = {
  action,
  command,
  help: (interaction) => {
    const perso = PERSONALITY.getCommands().spotify.help;
    interactionReply(interaction, perso);
  },
  releaseDate: dayjs("12-25-2024", "MM-DD-YYYY"),
};

export default spotify;
