import waitForUserInput from "wait-for-user-input";
import ytdl from "ytdl-core";

const buildCode = async (spotifyApi) => {
  const scopes = [
    "playlist-modify-public",
    "playlist-read-collaborative",
    "playlist-modify-private",
  ];
  const state = "5241fdsf641614sdfsdf16";

  var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
  console.log("ouvrez cette page : ", authorizeURL);
  const leCode = await waitForUserInput("Ecris le code stp : ");

  return leCode;
};

const getToken = async (spotifyApi, code) => {
  console.log("ON PASSE LE CODE");

  const data = await spotifyApi.authorizationCodeGrant(code);

  // Set the access token on the API object to use it in later calls
  spotifyApi.setAccessToken(data.body["access_token"]);
  spotifyApi.setRefreshToken(data.body["refresh_token"]);

  return 0;
};

const refreshToken = async (spotifyApi) => {
  const data = await spotifyApi.refreshAccessToken();

  spotifyApi.setAccessToken(data.body["access_token"]);
};

export const generateSpotifyClient = async (spotifyApi) => {
  const code = await buildCode(spotifyApi);
  await getToken(spotifyApi, code);
  setInterval(refreshToken, 50 * 60 * 1000, spotifyApi);
};

const youtubeRegex = new RegExp(
  /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w-_]+)/gim
); // Youtube Link recognition

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
}; // Youtube link clear

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

export const parseLink = async (
  messageContent,
  client,
  personality,
  currentServer
) => {
  const songSpotify = await parseSpotifyLink(messageContent);
  const songYoutube = await parseYoutubeLink(messageContent, client);
  const songManual = await parseAddCommand(messageContent, client);

  const songId = songSpotify || songYoutube || songManual; // Select between Spotify, Youtube or manual song

  if (songId) {
    const currentPlaylist = await getEntirePlaylist(client);

    if (currentPlaylist.includes(songId))
      // check if song is already in playlist
      return {
        answer: personality.alreadyInPlaylist,
        songId: null,
      };

    try {
      //try to add the music to Spotify Playlist
      client.spotifyApi.addTracksToPlaylist(process.env.SPOTIFY_PLAYLIST_ID, [
        songId,
      ]);

      const {
        // get tracks results from the query
        body: { tracks },
      } = await client.spotifyApi.getTracks([songId.split(":")[2]]);

      const artists = tracks[0].artists.reduce(
        // Get the artists
        (acc, { name }) => `${acc},  ${name}`,
        ""
      );

      const result = `${tracks[0].name} ${artists}`; // The result is the first one

      return {
        answer: personality.songAdded.concat(
          // Bot answer
          `${result}`,
          personality.reminder.react[0],
          `${currentServer.removeEmoji}`,
          personality.reminder.react[1]
        ),
        songId,
      };
    } catch {
      return {
        // If error
        answer: personality.errorAdding,
        songId: null,
      };
    }
  }

  return null; // if no song founded from spotify, Youtube or manual query
};

export const deleteSongFromPlaylist = async (songId, client, personality) => {
  const tracks = [{ uri: songId }];
  try {
    await client.spotifyApi.removeTracksFromPlaylist(
      process.env.SPOTIFY_PLAYLIST_ID,
      tracks
    );
    return personality.songSupressed;
  } catch {
    return personality.errorSupressing;
  }
};
