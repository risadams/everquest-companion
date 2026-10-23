# Upstream #28: App opens a window with titlebar only in Crossover for Mac

- Source: https://github.com/jmoyers/everquest-companion/issues/28 (read-only copy; upstream was NOT modified)
- Author: rickharris | Opened: 2026-08-12T23:56:26Z | Last updated: 2026-08-15T13:06:12Z
- Local status: open

## Body

I'd really like to be able to use this app - it looks amazing! I saw that 0.6.0 made it installable via Wine, but I haven't gotten the app to run successfully yet.

I originally tried to install 0.4.0 in the same Crossover for Mac bottle that I have EQL installed to. I obviously couldn't get that version installed because of the issue fixed in 0.6.0. The next version I installed was 0.6.1 and I've tried every few versions with 0.24.0 being the most recent version I tried. Ever since 0.6.0 I've been able to install the app, but when it opens I see a window that has a titlebar but no content. The window does seem to have dimensions, though, because it blocks things from being clicked behind it.

<img width="1487" height="333" alt="Image" src="https://github.com/user-attachments/assets/20a4b5c9-9c63-47a1-8aac-4fbfc2f13039" />

I don't know how much you intend to support wine but if I can provide any information to help I'd be happy to. I'll also try to do a little research of my own to see what's going on.

Thanks!

## Comments

### JKane10 (2026-08-14T04:43:28Z)

Ran into this as well. I'm not super familiar with Electron, Chromium so went back and forth with Claude a bit until I got it working and asked it to summarize the issue. 

It produced a rather robust write up that I'll add here that might be helpful for a long term fix, but may also just be slop, but seems to pass the smell test of my limited knowledge of this stack. My work around ended up being as follows which should unblock you @rickharris...

1. Modify the following file in your bottle: /drive_c/users/crossover/AppData/Roaming/everquest-companion and add the line `"graphics": { "safeMode": "off", "opaqueOverlays": "on" }` to the top. Honestly I don't think the opaqueOverlays is required, but was in mine to get it working.
2. Run the companion app with the following command line options `--disable-direct-composition --in-process-gpu`

### The full summary: **Potential AI slop warning**
# Wine auto-detection forces safe mode, which is the one graphics path Wine cannot do (white window, GPU process crash loop)

## Summary

Under CrossOver/Wine the app launches, loads, and runs correctly — but renders a
completely blank white client area. The window, title bar and menu are all there;
nothing is ever painted.

The cause is the Wine compatibility path itself. `WINE_GRAPHICS_AUTO` sets
`safeMode: true`, which calls `app.disableHardwareAcceleration()`, which puts
Chromium on its Windows software renderer — **D3D11 WARP**. WARP is a Microsoft
binary that Wine does not implement at all, so ANGLE can never initialise and the
GPU process dies.

Meanwhile *hardware* D3D11 works fine in a modern bottle via DXVK / D3D Metal. So
the auto-detection is backwards for current Electron: the "safe" path is the only
one that cannot work, and the normal path very nearly does.

## Environment

- App version 0.1.0 (`channel=prod`), packaged NSIS installer
- Electron 43 / Chromium 140
- CrossOver on macOS, D3D Metal enabled in the bottle
- Wine detected correctly by the app (`file:wineboot.exe`, `env:WINELOADER`, …)

## Evidence

With graphics switches on `auto` (the default under Wine):

```
[everquest-companion] wine: running under Wine (...) - graphics switches left on auto take the compatibility path.
[everquest-companion] Graphics safe mode is ON for this launch (detected automatically): drawing without hardware acceleration.
...
ERR: DisplayD3D.cpp:157 (rx::CreateRendererD3D): Failed to create D3D renderer: Could not create D3D11 device.
ERR: Display.cpp:1119 (egl::Display::initialize): ANGLE Display::initialize error 12289: No available renderers.
[ERROR:ui\gl\gl_display.cc:638] eglInitialize D3D11Warp failed with error EGL_NOT_INITIALIZED
[ERROR:ui\gl\gl_display.cc:673] Initialization of all (1) EGL display types failed.
[ERROR:components\viz\service\main\viz_main_impl.cc:190] Exiting GPU process due to errors during initialization
```

