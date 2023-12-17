# Helpers

Helpers are small functions that *help* the bot.

It contains 4 files:  
* _[dbHelper.js](./src/helpers/dbHelper.js)_ is regrouping every function used for accessing and modifying the 
[database](#database). It usually has the _Is_, _Add_ and _Remove_ functions for basic DB access and modification.  
* _[index.js](.src/helpers/index.js)_ regroups all the exported functions from _dbHelper.js_, _spotifyHelper.js_ and 
_utils.js_.  
* _[spotifyHelper](.src/helpers/spotifyHelper.js)_ is regrouping all the functions used in the spotify application.  
* _[utils](.src/helpers/utils.js)_ does the same as _spotifyHelper.js_ but for functions used in multiple files.

Please note that there are multiple `utils` files. The main one is in the helpers folder.
The others contains functions that are only used in files of the same folder:

- admin
    - `utils` is only for `admin` files.
- commands
    -`utils` is only for `commands` files.
- helpers
    - `utils` is for the whole bot.

This kind of function always have `doctrings`, to make them more understandable.
