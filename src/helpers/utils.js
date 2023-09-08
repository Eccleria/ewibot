const apologyRegex = new RegExp( //regex for apology detection
  /(d[ée]*sol*[eé]*[sr]?)|(dsl[eé]*)|(so?r+y)|(pardo+n+)|(navr[eé]+)/gm
);
export const hasApology = (sanitizedContent) => {
  const apologyResult = apologyRegex.exec(sanitizedContent); //check if contains apology
  if (process.env.DEBUG === "yes") console.log("apologyResult", apologyResult);

  apologyRegex.lastIndex = 0; //reset lastIndex, needed for every check
  if (apologyResult !== null) {
    //if found apology
    const splited = sanitizedContent.split(" "); //split words
    const idx = apologyResult.index;

    if (process.env.DEBUG === "yes")
      console.log("splited.length", splited.length, "apologyResult.index", idx);

    const result = splited.reduce(
      (acc, cur) => {
        const newLen = acc.len + cur.length + 1;
        if (process.env.DEBUG === "yes") {
          console.log("len", acc.len, "newLen", newLen, "cur", [cur]);
          console.log(cur.length, sanitizedContent[newLen], "word", acc.word);
        }
        if (acc.len <= idx && idx < newLen) {
          if (process.env.DEBUG === "yes") console.log("found");
          return { word: acc.word || cur, len: newLen, nb: acc.nb + 1 };
        } else return { word: acc.word, len: newLen, nb: acc.nb };
      },
      { word: null, len: 0, nb: 0 }
    );
    const wordFound = result.word;

    if (process.env.DEBUG === "yes") console.log("wordFound", [wordFound]);

    //verify correspondance between trigerring & full word for error mitigation
    if (apologyResult[0] === wordFound) return true;
  }
  return false;
};

const ADMINS = ["141962573900808193", "290505766631112714"]; // Ewibot Admins' Ids
export const isAdmin = (authorId) => {
  // Check if is admin users
  return ADMINS.includes(authorId);
};

const punctuation = new RegExp(/[!"#$%&'()*+,\-.:;<=>?@[\]^_`{|}~…]/gm);
export const sanitizePunctuation = (messageContent) => {
  const lineBreakRemoved = messageContent.replaceAll("\n", " ");
  return lineBreakRemoved.replaceAll(punctuation, "");
};

export const hasOctagonalSign = (content, cmnShared) => {
  return content.includes(cmnShared.octagonalSignEmoji);
};
