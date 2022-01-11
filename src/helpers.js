//eslint-disable-next-line
require("dotenv").config();
import ytdl from "ytdl-core";

export const isCommand = (content) => content[0] === "!";

const apologies = [
  "desolé",
  "desolée",
  "desole",
  "desolee",
  "dsl",
  "sorry",
  "sry",
  "desoler",
  "désolé",
  "désolée",
  "désoler",
  "pardon",
  "navré",
  "navrée",
];

export const isApologies = (messageContent) => {
  return messageContent.split(" ").some((e) => apologies.includes(e));
};

const youtubeRegex = new RegExp(
  /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w-_]+)/gim
);

const sanitizeTitle = (title) => {
  return title
    .toLowerCase()
    .replace(/\([^()]*\)/g, "")
    .replace(/official music video/gi, "")
    .replace(/official lyrics video/gi, "")
    .replace(/official audio/gi, "")
    .replace(/official video/gi, "")
    .replace(/official/gi, "")
    .replace(/| napalm records/gi, "")
    .replace(/officiel/gi, "")
    .replace(/ ost /gi, "")
    .replace(/credits/gi, "")
    .replace(/original soundtrack/gi, "");
};

export const isYoutubeLink = async (messageContent, client) => {
  const res = await youtubeRegex.exec(messageContent);

  if (!res) return null;

  const youtubeLink = res[0];

  const infos = await ytdl.getInfo(youtubeLink);

  if (infos.videoDetails) {
    const { artist, song } = infos.videoDetails.media;

    const title = sanitizeTitle(infos.videoDetails.title);

    const searchQuery = artist && song ? `${song} ${artist}` : title;

    const dataFound = await client.spotifyApi.searchTracks(searchQuery);

    const { items } = dataFound.body.tracks;

    if (items.length > 0) {
      client.spotifyApi.addTracksToPlaylist(process.env.SPOTIFY_PLAYLIST_ID, [
        items[0].uri,
      ]);
      console.log(`Chanson ajoutée : ${searchQuery}`);
      return null;
      // return `Chanson ajoutée : ${searchQuery}`;
    }
  }

  return null;
};
