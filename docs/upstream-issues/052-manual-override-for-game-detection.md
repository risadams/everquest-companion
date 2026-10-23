# Upstream #52: Manual override for game detection

- Source: https://github.com/jmoyers/everquest-companion/issues/52 (read-only copy; upstream was NOT modified)
- Author: daviderickson | Opened: 2026-08-21T15:43:47Z | Last updated: 2026-09-01T21:52:11Z
- Local status: open

## Body

I'm running Everquest Companion within a Windows sandbox for isolation.. I've mapped the EQL logs folder into the sandbox so it can read that, but as of a couple versions back (1.3 1.4?) it stopped being able to detect live combat.  I'm assuming it went from watching the log file to also triggering on checking for a running EQL process.  Since the EQL process is not visible within the sandbox, it won't detect and trigger live combat.

Can we get an override button or property to revert to the prior behavior of just polling the log and assuming the game is running?

Thanks!

## Comments

### mlbdudecsm1974 (2026-09-01T21:52:11Z)

Running the game on Mac, with the folders shared out to a windows PC running companion having the same issue.  Older version worked, latest just spins on reading log.
