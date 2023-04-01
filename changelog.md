## 5.0.0
- New: `commons.js` file - `Class Commons` with same behaviour as `Class Personality`
- New: admin `/commands` `message send/reply` for dev usage
- Remove: `$commands` (birthday, concrete, help, ignoreUser, ignoreChannel, ping, reminder, roll)
- Remove: $ access to remaining `$commands` (leadApo, pronouns, spotify)
- Remove: `$commands` helpers (checkIsOnThread, isCommand)
- Remove: `onPrivateMessage` - dev ability to speak through Ewibot
- Update: files now use `COMMONS` object instead of commons.json parse 
- Update: personality organisation 
	- explode personalities.json file into 3 files
	- regroup files into personalities folder
- Update dbHelper organisation
	- explode dbHelper.js into files
	- regroup new files in new db folder
	- every dbHelper function have `db` as first arg
- Update AdminLogs:
	- messageUpdate now with un/pinned author and message channel

## 4.9.3
- Fix: missing frequency check for reducing April Fools react occurence

## 4.9.2
- Upgrade: discord.js to 13.14, fixing ([#173](https://github.com/Eccleria/ewibot/issues/173))

## 4.9.1
- Feat: new emote reaction on `reactionHandler`
- Fix: rare case when `AuditLog.executor` is not retrieved
- Fix: pronouns rare case with missing json. Add log for monitoring.
- Update: `checkProdTestMode` now `isTestServer` for clarity

## 4.9.0
- Update: pronouns buttons with `pronouns_` prefix
- Feat: `/event-roles create` subcommand for event role creation
- Feat: `/event-roles send` subcommand for event roles attribution
- Fix: `$pronouns` with missing `currentServer` arg

## 4.8.3
- Feat: guildMemberAdd now filter debug mode & test/prod
- Update: channel permission overwrite logs now adapt text to added/removed permissions 

## 4.8.2
- Disable: Twitter API no longer free, disabling Twitter link
- Fix: alavirien checking wrong sentinelle member + not fetching old presentations
- Fix: dbHelper `removeAlavirien` wrong param order in `checkDb`
- Fix: handle empty twitter fetched data when is only retweets

## 4.8.1
- Fix: activities updated with setInterval, wrongly used as setTimeout
- Fix: giving alavirien role to sentinelle reacting and not to presenting user

## 4.8.0
- Feat: attribution of alavirien role for users' presentation with Sentinelle reaction
- Feat: check new user alavirien eligibility each night
- Feat: remove logs from user arrival/departure
- Fix: reverse-translator error on message with empty content
- Update: `reverse-translator` now can translate frequent-logs
- Update: add gift button date check + change gift command release date 

## 4.7.0
- Feat: New Year personality
- Feat: dbHelper addGiftSeparator()
- Fix: `getLogChannel` deprecated use in generalEmbed(), octagonalLog(), savelog action()
- Fix: messageDelete log now handle system `CHANNEL_PINNED_MESSAGE` message deletion
- Fix: missing tweet removing from db when sending tweets from timeout listener
- Fix: role logs fired before the end of `shuffle` loop
- Update: timeout with db modification once 12/27
- Update: bot message once New Year

## 4.6.0
- Feat: bot birthday emote
- Feat: `/shuffle` command:
	- `startstop` that allows to start and stop the role color shuffle loop
	- `set` subcommand to modify shuffle loop waitingTime 
- Update: `roleUpdate` log ignore role logs when loop is active

## 4.5.0
- Feat: december month emote
- Feat: Ewibot `Activities`
- Feat: new commands:
	- `/reverse` allows to return a reversed string, with options
	- `reverse-translator` context command for translating `/reversed` text
- Update: Add /commands access for existing commands: 
	`ping` `help` `roll` `ignoreChannel` `ignore` `concrete` `birthday` `reminder`
- Update: `ignore` is now `/ignore_user`
- Update: `/help` now with adapatative autocomplete and action according to user rigths
- Update: gift Christmas embed with correct fan-art
- Fix: `/gift remove` cases that caused db error

## 4.4.1
- Hotfix: removing defaultMemberPermission for `/gift` preventing every user from using it

## 4.4.0
- Feat: `/help` command with autocomplete feature
- Feat: `/gift` commands: `use`, `add`, `remove`, `get`, `accepting`
- Feat: `/announce` command
	- announce confirmation button
	- `announce_gift` as first annouce
- Update: share functions from `pronouns.js` (`buttonHandler`, `createButton`)
- Update: add announce personality part where announce_... content is stored

## 4.3.0
- Feat: twitter
	- commands
	- loop for tweets auto fetch
- Fix: `commands.md` with wrong links and typos
- Fix: `messageDelete` deleter not as embed
- Fix: `date` log field now adapt between prod and test mode
- Fix: `memberKick` wrong db index access 
- Fix: rare crash case with `updateChannel` after `memberKick`
- Doc : `twitter.md`

## 4.2.0
- Feat: add imported gif log detection
- Feat: add 1024> content length in `messageDelete`/`Update` logs
- Feat: add logRemover difference between db data and bulkDelete result
- Feat: `save-log` moderation context command
- Feat: messageUpdate 🛑 `log`
- Fix: `finishEmbed` missing catch return case
- Fix: missing `logsRemover` when the day of restarting bot
- Fix: wrong `messageDelete` `AuditLog` date usage
- Fix: test logThreadId
- Fix: wrong `kicklog` fire when user left
- Update: `admin.md` with more recent code

## 4.1.0
- Doc: `admin.md`
- Fix: wrong prod bot triggered by test server changes
- Feat: `frequent logs` remover using db
- Feat: `octagonalSign` detection and log

## 4.0.1
- Update: pronouns with latests moderation choices
- Update: Lucifer regex

## 4.0.0
- Feat: admin logs
- Feat: `pronouns` role attribution
- Feat: add admin property to `Personality` class
- Fix: `apology` regex
- Fix: `commons` access in listeners file
- Update: readme

## 3.6.0
- Fix: `apology` regex
- Feat: Lucifer regex

## 3.5.0
- Feat: add `leadApo` admin command

## 3.4.1
- Fix: `sanitizePunctuation` with `replaceAll` typo

## 3.4.0
- Feat: cosmetic `roles` attribution
- Feat: add pride month emote reaction
- Fix: `apology` regex
- Fix: json file access error from package update
- Fix: `onRemoveReminderReaction` useless client arg
- Update: `readme`

## 3.3.1
- Fix: missing spotify command in index.js
- Fix: spotify errors
- Fix: apology regex

## 3.3.0
- Feat: `--force` concrete arg
- Feat: first `readme`
- Feat: add ewibot reaction when self concrete 
- Fix: major code reorganization 
	- more comments
	- `Personality` class
	- `personalities` typos
	- reorder using alphabet order
	- new `listeners` file
	- new `spotify` files
	- `static` folder

## 2.2.0
- Feat: `concrete` command

## 2.1.2
- Fix: `spotify` personality

## 2.1.1
- Fix: remove `reminder` dm possibility for further fix
- Fix: `roll` wrong check + wrong value returned

## 2.1.0
- Feat: add `roll` command
- Fix: `personality` typos
- Update: adapt `birthday` to new command format 

## 2.0.2
- Fix: `personality` missing args
- Fix: `reminder`/`birthday` wrong personality arg used

## 2.0.1
-Fix: personality normal `help` wrongly exploded on multiple lines

## 2.0.0
- Feat: ewibot `personality`

## 1.4.1
- Feat: add `birthday` date check for too old/young dates

## 1.4.0
- Feat: add `birthday` command
- Fix: add missing `help.help`
- Fix: `reactionHandler` wrong emote check

## 1.3.0
- Feat: add `ignoreChannel` admin command
- Feat: add DM possibility for reminder

## 1.2.0
- Feat: add apology counting in `db`
- Feat: add `db` update delayed by setInterval

## 1.1.1
- Fix: Fix missing change of spotify remove emoji, modified in 1.1.0

## 1.1.0
- Feat: handle private messages from admins for sharing it in desired channel
- Feat: add `reminder` command
- Fix: `isAbcd` behaviour with unicode

## 1.0.1
- Fix: rename `tslicheyeReactId` into `eyeReactId`

## 1.0.0
- First instalment