import { expect, test } from "@jest/globals";
import {
  addAdminLogs,
  dbReturnType,
  getAdminLogs,
} from "../../src/helpers/index.js";

//#region args
const fakeDb = {
  data: {
    adminLogs: {
      frequent: [[], [], [], [], [], [], []],
      userAD: [[], []],
    },
  },
};

const args = {
  frequent: ["frequent", 6],
  userAD: ["userAD", 1],
};

const messageId = "1234";
//#endregion

//addAdminLogs
test("addAdminLogs false input should return error", () => {
  expect(addAdminLogs(null, messageId, ...args.frequent)).toBe(
    dbReturnType.wrongInput
  );
  expect(addAdminLogs(fakeDb, null, ...args.frequent)).toBe(
    dbReturnType.wrongInput
  );
  expect(addAdminLogs(fakeDb, messageId, null, args.frequent[1])).toBe(
    dbReturnType.wrongInput
  );
  expect(addAdminLogs(fakeDb, messageId, args.frequent[0], null)).toBe(
    dbReturnType.wrongInput
  );
});

test("addAdminLogs should return isOk", () => {
  expect(addAdminLogs(fakeDb, messageId, ...args.frequent)).toBe(dbReturnType.isOk);
  expect(addAdminLogs(fakeDb, messageId, ...args.userAD)).toBe(dbReturnType.isOk);
})

//getAdminLogs
test("getAdminLogs should return db content", () => {
  expect(getAdminLogs(fakeDb)).toBe(fakeDb.data.adminLogs);
});

test("getAdminLogs false input should return error", () => {
  expect(getAdminLogs(null)).toBe(dbReturnType.wrongInput);
  expect(getAdminLogs({ data: null })).toBe(dbReturnType.wrongInput);
});
