import { MessageEmbed } from "discord.js";

const fetchUserTimeline = async (client) => {
  const twitter = client.twitter;

  let params = {
    max_results: 5,
    exclude: ["replies"]
  }; //params for api requests - used for timeline fetch

  const andartaTimeline = await twitter.userTimeline("1039418011260727296", params);

  console.log("andartaTimeline", andartaTimeline);
  console.log("data", andartaTimeline.data)
}

const fetchUserProfile = async (client) => {
  const twitter = client.twitter;

  const params = {
    "user.fields": ["profile_image_url", "url", "username"]
  }; //used for user fetch

  const andartaId = "1039418011260727296";
  const andartaObj = await twitter.user(andartaId, params); //fetch Andarta Pictures's Twitter profile
  const { url, name, profile_image_url, username } = andartaObj.data; //get usefull user data
}

const twitterIcon = "https://abs.twimg.com/icons/apple-touch-icon-192x192.png"; //link for twitter logo

const setupTwitterEmbed = (name, iconUrl, url) => {
  //create tweet embed
  return new MessageEmbed()
    .setAuthor({ name: name, iconURL: iconUrl, url: url })
    //.addFields({ name: "Tweet", value: "insert tweet content here" })
    .setColor("#00ACEE")
    .setFooter({ text: "Twitter", iconURL: twitterIcon })
    .setTimestamp();
}

const tweetLink = (username, id) => {
  return "https://twitter.com/" + username + "/status/" + id; //write tweet url
}

//embed.setDescription(`[Tweet link](${tweetLink})`); //add tweet url to embed

/*
const server = commons.find(({ name }) =>
  process.env.DEBUG === "yes" ? name === "test" : name === "prod"
);

const channel = await client.channels.fetch(server.randomfloodChannelId);

channel.send({ embeds: [embed] });
*/
