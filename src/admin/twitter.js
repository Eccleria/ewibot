import { MessageEmbed } from "discord.js";

export const fetchUserTimeline = async (client, userId) => {
  const twitter = client.twitter;

  let params = {
    max_results: 5,
    exclude: ["replies"]
  }; //params for api requests - used for timeline fetch

  return await twitter.userTimeline(userId, params);
}

export const fetchUserProfile = async (client, userId) => {
  const twitter = client.twitter;

  const params = {
    "user.fields": ["profile_image_url", "url", "username"]
  }; //used for user fetch

  return await twitter.user(userId, params); //fetch Andarta Pictures's Twitter profile
}

const twitterIcon = "https://abs.twimg.com/icons/apple-touch-icon-192x192.png"; //link for twitter logo

export const setupTwitterEmbed = (name, iconUrl, url) => {
  //create tweet embed
  return new MessageEmbed()
    .setAuthor({ name: name, iconURL: iconUrl, url: url })
    //.addFields({ name: "Tweet", value: "insert tweet content here" })
    .setColor("#00ACEE")
    .setFooter({ text: "Twitter", iconURL: twitterIcon })
    .setTimestamp();
}

export const tweetLink = (username, id) => {
  return "https://twitter.com/" + username + "/status/" + id; //write tweet url
}

//embed.setDescription(`[Tweet link](${tweetLink})`); //add tweet url to embed

