import dotenv from "dotenv";
dotenv.config();
import ytdl from "ytdl-core";

import {
  isUserIgnored,
  addApologyCount,
  isIgnoredChannel,
} from "./dbHelper.js";

import servers from "../servers.json";

export const isCommand = (content) => content[0] === "$";

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
  "deso",
  "déso",
];

const hello = [
  "bonjour",
  "hello",
  "yo",
  "salut",
  "bonsoir",
  "coucou",
  "bijour",
  "bonjoir",
  "hey",
];

const ADMINS = ["141962573900808193", "290505766631112714"];

export const isAdmin = (authorId) => {
  return ADMINS.includes(authorId);
};

const isAbcd = (words) => {
  if (words.length >= 4) {
    const reduced = words.reduce(
      (precedent, current) => {
        const unicodeWord = current.charCodeAt(0);
        if (unicodeWord >= 97 && unicodeWord <= 122)
          return {
            latestUnicode: unicodeWord,
            isAbcd: precedent.isAbcd && unicodeWord > precedent.latestUnicode,
          };
        else return { latestUnicode: unicodeWord, isAbcd: false };
      },
      { latestUnicode: null, isAbcd: true }
    );
    return reduced.isAbcd;
  }
  return false;
};

export const reactionHandler = async (
  message,
  messageContent,
  currentServer,
  client
) => {
  const loweredMessage = messageContent.toLowerCase();
  const db = client.db;
  const authorId = message.author.id;

  if (isUserIgnored(authorId, db) || isIgnoredChannel(db, message.channel.id))
    return;

  const words = loweredMessage.split(" ");
  if (apologies.some((apology) => words.some((word) => word === apology))) {
    addApologyCount(authorId, db);
    await message.react(currentServer.autoEmotes.panduom);
  }

  if (isAbcd(words)) await message.react(currentServer.eyeReactId);

  if (Math.random() < 0.8) return;

  if (hello.some((helloMessage) => words[0] === helloMessage)) {
    await message.react(currentServer.helloEmoji);
  }
  const emotes = Object.values(currentServer.autoEmotes);
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

export const parseLink = async (
  messageContent,
  client,
  personality,
  currentServer
) => {
  const songSpotify = await parseSpotifyLink(messageContent);
  const songYoutube = await parseYoutubeLink(messageContent, client);
  const songManual = await parseAddCommand(messageContent, client);

  const songId = songSpotify || songYoutube || songManual;

  if (songId) {
    // check if song is already in playlist

    const currentPlaylist = await getEntirePlaylist(client);

    if (currentPlaylist.includes(songId))
      return {
        answer: personality.alreadyInPlaylist,
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
        answer: personality.songAdded.concat(
          `${result}`,
          personality.react[0],
          `${currentServer.removeEmoji}`,
          personality.react[1]
        ),
        songId,
      };
    } catch (err) {
      console.log(err);
      return {
        answer: personality.errorAdding,
        songId: null,
      };
    }
  }

  return null;
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

const PMfindEmotes = (channel, args) => {
  const position = args.indexOf("--emote");
  if (position === -1) return [position, null];

  const currentServer = servers.find(
    ({ guildId }) => guildId === channel.guild.id
  );

  const emotes = currentServer
    ? [
      ...Object.entries(currentServer.ewilanEmotes),
      ...Object.entries(currentServer.autoEmotes),
    ]
    : null;

  if (emotes && args.length > position + 1) {
    let foundEmotes = [];
    for (const word of args.slice(position + 1)) foundEmotes = [...foundEmotes, emotes.find((emote) =>
        word.includes(emote[0])
      )];

    return [position, foundEmotes]
  }
  else return [-1, []]
};

const PMContent = (channel, args) => {
  // prepare text to send
  let results = [0, []];
  if (args.includes("--emote")) results = PMfindEmotes(channel, args);

  const contentSliced = results[0] === 0 ? args.slice(2) : args.slice(2, results[0]); //get content + remove --emote
  const emotesToSend = results[1].map((emote) => emote[1]); // fetch emotes emote
  const content = [...contentSliced, ...emotesToSend].join(" "); // assemble text to send

  return content
};

export const onPMChannel = async (
  client,
  message,
  args,
  attachments
) => {
  const destinationChannelId = args.length > 1 ? args[1] : null;
  try {
    const channel = await client.channels.fetch(destinationChannelId);

    if (channel) {
      const content = PMContent(channel, args);

      channel.sendTyping();
      setTimeout(() => {
        if (content.length > 0)
          channel.send({
            content: content,
            files: attachments,
          });
        else channel.send({ files: attachments });
      }, 3000);
    }
  } catch (e) {
    console.log("catch PMChannel")
    message.reply("Exception");
  }
};

export const onPMReply = async (
  client,
  message,
  args,
  attachments
) => {
  const messageReplyId = args.length >= 2 ? args[1] : null;

  //Find channel and message
  const fetchIDs = client.channels.cache.map((element) => element.id);
  let foundMessage = null;
  let foundChannel = null;
  for (let id of fetchIDs) {
    const channel = await client.channels.fetch(id);
    if (channel.type === "GUILD_TEXT") {
      try {
        foundMessage = await channel.messages.fetch(messageReplyId);
        foundChannel = channel;
      } catch (e) {
        //nothing to do
      }
    }
  }

  if (foundChannel && foundMessage) {
    const content = PMContent(foundChannel, args);

    foundChannel.sendTyping();
    setTimeout(() => {
      if (content.length > 0) // if content to send
        foundMessage.reply({
          content: content,
          files: attachments,
        });
      else foundMessage.reply({ files: attachments });
    }, 3000);
  } else {
    console.log("catch PMReply")
    message.reply(`Erreur, message non trouvé`);
  }
};
