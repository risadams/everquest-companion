# Upstream #64: raid target view not tracking kills for the week

- Source: https://github.com/jmoyers/everquest-companion/issues/64 (read-only copy; upstream was NOT modified)
- Author: Azzuri-UK | Opened: 2026-09-06T14:36:03Z | Last updated: 2026-09-06T15:05:13Z
- Local status: open

## Body

I did Vox 0-4 yesterday and Phinny 0-4 today.  Neither of them are showing in the "This week" view.

<img width="1656" height="782" alt="Image" src="https://github.com/user-attachments/assets/82624424-f00a-45a2-a92f-16c89cd08fe0" />

In the overall view it shows the last killed date correctly

<img width="596" height="169" alt="Image" src="https://github.com/user-attachments/assets/f4560c22-2f37-4910-ab9c-9d75fc00cbf3" />

Previous weeks this has tracked without issue, as I've been using it for my "todo" list

## Comments

### brianmontanaweb (2026-09-06T15:05:13Z)

Seeing the same thing for the current version `v1.16.0`, lemme see if an agent can help me understand what's happening here.

## Local triage

Likely addressed by upstream PR #68 (raid kills credit tier after the XP line change); verify against a live raid kill.
