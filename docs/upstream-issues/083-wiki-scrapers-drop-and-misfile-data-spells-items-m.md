# Upstream #83: Wiki scrapers drop and misfile data (spells, items, mobs, quests)

- Source: https://github.com/jmoyers/everquest-companion/issues/83 (read-only copy; upstream was NOT modified)
- Author: kaltinril | Opened: 2026-10-11T01:48:30Z | Last updated: 2026-10-11T01:48:30Z
- Local status: open

## Body

A review of the wiki scrapers against the committed caches found parser and caching bugs that drop or misfile data. Counts are measured on the committed data and caches, with no wiki requests.

**Spells** (`scrape-spells.ts`)
- A spell is named by the page's `|spellname`, not its title. Pages created by copying another spell keep the old name: page 57458 `Healing Water` still says `Greater Healing` (the wiki has since fixed the field), so the druid spell is missing. Same for Full Heal, Illusion: Imp, Katta's Song of Sword Dancing, Circle of Butcherblock, Mass Imbue Emerald and others (130 pages differ from their title).
- `|| field =` is not a field marker: Harmshield's wear-off message swallows `where_to_obtain`.
- A single-line `{{Spellpage|...}}` yields no fields and the spell is dropped (Mass Imbue Sapphire).
- The template's closing `}}` is stripped from every field, so `{{Era | Kunark` leaks into class lines.

**Items** (`scrape-items.ts`, `itemLookupParse.ts`)
- An `|itemname` copied from another item takes that item's key, so the real page is unreachable (30 pages, e.g. Armadillo Tooth).
- Summaries keep `{{Item Lore|...}}` markup (1,227 items).
- The flag `Quest` (not `QUEST ITEM`) and `Lore` short forms are not read (171 / 7 items).
- A field closed by `}}` on its own last line is lost (Large Sky Lapis has no stats).
- An API error body is cached as an empty batch.

**Mobs** (`mobLookupParse.ts`, `scrape-mobs.ts`, `scrape-respawns.ts`)
- Loot written as `[[Item]]` links is ignored (524 pages, about 1,000 item drops).
- Zones separated by `<br>` are glued together or dropped (`Burning WoodsEmerald Jungle`; A Black Wolf has none).
- The respawn key keeps a proper name added in parentheses (`the ghoul lord (Hoptor Thaggelum)`), which no death line matches.

**Quests** (`questPage.ts`, `scrape-quests.ts`)
- `{{Gear Set|...}}` rewards are ignored (55 armor quests, 395 items).
- `== Heading =={{CheckboxList}}` is not a heading, so turn-ins are listed as rewards.
- `Additional Rewards` / `Possible Rewards` headings, `{{Experience}}`, `{{:UNKNOWN}}` placeholders and underscored titles are misread.
- An API error is cached as an empty category; a failed page fetch silently drops the quest.

**Page era, Plane of Sky, images, spell lines**
- Page-era lookups miss normalized titles and read the era off `#REDIRECT` pages; error bodies are cached.
- The Plane of Sky item fetches run 110 ms apart; a class that parses to zero quests is written anyway.
- `fetch-wiki-images` retries a 404 four times.
- `gen-spell-lines` treats summon and utility sets as upgrade ladders ("Summon Food replaces Summon Drink").

## Local triage

Addressed on integrate/upstream-fixes by upstream PR #84 (wiki scraper fixes). Side effect: itemLookupParse.ts is 436 code lines vs the 400 lint cap.
