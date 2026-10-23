# Upstream #87: spells_us.txt: the 2026-10-13 game patch inserted a column, so every field read from 75 on is one off

- Source: https://github.com/jmoyers/everquest-companion/issues/87 (read-only copy; upstream was NOT modified)
- Author: kaltinril | Opened: 2026-10-14T02:28:15Z | Last updated: 2026-10-14T02:28:15Z
- Local status: open

## Body

The EverQuest Legends patch of 2026-10-13 inserted one new column into the client's `spells_us.txt`, somewhere in fields 52 to 75. Both readers of that file index fixed field positions, so on a patched client every field they read from 75 onward is now one column off.

**What moved** (measured on a patched install, comparing known spells against a pre-patch parse):

| Field | Before | After |
|---|---|---|
| icon | 75 | 76 |
| resist adjustment | 78 | 79 |
| effect slots (`n\|n\|n...`) | 172 | 173 |

Fields 0 to 51 (name, cast and recast times, mana, resist type, target type, the 16 class levels) are unchanged. The field count is still 174 per row.

**Effect:** `src/main/resist/spellsUsParse.ts` and the engine's `fold/src/spells_us.rs` read the wrong columns for the icon, resist adjustment, beneficial flag, spell categories (86/87), AE target count and effect slots. Resist estimates, debuff and stacking reads, and spell categories are wrong on a patched client. 48,200 of 48,255 parsed spells differ from a pre-patch parse of the same spells. Three tests that read the live client file fail: `Lord Nagafen reads the magic resistance the plan predicted` (R=-34 against [90, 210]), `THE ZOL GHOUL KNIGHT LOST ITS COLD CLAIM...`, and `every block the GAME issued is a conflict the engine sees`.

**Example:** Theft of Thought (id 1686) has a resist adjustment of -1000, now at field 79; field 78 reads 0.

A pull request follows that reads the layout from the file, so patched and unpatched clients both parse correctly.

## Local triage

Addressed on integrate/upstream-fixes by upstream PR #88 (reads spells_us.txt in both column layouts).
