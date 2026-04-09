# Emberfall: Ash of the Oath

A dark-fantasy 8-bit iOS adventure prototype built with SwiftUI. The game follows **Kael Veyr**, a battle-scarred mercenary who survived the fall of Emberfall Keep. Kael carries severe trauma, fragmented memories, and a relentless need to finish the war that already destroyed him.

Across several levels, the player uncovers the truth of the so-called Dark Lord. What begins as a monster hunt slowly becomes a story about guilt, sacrifice, and a failed attempt to save a dying world.

## Core pillars

- **8-bit tone + modern controls**: retro framing with SwiftUI-driven UX.
- **Trauma-informed protagonist**: Kael's memory fragments unlock lore and influence his internal monologue.
- **Multiple weapon styles**: Greatsword, Twin Blades, Halberd, and Hexbow each alter combat rhythm.
- **Branching revelation arc**: each cleared level exposes a different layer of the Dark Lord's history.

## Narrative premise

Kael once served the Black Banner, an elite company ordered to assassinate **Lord Seradain Voss**, the ruler later remembered as the Dark Lord. The mission ended with Emberfall burning, Kael's company slaughtered, and Kael left alive only because Seradain spared him.

Years later, plague and shadow storms consume the frontier. Kael is pulled back into the wasteland and told one lie: *kill the Dark Lord, end the curse.*

As the campaign unfolds, players learn Seradain was never trying to conquer the realm. He bound himself to an abyssal covenant to hold a cosmic rift shut, taking on the appearance of a monster so the kingdom would fear him enough to keep away from the rift. The "curse" is the covenant failing.

## Included prototype structure

This repository includes a lightweight architecture for an iOS prototype:

- `Sources/Emberfall8bit/ShadowborneApp.swift` – app entry point.
- `Sources/Emberfall8bit/ContentView.swift` – main retro UI shell.
- `Sources/Emberfall8bit/GameViewModel.swift` – state, progression, and level transitions.
- `Sources/Emberfall8bit/Models.swift` – level, weapon style, and lore models.

> The code is intentionally content-first for fast iteration on narrative and progression.

## Level arc (initial)

1. **Ashen Causeway** – tutorial zone, Kael relives the night his unit fell.
2. **Cathedral of Cinders** – first hints Seradain protected civilians during the purge.
3. **Gravewood Bastion** – Kael finds journals from his former captain, exposing political betrayal.
4. **The Rift Crown** – final ascent; Seradain is revealed as the last living seal on the abyss.

## Weapon styles

- **Greatsword (Ruin Edge)**: heavy stagger, high commitment.
- **Twin Blades (Mournfangs)**: mobility, bleed stacks.
- **Halberd (Dawnspike)**: spacing and counter windows.
- **Hexbow (Nightglass Bow)**: ranged pressure + curse interactions.

## Ending direction

Final confrontation gives two narrative resolutions:

- **Execution ending**: Kael kills Seradain, briefly ending the storms but opening the abyss fully.
- **Burden ending**: Kael takes the covenant into himself, becoming the next feared warden.

Both endings preserve the tragic dark-fantasy feel while reframing the Dark Lord as a doomed guardian rather than a pure villain.
