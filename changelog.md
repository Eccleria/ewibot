## 6.2.0
- Update: `/vest` now send picture in `interaction` reply ([#294](https://github.com/Eccleria/ewibot/issues/294)) ([#295](https://github.com/Eccleria/ewibot/pull/295))

## 6.1.0
- Fix: `activity` not using `ActivityType` ([#278](https://github.com/Eccleria/ewibot/issues/278)) ([#279](https://github.com/Eccleria/ewibot/pull/279))
- Fix: `/vest` ([#280](https://github.com/Eccleria/ewibot/pull/280))
	- missing credits in `/help`
	- wrong behaviour on vest send
- Fix: `/polls nouveau-choix` removing timeout embed ([#282](https://github.com/Eccleria/ewibot/pull/282))
- Fix: `/personality` missing MODERATE_MEMBERS permission snowflake ([#283](https://github.com/Eccleria/ewibot/pull/283))
- Fix: `gift` wrong color string ([#287](https://github.com/Eccleria/ewibot/pull/287))
- Fix: missing `vest` personality in `funny` json ([#290](https://github.com/Eccleria/ewibot/pull/290))
- Feat: add Sentinelles `/timeout` command for better timeout duration customization ([#281](https://github.com/Eccleria/ewibot/pull/281))
- Update: reduce `activity` timeout max duration ([#279](https://github.com/Eccleria/ewibot/pull/279))
- Update: `/reaction` now uses lowerCased emote names ([#284](https://github.com/Eccleria/ewibot/issues/284)) ([#285](https://github.com/Eccleria/ewibot/pull/285))
- Update: `apologies` featuring "excuses" ([#288](https://github.com/Eccleria/ewibot/pull/288))

## 6.0.0
- Core: reorganize functions and methods for consistency ([#247](https://github.com/Eccleria/ewibot/pull/247))
	- admin/commands utils that are shared in another folder were moved in helpers utils file
	- `Commons` class and some functions (`setupEmbed`, `finishEmbed`) were simplified
	- `listeners` are now more consistent (`onInteractionCreate`, `onMessageCreate` moved)
	- a lot of function names were modified for easier understanding
	- `concrete` folder were move in pics, for future pictures fonctionalities
	- simplify `bot` main file
	- add jest for future unit testing and auto tests
	- public `text` are now in personality
- Doc:
	- update `readme` with recent and older changes ([#247](https://github.com/Eccleria/ewibot/pull/247)) ([#245](https://github.com/Eccleria/ewibot/pull/245))
	- add more docstrings to functions/methods ([#247](https://github.com/Eccleria/ewibot/pull/247))
	- add `canvas` (`concrete` + `vest`) + `helpers` + `announce` doc ([#259](https://github.com/Eccleria/ewibot/pull/259)) ([#245](https://github.com/Eccleria/ewibot/pull/245))
- Fix: wrong behaviour if only one time value is set for `poll` timeout ([#276](https://github.com/Eccleria/ewibot/issues/276))
- Feat: add admin `/reaction` command to make the bot react to designated message ([#251](https://github.com/Eccleria/ewibot/pull/251))
- Feat: add `vest` command, creating a personnalized `vest` with `user` data ([#259](https://github.com/Eccleria/ewibot/pull/259))
- Feat: add admin `/personality` command ([#270](https://github.com/Eccleria/ewibot/pull/270))
- Feat: add `poll` ending time in a new embed ([#277](https://github.com/Eccleria/ewibot/issues/277))
- Update: `concrete` and `vest` store pp hash in pic name for easier pic update ([#260](https://github.com/Eccleria/ewibot/pull/260))

## 5.5.3
- Fix: wrong uptade value for PR ([#269](https://github.com/Eccleria/ewibot/pull/269)) ([#271](https://github.com/Eccleria/ewibot/pull/271)). ([#274](https://github.com/Eccleria/ewibot/pull/274))
- Update: remove `messageUpdate` length filter which remove some important logs ([#269](https://github.com/Eccleria/ewibot/pull/269))
- Update: `gift` ([#268](https://github.com/Eccleria/ewibot/issues/268)) ([#271](https://github.com/Eccleria/ewibot/pull/271))
	- disable older buttons using a yearly `customId` recognition.
	- update dates to 2023 case
	- `/gift accepting` now display full tag list if no `recipient` argument

## 5.5.2
- Feat: optional `activity` for Halloween ([#262](https://github.com/Eccleria/ewibot/issues/262)) ([#263](https://github.com/Eccleria/ewibot/pull/263)) ([#264](https://github.com/Eccleria/ewibot/pull/264))

## 5.5.1
- Fix: wrong `author` on some `onThreadCreate` log when `thread` is created ([#252](https://github.com/Eccleria/ewibot/issues/252)) ([#253](https://github.com/Eccleria/ewibot/pull/253))
- Fix: multiple `poll` issues ([#240](https://github.com/Eccleria/ewibot/issues/240)) ([#254](https://github.com/Eccleria/ewibot/pull/254))
	- error if user vote during `poll` closure
	- difficulties on `emote` detection in `poll` choice submission
	- `dbPoll` `undefined` if accessed after `poll` closure
- Update: `/roll` result is now public ([#261](https://github.com/Eccleria/ewibot/pull/261))

## 5.5.0
- Feat: statistics ([#234](https://github.com/Eccleria/ewibot/pull/234))
	- add `/stats use` command to dis/enable Ewibot stats for requesting user
	- count `gifs`, `hello` words, `hungry` words, and `emojis` for accepting users
	- count `emotes` occurences and `cats` pictures sent for whole guild
- Feat: `dbReturnType` frozen object with returned values for db helpers ([#234](https://github.com/Eccleria/ewibot/pull/234))
- Fix: alavirien wrong db access when alavirien check ([#250](https://github.com/Eccleria/ewibot/pull/234))

## 5.4.0
- Feat: add reaction if is mentioned by a user ([#230](https://github.com/Eccleria/ewibot/pull/230))
- Feat: add `DEBUGLOGS` .env attribute - this add console.logs when switched to "yes"
- Fix: wrong `apology` detection 
	- missing " " count during word detection ([#233](https://github.com/Eccleria/ewibot/pull/233))
	- issue with last word detection - now use `reduce` for easier implementation ([#235](https://github.com/Eccleria/ewibot/pull/235))
- Fix: `help` for `polls` was inaccessible for users ([#220](https://github.com/Eccleria/ewibot/pull/220))
- Update: `adminLogs` `attachments` ([#231](https://github.com/Eccleria/ewibot/pull/231))
	- attachments are now sent as replies to main log message
	- `save-log` now is able to save attachment messages
- Update: `adminLogs` `memberKick` embed now has user id ([#232](https://github.com/Eccleria/ewibot/pull/232))
- Update: `polls` ([#220](https://github.com/Eccleria/ewibot/pull/220))
	- add `anonymous` option for `update` button
	- add `/poll stop` command - usefull if buttons are not sent by Discord
	- add `author` optional option for `/poll create`
	- `refresh` poll is now fired along with `stop`
	- `reply` to poll to announce poll stop
	- add `heures`, `minutes` optional options for poll lifespan

## 5.3.0
- Fix: `eventRoles` attribution that unexpectedly worked for a new user
	- no satisfying explanation found ([#198](https://github.com/Eccleria/ewibot/pull/198))
	- wrong order in #198 fix ([#222](https://github.com/Eccleria/ewibot/pull/222))
- Fix: `apologies` multiple issues ([#225](https://github.com/Eccleria/ewibot/pull/225))
	- wrong word detection brecause of word prefix sliced in some cases
	- `\n` 5.2.0 fix was creating unexpected words - is now replaced by " "
	- missing stopping condition for while loop ([#229](https://github.com/Eccleria/ewibot/pull/229))
- New: add `/lead-apo` admin only command to send apologies leaderboard ([#223](https://github.com/Eccleria/ewibot/pull/223))
- Update: `alavirien` check using a `toUpdate` list ([#211](https://github.com/Eccleria/ewibot/pull/211))
	- minimize checkAlavirien process
	- **WARNING** breaking changes to `db`, please update the file
- Update: `adminLogs` for leaving members now sent in new log channel ([#227](https://github.com/Eccleria/ewibot/pull/227))

## 5.2.0
- Fix: `channelUpdate` log with incomplete text when position update is canceled by user ([#209](https://github.com/Eccleria/ewibot/pull/209))
- Fix: `apology` not detected because of `\n` character next to an apology ([#210](https://github.com/Eccleria/ewibot/pull/210))
- Fix: `channelUpdate` log
	- wrong log text with some channels order because of wrong variable usage ([#212](https://github.com/Eccleria/ewibot/pull/212))
	- wrong duplicates check because of indentation "  " and "\n" ([#212](https://github.com/Eccleria/ewibot/pull/212))
	- remove embed sending if no ChannelUpdate AuditLog ([#214](https://github.com/Eccleria/ewibot/pull/214))
- Fix: adminLogs `banAdd` && `banRemove` : missing an argument, breaking `setupEmbed` ([#216](https://github.com/Eccleria/ewibot/pull/216))

## 5.1.0
- Debug: remove `console.log` for polls monitoring ([#202](https://github.com/Eccleria/ewibot/pull/202))
- Fix: typo on `anonymous` check during poll refresh ([#199](https://github.com/Eccleria/ewibot/pull/199))
- Fix: missing role permission by upgrading `discord.js` to 13.16.0 ([#207](https://github.com/Eccleria/ewibot/pull/207))
- New: refacto on `activities` ([#204](https://github.com/Eccleria/ewibot/pull/204))
- New: add `reminder` storage in db to mitigate `reminder` lose on bot restart ([#206](https://github.com/Eccleria/ewibot/pull/206))
- Remove: `twitter` unused code ([#205](https://github.com/Eccleria/ewibot/pull/205))
- Remove: useless client attributes ([#205](https://github.com/Eccleria/ewibot/pull/205))

## 5.0.1
- Fix: `botMessage` missing `setDefaultMemberPermission` ([#184](https://github.com/Eccleria/ewibot/pull/184))
- Fix: wrong commons usage from `eventRoles` buttons ([#190](https://github.com/Eccleria/ewibot/pull/190))
- Fix: wrong arg order when using `removeAlavirien` ([#191](https://github.com/Eccleria/ewibot/pull/191))
- Fix: missing alavirien personality since 5.0.0 ([#193](https://github.com/Eccleria/ewibot/pull/193))
- Fix: rare `Unknown interaction` with poll settings buttons ([#195](https://github.com/Eccleria/ewibot/pull/195))

## 5.0.0
- New: `commons.js` file - `Class Commons` with same behaviour as `Class Personality` ([#138](https://github.com/Eccleria/ewibot/pull/138), [#181](https://github.com/Eccleria/ewibot/pull/181))
- New: admin `/commands` `message send/reply` for dev usage ([#139](https://github.com/Eccleria/ewibot/pull/139))
- Remove: `$commands` (birthday, concrete, help, ignoreUser, ignoreChannel, ping, reminder, roll) ([#134](https://github.com/Eccleria/ewibot/pull/134), [#137](https://github.com/Eccleria/ewibot/pull/137))
- Remove: $ access to remaining `$commands` (leadApo, pronouns, spotify) ([#134](https://github.com/Eccleria/ewibot/pull/134), [#137](https://github.com/Eccleria/ewibot/pull/137))
- Remove: `$commands` helpers (checkIsOnThread, isCommand) ([#134](https://github.com/Eccleria/ewibot/pull/134), [#137](https://github.com/Eccleria/ewibot/pull/137))
- Remove: `onPrivateMessage` - dev ability to speak through Ewibot ([#139](https://github.com/Eccleria/ewibot/pull/139))
- Update: files now use `COMMONS` object instead of commons.json parse ([#138](https://github.com/Eccleria/ewibot/pull/138), [#181](https://github.com/Eccleria/ewibot/pull/181))
- Update: personality organisation ([#140](https://github.com/Eccleria/ewibot/pull/140))
	- explode personalities.json file into 3 files
	- regroup files into personalities folder
- Update dbHelper organisation ([#153](https://github.com/Eccleria/ewibot/pull/153))
	- explode dbHelper.js into files
	- regroup new files in new db folder
	- every dbHelper function have `db` as first arg
- Update AdminLogs: ([#159](https://github.com/Eccleria/ewibot/pull/159))
	- messageUpdate now with un/pinned author and message channel

## 4.9.4
- Fix: filter ChannelLog channels without position change and not in bulk ([#180](https://github.com/Eccleria/ewibot/pull/180))
- Fix: RoleLog filter roles with no position change ([#179](https://github.com/Eccleria/ewibot/pull/179))

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