# Upstream #37: Feature request: log rotation option

- Source: https://github.com/jmoyers/everquest-companion/issues/37 (read-only copy; upstream was NOT modified)
- Author: ayust | Opened: 2026-08-17T02:28:13Z | Last updated: 2026-09-15T16:59:42Z
- Local status: open

## Body

Given how EQ logs can grow, and given how EQL Companion is reliant on logging being enabled and complete to function, it would be great for EQL Companion to have optional functionality to rotate the EQ log file - ideally compressing (and optionally including in replay) the older segments of the logs.

e.g. "when an EQ log grows to be > 50 MB, the next time EQ is quit, compress the existing logfile as <logfilename>.## so that EQ will create a new one upon next login".

## Comments

### kaltinril (2026-08-17T04:05:19Z)

I like this idea, extract important stats from the history, as you say, compress.  Perhaps it could aggregeate stats by hour, purge useless stats (<name> tries to cast a spell on you but you are protected) that gets spammed in towns.

Wouldn't want to lose important information from the logs like the named spawning, items dropped (and counts), etc.

### ayust (2026-08-17T05:37:17Z)

EQ logs are also just text which is highly compressible, so even if not removing any log lines, just applying e.g. zip compression would decrease the size on disk significantly.

### johnsideserf (2026-08-20T13:59:02Z)

Sketching a design here rather than a PR, because rotation touches two things that deserve a ruling first. Grounded in the current code, not in the abstract.

## The two real problems

**1. The file is EQ's, and EQ may have it open.** The app must never rename or truncate a log the game is writing. The reporter's trigger ("next time EQ is quit") is the right instinct; the cheapest safe approximation is **rotate at companion startup, only when the log's tailer isn't seeing growth and the file's mtime is comfortably stale** — no process detection needed, and a wrong guess degrades to "EQ was running, so nothing happened" (the Tailer already survives shrink/rotate in place, so even a mid-write rotation wouldn't corrupt the app's state — it would just be rude to the game).

**2. The app derives most of its world by replaying the whole log at every launch** (`session.ts` scans to frozen EOF, then tails). That's both the opportunity and the hazard:
- *Opportunity:* rotation directly buys the thing the fleet startup readings measure — cold-read cost scales with the whole file (`coldRead.ts`), so a 50MB cap is a real startup win.
- *Hazard:* kills (all-time boss record, best tiers, first/last-seen), loot history, and level/AA history are **replay-derived, not persisted** — rotate the history away and the Bosses tab forgets Nagafen. Quest turn-ins already survive exactly this, by design: `ProgressState.questTurnIns` persists detected turn-ins verbatim *because* "truncated logs happen, and a turn-in the log can no longer show is still a thing that happened." That sentence is the whole design principle rotation needs, already stated in the tree.

## The shape I'd propose

**Persist-then-rotate**, not replay-the-archives: extend the `questTurnIns` precedent to the other long-horizon facts (the kills map is the big one), and gate rotation on a completed fold — rotate only *after* a launch has replayed the current log and flushed the derived state. Replaying compressed segments at startup (the "include in replay" option) is self-defeating: it spends the startup time the rotation existed to save. The compressed segments stay on disk as archives for audit or re-derivation, but nothing reads them on the hot path.

Known cost to state honestly rather than hide: one-shot lines. `You will now use <X>` prints once at a level-up, and the tree already documents that a log beginning after it degrades the Strike lane forever (the JOS-163 story — "fresh install, rotation, `/log on` enabled later"). Rotation makes that pre-existing class of loss more common; the same persist-before-rotate move covers any lane that matters, but which lanes matter is an owner call.

## Details that fall out of the code

- **Naming:** discovery matches `/^eqlog_.+\.txt$/i`, so the archive suffix must come *after* `.txt` (`eqlog_Char_server.txt.2026-08-20.gz`) — the reporter's `<logfilename>.##` would make `eqlog_Char_server.1.txt` a phantom character in the picker.
- **Compression:** plain gzip is plenty (these logs compress ~10:1) and keeps archives greppable with standard tools.
- **Opt-in, off by default,** per the telemetry-notice precedent — this is the app modifying the player's game files, which nobody should discover by surprise. Threshold configurable, 50MB is a fine default.
- `logTailMarks`/`coldRead` already treat a shrunk file as "unmeasured", so rotation doesn't confuse the startup profile.

Happy to build it in this shape (or any other) if wanted — posting the design first since it touches the player's files and the persistence model, and both of those are rulings rather than patches.

### ayust (2026-08-20T15:25:15Z)

Incidentally, the reason why I suggested "when EQ quits" is because the app already has detection for whether the EQ process as running (to power the "hide overlays when EQ isn't running" option).

### joeymavity (2026-09-15T16:59:42Z)

You can see an approach at https://github.com/DranakCorps-bot/EQBuddy/discussions/52 that worked well. Basically: Create a subfolder called 'archive'. But yes, a lot of the persistent data you have here wouldn't persist unless you saved them somehow, but that seems easy for at least some cases (where you calculate outcomes, and no longer need the underlying data). Also if you had a date_time structure that was consistent, you could fetch logs if needed. Ex, if I wanted to dive into my best kill from 20260903_205004 (September 3, 2026, 20:50:04 (military time)), you'd just need to find the file with the closest last line date to that kill time, or fail out saying not found. Ex: Freeport_Player_20260903_081618.txt is too early, Freeport_Player_20260903_223742.txt is too late, if there's a file called Freeport_Player_20260903_210133.txt, which would have the logged fight you could read in and evaluate. Put them all in the 'archive' subdirectory and you're good to go. Moving the file 'live', the client just auto-starts a new log file, fwiw.
