import { dbReturnType } from "../index.js";
import { checkDBInput } from "./db.js";

export const dbGamesType = Object.freeze({
  creativity: "creativity"
});

const addGames = (db, game, type) => {
  if (checkDBInput(db) === dbReturnType.wrongInput) return dbReturnType.wrongInput;
  if (!game || typeof game !== "object") return dbReturnType.wrongInput;
  if (!type || typeof type !== "string") return dbReturnType.wrongInput;

  const games = db.data.games[type];
  if (games) {
    db.data.games[type] = games.push(game);
    db.wasUpdated = true;
    return dbReturnType.isOk;
  } else {
    console.log(`addGames: game ${type} does not exist`);
    return dbReturnType.isNotOk;
  }
};

export { addGames };
