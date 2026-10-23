# Upstream #62: JOS-415's mob-island overlay misses the visible Dropped-by line: "Protector of Sky · Island 7" while the hover says Island 2

- Source: https://github.com/jmoyers/everquest-companion/issues/62 (read-only copy; upstream was NOT modified)
- Author: kaltinril | Opened: 2026-09-03T08:10:34Z | Last updated: 2026-09-03T08:10:34Z
- Local status: open

## Body

In the Sky quests view, Warrior Test of Smash's Gem of Invigoration row renders "Protector of Sky · Island 7" on the visible Dropped-by line, while hovering the same row shows the roster's correct "Protector of Sky · level 55 · Plane of Sky · Island 2". The JOS-415 overlay (skyMobIslands.ts) fixed exactly this join — the item's `where` glued to a mob that lives elsewhere — for the Kill caption and the hover roster, but DropperCell's visible line still appends `islandOf(where)` after the mob names without it, so the one mob the overlay exists for contradicts its own tooltip. Seen on 1.15.0-era main (8a26fe5c).
