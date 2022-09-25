import { SlashCommandBuilder } from "@discordjs/builders";

import { PERSONALITY } from "../personality.js";
import { parseLink } from "../helpers/index.js";
import { interactionReply } from "./utils.js";

const spotifyReply = async (link, interaction, client, currentServer) => {
  // Ewibot reply for command query
  if (link) {
    const { answer, songId } = link;
    const newMessage = await interactionReply(interaction, answer);

    if (songId) await newMessage.react(currentServer.removeEmoji);

    client.playlistCachedMessages = [
      ...client.playlistCachedMessages,
      { ...newMessage, songId },
    ];
  }
};

const action = async (interaction, commons) => {
  const options = interaction.options;
  const subcommand = options.getSubcommand();

  if (subcommand === "ajouter") {
    const link = interaction.options.getString("lien");
    const client = interaction.client

    const currentServer = commons.some(
      ({ guildId }) => guildId === interaction.guildId
    ); //get server local data

    const foundLink = await parseLink(
      link,
      client,
      PERSONALITY.getSpotify(),
      currentServer
    );

    console.log("spotify", foundLink);

    await spotifyReply(foundLink, interaction, client, currentServer);
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
          .setDescription("lien spotify de la musique à ajouter")
      )
  )

const spotify = {
  action,
  command,
  help: (interaction) => {
    const perso = PERSONALITY.getCommands().spotify.help;
    interactionReply(interaction, perso);
  },
};

export default spotify;
