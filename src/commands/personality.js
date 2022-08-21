// jsons imports
import { readFileSync } from "fs";
const personalities = JSON.parse(readFileSync("static/personalities.json"));

 const action = (message) => {
   const args = message.content.tolowercase().split(" ");
   const namelist = Object.keys(personalities); // list of all personalities names
   const replies = personality.getcommands().personality;

   if (args.length === 1) {
     // if no content, send actual personality name
     message.reply(replies.currentname + personality.getname() + ".");
   } else if (args[1]) {
     if (namelist.includes(args[1])) {
       // if args[1] is in personalities.json
       const foundpersonality = Object.values(personalities).find(
         (obj) => obj.name === args[1]
       );
       if (foundpersonality) {
         personality.set(foundpersonality.name, foundpersonality);
         message.reply(replies.change + `${args[1]}.`);
       }
     } else if (args[1] === "list") {
       // send  personality name list
       message.reply(replies.namelist + `${namelist.join(", ")}.`);
     } else message.reply(replies.nameerror);
   }
 };

 const personality = {
   name: "personality",
   action,
   help: () => {
     return personality.getcommands().personality.help;
   },
   admin: true,
 };

 export default personality;