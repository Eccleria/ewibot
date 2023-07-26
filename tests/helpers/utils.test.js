import { hasApology } from "../../src/helpers/index.js";

//#region hasApology
//test input
const hasApologyInputList = [
    " ça doit rentrer dans le lot activités désolée x",
    "dso",
    "déso",
    "sry",
    "déso lééééé",
    "pardon",
    "navrée"
];

const hasNotApologyInputList = [
    "désormais",
    "adsl",
    "navrant",
    "désolant",
    "pardonne"
]

//tests
test.each(hasApologyInputList)("hasApology behaviour", (apo) => {
    expect(hasApology(apo)).toBe(true);
});

test.each(hasNotApologyInputList)("hasNotApology behaviour", (apo) => {
    expect(hasApology(apo)).toBe(false);
});

//#endregion
