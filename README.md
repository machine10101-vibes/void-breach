# VOID BREACH

Isometric top-down survival looter-shooter. Year 2172. Earth is ash after the Shade tore a Void Gate under New Meridian. You are Vanguard-7 in a Chimera Protocol exo-suit.

Suit up, hold the ash streets, vacuum loot off the Shade, and burn the Harbinger.

## Campaign

Pick a drop on the ship, then **Deploy**.

| Drop | What it is |
| --- | --- |
| 01 Ashfall Gate | Short boulevard. Husk packs, then the Void Harbinger. |
| 02 Ember Rail | Metro spine. Spitters, wraiths, and the Rail Warden. Unlocks after Ashfall. |
| 03 Null Spire | Longest nest. Wraiths, brutes, and the Null Sovereign. Unlocks after Ember Rail. |

Each street has cover, a route mark, and an extract pad. Hold the pad when the breach hits, or push to the gate and burn the boss while its core is open.

## Loot

Colored drops are common, magic, rare, or legendary. Magic and better guns and plates roll **affixes** (damage, magazine, spread, reload, range, fire rate, plate, shield, servos). The numbers on the loadout are the numbers the gun uses.

Three two-piece kits change the suit when both pieces are worn:

| Kit | Pieces | Bonus |
| --- | --- | --- |
| Ember Protocol | Ember visor + Ember gauntlets | Overdrive lasts longer and hits harder |
| Rail Stride | Rail cuirass + Rail greaves | Move faster |
| Null Mantle | Null helm + Null mantle | Take less damage |

Print the missing piece on the hull CNC, or vacuum it off the street. Scrap, guns, plates, ammo, and cleared districts persist on this device.

## Play

| Input | Action |
| --- | --- |
| WASD / left stick | Move |
| Mouse / right drag | Aim on the ground |
| Click / Fire | Shoot |
| Shift | Sprint |
| Space | Dodge roll |
| R | Reload |
| 1–8 / scroll | Weapon slots |
| Q | Frag |
| E | Overdrive |
| F | Chainsaw cleave |
| G | Scan |
| X | Hold to extract |
| I | Loadout |
| Esc | Pause |

Follow the chevron. **Push** is the next plaza, **Contact** or **Marked** is a living pack, **Burn** is the boss, **Extract** is the pad.

## Mobile

The game is a PWA. On Android Chrome: menu → **Install app** / Add to Home Screen.

A sideloadable Android APK (WebView wrapper around the live game) is built from GitHub Actions on `main`. Download it from the title screen **Android APK** control after entering the access pin.

## Stack

Three.js (WebGL), TanStack Start, React 19. Characters, weapons, and the Shade are real 3D meshes.
