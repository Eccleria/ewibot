import dotenv from "dotenv";
dotenv.config();
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

const hello = ["bonjour", "hello", "yo", "salut", "bonsoir", "coucou"];

export const reactionHandler = async (
  message,
  messageContent,
  currentServer
) => {
  if (
    apologies.some((apology) => messageContent.includes(apology)) &&
    message.channel.id !== currentServer.helpChannelId
  ) {
    await message.react(currentServer.emotes.panDuomReactId);
  }

  if (Math.random() < 0.8) return;

  const words = messageContent.split(" ");

  if (hello.some((helloMessage) => words[0].includes(helloMessage))) {
    await message.react("👋");
  }
  const emotes = Object.values(currentServer.emotes);
  for (const word of words) {
    const foundEmotes = emotes.filter((emote) => word.includes(emote));
    for (const e of foundEmotes) {
      await message.react(e);
    }
  }
};

export const checkIsOnThread = async (channel, threadId) => {
  const thread = channel.isThread
    ? null
    : channel.threads.cache.find((x) => x.id === threadId);
  if (thread && thread.joinable) await thread.join();
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

const parseYoutubeLink = async (messageContent, client) => {
  const isYoutubeLink = await youtubeRegex.exec(messageContent);

  if (!isYoutubeLink) return null;

  const youtubeLink = isYoutubeLink[0];

  const infos = await ytdl.getInfo(youtubeLink);

  const searchQuery =
    infos.videoDetails &&
    infos.videoDetails.media &&
    infos.videoDetails.media.artist &&
    infos.videoDetails.media.song
      ? `${infos.videoDetails.media.song} ${infos.videoDetails.media.artist}`
      : sanitizeTitle(infos.videoDetails.title);

  const dataFound = await client.spotifyApi.searchTracks(searchQuery);
  const { items } = dataFound.body.tracks;
  return items && items[0] && items[0].uri;
};

const parseSpotifyLink = async (messageContent) => {
  // https://open.spotify.com/track/3HctJdhy5CFb06NKIVp92U?si=cde5ab12a0f64fa6
  const isSpotifyLink = messageContent.includes("open.spotify.com/track");

  if (!isSpotifyLink) return null;

  const spotifyId = messageContent
    .split("open.spotify.com/track")[1]
    .slice(1, "3HctJdhy5CFb06NKIVp92Ue".length);
  return `spotify:track:${spotifyId}`;
};

const getEntirePlaylist = async (client) => {
  let offset = 0;
  let tracksIds = [];

  let loop = true;
  do {
    let tracks = await client.spotifyApi.getPlaylistTracks(
      process.env.SPOTIFY_PLAYLIST_ID,
      { limit: 100, offset }
    );
    const trackIds = tracks.body.items.map(({ track }) => track.uri);
    if (trackIds.length === 0) loop = false;
    tracksIds = [...tracksIds, ...trackIds];

    offset += 100;
  } while (loop);

  return tracksIds;
};

const parseAddCommand = async (messageContent, client) => {
  if (!messageContent.startsWith("!addsong")) return null;

  const searchQuery = messageContent.split(" ").slice(1).join(" ");

  const dataFound = await client.spotifyApi.searchTracks(searchQuery);
  const { items } = dataFound.body.tracks;
  return items && items[0] && items[0].uri;
};

export const parseLink = async (messageContent, client) => {
  const songSpotify = await parseSpotifyLink(messageContent);
  const songYoutube = await parseYoutubeLink(messageContent, client);
  const songManual = await parseAddCommand(messageContent, client);

  const songId = songSpotify || songYoutube || songManual;

  if (songId) {
    // check if song is already in playlist

    const currentPlaylist = await getEntirePlaylist(client);

    if (currentPlaylist.includes(songId))
      return {
        answer: "Cette chanson est deja dans la playlist !",
        songId: null,
      };
    try {
      client.spotifyApi.addTracksToPlaylist(process.env.SPOTIFY_PLAYLIST_ID, [
        songId,
      ]);

      const {
        body: { tracks },
      } = await client.spotifyApi.getTracks([songId.split(":")[2]]);

      const artists = tracks[0].artists.reduce(
        (acc, { name }) => `${acc},  ${name}`,
        ""
      );

      const result = `${tracks[0].name} ${artists}`;

      // return null;
      return {
        answer: `Chanson ajoutée : ${result}. Vous pouvez react avec ❌ pour annuler cet ajout !`,
        songId,
      };
    } catch {
      return {
        answer: "Erreur lors de l'ajout",
        songId: null,
      };
    }
  }

  return null;
};

export const deleteSongFromPlaylist = async (songId, client) => {
  const tracks = [{ uri: songId }];
  try {
    await client.spotifyApi.removeTracksFromPlaylist(
      process.env.SPOTIFY_PLAYLIST_ID,
      tracks
    );
    return "Chanson supprimée de la playlist";
  } catch {
    return "erreur lors de la suppression";
  }
};
