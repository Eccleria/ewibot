require("dotenv").config();
import waitForUserInput from "wait-for-user-input";

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
  console.log("tentative de refresh");
  const data = await spotifyApi.refreshAccessToken();
  console.log("refresh");

  spotifyApi.setAccessToken(data.body["access_token"]);
};

export const generateSpotifyClient = async (spotifyApi) => {
  const code = await buildCode(spotifyApi);
  await getToken(spotifyApi, code);
  setInterval(refreshToken, 50 * 60 * 1000, spotifyApi);
};
