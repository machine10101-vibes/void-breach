# VOID BREACH

Isometric top-down survival looter-shooter. Year 2172. Earth is ash after the Shade tore a Void Gate under New Meridian. You are Vanguard-7 in a Chimera Protocol exo-suit.

Suit up, hold the ash streets, vacuum loot off the Shade, and burn the Harbinger.

## Campaign

Pick a drop on the title or on the ship, then **Deploy**. A locked district stays dark until the previous gate is cleared.

| Drop | What it is |
| --- | --- |
| 01 Ashfall Gate | Short boulevard. Husks, a cinder, then a spitter and a wraith in the atrium, then the Void Harbinger. |
| 02 Ember Rail | Metro spine. Cantors ward the pack. Spitters, wraiths, and the Rail Warden. Unlocks after Ashfall. |
| 03 Null Spire | Longest nest. Cantors, wraiths, brutes, and the Null Sovereign. Unlocks after Ember Rail. |

Each street has cover, a route mark, and an extract pad. Hold the pad when the breach hits, or push to the gate and burn the boss while its core is open.

An **Ash Cantor** hangs behind a pack and wards the Shade around it. Their ring turns indigo and shots print WARD until you drop the singer. The **Sever Pike** (rifle ammo, hull CNC or a rare drop) cuts that ward and staggers. The **Ash Howl** is a short rifle-ammo hand cannon from the hull CNC. It staggers and ships with Open seam. A **Seam ARX** prints on the hull for 110 scrap, and the Ashfall field cache stamps Open seam on a gun.

A **Cinder** sprints the pack and swells an orange ring. When the ring fills, it pops. Step off the ring or shoot it before the swell finishes. One runs the Ashfall boulevard, the Ember platform, and the Spire forecourt.

A **Stalker** does not stand in the lane. Inside its shot, it weaves across the street while the rifle comes up. A **Spitter** backs off when you close, and keeps the lob going.

## Loot

Colored drops are common, magic, rare, or legendary. Magic and better guns and plates roll **affixes** (damage, magazine, spread, reload, range, fire rate, open seam, plate, shield, servos). The numbers on the loadout are the numbers the gun uses. **Open seam** hits harder through a cantor's ward and through an open boss core. It is not baked into the listed damage. **Brace** on a plate lengthens the dodge roll, up to three pieces. Print Braced greaves on the hull if the street has not dropped one.

Three two-piece kits change the suit when both pieces are worn:

| Kit | Pieces | Bonus |
| --- | --- | --- |
| Ember Protocol | Ember visor + Ember gauntlets | Overdrive lasts longer and hits harder |
| Rail Stride | Rail cuirass + Rail greaves | Move faster |
| Null Mantle | Null helm + Null mantle | Take less damage |

Print the missing piece on the hull CNC, or vacuum it off the street. Scrap, guns, plates, ammo, cleared districts, and Chimera drills persist on this device.

## Drills

On the ship, open **Ops**. Under the district list, spend banked scrap to drill Frag, Overdrive, Cleave, and Scan up to three ranks. Each rank widens the skill and shortens the cooldown. The pips under the skill keys, and under the phone skill buttons, show the rank you are carrying into the drop.

Cleave paints an ember arc on the street for the swing's reach. A frag or grenade draws an orange ring on the ground until it pops. A hit ticks four marks over the street instead of a word. When the shield breaks, the street prints CRACK.

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
