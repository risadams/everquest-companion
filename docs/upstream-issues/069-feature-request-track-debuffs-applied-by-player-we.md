# Upstream #69: Feature request: Track debuffs applied by player weapon/item procs

- Source: https://github.com/jmoyers/everquest-companion/issues/69 (read-only copy; upstream was NOT modified)
- Author: Luterin70 | Opened: 2026-09-09T16:07:10Z | Last updated: 2026-10-10T23:18:40Z
- Local status: open

## Body

## Feature request: Track debuffs applied by player weapon/item procs

I would like to request support for tracking debuffs in the Debuff overlay when they are applied by a weapon or item proc.

### Example

A good test case is **Orb of Tishan**, which procs **Tashania**.

When the proc lands, the mob clearly receives Tashania and the landing message appears in the game log, but Companion does not add Tashania to the Debuff tracker because there was no normal spell cast from my character for it to associate with the debuff.

This likely affects other proc-applied debuffs as well, such as:

* Snare procs
* Slow procs
* Resist debuffs
* Other weapon/item proc effects with a duration

### Suggested behavior

If Companion detects a proc caused by the player, that proc could be treated as ownership evidence in the same way as a normal spell cast.

For example:

Player attacks mob
→ Orb of Tishan proc is detected
→ Tashania landing message is detected on that mob
→ Companion associates the proc with the player
→ Tashania is started/refreshed in the Debuff overlay

### Optional safety checks

If stronger ownership verification is desired, Companion could also use the player's latest inventory dump.

For example, if the inventory dump shows that the player has or has equipped an item capable of producing the detected proc, that could provide additional confidence that the proc belongs to the player.

I already use an in-game macro to create inventory dumps, so requiring or recommending a fresh inventory dump after changing proc weapons would be reasonable for this type of feature.

Another option would be a setting such as:

**Track player proc debuffs**

This could be optional so the current conservative ownership behavior remains unchanged by default.

### Use case

My main use case is solo/instanced play, where false attribution from another player's proc is generally not a concern.

Orb of Tishan / Tashania would be a simple and useful test case for this feature.

Companion feedback report ID: 01M23EQJRNRP1F24B34GXMMNS0

## Comments

### kaltinril (2026-10-10T23:18:40Z)

Thanks for the suggestion! Debuffs from weapon and item procs can now be tracked, behind a switch that's off by default (the log never names the proc, so it's matched from your held items and a melee hit just before). See #77.

## Local triage

Addressed on integrate/upstream-fixes by upstream PR #77 (debuffs from weapon/item procs).
