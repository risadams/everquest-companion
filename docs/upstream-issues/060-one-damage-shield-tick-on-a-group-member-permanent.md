# Upstream #60: One damage-shield tick on a group member permanently disables ally-pet crediting for them

- Source: https://github.com/jmoyers/everquest-companion/issues/60 (read-only copy; upstream was NOT modified)
- Author: kaltinril | Opened: 2026-09-03T03:28:44Z | Last updated: 2026-10-10T23:18:44Z
- Local status: open

## Body

If my damage shield ever hits another player — e.g. `Malkil is pierced by YOUR thorns for 5 points of non-melee damage.` (he was mob-charmed and swinging at me to break it) — the fold files it as me striking him (`note_struck`, routing.rs), and `ally_caster_allowed` then refuses every later `My leader is Malkil.` bind, so his pet's damage is never credited again. Since the engine re-reads the whole log, that one line from three weeks ago disables ally crediting for that player forever. Repro with `parity --snapshots`: my full log yields zero `allypet:malkil:jibektik` rows; the same log cut to start just after that line credits `Pet (Jibektik) - Malkil` in 16 fights. A DS retaliation proves they swung at me, not that I attacked them — suggest exempting dtype `ds` from `note_struck`.

## Comments

### kaltinril (2026-10-10T23:18:44Z)

A second path to the same symptom: a riposte on a charmed group-mate also blocked their pet for good. #80 lets a current group member through that check (a charm broadcast still blocks).

## Local triage

Addressed on integrate/upstream-fixes by upstream PR #61 (ds lines no longer write ever_struck); PR #80 covers the second path (roster overrides ever_struck).
