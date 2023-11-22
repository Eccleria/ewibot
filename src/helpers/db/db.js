/**
 *
 * @param {object} db Database object
 * @returns {dbReturnType} wrongInput if error, else isOk.
 */
export const checkDBInput = (db) => {
  if (db === null || typeof db !== "object") return dbReturnType.wrongInput;
  else if (db.data === null || typeof db.data !== "object")
    return dbReturnType.wrongInput;
  else return dbReturnType.isOk;
};

/**
 * @enum {number} return values for most db helper functions
 */
export const dbReturnType = Object.freeze({
  isNotOk: -1,
  isOk: 0,
  isIn: 1,
  isNotIn: 2,
  wrongInput: 3,
});

/**
 * @enum {string} user's stats attibutes
 */
export const statsKeys = Object.freeze({
  gifs: "gifs",
  hello: "hello",
  hungry: "hungry",
  emojis: "emojis",
});
