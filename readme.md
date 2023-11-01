# Ewibot

[![Version badge](https://badgen.net/github/release/Eccleria/ewibot)](https://github.com/Eccleria/ewibot) [![Version badge](https://badgen.net/github/branches/Eccleria/ewibot)](https://github.com/Eccleria/ewibot)

- [Documentation](#documentation)
- [How to Contribute](#how-to-contribute)

Ewibot is a Discord Bot used only on the official *La Quête d'Ewilan* Discord Server.
This bot does not have the aim to directly do some moderation but to enhance the social interactions between users. 

## Documentation
Ewibot is written in Javascript. The tree is devided into 4 main parts: 

- [pics](#pics)
	- concrete
	- vest
- [db](#database)
- [source code](#source-code)
	- [admin](#admin)
	- [commands](#commands)
		- polls
	- [helpers](#helpers)
- [static code](#static-code)

### Pics
The [pics folder](./pics) contains all the pictures required or generated by Ewibot for some features.
> Note: the generated content ***is not*** uploaded on github.

- It includes the [concrete folder](./pics/concrete), which is for the concrete command. It is used by Ewibot users to
make a gif containing a falling concrete block and the specified user profile picture. It is inspired by the 
*La Quête d'Ewilan* book.
The [concrete jpgs folder](./pics/concrete/jpgs) regroups all the necessary pictures used to create the requested concrete gif. It contains 50 frames.
The gifs created by the code are stored in the [concrete gifs folder](./pics/concrete/gifs).
- It includes the [vest folder](./pics/vest). This one regroups the pics for the `/vest` command.

To see how it works, see the respective doc:
- [concrete command](./doc/commands/concrete.md)
- [vest command](./doc/commands/vest.md)

### Database
The [database folder](./db) contains the database files required. The DB system is a .json file.   
*db.json* file is the database file used by the bot.
All the database values are stored inside of it. Note: this folder *is not* uploaded on github, for privacy concerns.  
[db.json.example](./db/db.json.example) is a template file. This allows to share a template between developers without sharing all users' information online.

### Source Code
The [src folder](./src) is the folder containing all the source code for Ewibot.
> Source means that its javascript (.js) files.

It is divided into 4 parts: 
[admin](#admin), [commands](#commands), [helpers](#helpers) and the [main code](#main-code).

#### Admin
The [admin folder](./src/admin) regroups the file aiming to have an administrative action in the Discord Server. 
See [Admin documentation](./doc/admin.md) for more details.

#### Commands
There are different commands available for the users. All are inside the files of the [commands folder](./src/commands). 
See [Commands documentation](./doc/commands/commands.md) for more details.

#### Helpers
The [folder](./src/helpers) is dedicated to regroup every file having smaller functions or methods used in more important files.
See [Helpers documentation](./doc/helpers.md) for more details.

#### Main Code
Main code refers to all the files in the src folder. It includes 5 files:
* _[bot.js](./src/bot.js)_ is the principal file containing all the major Discord features required to make the bot 
functional, such as `client` login and event `listeners`.
* _[commons.js](./src/commons.js)_ is where the `Commons` Class is declared. This class allows Ewibot to find the correct ids/emotes to use, according to the current guild where Ewibot is working.
* _[fun.js](./src/fun.js)_ regroups features that are only for fun/entertainment purpose, such as Ewibot `reacting` to some specific user words, or its `activity`.
* _[listeners.js](./src/listeners.js)_ is a file regrouping all functions associated to the events Ewibot is responding to.
* _[personality.js](./src/personality.js)_ is the file where the `Personality` Class is declared. This class allows Ewibot to chose the correct text to send to users. It will also allow admins to change Ewibot personality, but is still work in
progress.

### Static Code
The [static folder](./static) is including the json files used.

[commons.json](./src/commons.json) contains all the IDs used in the main file, like guild, channels or emoji IDs. 
It allows the distinction between 2 modes:
* _test_ is the development mode, used to have the data of the Discord *Test Server*.
* _prod_ is the Ewibot mode, which is using all the data from *La Quête d'Ewilan* Discord Server. 
* _shared_ includes all ids that are common to both Ewibot modes.

The [personalities](./src/personalities) folder includes all the texts send by the bot in Discord channels. 
The texts are written according to different personalities but for now only one is used.

## How to contribute
We welcome every contribution. If you want to contribute to Ewibot, you will have to follow the next instructions.

### Setup process
You need to install nodejs **v16.14.2**.
Then on your code editor you can clone the Ewibot repository, using this command on your terminal: `git clone https://github.com/Eccleria/ewibot.git`.
You will need to install yarn with the follow command: ```npm install --global yarn```.

Next, you need to download every dependancy that the bot need. To do so, you need to go in the ewibot folder and use the command in the terminal: ```yarn```.
> This command installs all the libraries required, such as `discord.js`.

Now, you need to setup the `.env` file. Create it with `touch .env`and use the [.env.example](.env.example) as a template (you can copy the `.env.example` content and paste it in `.env` file).
The *DEBUG* line needs to be set as **yes** if you have only a bot used for development (used on a Discord test server), and **no** if you will host Ewibot on the `Ewilan` Discord Server.
The *USE_SPOTIFY* uses the same process: **yes** or **no**. If **no**, you don't need to write the rest of the *SPOTIFY_* variables.

For the database, you need to create the `.db.json` file in the [database folder](./db).
When created, you can repeate the same process for `.env` file: copy the content of the [.db.json.example](./db/db.json.example) and paste it in the newly created file.
**Remove the comments, otherwise you will get an error.**

2 folders need to be created:
- `gifs`, in the [concrete folder](./pics/concrete). Nothing to add inside.
- `pngs`, in the [vest folder](./pics/vest). Nothing to add inside too.

> Note: if you use an IDE that create local setup files, you shall add it to the [.gitignore file](.gitignore).
It is the case with _Visual Studio 2019_ that create the `.vs` folder locally, or `.vscode` for _Visual Studio Code_.

### Contribution
To contribute, you can do so by different ways. You can contribute on existing branches or by creating a new branch. 

For an existing branch, **please ask to contributors** if there are commits under way before adding yours. 

For a new branch, you will need to create a *Pull Request*(PR) in order to have this branch merged into master.
The PR cannot be merged without the approval of at least one other contributor.
If the branch is still under development, you can set the PR as a draft. When it is ready, undraft it and request an approval.
