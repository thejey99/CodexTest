import Foundation

struct GameLevel: Identifiable, Hashable {
    let id: Int
    let title: String
    let objective: String
    let atmosphere: String
    let revelation: String
    let bossEcho: String
}

enum WeaponStyle: String, CaseIterable, Identifiable {
    case greatsword = "Ruin Edge"
    case twinBlades = "Mournfangs"
    case halberd = "Dawnspike"
    case hexbow = "Nightglass Bow"

    var id: String { rawValue }

    var combatIdentity: String {
        switch self {
        case .greatsword:
            return "High stagger and armor break. Slow recovery, brutal finishers."
        case .twinBlades:
            return "Fast chain attacks with bleed pressure and evasive dodges."
        case .halberd:
            return "Mid-range control, parry routes, and tactical crowd management."
        case .hexbow:
            return "Ranged precision, curse marks, and setup-driven burst windows."
        }
    }
}

struct LoreFragment: Identifiable, Hashable {
    let id: UUID = UUID()
    let title: String
    let body: String
}
