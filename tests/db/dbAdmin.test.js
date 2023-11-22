import { expect, test } from "@jest/globals";
import {
  addAdminLogs,
  dbReturnType,
  getAdminLogs,
} from "../../src/helpers/index.js";

const fakeDb = {
  data: {
    adminLogs: {
      frequent: [[], [], [], [], [], [], []],
      userAD: [[], []],
    },
  },
};

//addAdminLogs
test("addAdminLogs false input should return error", () => {
  expect(addAdminLogs(null, null, null, null)).toBe(dbReturnType.wrongInput);
});

//getAdminLogs
test("getAdminLogs should return db content", () => {
  expect(getAdminLogs(fakeDb)).toBe(fakeDb.data.adminLogs);
});

test("getAdminLogs false input should return null", () => {
  expect(getAdminLogs(null)).toBe(dbReturnType.wrongInput);
  expect(getAdminLogs({ data: null })).toBe(dbReturnType.wrongInput);
});
