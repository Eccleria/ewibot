import { PERSONALITY } from "./personality.js";
import { parseLink, spotifyReply } from "../helpers/index.js";

const action = async (message, _personality, client, currentServer) => {

  const foundLink = await parseLink(
    message.content,
    client,
    PERSONALITY.spotify,
    currentServer
  );

  await spotifyReply(foundLink, message, client, currentServer);
};

const spotify = {
  name: "spotify",
  action,
  help: () => { return PERSONALITY.commands.spotify.help },
  admin: false
};

export default spotify;
