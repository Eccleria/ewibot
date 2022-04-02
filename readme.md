# Ewibot

Ewibot is a Discord Bot used only on the official *La Quête d'Ewilan* Discord Server.
This bot does not have the aim to do some moderation but only to enhance the social interactions between users. 


## How it works
Ewibot is written in Javascript. The tree is devided into 5 parts: the commands, the helpers, the jsons, the 
database and the main code.

### Commands
There are differents commands available for the users. All are inside the files of the [commands folder](.src/commands). 
If the commands are complex, they are separated from the rest in a dedicated file, like the
[reminder command](.src/commands/reminder.js). They are after imported in the [index file](.src/commands/index.js) and 
then exported for the main bot file.

A command is a object divided in 4 arguments. _name_ is for the recognition of the command in an user message. _action_ is
the associated function to apply when the command is called. _help_ is the message the bot should send when calling 
`$help function`. _admin_ is the argument distinguishing if the command may be only used by the bot admins or by 
all users. An admin is a bot developer.

### Helpers
The folder is dedicated for every file having smaller functions or methods used in more important files. It includes the
_.js_ files but also the _.json_ ones.

The [dbHelper](./src/helpers/dbHelper.js) is regrouping every function used for accessing and modifying the Database. It 
usually has the _Is_, _Add_ and _Remove_ functions. 

The [spotifyHelper file](.src/helpers/spotifyHelper.js), which is regrouping all the functions used in the spotify 
application. 

### Jsons
The [Jsons folder](./src/jsons) is including all the jsons files used. 

The [commons library](./src/commons.json) is containing all the IDs used in the main file, like guild, channels or 
emoji IDs. It allows the distinction between the test mode and the prod mode. 

The [personality file](./src/personalities.json) includes all the texts send by the bot in Discord channels. The texts 
are written according to different personalities but for now only one is used. 

### Database
The [database folder](./db) contains the database files required.

The [main database](./db/db.json) is the database used by the bot. All the values used are stocked inside of it. 

The [example database](./db/db.json.example) is a template file. This allows to share a template between developers without 
giving all the users' information online.

### Main
The rest is including the [main file](./src/bot.js) which is, as its name underlines it, the principal file
containing all the major Discord features required to make the bot functional.

