import { PERSONALITY } from "./personality.js";
import { parseLink } from "../helpers/index.js";

const spotifyReply = async (foundLink, message, client, currentServer) => {
  // Ewibot reply for command query
  if (foundLink) {
    const { answer, songId } = foundLink;
    const newMessage = await message.reply(answer);

    if (songId) await newMessage.react(currentServer.removeEmoji);

    client.playlistCachedMessages = [
      ...client.playlistCachedMessages,
      { ...newMessage, songId },
    ];
  }
};

const action = async (message, client, currentServer) => {
  const foundLink = await parseLink(
    message.content,
    client,
    PERSONALITY.getSpotify(),
    currentServer
  );

  await spotifyReply(foundLink, message, client, currentServer);
};

const spotify = {
  name: "spotify",
  action,
  help: () => {
    return PERSONALITY.getCommands().spotify.help;
  },
  admin: false,
};

export default spotify;
