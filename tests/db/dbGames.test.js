import { expect, test } from "@jest/globals";
import { addGames, dbGamesType } from "../../src/helpers/db/dbGames.js";
import { dbReturnType } from "../../src/helpers/db/db.js";

const fakeDb = {
  data: {
    games: {}
  }
};

test("addGames false input should return error", () => {
  const type = dbGamesType.creativity;
  const game = {};

  //null input
  expect(addGames(null, game, type)).toBe(dbReturnType.wrongInput);
  expect(addGames(fakeDb, null, type)).toBe(dbReturnType.wrongInput);
  expect(addGames(fakeDb, game, null)).toBe(dbReturnType.wrongInput);

  //type wrong input
  expect(addGames(fakeDb, game, "wrongType")).toBe(dbReturnType.isNotOk);
});

test("addGames should return isOk when ok", () => {
  const type = dbGamesType.creativity;
  fakeDb.data.games[type] = [];
  console.log("data", fakeDb.data);
  expect(addGames(fakeDb, {}, type)).toBe(dbReturnType.isOk);
})
