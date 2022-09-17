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
- Update: readme
- Feat: `pronouns` role attribution
- Fix: `apology` regex
- Fix: `commons` access in listeners file
- Feat: add admin property to `Personality` class

## 3.6.0
- Fix: `apology` regex
- Feat: Lucifer regex

## 3.5.0
- Feat: add `leadApo` admin command

## 3.4.1
- Fix: `sanitizePunctuation` with `replaceAll` typo

## 3.4.0
- Update: `readme`
- Feat: cosmetic `roles` attribution
- Fix: `apology` regex
- Feat: add pride month emote reaction
- Fix: json file access error from package update
- Fix: `onRemoveReminderReaction` useless client arg

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
- Update: adapt `birthday` to new command format 
- Fix: `personality` typos

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
- Fix: `isAbcd` behaviour with unicode
- Feat: handle private messages from admins for sharing it in desired channel
- Feat: add `reminder` command

## 1.0.1
- Fix: rename `tslicheyeReactId` into `eyeReactId`

## 1.0.0
- First instalment