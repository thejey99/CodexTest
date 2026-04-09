import Foundation
import Combine

@MainActor
final class GameViewModel: ObservableObject {
    @Published var selectedWeapon: WeaponStyle = .greatsword
    @Published private(set) var levels: [GameLevel] = []
    @Published private(set) var currentLevelIndex: Int = 0
    @Published private(set) var unlockedFragments: [LoreFragment] = []

    init() {
        levels = Self.defaultLevels
        unlockedFragments = [
            LoreFragment(
                title: "The Survivor",
                body: "Kael remembers the smell of iron and ash. He survived Emberfall, but never escaped it."
            )
        ]
    }

    var currentLevel: GameLevel {
        levels[currentLevelIndex]
    }

    var canAdvance: Bool {
        currentLevelIndex < levels.count - 1
    }

    func clearCurrentLevel() {
        unlockedFragments.append(
            LoreFragment(
                title: currentLevel.title,
                body: currentLevel.revelation
            )
        )

        if canAdvance {
            currentLevelIndex += 1
        }
    }

    func restartCampaign() {
        currentLevelIndex = 0
        unlockedFragments = [
            LoreFragment(
                title: "The Survivor",
                body: "Kael remembers the smell of iron and ash. He survived Emberfall, but never escaped it."
            )
        ]
    }

    private static let defaultLevels: [GameLevel] = [
        GameLevel(
            id: 1,
            title: "Ashen Causeway",
            objective: "Reach the Emberfall gate and survive memory ambushes.",
            atmosphere: "Rain, burning siege engines, and broken prayer bells.",
            revelation: "Kael finds a child he once failed to protect. In the memory, Seradain orders safe passage for civilians.",
            bossEcho: "The Broken Standard — manifestation of Kael's survivor's guilt."
        ),
        GameLevel(
            id: 2,
            title: "Cathedral of Cinders",
            objective: "Defeat the Choir Warden and recover the sealed hymn page.",
            atmosphere: "Ruined stained glass, torch smoke, and cracked hymns.",
            revelation: "Records reveal Seradain diverted his own guard to hold back abyss-born creatures while nobles fled.",
            bossEcho: "Choir Warden Iskra — faith twisted into fanaticism."
        ),
        GameLevel(
            id: 3,
            title: "Gravewood Bastion",
            objective: "Cross the blackwood trenches and locate Captain Rhel's journal.",
            atmosphere: "Bone-white trees and whispers that mimic old comrades.",
            revelation: "Kael learns the Black Banner was ordered to provoke Seradain, forcing him into the forbidden covenant.",
            bossEcho: "Captain Rhel, Hollowed — Kael's mentor consumed by ambition."
        ),
        GameLevel(
            id: 4,
            title: "The Rift Crown",
            objective: "Climb the shattered spire and face the Dark Lord.",
            atmosphere: "Starless sky, gravity fractures, and abyssal thunder.",
            revelation: "Seradain confesses the title 'Dark Lord' was a mask he accepted to keep the abyss sealed. He asks Kael to choose: kill him, or inherit the burden.",
            bossEcho: "Lord Seradain Voss — a guardian mistaken for a tyrant."
        )
    ]
}
