# Upstream #56: dbstr_us.txt type 6 carries spell descriptions — including the 74xxx spells no wiki has

- Source: https://github.com/jmoyers/everquest-companion/issues/56 (read-only copy; upstream was NOT modified)
- Author: cutlerbenjamin1-cmd | Opened: 2026-08-29T19:02:57Z | Last updated: 2026-08-29T19:02:57Z
- Local status: open

## Body

`fold::dbstr` currently keeps only type 5 and discards the rest, on the reasoning that keeping it "would hold tooltips, race names and achievement text in memory." That's true of most types, but **type 6 is the spell description table** — 35,869 rows on a current install, keyed by `spells_us.txt` **field 85**.

This seems worth surfacing because two comments elsewhere in the repo describe the gap it closes. `fold::spells_us` notes that the wiki-scraped `spells.json` "knows a spell's messages and nothing about how it is resisted," and separately that the file contains "the Legends-only 74xxx ids no wiki has." Type 6 covers both: it's in the file you already open, and it includes the Legends content a wiki scrape structurally cannot.

Measured against a current install:

- **87%** of non-placeholder spells (63,876 / 73,290) resolve to a type-6 description
- **83%** of the Legends-only 74xxx spells (84 / 101) — e.g. 74000 Frost Dagger, 74001 Echo of Health, 74002 Echoing Light
- Field 85 equals the row's own spell id on every spell I sampled, though I'd treat that as incidental and key off 85 rather than assume it

## The text needs substitution to be usable

Descriptions store placeholders the client fills at render time, so printing them raw gives you literal `#1`. The grammar:

| Token | Renders |
|---|---|
| `#N` / `@N` / `$N` | slot N's base / max / limit |
| `%z` `%i` `%I` `%Y` `%Z` | duration |
| `%T` | max targets (field 143) |
| `%L` | max hits count (field 102) |
| `%H` `%M` | hate (field 99) |
| `%O` | percent chance (field 142) |
| `%J` | radius (field 5) |
| `%S` | skill name |
| `%R` / `%N` `%n` | referenced spell id / its name |

Worked example, Lifetap (341):

```
raw      Drains your target of life energy, siphoning between #1 and @1 hit points.
rendered Drains your target of life energy, siphoning between 4 and 8 hit points.
```

Two gotchas that bite immediately:

1. **Magnitudes are stored signed.** Damage and debuffs are negative, but the surrounding text already carries the direction — render the absolute value or you print "causing -62 damage."
2. **`#N`/`@N`/`$N` reference slots that may not exist.** 96.2% of references are valid (40,883 of 42,480); the remainder are descriptions left stale by later slot edits. Worth failing soft rather than indexing blindly.

Happy to open a PR if useful, though I don't want to cut across your conventions — say the word either way.

---

Separately, and only if it's wanted: I've mapped EQL's full 173-column layout. It's the 169-field 2018-04-10 Live layout minus five fields (`IMAGENUMBER`, `MEMIMAGENUMBER`, `ACTIVATED`, `SPELL_EFFECT_INDEX`, `BARD_BUFF_BOX`) plus nine EQL-specific ones, which is why no stock parser aligns. Names come from `rumstil/eqspellparser` (Apache 2.0).

One of the nine additions is field **165**, a spell-line id that groups every tier of a line under one code — 1,504 groups over 32,340 spells, e.g. Minor Healing through Superior Healing all read `100020020`. That's the join for upgrade paths if you ever want it. Happy to write it up as a separate issue rather than expand this one.
