# Upstream #58: Application trying to access MIC and Camera  on systems.

- Source: https://github.com/jmoyers/everquest-companion/issues/58 (read-only copy; upstream was NOT modified)
- Author: jjmancil99 | Opened: 2026-08-30T20:49:16Z | Last updated: 2026-10-10T23:18:41Z
- Local status: open

## Body

Receiving alerts from Norton on the application trying to access the camera and Microphone on the system.  I don't see any reason why it would need access to the Camera or mic.

<img width="862" height="458" alt="Image" src="https://github.com/user-attachments/assets/e2c2d44f-f6be-4264-91d6-ed1a5eea60f8" />

## Comments

### kaltinril (2026-10-10T23:18:41Z)

Thanks for flagging this. The only code touching media devices was an audio-device listener used for a developer log line; it's removed in #79. The app never requested camera or microphone permission.

## Local triage

Addressed on integrate/upstream-fixes by upstream PR #79 (removes the audio-device listener).
