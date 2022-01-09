export const isCommand = (content) => content[0] === "!";

const apologies = [
  "desolé",
  "desolée",
  "desole",
  "desolee",
  "dsl",
  "sorry",
  "sry",
  "desoler",
  "désolé",
  "désolée",
  "désoler",
  "pardon",
  "navré",
  "navrée",
];

export const isApologies = (messageContent) => {
  return messageContent.split(" ").some((e) => apologies.includes(e));
};

const youtubeRegex = new RegExp(
  /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w-_]+)/gim
);
export const isYoutubeLink = (messageContent) => {
  const res = youtubeRegex.exec(messageContent);
  return res ? res[0] : null;
};
