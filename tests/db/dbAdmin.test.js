import { expect, test } from "@jest/globals";
import {
  addAdminLogs,
  dbReturnType,
  getAdminLogs,
  removeAdminLogs,
} from "../../src/helpers/index.js";

//#region args
const fakeDb = {
  data: {
    adminLogs: {
      frequent: [[], [], [], [], [], [], ["6"]],
      userAD: [[], ["11"]],
    },
  },
};

const args = {
  frequent: ["frequent", 6],
  userAD: ["userAD", 1],
};

let messageId = "7";

const wrongInput = dbReturnType.wrongInput;
//#endregion

//addAdminLogs
test("addAdminLogs false input should return error", () => {
  expect(addAdminLogs(null, messageId, ...args.frequent)).toBe(wrongInput);
  expect(addAdminLogs(fakeDb, null, ...args.frequent)).toBe(wrongInput);
  expect(addAdminLogs(fakeDb, messageId, null, args.frequent[1])).toBe(
    wrongInput
  );
  expect(addAdminLogs(fakeDb, messageId, args.frequent[0], null)).toBe(
    wrongInput
  );
});

test("addAdminLogs should return isOk when", () => {
  expect(addAdminLogs(fakeDb, messageId, ...args.frequent)).toBe(
    dbReturnType.isOk
  );
  messageId = "12";
  expect(addAdminLogs(fakeDb, messageId, ...args.userAD)).toBe(
    dbReturnType.isOk
  );
});

//getAdminLogs
test("getAdminLogs should return db content", () => {
  expect(getAdminLogs(fakeDb)).toBe(fakeDb.data.adminLogs);
});

test("getAdminLogs false input should return error", () => {
  expect(getAdminLogs(null)).toBe(wrongInput);
  expect(getAdminLogs({ data: null })).toBe(wrongInput);
});

//removeAdminLogs
test("removeAdminLogs false input should return error", () => {
  expect(removeAdminLogs(null, args.frequent[0])).toBe(wrongInput);
  expect(removeAdminLogs(fakeDb, null)).toBe(wrongInput);
  expect(removeAdminLogs(fakeDb, "wrongType")).toBe(dbReturnType.isNotOk);
});

test("removeAdminLogs should return isOk when ok", () => {
  expect(removeAdminLogs(fakeDb, args.frequent[0])).toBe(dbReturnType.isOk);
  expect(fakeDb.data.adminLogs.frequent).toEqual([
    [],
    [],
    [],
    [],
    [],
    ["6", "7"],
    [],
  ]);
  expect(removeAdminLogs(fakeDb, args.userAD[0])).toBe(dbReturnType.isOk);
  expect(fakeDb.data.adminLogs.userAD).toEqual([["11", "12"], []]);
});