Note `D3D11Warp` and `all (1) EGL display types` — safe mode has pinned ANGLE to
WARP and there is no other backend left to try.

Everything else in the app is completely healthy in the same run:

```
[everquest-companion] Tailing character@qeynos: ...\eqlog_character_qeynos.txt
[everquest-companion] Loaded 948 loot, 6 turn-ins, 215 mobs, 8 level-ups, 26 AA gains, 11 AA buys.
[everquest-companion] Startup 12191ms, 345481 events replayed, ... rendererHydrated 3044ms
```

Log tailing, parsing, replay and store all work. This is purely presentation.

## What fixes it

Setting `graphics.safeMode` to `"off"` in `everquest-companion-progress.json`
removes the WARP errors entirely — D3D Metal supplies a real D3D11 device. Two
further problems then surface:

```
[ERROR:ui\gl\direct_composition_support.cc:755] DCompositionCreateDevice3 failed: Not implemented. (0x80004001)
[ERROR:content\browser\gpu\gpu_process_host.cc:1089] GPU process exited unexpectedly: exit_code=-1073741819
```

`0x80004001` is `E_NOTIMPL` (Wine has no DirectComposition) and `-1073741819` is
`0xC0000005`, an access violation. The GPU process crashes three times and gives up.

`--disable-direct-composition` silences the DComp error but **not** the segfault,
so DComp is a red herring — something else in GPU process init is faulting. Adding
`--in-process-gpu` avoids it, and the app then renders correctly and is fully usable.

Working configuration:

- `graphics.safeMode: "off"`
- `--disable-direct-composition --in-process-gpu`
- D3D Metal enabled in the bottle

(`--no-sandbox` turned out not to be required.)

## Suggested change

Flip the Wine default and apply the two switches on that path:

```js
const WINE_GRAPHICS_AUTO = { safeMode: false, opaqueOverlays: true };

function applyWineGraphicsSwitches() {
  if (!wineDetection().wine) return;
  electron.app.commandLine.appendSwitch('disable-direct-composition');
  electron.app.commandLine.appendSwitch('in-process-gpu');
}
```

Called alongside `applyGraphicsSafeMode()` before `whenReady()`. Gated on
`wineDetection().wine` it is a no-op on real Windows, and both switches are
Windows-only concepts anyway, so there is no cross-platform risk.

Caveats worth weighing:

- `--in-process-gpu` means a GPU crash takes the whole app down instead of being
  contained and restarted. Under Wine that beats a guaranteed white screen, but it
  is a good reason to keep it strictly behind the Wine check.
- The underlying segfault is unidentified; `--in-process-gpu` works around it
  rather than fixing it, so this may need revisiting as Wine or Electron moves.
- `opaqueOverlays: true` is left as-is — that part of the Wine default looks right.

The Wine detection itself already does the hard part; it is only the conclusion it
draws that needs inverting. Happy to test a patch.

### brucealeg (2026-08-14T20:15:18Z)

would love to see this patched or Mac native version

### rickharris (2026-08-14T20:18:11Z)

@JKane10 thanks, I might give that a try. My current solution was to pull the repo down and make a Mac build of the electron app and that works really nicely actually.

### brucealeg (2026-08-14T20:27:02Z)

> [@JKane10](https://github.com/JKane10) thanks, I might give that a try. My current solution was to pull the repo down and make a Mac build of the electron app and that works really nicely actually.

Did you just pull the source and do something like:

mkdir build && cd build
cmake ..
make
sudo make install

### JKane10 (2026-08-14T20:40:06Z)

> > [@JKane10](https://github.com/JKane10) thanks, I might give that a try. My current solution was to pull the repo down and make a Mac build of the electron app and that works really nicely actually.
> 
> Did you just pull the source and do something like:
> 
> mkdir build && cd build cmake .. make sudo make install

ah, sorry, you weren't asking me :) - quoting the tag notify me and I misread.

### JKane10 (2026-08-15T12:40:19Z)

Looks like this was fixed in the latest (0.28) build. Worked for me! https://github.com/jmoyers/everquest-companion/commit/a61efb3a66217480487e256499cc1eb463fa3ac9#diff-3d9dab3ede51df9dee43c588f581de617b759efa3c464203c827bda1d81167e9R193
