"use client";

import { useEffect, useMemo, useState } from "react";

import { branchConditions, dialogueNodes, storyActs, storyChapters, storyEndings, storyMissions } from "@/game/data/story";
import { DialogueEngine } from "@/game/systems/dialogue-system";
import { QuestStateMachine, createDefaultQuestProgress, type QuestProgressState } from "@/game/systems/quest-system";
import { clearStorySave, loadStorySave, persistStorySave } from "@/game/systems/story-save";

type StoryTab = "codex" | "active" | "completed" | "affinity";

const cloneQuestState = (state: QuestProgressState): QuestProgressState => ({
  activeMissionIds: [...state.activeMissionIds],
  completedMissionIds: [...state.completedMissionIds],
  failedMissionIds: [...state.failedMissionIds],
  selectedBranches: { ...state.selectedBranches },
  flags: { ...state.flags },
  relationship: { ...state.relationship }
});

export default function StoryHub() {
  const [questState, setQuestState] = useState<QuestProgressState>(createDefaultQuestProgress);
  const [storyLoaded, setStoryLoaded] = useState(false);
  const [storyTab, setStoryTab] = useState<StoryTab>("codex");
  const [dialogueNodeId, setDialogueNodeId] = useState(dialogueNodes[0]?.id ?? "");

  const questMachine = useMemo(() => new QuestStateMachine(storyMissions, questState), [questState]);
  const dialogueEngine = useMemo(() => new DialogueEngine(dialogueNodes, questMachine), [questMachine]);

  const runQuestMutation = (mutation: (machine: QuestStateMachine) => void) => {
    setQuestState((current) => {
      const nextState = cloneQuestState(current);
      const machine = new QuestStateMachine(storyMissions, nextState);
      mutation(machine);
      return nextState;
    });
  };

  const activeMissions = storyMissions.filter((mission) => questMachine.getMissionStatus(mission.id) === "active");
  const completedMissions = storyMissions.filter((mission) => questMachine.getMissionStatus(mission.id) === "completed");
  const failedMissions = storyMissions.filter((mission) => questMachine.getMissionStatus(mission.id) === "failed");
  const availableMissions = storyMissions.filter((mission) => questMachine.getMissionStatus(mission.id) === "available");

  const completedArcs = storyActs.filter((act) => {
    const chapters = storyChapters.filter((chapter) => chapter.actId === act.id);
    const missionIds = chapters.flatMap((chapter) => chapter.missionIds);
    return missionIds.every((missionId) => questState.completedMissionIds.includes(missionId));
  });

  const unlockedConditionIds = branchConditions
    .filter((condition) => questMachine.meetsAll(condition.requirements))
    .map((condition) => condition.id);

  const unlockedEndings = storyEndings.filter((ending) => ending.conditionIds.some((conditionId) => unlockedConditionIds.includes(conditionId)));

  useEffect(() => {
    const save = loadStorySave();
    setQuestState(save.quest);
    setStoryLoaded(true);
  }, []);

  useEffect(() => {
    if (!storyLoaded) {
      return;
    }

    persistStorySave(questState);
  }, [questState, storyLoaded]);

  useEffect(() => {
    if (!storyLoaded) {
      return;
    }

    if (questState.activeMissionIds.length === 0 && questState.completedMissionIds.length === 0) {
      const firstMission = storyMissions[0];
      runQuestMutation((machine) => {
        machine.startMission(firstMission.id);
      });
    }
  }, [storyLoaded, questState.activeMissionIds.length, questState.completedMissionIds.length]);

  const currentDialogueNode = dialogueEngine.getNode(dialogueNodeId);
  const dialogueChoices = currentDialogueNode ? dialogueEngine.getAvailableChoices(dialogueNodeId) : [];

  return (
    <section className="story-hub">
      <header>
        <h2>Story Operations</h2>
        <p>Quest state machine + branching dialogue are now integrated with versioned local save progress.</p>
      </header>

      <div className="story-tabs">
        {([
          ["codex", "Codex"],
          ["active", "Active Missions"],
          ["completed", "Completed Arcs"],
          ["affinity", "Character Affinity"]
        ] as const).map(([id, label]) => (
          <button key={id} type="button" className={storyTab === id ? "active" : ""} onClick={() => setStoryTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {storyTab === "codex" ? (
        <div className="story-panel-grid">
          {storyActs.map((act) => (
            <article key={act.id} className="story-card">
              <h3>{act.title}</h3>
              <p>{act.summary}</p>
            </article>
          ))}
        </div>
      ) : null}

      {storyTab === "active" ? (
        <div className="story-panel-grid">
          {activeMissions.length === 0 ? <p className="story-empty">No active missions yet.</p> : null}
          {activeMissions.map((mission) => (
            <article key={mission.id} className="story-card">
              <h3>{mission.title}</h3>
              <p>{mission.briefing}</p>
              <div className="story-actions-row">
                <button type="button" onClick={() => runQuestMutation((machine) => machine.completeMission(mission.id))}>
                  Mark Complete
                </button>
                <button type="button" onClick={() => runQuestMutation((machine) => machine.failMission(mission.id))}>
                  Trigger Fail State
                </button>
              </div>
              <small>Fail state: {mission.failState}</small>
              {mission.branches ? (
                <div className="story-actions-row">
                  {mission.branches.map((branch) => (
                    <button
                      key={branch.id}
                      type="button"
                      disabled={Boolean(questMachine.getSelectedBranch(mission.id))}
                      onClick={() => runQuestMutation((machine) => machine.chooseBranch(mission.id, branch.id))}
                    >
                      {branch.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </article>
          ))}

          {availableMissions.map((mission) => (
            <article key={mission.id} className="story-card muted">
              <h3>{mission.title}</h3>
              <p>{mission.briefing}</p>
              <button type="button" onClick={() => runQuestMutation((machine) => machine.startMission(mission.id))}>
                Start Mission
              </button>
            </article>
          ))}
        </div>
      ) : null}

      {storyTab === "completed" ? (
        <div className="story-panel-grid">
          {completedArcs.map((arc) => (
            <article key={arc.id} className="story-card">
              <h3>{arc.title}</h3>
              <p>{arc.summary}</p>
            </article>
          ))}
          {completedMissions.map((mission) => (
            <article key={mission.id} className="story-card muted">
              <h3>{mission.title}</h3>
              <p>Completed mission record.</p>
            </article>
          ))}
          {failedMissions.map((mission) => (
            <article key={mission.id} className="story-card warning">
              <h3>{mission.title}</h3>
              <p>Failed: {mission.failState}</p>
            </article>
          ))}
          {unlockedEndings.map((ending) => (
            <article key={ending.id} className="story-card ending">
              <h3>{ending.title}</h3>
              <p>{ending.summary}</p>
            </article>
          ))}
        </div>
      ) : null}

      {storyTab === "affinity" ? (
        <div className="story-panel-grid affinity-grid">
          {Object.entries(questState.relationship).map(([name, value]) => (
            <article key={name} className="story-card">
              <h3>{name.toUpperCase()}</h3>
              <p>Affinity: {value}</p>
            </article>
          ))}
        </div>
      ) : null}

      <section className="dialogue-console">
        <h3>Dialogue Console</h3>
        <div className="story-actions-row">
          {dialogueNodes.map((node) => (
            <button key={node.id} type="button" onClick={() => setDialogueNodeId(node.id)}>
              {node.speaker}
            </button>
          ))}
        </div>
        {currentDialogueNode ? (
          <>
            <p>
              <strong>{currentDialogueNode.speaker}:</strong> {currentDialogueNode.text}
            </p>
            <div className="story-panel-grid">
              {dialogueChoices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  className="choice-button"
                  onClick={() => {
                    runQuestMutation((machine) => {
                      const engine = new DialogueEngine(dialogueNodes, machine);
                      const nextNode = engine.applyChoice(dialogueNodeId, choice.id);
                      if (nextNode) {
                        setDialogueNodeId(nextNode);
                      }
                    });
                  }}
                >
                  {choice.text}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="story-empty">No dialogue node selected.</p>
        )}
      </section>

      <div className="story-actions-row">
        <button
          type="button"
          onClick={() => {
            clearStorySave();
            setQuestState(createDefaultQuestProgress());
          }}
        >
          Reset Story Save
        </button>
      </div>
    </section>
  );
}
