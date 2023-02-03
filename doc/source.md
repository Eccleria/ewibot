# Source code
The src (source) folder contains all the javascript code of the bot.
The organization is divided into 4 parts: 
- [admin](#admin), 
- [commands](#commands), 
- [helpers](#helpers),
- [main code](#main-code).

## Admin
The [admin folder](./src/admin) regroups the file aiming to have an administrative action in the Discord Server. 
> See [Admin documentation](./doc/admin.md) for more details.

## Commands
There are different commands available for the users. All are inside the files of the [commands folder](./src/commands). 
> See [Commands documentation](./doc/commands.md) for more details.

## Helpers
The [folder](./src/helpers) is dedicated to regroup every file having smaller functions or methods used in more important
files. It contains 4 files:  
* _[dbHelper.js](./src/helpers/dbHelper.js)_ is regrouping every function used for accessing and modifying the 
[database](#database). It usually has the _Is_, _Add_ and _Remove_ functions for basic DB access and modification.  
* _[index.js](.src/helpers/index.js)_ regroups all the exported functions from _dbHelper.js_, _spotifyHelper.js_ and 
_utils.js_.  
* _[spotifyHelper](.src/helpers/spotifyHelper.js)_ is regrouping all the functions used in the spotify application.  
* _[utils](.src/helpers/utils.js)_ does the same as _spotifyHelper.js_ but for more general functions.

## Main Code
Main code refers to all the single files in the src folder. It includes 3 files:
* _[bot.js](./src/bot.js)_ is the principal file containing all the major Discord features required to make the bot 
functional, such as client login and event listeners.
* _[commons.js](./src/commons.js)_ contains Commons Class, which give access to multiple methods. They allow to get the 
local data related to the proper channel : *prod* or *test* Discord channels.
* _[listeners.js](./src/listeners.js)_ is a file regrouping all functions associated to the events Ewibot is responding to.
* _[personality.js](./src/personality.js)_ is the file where the Personality Class is declared. This class allows Ewibot 
to chose the correct text to send to users. It will also allow admins to change Ewibot personality, but is still _work in
progress_.
