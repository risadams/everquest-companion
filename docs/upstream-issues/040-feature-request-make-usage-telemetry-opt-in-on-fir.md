# Upstream #40: Feature request: Make usage telemetry opt-in on first launch

- Source: https://github.com/jmoyers/everquest-companion/issues/40 (read-only copy; upstream was NOT modified)
- Author: undergroundrap | Opened: 2026-08-17T20:32:59Z | Last updated: 2026-08-17T20:35:28Z
- Local status: open

## Body

## Summary
Make anonymous usage telemetry opt-in instead of enabled by default.

## Problem / Motivation
The application on first launch currently initializes telemetry automatically (including anonymous identifier generation and event buffering), even though users can disable it later. This can surprise users who expect privacy-first behavior from open-source companion tools.

## Proposed Alternatives

### Option A (Recommended): Explicit first-launch consent
Show a blocking or prominent first-launch prompt with two clear actions:
- **Enable Analytics**
- **Keep Analytics Disabled**

Do not initialize telemetry services, anonymous IDs, or event buffers until consent is granted.

### Option B: Default disabled in preferences
Set telemetry to disabled by default for new installs and require users to enable it manually under **Preferences → Usage analytics** (or via an optional first-run prompt).

## Expected Behavior
- No telemetry IDs or event buffers are initialized before explicit user consent.
- Existing users without an explicit preference set are treated as opted out.
- Existing opted-in users preserve their preference across updates.

## Documentation
Update `TELEMETRY.md` and `SECURITY.md` to explicitly state:
- Telemetry defaults to disabled.
- What data is collected after consent.
- How to enable or disable it.

## Testing Notes
- Verify the first-run prompt appears and no telemetry state initializes before user choice.
- Verify consent persists across app restarts.
- Verify no events are collected, buffered, or sent when disabled.
- Verify manual re-enabling works correctly from Preferences.

## Comments

### undergroundrap (2026-08-17T20:35:28Z)

Happy to put together a PR for this once you confirm which approach (Option A vs. Option B) you'd prefer to move forward with!
