import { expect, test } from "@jest/globals";

import { isAbcd } from "../src/fun.js";

//#region isAbcd
//test input
const hasABCDInputList = [
  "ah bah d'accord x)",
];

const hasNotABCDInputList = [
  "ah bah d'accord\nsupaire\nje retiens",
  "ah bah d'accord\nsupaire\n je retiens",
];

//tests
test.each(hasABCDInputList)("is ABCD behaviour", (abcd) => {
  try {
    expect(isAbcd(abcd)).toBe(true);
  } catch (e) {
    console.log([abcd]);
    throw e;
  };
});

test.each(hasNotABCDInputList)("is not ABCD behaviour", (abcd) => {
  try {
    expect(isAbcd(abcd)).toBe(false);
  } catch (e) {
    console.log([abcd]);
    throw e;
  };
});

//#endregion

