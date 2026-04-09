import SwiftUI

struct ContentView: View {
    @StateObject private var viewModel = GameViewModel()

    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()

                VStack(alignment: .leading, spacing: 16) {
                    Text("EMBERFALL: ASH OF THE OATH")
                        .font(.system(.headline, design: .monospaced))
                        .foregroundStyle(.red)

                    GroupBox("Current Level") {
                        VStack(alignment: .leading, spacing: 8) {
                            Text(viewModel.currentLevel.title)
                                .font(.title3.weight(.bold))
                            Text(viewModel.currentLevel.objective)
                            Text("Atmosphere: \(viewModel.currentLevel.atmosphere)")
                                .foregroundStyle(.secondary)
                            Text("Boss: \(viewModel.currentLevel.bossEcho)")
                                .foregroundStyle(.orange)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }

                    GroupBox("Weapon Style") {
                        Picker("Weapon", selection: $viewModel.selectedWeapon) {
                            ForEach(WeaponStyle.allCases) { style in
                                Text(style.rawValue).tag(style)
                            }
                        }
                        .pickerStyle(.segmented)

                        Text(viewModel.selectedWeapon.combatIdentity)
                            .font(.footnote)
                            .padding(.top, 6)
                    }

                    GroupBox("Recovered Lore") {
                        ScrollView {
                            VStack(alignment: .leading, spacing: 10) {
                                ForEach(viewModel.unlockedFragments.reversed()) { fragment in
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(fragment.title)
                                            .font(.subheadline.weight(.semibold))
                                        Text(fragment.body)
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .padding(.vertical, 4)
                                }
                            }
                        }
                        .frame(maxHeight: 220)
                    }

                    HStack(spacing: 12) {
                        Button("Clear Level") {
                            viewModel.clearCurrentLevel()
                        }
                        .buttonStyle(.borderedProminent)

                        Button("Restart") {
                            viewModel.restartCampaign()
                        }
                        .buttonStyle(.bordered)
                    }
                }
                .padding()
                .foregroundStyle(.white)
            }
            .navigationTitle("8-Bit Dark Fantasy")
        }
    }
}

#Preview {
    ContentView()
}
