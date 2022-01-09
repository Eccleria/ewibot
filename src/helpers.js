export const isCommand = (content) => content[0] === "!";

const apologies = [
  "desolé",
  "desole",
  "dsl",
  "sorry",
  "sry",
  "desoler",
  "désolé",
  "désoler",
  "pardon",
];

export const isApologies = (messageContent) => {
  return messageContent.split(" ").some((e) => apologies.includes(e));
};
