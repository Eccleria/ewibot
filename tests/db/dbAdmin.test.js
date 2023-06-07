import {
  addAdminLogs,
  getAdminLogs,
  removeAdminLogs,
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

//getAdminLogs
test("getAdminLogs should return db content", () => {
  expect(getAdminLogs(fakeDb)).toBe(fakeDb.data.adminLogs);
});

test("getAdminLogs false input should return null", () => {
  expect(getAdminLogs(null)).toBe(null);
  expect(getAdminLogs({ data: null }));
});
