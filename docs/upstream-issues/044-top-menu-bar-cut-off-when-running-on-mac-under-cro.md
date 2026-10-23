# Upstream #44: Top menu bar cut off when running on mac under crossover

- Source: https://github.com/jmoyers/everquest-companion/issues/44 (read-only copy; upstream was NOT modified)
- Author: brino | Opened: 2026-08-19T12:20:40Z | Last updated: 2026-08-20T20:55:49Z
- Local status: open

## Body

I'm sure running under crossover is not TECHNICALLY supported. That said, the app seems to work well in the crossover environment.

However, it seems the mac window top bar is covering up the top of eq companion. This happens even if I go fullscreen and there is no top window bar. See my screenshot below.

Idk what you can really do about this. However, it makes the overlays difficult, if not impossible to use for anyone running under crossover.

<img width="1294" height="913" alt="Image" src="https://github.com/user-attachments/assets/facb2acf-bd2c-4b2d-8339-55fa0291df7c" />

## Comments

### mlbdudecsm1974 (2026-08-20T13:33:03Z)

Same platform same issue.  Still a great app, thanks!

### Bombg (2026-08-20T20:54:05Z)

Not sure what the mac equivalent is but I was able to fix this in Linux by setting containers registry key at  HKEY_CURRENT_USER\Software\Wine\X11 Driver and setting a string value Decorated to N.  Also as a workaround F11 did expand the UI enough for me to see the button.
