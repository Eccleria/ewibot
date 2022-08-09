# Ewibot

Ewibot is a Discord Bot used only on the official *La Quête d'Ewilan* Discord Server.
This bot does not have the aim to directly do some moderation but to enhance the social interactions between users. 

## How it works
Ewibot is written in Javascript. The tree is devided into 4 parts: 
[concrete](https://github.com/Titch88/ewibot/edit/master/readme.md#concrete), 
[database](https://github.com/Titch88/ewibot/edit/master/readme.md#database), 
[source code](https://github.com/Titch88/ewibot/edit/master/readme.md#source-code) 
and [static code](https://github.com/Titch88/ewibot/edit/master/readme.md#static-code).

### Concrete
The [concrete folder](./concrete) contains all the concrete related files. Concrete is a command used by Ewibot users to
make a gif containing a falling concrete block and the specified user profile picture. It is inspired by the 
*La Quête d'Ewilan* book.  
The [jpgs folder](./concrete/jpgs) regroups all the necessary pictures for creating the concrete gif asked by a user. It 
contains 50 frames.  
The gifs created by the code are stored in the *gifs* folder. Note: this folder *is not* uploaded on github.

### Database
The [database folder](./db) contains the database files required. The DB system is a .json file.   
*db.json* file is the database file used by the bot. All the database values are stored inside of it. Note: this folder 
*is not* uploaded on github, for privacy concerns.  
[db.json.example](./db/db.json.example) is a template file. This allows to share a template between developers without 
sharing all users' information online.

### Source Code
The [folder src](./src) is the folder containing all the source code for Ewibot. It is divided into 4 parts: 
[admin](https://github.com/Titch88/ewibot/edit/master/readme.md#admin), 
[commands](https://github.com/Titch88/ewibot/edit/master/readme.md#commands), 
[helpers](https://github.com/Titch88/ewibot/edit/master/readme.md#helpers)
and the [main code](https://github.com/Titch88/ewibot/edit/master/readme.md#main-code).

#### Admin
The [admin folder](./src/admin) regroups the file aiming to have an administrative action in the Discord Server. 
* _[listeners.js](./src/admin/listeners.js)_ is a file regrouping all functions associated to the events Ewibot is responding
to. These events are affiliated to moderation stuff, like message update/delete, timeout, kick, ban and so on.
* _[role.js](./src/admin/role.js)_ is used to dispatch cosmetic roles among users.
* _[utils](.src/admin/utils.js)_ is regrouping all the functions used in different files of the admin folder.  

#### Commands
There are different commands available for the users. All are inside the files of the [commands folder](./src/commands). 
If the commands are not complex, they are written in the [index file](./src/commands/index.js). Otherwise, they are 
separated from the rest in a dedicated file, like the [reminder command](./src/commands/reminder.js). Then they are 
imported in the [index file](./src/commands/index.js) and regrouped for the main bot file usage.  
A command is a object divided in 4 arguments:
* _name_ is for the recognition of the command in an user message. 
* _action_ is the associated function to use when the command is called by a user. 
* _help_ is the message the bot should send when calling `$help function`. 
* _admin_ is the argument distinguishing if the command may only be used by bot admins or by all users. An admin is a bot 
developer.

#### Helpers
The [folder](./src/helpers) is dedicated to regroup every file having smaller functions or methods used in more important
files. It contains 4 files:  
* _[dbHelper.js](./src/helpers/dbHelper.js)_ is regrouping every function used for accessing and modifying the 
[database](https://github.com/Titch88/ewibot/edit/master/readme.md#database). It usually has the _Is_, _Add_ and _Remove_ 
functions for basic DB access and modification.  
* _[index.js](.src/helpers/index.js)_ regroups all the exported functions from _dbHelper.js_, _spotifyHelper.js_ and 
_utils.js_.  
* _[spotifyHelper](.src/helpers/spotifyHelper.js)_ is regrouping all the functions used in the spotify application.  
* _[utils](.src/helpers/utils.js)_ does the same as _spotifyHelper.js_ but for more general functions.

#### Main Code
Main code refers to all the single files in the src folder. It includes 3 files:
* _[bot.js](./src/bot.js)_ is the principal file containing all the major Discord features required to make the bot 
functional, such as client login and event listeners.
* _[listeners.js](./src/listeners.js)_ is a file regrouping all functions associated to the events Ewibot is responding to.
* _[personality.js](./src/personality.js)_ is the file where the Personality Class is declared. This class allows Ewibot 
to chose the correct text to send to users. It will also allow admins to change Ewibot personality, but is still work in
progress.

### Static Code
The [static folder](./static) is including the 2 json files used.

[commons.json](./src/commons.json) contains all the IDs used in the main file, like guild, channels or emoji IDs. 
It allows the distinction between 2 modes:
* _test_ is the development mode, used to have the data of the Discord *Test Server*.
* _prod_ is the Ewibot mode, which is using all the data from *La Quête d'Ewilan* Discord Server. 

[personalities.json](./src/personalities.json) includes all the texts send by the bot in Discord channels. The texts are
written according to different personalities but for now only one is used.

## How to contribute
We welcome every contribution. If you want to contribute to Ewibot, you will have to follow the next instructions.

### Setup process
You need to install nodejs *v16.14.2*. Then on your IDE you can clone the Ewibot repository. You will need to install yarn 
with the follow command: ```npm install --global yarn```.

Next, you need to download every dependancy that the bot need. To do so, you need to go in the ewibot folder and use the 
command in the terminal: ```yarn```.

Now, you need to setup the *.env* file by creating it and use the [.env.example](.env.example) as a template.  The *DEBUG*
line needs to be set as **yes** if you have only a bot used for development, and **no** if you will host Ewibot on the 
Discord Server.  The *USE_SPOTIFY* uses the same process: **yes** or **no**. If **no**, you don't need to write the rest of
the *SPOTIFY_* stuff.

For the database, you need to create the *.db.json* file in the [database folder](./db). When created, you can copy the 
content of the [.db.json.example](./db/db.json.example) and paste it in the newly created file. **Do not forget to remove
the comments, otherwise you will get an error**

Another folder that need to be created is the *gifs*, in the [concrete folder](./concrete). Nothing to add inside.

Note: if you use an IDE that create local setup files, you shall add it to the [.gitignore file](.gitignore). It is the case 
with Visual Studio 2019 that create the *.vs* folder locally.

### Contribution
To contribute, you can do so by different ways. You can contribute on existing branches or by creating a new branch. 

For an existing branch, please ask to contributors if there are commits under way before adding yours. 

For a new branch, you will need to create a *Pull Request*(PR) in order to have this branch merged into master. The PR 
cannot be merged without the approval of at least one other contributor. If the branch is still under development, you can
set the PR as a draft. When it is ready, undraft it and request an approval.
