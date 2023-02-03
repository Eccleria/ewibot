# Ewibot

[![Version badge](https://badgen.net/github/release/Titch88/ewibot)](https://github.com/Titch88/ewibot) [![Version badge](https://badgen.net/github/branches/Titch88/ewibot)](https://github.com/Titch88/ewibot)

Ewibot is a Discord Bot used only on the official *La Quête d'Ewilan* Discord Server.
This bot does not have the aim to directly do some moderation but to enhance the social interactions between users. 

- [Tree organisation](#organisation)
- [How to contributee](#how-to-contribute)
	- [Setup](#setup-process)
		- [Install](#install)
		- [Folders](#folders)
	- [Contribution rules](#contribution)

## Organisation
Ewibot is written in Javascript. The tree is devided into 5 parts: 

- [concrete](#concrete)
- [database](#database)
- [documentation](#documentation)
- [source code](#source-code)
- [static code](#static-code)

### Concrete
The [concrete folder](./concrete) contains all the concrete related files. Concrete is a command used by Ewibot users to
make a gif containing a falling concrete block and the specified user profile picture. It is inspired by the 
*La Quête d'Ewilan* book.  
The [jpgs folder](./concrete/jpgs) regroups all the necessary pictures for creating the concrete gif asked by a user. It 
contains 50 frames.  
The gifs created by the code are stored in the *gifs* folder. Note: this folder *is not* uploaded on github.

### Database
The [database folder](./db) contains the database (DB) files required. The DB system is a .json file.   
*db.json* file is the database file used by the bot. All the database values are stored inside of it. Note: this folder 
*is not* uploaded on github, for privacy concerns.  
[db.json.example](./db/db.json.example) is a template file. This allows to share a template between developers without 
sharing all users' information online.

### Documentation
The [documentation folder](./doc) regroups all the markedown files explaining in details Ewibot's code.

### Source Code
The [folder src](./src) is the folder containing all the source code for Ewibot.

> Please see [source code documentation](./doc/source.md) for more details.

### Static Code
The [static folder](./static) is including the 2 json files used.

[commons.json](./src/commons.json) contains all the IDs used in the main file, like guild, channels or emoji IDs. 
It allows the distinction between 2 modes:
* _test_ is the development mode, used to have the data of the Discord *Test Server*.
* _prod_ is the Ewibot mode, which is using all the data from *La Quête d'Ewilan* Discord Server. 

[personalities](./src/personalities) includes all the texts send by the bot in Discord channels. The texts are
written according to different personalities but for now only one is used. It also includes text used for commands declaration,
and also for announces.

## How to contribute
We welcome every contribution. If you want to contribute to Ewibot, you will have to follow the next instructions.

### Setup process
#### Install
You need to install nodejs *v16.14.2*. Then on your IDE (we use _Visual Studio Code/2019_), you can clone the Ewibot repository. 
You will need to install yarn with the follow command: ```npm install --global yarn```.

Next, you need to download every dependancy that the bot need. To do so, you need to go in the ewibot folder where the repo has
been downloaded. In the console, use the command: ```yarn```.

#### Folders
Now, you need to setup the *.env* file by creating it and use the [.env.example](.env.example) as a template.  The *DEBUG*
line needs to be set as **yes** if you have only a bot used for development, and **no** if you will host Ewibot on the 
Discord Server.  The *USE_SPOTIFY* uses the same process: **yes** or **no**. If **no**, you don't need to write the rest of
the *SPOTIFY_* stuff.

For the database, you need to create the *.db.json* file in the [database folder](./db). When created, you can copy the 
content of the [.db.json.example](./db/db.json.example) and paste it in the newly created file. **Do not forget to remove
the comments, otherwise you will get an error**

Another folder that need to be created is the *gifs*, in the [concrete folder](./concrete). Nothing to add inside.

> Note: if you use an IDE that create local setup files, you shall add it to the [.gitignore file](.gitignore). It is the case 
with Visual Studio 2019 that create the *.vs* folder locally.

### Contribution
To contribute, you can do so by different ways. You can contribute on existing branches or by creating a new branch. 

For an existing branch, please ask to contributors if there are commits under way before adding yours. 

For a new branch, you will need to create a *Pull Request*(PR) in order to have this branch merged into master. The PR 
cannot be merged without the approval of at least one other contributor. If the branch is still under development, you can
set the PR as a draft. When it is ready, undraft it and request an approval.
