import { dbReturnType } from "../index.js";
import { checkDBInput } from "./db.js";

/**
 * Store admin log messageId in db.
 * @param {object} db Database object.
 * @param {string} messageId Id of the admin log message.
 * @param {*} type Type of the admin log.
 * @param {*} index Index where to store messageId.
 */
const addAdminLogs = (db, messageId, type, index) => {
  if (checkDBInput(db) == dbReturnType.wrongInput)
    return dbReturnType.wrongInput;
  const adminLogs = db.data.adminLogs;
  //{frequent: [[]...], userAD: [[]...]}
  const data = adminLogs[type]; // [[]...]

  data[index].push(messageId);
  db.wasUpdated = true;
};

/**
 * get AdminLogs data from db
 * @param {object} db Database object
 * @returns {?object} dbReturnType. if wrong input, adminLogs otherwise
 */
const getAdminLogs = (db) => {
  if (checkDBInput(db) == dbReturnType.wrongInput)
    return dbReturnType.wrongInput;
  else return db.data.adminLogs;
};

const removeAdminLogs = (db, type) => {
  const adminLogs = db.data.adminLogs;
  //{frequent: [[]...], userAD: [[]...]}
  const data = adminLogs[type]; // [[]...]
  const sliced = data.slice(1); //remove first
  sliced.push([]); //add [] at the end

  db.data.adminLogs[type] = sliced;
  db.wasUpdated = true;
};

export { addAdminLogs, getAdminLogs, removeAdminLogs };
