# Upstream #53: Bug: Regex capture groups not being substituted in Alert banner

- Source: https://github.com/jmoyers/everquest-companion/issues/53 (read-only copy; upstream was NOT modified)
- Author: andrew512 | Opened: 2026-08-24T19:23:57Z | Last updated: 2026-10-10T23:18:43Z
- Local status: open

## Body

Regex capture groups are correctly substituted in spoken text alerts, but the same substitutions are not applied to text-based alerts displayed in the Alert banner. I'm happy to submit my PR for this (https://github.com/andrew512/everquest-companion/pull/4), if desired.

## Comments

### kaltinril (2026-10-10T23:18:42Z)

Thanks for the clear report! The on-screen banner now fills in capture groups the same way the spoken phrase does. See #78.

## Local triage

Addressed on integrate/upstream-fixes by upstream PR #78 (alert banner fills capture groups).
