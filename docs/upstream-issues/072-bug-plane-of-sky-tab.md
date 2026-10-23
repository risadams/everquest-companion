# Upstream #72: BUG Plane of Sky tab

- Source: https://github.com/jmoyers/everquest-companion/issues/72 (read-only copy; upstream was NOT modified)
- Author: gSe7eN | Opened: 2026-09-16T13:46:04Z | Last updated: 2026-10-10T23:18:38Z
- Local status: open

## Body

Windows 10.The Plane of Sky tab is showing that I have unlocked half of my classes despite only unlocking two classes. Rebasing DOES NOTHING. Installing EQLC in a new location does not fix the problem. I did try searching everywhere for any local cache of where this may be stored so I can delete it and have accurate information, but nothing would reset my progress. 

Bug One: The app is marking classes as completed even though they are not done despite my inv and ach outputs are current.

Bug Two: There is no current working way to reset progress in the plane of sky tab. (Contrast with the Loot tab rebase reset that does work and allow you to reset the data in the app)

Bug Three: The app is improperly reporting quests that are ready to be turned in because even though the quest is empty in the achievement file I just told it to pull its info from, the app believes it's completed and won't list it.

Bug Four: Related to above, when you turn off the completed filters in the app, many of the quests from bug 3 do not show up because for some reason, it doesn't see the items in my bags despite me literally looking at them in game.

## Comments

### kaltinril (2026-10-10T23:18:38Z)

Thanks for the detailed report. A detected turn-in can now be undone, and there's a Reset turn-ins button for the tab. The fix is in #76, and it's in the community fork's test builds (https://github.com/kaltinril/everquest-companion/releases) in the meantime.

## Local triage

Addressed on integrate/upstream-fixes by upstream PR #76 (undo a detected turn-in, reset the tab).
