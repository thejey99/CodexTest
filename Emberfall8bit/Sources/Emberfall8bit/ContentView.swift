import SwiftUI

struct ContentView: View {
    @StateObject private var viewModel = GameViewModel()

    var body: some View {
        NavigationStack {
            GeometryReader { proxy in
                let isCompactPhone = proxy.size.width < 390

                ZStack {
                    Color.black.ignoresSafeArea()

                    ScrollView {
                        VStack(alignment: .leading, spacing: 16) {
                            Text("EMBERFALL: ASH OF THE OATH")
                                .font(.system(isCompactPhone ? .subheadline : .headline, design: .monospaced).weight(.bold))
                                .foregroundStyle(.red)
                                .minimumScaleFactor(0.7)
                                .lineLimit(2)

                            GroupBox("Current Level") {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text(viewModel.currentLevel.title)
                                        .font(.title3.weight(.bold))
                                        .minimumScaleFactor(0.8)
                                    Text(viewModel.currentLevel.objective)
                                    Text("Atmosphere: \(viewModel.currentLevel.atmosphere)")
                                        .foregroundStyle(.secondary)
                                    Text("Boss: \(viewModel.currentLevel.bossEcho)")
                                        .foregroundStyle(.orange)
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                            }

                            GroupBox("Weapon Style") {
                                if isCompactPhone {
                                    Picker("Weapon", selection: $viewModel.selectedWeapon) {
                                        ForEach(WeaponStyle.allCases) { style in
                                            Text(style.rawValue).tag(style)
                                        }
                                    }
                                    .pickerStyle(.menu)
                                } else {
                                    Picker("Weapon", selection: $viewModel.selectedWeapon) {
                                        ForEach(WeaponStyle.allCases) { style in
                                            Text(style.rawValue).tag(style)
                                        }
                                    }
                                    .pickerStyle(.segmented)
                                }

                                Text(viewModel.selectedWeapon.combatIdentity)
                                    .font(.footnote)
                                    .padding(.top, 6)
                            }

                            GroupBox("Recovered Lore") {
                                VStack(alignment: .leading, spacing: 10) {
                                    ForEach(viewModel.unlockedFragments.reversed()) { fragment in
                                        VStack(alignment: .leading, spacing: 4) {
                                            Text(fragment.title)
                                                .font(.subheadline.weight(.semibold))
                                                .minimumScaleFactor(0.8)
                                            Text(fragment.body)
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                        }
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                        .padding(.vertical, 4)
                                    }
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                            }

                            VStack(spacing: 12) {
                                Button("Clear Level") {
                                    viewModel.clearCurrentLevel()
                                }
                                .buttonStyle(.borderedProminent)
                                .frame(maxWidth: .infinity)

                                Button("Restart") {
                                    viewModel.restartCampaign()
                                }
                                .buttonStyle(.bordered)
                                .frame(maxWidth: .infinity)
                            }
                        }
                        .padding()
                        .foregroundStyle(.white)
                        .frame(maxWidth: 700, alignment: .leading)
                        .frame(maxWidth: .infinity)
                    }
                }
            }
            .navigationTitle("8-Bit Dark Fantasy")
        }
    }
}

#Preview {
    ContentView()
}
