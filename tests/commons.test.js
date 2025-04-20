import { describe, test, expect } from "@jest/globals";

import { Commons, COMMONS } from "../src/commons.js";

describe("Commons", () => {
  test("Singleton exists", () => {
    expect(COMMONS).toBeDefined();
    expect(COMMONS).toBeInstanceOf(Commons);
  });
  
  const prodC = {guildId: 1};
  const testC = {guildId: 2};
  const sharedC = {shared: 0};
  const c = new Commons(testC, prodC, sharedC);

  test("Correct init", () => {
    expect(c.test).toStrictEqual(testC);
    expect(c.prod).toStrictEqual(prodC);
    expect(c.shared).toStrictEqual(sharedC);
  });

  test("getTest", () => {
    expect(c.getTest()).toStrictEqual(testC);
  });

  test("getProd", () => {
    expect(c.getProd()).toStrictEqual(prodC);
  });

  test("getShared", () => {
    expect(c.getShared()).toStrictEqual(sharedC);
  });

  test("fetchFromGuildId", () => {
    expect(c.fetchFromGuildId(1)).toStrictEqual(prodC);
  });

  test("getList", () => {
    expect(c.getList()).toStrictEqual([testC, prodC]);
  });
});
