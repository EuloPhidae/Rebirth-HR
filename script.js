const BOARD_COLS = 6;
const BOARD_ROWS = 8;
const BOARD_SIZE = BOARD_COLS * BOARD_ROWS;
const MAX_LEVEL = 5;

const STARTING_TOKENS = 0;
const STARTING_COMPANY_FUNDS = 4;
const SKILL_WORKER_COST = 30;
const SKILL_WORKER_EXCHANGE_TOKEN = 6;
const KPI_TO_ACTION_COST = 10;
const SPECIALIZATION_UNLOCK_AFTER_TASKS = 5;
const TRANSFER_COST = 1;
const gsapApi = window.gsap ?? null;
const interactApi = window.interact ?? null;
const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
let enhancedInteractionsBound = false;

const JOB_FUNCTIONS = ["运营", "行政"];
const DEPARTMENTS = ["运营部", "行政部"];

const TALENT_META = {
  1: { name: "实习生", icon: "☕", colorClass: "rarity-1" },
  2: { name: "应届生", icon: "📘", colorClass: "rarity-2" },
  3: { name: "高级员工", icon: "💡", colorClass: "rarity-3" },
  4: { name: "资深员工", icon: "🧠", colorClass: "rarity-4" },
  5: { name: "专家员工", icon: "👔", colorClass: "rarity-5" }
};

const ROLE_ICONS = {
  "运营": "📊",
  "行政": "📋"
};

const ENTITY_META = {
  talent: TALENT_META,
  pool: {
    1: { name: "人才库", icon: "📦", colorClass: "entity-pool" },
    2: { name: "人才库", icon: "🏷", colorClass: "entity-pool" },
    3: { name: "人才库", icon: "🗂", colorClass: "entity-pool" },
    4: { name: "人才库", icon: "🏛", colorClass: "entity-pool" },
    5: { name: "人才库", icon: "🛰", colorClass: "entity-pool" }
  },
  skillWorker: {
    1: { name: "员工.Skill", icon: "✦", colorClass: "rarity-3" },
    2: { name: "员工.Skill", icon: "✦", colorClass: "rarity-4" },
    3: { name: "员工.Skill", icon: "✦", colorClass: "rarity-5" },
    4: { name: "员工.Skill", icon: "✦", colorClass: "rarity-5" },
    5: { name: "员工.Skill", icon: "✦", colorClass: "rarity-5" }
  },
  lockedTalent: {
    1: { name: "积灰人才", icon: "🔒", colorClass: "entity-locked" },
    2: { name: "积灰人才", icon: "🔒", colorClass: "entity-locked" },
    3: { name: "积灰人才", icon: "🔒", colorClass: "entity-locked" },
    4: { name: "积灰人才", icon: "🔒", colorClass: "entity-locked" },
    5: { name: "积灰人才", icon: "🔒", colorClass: "entity-locked" }
  }
};

const POOL_WEIGHTS = {
  1: { 1: 100 },
  2: { 1: 80, 2: 20 },
  3: { 1: 58, 2: 28, 3: 14 },
  4: { 1: 40, 2: 28, 3: 20, 4: 12 },
  5: { 1: 26, 2: 24, 3: 20, 4: 17, 5: 13 }
};

const TUTORIAL_TASKS = [
  {
    id: "tutorial-1",
    decisionPoints: 1,
    title: "入职培训 1",
    description: "使用 1 点决策点和 1 点公司资金，采购一个 📦人才库，并把它拖进棋盘空格中后提交。",
    rewardText: "奖励：正式获得招聘权限",
    objective: { type: "board_pool_count", count: 1 }
  },
  {
    id: "tutorial-2",
    decisionPoints: 1,
    title: "入职培训 2",
    description: "点击棋盘中的人才库，消耗 1 点决策点招聘 1 名☕实习生，然后提交。",
    rewardText: "奖励：学会基础招聘",
    objective: { type: "talent_level_count", level: 1, count: 1 }
  },
  {
    id: "tutorial-3",
    decisionPoints: 2,
    title: "入职培训 3",
    description: "再点击两次人才库，获得两名☕实习生。别问为什么是合成，这就是设定。将他们合成为 1 名📘应届生后提交。",
    rewardText: "奖励：学会合成晋升",
    objective: { type: "talent_level_count", level: 2, count: 1 }
  },
  {
    id: "tutorial-4",
    decisionPoints: 1,
    title: "入职培训 4",
    description: "把一个可活动的☕实习生拖到被积灰的☕实习生上，完成解锁并合成后提交。",
    rewardText: "奖励：学会解锁格子",
    objective: { type: "unlock_count", count: 1 }
  },
  {
    id: "tutorial-5",
    decisionPoints: 1,
    title: "入职培训 5",
    description: "任选一名员工执行一次裁员，并蒸馏他的工作成果，获得对应等级的 Token，然后提交任务。",
    rewardText: "奖励：学会资源回收",
    objective: { type: "distill_count", count: 1 }
  }
];

const FREEPLAY_TASKS = [
  { id: "task-1", decisionPoints: 5, rewardKpi: 10, objective: { type: "talent_level_count", level: 3, count: 2 } },
  { id: "task-2", decisionPoints: 5, rewardKpi: 14, objective: { type: "talent_level_count", level: 4, count: 1 } },
  { id: "task-3", decisionPoints: 7, rewardKpi: 20, objective: { type: "talent_level_count", level: 5, count: 1 } },
  { id: "task-4", decisionPoints: 6, rewardKpi: 12, objective: { type: "talent_level_count", level: 2, count: 2 } }
];

const state = {
  grid: [],
  stash: [],
  decisionPoints: 0,
  companyFunds: STARTING_COMPANY_FUNDS,
  tokens: STARTING_TOKENS,
  kpi: 0,
  currentTask: null,
  selectedCell: null,
  bubbles: [],
  isGameOver: false,
  tutorialIndex: 0,
  tutorialComplete: false,
  totalUnlockedCells: 0,
  totalDistilled: 0,
  completedFreeplayTasks: 0,
  specializationUnlocked: false,
  pendingSkillWorkerIndex: null,
  pendingTransferIndex: null
};

const boardEl = document.querySelector("#board");
const bubbleLayerEl = document.querySelector("#bubbleLayer");
const decisionPointsEl = document.querySelector("#decisionPoints");
const companyFundsEl = document.querySelector("#companyFunds");
const tokenCountEl = document.querySelector("#tokenCount");
const kpiCountEl = document.querySelector("#kpiCount");
const taskSubtitleEl = document.querySelector("#taskSubtitle");
const taskDescriptionEl = document.querySelector("#taskDescription");
const taskTargetEl = document.querySelector("#taskTarget");
const taskRewardEl = document.querySelector("#taskReward");
const submitTaskButtonEl = document.querySelector("#submitTaskButton");
const stashCountLabelEl = document.querySelector("#stashCountLabel");
const stashListEl = document.querySelector("#stashList");
const stashPanelEl = document.querySelector("#stashPanel");
const poolStorePanelEl = document.querySelector("#poolStorePanel");
const poolStoreListEl = document.querySelector("#poolStoreList");
const shopListEl = document.querySelector("#shopList");
const failureModalEl = document.querySelector("#failureModal");
const restartGameButtonEl = document.querySelector("#restartGameButton");
const introModalEl = document.querySelector("#introModal");
const startGameButtonEl = document.querySelector("#startGameButton");
const specializationModalEl = document.querySelector("#specializationModal");
const closeSpecializationButtonEl = document.querySelector("#closeSpecializationButton");
const skillWorkerModalEl = document.querySelector("#skillWorkerModal");
const skillWorkerModalTextEl = document.querySelector("#skillWorkerModalText");
const confirmSkillWorkerButtonEl = document.querySelector("#confirmSkillWorkerButton");
const cancelSkillWorkerButtonEl = document.querySelector("#cancelSkillWorkerButton");
const transferModalEl = document.querySelector("#transferModal");
const transferModalTextEl = document.querySelector("#transferModalText");
const transferOptionsEl = document.querySelector("#transferOptions");
const cancelTransferButtonEl = document.querySelector("#cancelTransferButton");
const shopModalEl = document.querySelector("#shopModal");
const openShopButtonEl = document.querySelector("#openShopButton");
const closeShopButtonEl = document.querySelector("#closeShopButton");
const winAudio = new Audio("win.mp3");

submitTaskButtonEl.addEventListener("click", () => {
  submitCurrentTask();
});

restartGameButtonEl.addEventListener("click", () => {
  restartGame();
});

startGameButtonEl.addEventListener("click", () => {
  introModalEl.classList.add("hidden");
  introModalEl.setAttribute("aria-hidden", "true");
});

closeSpecializationButtonEl.addEventListener("click", () => {
  showSpecializationModal(false);
});

cancelSkillWorkerButtonEl.addEventListener("click", () => {
  closeSkillWorkerModal();
});

confirmSkillWorkerButtonEl.addEventListener("click", () => {
  confirmSkillWorkerExchange();
});

cancelTransferButtonEl.addEventListener("click", () => {
  closeTransferModal();
});

openShopButtonEl.addEventListener("click", () => {
  shopModalEl.classList.remove("hidden");
  shopModalEl.setAttribute("aria-hidden", "false");
});

closeShopButtonEl.addEventListener("click", () => {
  shopModalEl.classList.add("hidden");
  shopModalEl.setAttribute("aria-hidden", "true");
});

shopModalEl.addEventListener("click", (event) => {
  if (event.target === shopModalEl) {
    shopModalEl.classList.add("hidden");
    shopModalEl.setAttribute("aria-hidden", "true");
  }
});

function createEntityId(type) {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createEntity(type, level, extra = {}) {
  return { id: createEntityId(type), type, level, ...extra };
}

function randomFromList(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomFromWeighted(weights) {
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = Math.random() * total;
  for (const [level, weight] of entries) {
    roll -= weight;
    if (roll <= 0) {
      return Number(level);
    }
  }
  return Number(entries[entries.length - 1][0]);
}

function getRandomJobFunction() {
  return randomFromList(JOB_FUNCTIONS);
}

function getDepartmentName(role) {
  return `${role}部`;
}

function getTalentDisplayName(level, role) {
  return role ? `${role}${TALENT_META[level].name}` : TALENT_META[level].name;
}

function getSkillWorkerExchangeFunds(level) {
  return Math.min(level, 5);
}

function createInitialGrid() {
  const grid = Array.from({ length: BOARD_SIZE }, () =>
    createEntity("lockedTalent", Math.ceil(Math.random() * MAX_LEVEL))
  );
  [20, 21, 26, 27].forEach((index) => {
    grid[index] = null;
  });
  return grid;
}

function indexToPoint(index) {
  return { row: Math.floor(index / BOARD_COLS), col: index % BOARD_COLS };
}

function getDistance(aIndex, bIndex) {
  const a = indexToPoint(aIndex);
  const b = indexToPoint(bIndex);
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function getEmptyIndices() {
  return state.grid.map((entity, index) => (entity ? -1 : index)).filter((index) => index !== -1);
}

function getNearestEmptyIndexToIndex(originIndex) {
  const empties = getEmptyIndices();
  if (empties.length === 0) {
    return -1;
  }
  let bestDistance = Infinity;
  let candidates = [];
  empties.forEach((index) => {
    const distance = getDistance(originIndex, index);
    if (distance < bestDistance) {
      bestDistance = distance;
      candidates = [index];
    } else if (distance === bestDistance) {
      candidates.push(index);
    }
  });
  return randomFromList(candidates);
}

function addLog(message, type = "info") {
  if (type === "warning") {
    console.warn(message);
  } else {
    console.log(message);
  }
}

function clearSelection() {
  state.selectedCell = null;
}

function showFailureModal(visible) {
  failureModalEl.classList.toggle("hidden", !visible);
  failureModalEl.setAttribute("aria-hidden", String(!visible));
  if (visible) {
    animateModalEntrance(failureModalEl);
  }
}

function showSpecializationModal(visible) {
  specializationModalEl.classList.toggle("hidden", !visible);
  specializationModalEl.setAttribute("aria-hidden", String(!visible));
  if (visible) {
    animateModalEntrance(specializationModalEl);
  }
}

function openSkillWorkerModal(index) {
  const entity = state.grid[index];
  if (!entity || entity.type !== "skillWorker") {
    return;
  }
  const exchangeFunds = getSkillWorkerExchangeFunds(entity.level);
  skillWorkerModalTextEl.textContent =
    `将消耗 ${SKILL_WORKER_EXCHANGE_TOKEN} Token，换取 ${exchangeFunds} 点公司资金。` +
    ` 当前是 Lv.${entity.level}，等级越高越划算。`;
  state.pendingSkillWorkerIndex = index;
  skillWorkerModalEl.classList.remove("hidden");
  skillWorkerModalEl.setAttribute("aria-hidden", "false");
  animateModalEntrance(skillWorkerModalEl);
}

function closeSkillWorkerModal() {
  state.pendingSkillWorkerIndex = null;
  skillWorkerModalEl.classList.add("hidden");
  skillWorkerModalEl.setAttribute("aria-hidden", "true");
}

function openTransferModal(index) {
  const entity = state.grid[index];
  if (!entity || entity.type !== "talent" || !state.specializationUnlocked) {
    return;
  }

  state.pendingTransferIndex = index;
  transferModalTextEl.textContent =
    `当前员工是 ${getTalentDisplayName(entity.level, entity.role)}。` +
    ` 选择一个新职能，消耗 ${TRANSFER_COST} 点公司资金完成转岗。`;

  transferOptionsEl.innerHTML = "";
  JOB_FUNCTIONS.filter((role) => role !== entity.role).forEach((role) => {
    const button = document.createElement("button");
    button.className = "shop-item";
    button.innerHTML = `
      <span class="shop-title">${role}转岗</span>
      <span class="shop-cost">${TRANSFER_COST} 资金</span>
      <small class="shop-desc">把当前员工转为 ${role} 职能。</small>
    `;
    button.disabled = state.companyFunds < TRANSFER_COST || state.isGameOver;
    button.addEventListener("click", () => {
      confirmTransferRole(role);
    });
    transferOptionsEl.append(button);
  });

  transferModalEl.classList.remove("hidden");
  transferModalEl.setAttribute("aria-hidden", "false");
  animateModalEntrance(transferModalEl);
}

function closeTransferModal() {
  state.pendingTransferIndex = null;
  transferModalEl.classList.add("hidden");
  transferModalEl.setAttribute("aria-hidden", "true");
  transferOptionsEl.innerHTML = "";
}

function animateCell(index, className = "merge-pop") {
  requestAnimationFrame(() => {
    const cell = boardEl.querySelector(`[data-index="${index}"]`);
    if (!cell) {
      return;
    }
    const card = cell.querySelector(".talent-card");
    if (card && animateWithGsap(card, { scale: 0.82, y: 8 }, {
      scale: 1,
      y: 0,
      duration: 0.24,
      ease: "back.out(1.5)",
      clearProps: "transform"
    })) {
      return;
    }
    cell.classList.remove(className);
    void cell.offsetWidth;
    cell.classList.add(className);
  });
}

function animateWithGsap(target, fromVars, toVars) {
  if (!gsapApi || prefersReducedMotion || !target) {
    return false;
  }
  gsapApi.killTweensOf(target);
  gsapApi.fromTo(target, fromVars, toVars);
  return true;
}

function animateModalEntrance(modalEl) {
  if (!modalEl || modalEl.classList.contains("hidden")) {
    return;
  }
  const panel = modalEl.querySelector(".modal");
  animateWithGsap(modalEl, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: "power2.out" });
  animateWithGsap(panel, {
    opacity: 0,
    y: 24,
    scale: 0.94
  }, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.24,
    ease: "back.out(1.4)",
    clearProps: "transform,opacity"
  });
}

function getEventClientPoint(event) {
  const sourceEvent = event?.relatedEvent ?? event;
  const clientX = sourceEvent?.clientX ?? sourceEvent?.pageX;
  const clientY = sourceEvent?.clientY ?? sourceEvent?.pageY;
  return Number.isFinite(clientX) && Number.isFinite(clientY)
    ? { x: clientX, y: clientY }
    : null;
}

function getDropCellIndexFromPoint(point, draggedEl) {
  if (!point) {
    return null;
  }
  const previousPointerEvents = draggedEl.style.pointerEvents;
  draggedEl.style.pointerEvents = "none";
  const hitCell = document.elementFromPoint(point.x, point.y)?.closest(".cell");
  draggedEl.style.pointerEvents = previousPointerEvents;
  if (!hitCell) {
    return null;
  }
  return Number(hitCell.dataset.index);
}

function initializeEnhancedInteractions() {
  if (!interactApi || enhancedInteractionsBound) {
    return;
  }

  enhancedInteractionsBound = true;
  interactApi(".js-draggable").draggable({
    listeners: {
      start(event) {
        event.target.dataset.dragX = "0";
        event.target.dataset.dragY = "0";
        event.target.classList.add("is-dragging");
      },
      move(event) {
        const x = (Number(event.target.dataset.dragX) || 0) + event.dx;
        const y = (Number(event.target.dataset.dragY) || 0) + event.dy;
        event.target.dataset.dragX = String(x);
        event.target.dataset.dragY = String(y);
        event.target.style.transform = `translate(${x}px, ${y}px)`;
      },
      end(event) {
        const target = event.target;
        const dropIndex = getDropCellIndexFromPoint(getEventClientPoint(event), target);
        target.classList.remove("is-dragging");
        target.style.transform = "";
        target.dataset.dragX = "0";
        target.dataset.dragY = "0";

        if (dropIndex === null) {
          return;
        }

        handleBoardDrop(target.dataset.transfer, dropIndex);
      }
    }
  });
}

function isLockedTalent(entity) {
  return entity?.type === "lockedTalent";
}

function isSelectedTalent() {
  return state.selectedCell !== null && state.grid[state.selectedCell]?.type === "talent";
}

function isSelectedTalentUpgradeable() {
  return isSelectedTalent() && state.grid[state.selectedCell].level < MAX_LEVEL;
}

function getSelectedPool() {
  if (state.selectedCell === null) {
    return null;
  }
  const entity = state.grid[state.selectedCell];
  if (!entity || entity.type !== "pool") {
    return null;
  }
  return { entity, index: state.selectedCell };
}

function getEntityVisualMeta(entity) {
  if (entity.type === "talent") {
    const baseMeta = ENTITY_META.talent[entity.level];
    const roleIcon = entity.role ? ROLE_ICONS[entity.role] : null;
    return {
      ...baseMeta,
      name: getTalentDisplayName(entity.level, entity.role),
      icon: roleIcon || baseMeta.icon
    };
  }

  if (entity.type === "pool") {
    const baseMeta = ENTITY_META.pool[entity.level];
    const roleIcon = entity.role ? ROLE_ICONS[entity.role] : null;
    return {
      ...baseMeta,
      name: entity.role ? `${entity.role}人才库` : baseMeta.name,
      icon: roleIcon || baseMeta.icon
    };
  }

  if (entity.type === "lockedTalent") {
    const baseMeta = ENTITY_META.lockedTalent[entity.level];
    const roleIcon = entity.role ? ROLE_ICONS[entity.role] : null;
    return {
      ...baseMeta,
      name: `积灰${getTalentDisplayName(entity.level, entity.role)}`,
      icon: roleIcon || TALENT_META[entity.level].icon
    };
  }

  return ENTITY_META[entity.type][entity.level];
}

function getTaskProgress(task = state.currentTask) {
  if (!task) {
    return 0;
  }

  const { objective } = task;
  if (objective.type === "board_pool_count") {
    return state.grid.filter((entity) => entity?.type === "pool").length;
  }

  if (objective.type === "talent_level_count") {
    return state.grid.filter((entity) => {
      if (!entity || entity.type !== "talent" || entity.level !== objective.level) {
        return false;
      }
      if (!objective.role) {
        return true;
      }
      return entity.role === objective.role;
    }).length;
  }

  if (objective.type === "unlock_count") {
    return state.totalUnlockedCells;
  }

  if (objective.type === "distill_count") {
    return state.totalDistilled;
  }

  return 0;
}

function isTaskComplete(task = state.currentTask) {
  return !!task && getTaskProgress(task) >= task.objective.count;
}

function getCurrentTaskRewardText() {
  if (!state.currentTask) {
    return "";
  }
  if (state.currentTask.rewardText) {
    return state.currentTask.rewardText;
  }
  return `奖励：${state.currentTask.rewardKpi} KPI`;
}

function assignTutorialTask() {
  state.currentTask = { ...TUTORIAL_TASKS[state.tutorialIndex] };
  state.decisionPoints = state.currentTask.decisionPoints;
  clearSelection();
}

function buildFreeplayTask(baseTask) {
  const objective = { ...baseTask.objective };
  const targetName = TALENT_META[objective.level].name;
  const levelIcon = TALENT_META[objective.level].icon;

  if (state.specializationUnlocked) {
    const role = getRandomJobFunction();
    objective.role = role;
    const roleIcon = ROLE_ICONS[role];
    return {
      ...baseTask,
      department: getDepartmentName(role),
      description: `${getDepartmentName(role)}需要 ${objective.count} 名${roleIcon}${role}${targetName}。`,
      objective
    };
  }

  const department = randomFromList(DEPARTMENTS);
  return {
    ...baseTask,
    department,
    description: `${department}需要 ${objective.count} 名${levelIcon}${targetName}。`,
    objective
  };
}

function assignFreeplayTask() {
  state.currentTask = buildFreeplayTask(randomFromList(FREEPLAY_TASKS));
  state.decisionPoints = state.currentTask.decisionPoints;
  clearSelection();
}

function assignRolesToExistingBoardTalents() {
  state.grid = state.grid.map((entity) => {
    if (!entity) {
      return null;
    }
    if ((entity.type === "talent" || entity.type === "lockedTalent") && !entity.role) {
      return { ...entity, role: getRandomJobFunction() };
    }
    return entity;
  });
}

function convertExistingPoolsToAdminPools() {
  state.grid = state.grid.map((entity) => {
    if (!entity) {
      return null;
    }
    if (entity.type === "pool") {
      return { ...entity, role: "行政" };
    }
    return entity;
  });

  state.stash = state.stash.map((entity) => {
    if (entity.type === "pool") {
      return { ...entity, role: "行政" };
    }
    return entity;
  });
}

function unlockSpecializationSystem() {
  if (state.specializationUnlocked) {
    return;
  }
  state.specializationUnlocked = true;
  assignRolesToExistingBoardTalents();
  convertExistingPoolsToAdminPools();
  addLog("公司扩张完成，职能系统已开启。之后只有同职能、同等级的员工才能合成，任务单也会开始指定职能。");
  showSpecializationModal(true);
}

function finishTutorial() {
  state.tutorialComplete = true;
  addLog("你的入职培训完成了，接下来自己摸索吧。如果没在规定的决策点内完成任务，你就被炒鱿鱼了。");
  assignFreeplayTask();
}

function consumeSubmittedTalents(task) {
  if (task.objective.type !== "talent_level_count") {
    return;
  }

  let remaining = task.objective.count;
  for (let index = 0; index < state.grid.length && remaining > 0; index += 1) {
    const entity = state.grid[index];
    if (!entity || entity.type !== "talent" || entity.level !== task.objective.level) {
      continue;
    }
    if (task.objective.role && entity.role !== task.objective.role) {
      continue;
    }
    state.grid[index] = null;
    remaining -= 1;
  }
}

function playWinSound() {
  winAudio.currentTime = 0;
  winAudio.play().catch(() => {});
}

function submitCurrentTask() {
  if (!isTaskComplete()) {
    addLog("当前任务还没有达标，暂时不能提交。", "warning");
    return;
  }

  consumeSubmittedTalents(state.currentTask);
  playWinSound();

  if (!state.tutorialComplete) {
    addLog(`${state.currentTask.title} 已完成。`);
    state.tutorialIndex += 1;
    if (state.tutorialIndex >= TUTORIAL_TASKS.length) {
      finishTutorial();
    } else {
      assignTutorialTask();
    }
    render();
    return;
  }

  state.kpi += state.currentTask.rewardKpi;
  addLog(`需求提交成功，KPI +${state.currentTask.rewardKpi}。`);
  state.completedFreeplayTasks += 1;
  if (!state.specializationUnlocked && state.completedFreeplayTasks >= SPECIALIZATION_UNLOCK_AFTER_TASKS) {
    unlockSpecializationSystem();
  }
  assignFreeplayTask();
  render();
}

function triggerGameOver() {
  if (state.isGameOver || isTaskComplete()) {
    return;
  }
  state.isGameOver = true;
  addLog("决策点已经耗尽，任务仍未完成。你被开除了。", "warning");
  showFailureModal(true);
  render();
}

function spendDecisionPoint(amount, reason) {
  if (state.isGameOver) {
    return false;
  }
  if (state.decisionPoints < amount) {
    addLog(`决策点不足，无法执行：${reason}。`, "warning");
    if (state.decisionPoints <= 0 && !isTaskComplete()) {
      triggerGameOver();
    }
    return false;
  }
  state.decisionPoints -= amount;
  return true;
}

function spendCompanyFunds(amount, reason) {
  if (state.companyFunds < amount) {
    addLog(`公司资金不足，无法执行：${reason}。`, "warning");
    return false;
  }
  state.companyFunds -= amount;
  return true;
}

function getDecomposeReward(level) {
  return level * level + level * 2;
}

function confirmSkillWorkerExchange() {
  const index = state.pendingSkillWorkerIndex;
  const entity = index === null ? null : state.grid[index];
  if (!entity || entity.type !== "skillWorker") {
    closeSkillWorkerModal();
    return;
  }

  const exchangeFunds = getSkillWorkerExchangeFunds(entity.level);
  if (state.tokens < SKILL_WORKER_EXCHANGE_TOKEN) {
    addLog(`Token 不足，员工.Skill 需要 ${SKILL_WORKER_EXCHANGE_TOKEN} Token 才能换取公司资金。`, "warning");
    closeSkillWorkerModal();
    return;
  }

  state.tokens -= SKILL_WORKER_EXCHANGE_TOKEN;
  state.companyFunds += exchangeFunds;
  state.grid[index] = null;
  clearSelection();
  addLog(`员工.Skill 完成协助，消耗 ${SKILL_WORKER_EXCHANGE_TOKEN} Token，换取 ${exchangeFunds} 点公司资金。`);
  closeSkillWorkerModal();
  render();
  animateCell(index);
}

function confirmTransferRole(role) {
  const index = state.pendingTransferIndex;
  const entity = index === null ? null : state.grid[index];
  if (!entity || entity.type !== "talent") {
    closeTransferModal();
    return;
  }
  if (entity.role === role) {
    addLog("该员工已经是这个职能了。", "warning");
    closeTransferModal();
    return;
  }
  if (!spendCompanyFunds(TRANSFER_COST, "员工转岗")) {
    render();
    return;
  }

  state.grid[index] = { ...entity, role };
  addLog(`${TALENT_META[entity.level].name} 已转岗为 ${getTalentDisplayName(entity.level, role)}。`);
  closeTransferModal();
  render();
  animateCell(index);
}

const SHOP_ITEMS = [
  {
    id: "buy-pool",
    name: "采购人才库",
    costLabel: "1 决策点 + 1 资金",
    description: "采购一个 1 级人才库，放入暂存区后可拖进棋盘。",
    isDisabled: () => state.specializationUnlocked || state.decisionPoints < 1 || state.companyFunds < 1 || state.isGameOver,
    use: () => {
      if (!spendDecisionPoint(1, "采购人才库")) {
        render();
        return;
      }
      if (!spendCompanyFunds(1, "采购人才库")) {
        state.decisionPoints += 1;
        render();
        return;
      }
      state.stash.push(createEntity("pool", 1));
      addLog("1 级人才库已加入暂存区。");
      render();
    }
  },
  {
    id: "promote",
    name: "内推",
    costLabel: "1 决策点 + 1 资金",
    description: "让当前选中的人才立即提升 1 级。",
    isDisabled: () => !isSelectedTalentUpgradeable() || state.decisionPoints < 1 || state.companyFunds < 1 || state.isGameOver,
    use: () => {
      if (!isSelectedTalentUpgradeable()) {
        return;
      }
      if (!spendDecisionPoint(1, "内推")) {
        render();
        return;
      }
      if (!spendCompanyFunds(1, "内推")) {
        state.decisionPoints += 1;
        render();
        return;
      }
      const index = state.selectedCell;
      const entity = state.grid[index];
      state.grid[index] = createEntity("talent", entity.level + 1, entity.role ? { role: entity.role } : {});
      addLog(`内推成功，${getTalentDisplayName(state.grid[index].level, state.grid[index].role)} 已到岗。`);
      render();
      animateCell(index);
      maybeSpawnBubble(state.grid[index].level);
    }
  },
  {
    id: "distill",
    name: "裁员并蒸馏",
    costLabel: "选择员工",
    description: "把当前选中的员工扔回人才库。把他的工作成果蒸馏成 Token。",
    isDisabled: () => !isSelectedTalent() || state.isGameOver,
    use: () => {
      if (!isSelectedTalent()) {
        return;
      }
      const index = state.selectedCell;
      const entity = state.grid[index];
      const reward = getDecomposeReward(entity.level);
      state.tokens += reward;
      state.totalDistilled += 1;
      state.grid[index] = null;
      clearSelection();
      addLog(`蒸馏完成，${getTalentDisplayName(entity.level, entity.role)} 被转化为 ${reward} Token。`);
      render();
    }
  },
  {
    id: "buy-skill-worker",
    name: "员工.Skill",
    costLabel: `${SKILL_WORKER_COST} Token`,
    description: "购买后放入棋盘，双击并消耗 Token 可换取公司资金。",
    isDisabled: () => state.tokens < SKILL_WORKER_COST || state.isGameOver,
    use: () => {
      if (state.tokens < SKILL_WORKER_COST) {
        addLog(`Token 不足，员工.Skill 需要 ${SKILL_WORKER_COST} Token。`, "warning");
        return;
      }
      state.tokens -= SKILL_WORKER_COST;
      state.stash.push(createEntity("skillWorker", 1));
      addLog("员工.Skill 已加入暂存区。");
      render();
    }
  },
  {
    id: "kpi-to-action",
    name: "KPI 换行动点",
    costLabel: `${KPI_TO_ACTION_COST} KPI`,
    description: "牺牲 10 个 KPI，换取 1 个行动点。",
    isDisabled: () => state.kpi < KPI_TO_ACTION_COST || state.isGameOver,
    use: () => {
      if (state.kpi < KPI_TO_ACTION_COST) {
        addLog(`KPI 不足，需要 ${KPI_TO_ACTION_COST} KPI。`, "warning");
        return;
      }
      state.kpi -= KPI_TO_ACTION_COST;
      state.decisionPoints += 1;
      addLog(`你牺牲了 ${KPI_TO_ACTION_COST} KPI，换得 1 个行动点。`);
      render();
    }
  }
];

const SPECIALIZED_POOL_ITEMS = JOB_FUNCTIONS.map((role) => ({
  id: `buy-pool-${role}`,
  name: `${role}人才库`,
  costLabel: "1 决策点 + 1 资金",
  description: `采购一个 1 级${role}人才库，放入暂存区后可稳定产出${role}人才。`,
  isDisabled: () => !state.specializationUnlocked || state.decisionPoints < 1 || state.companyFunds < 1 || state.isGameOver,
  use: () => {
    if (!spendDecisionPoint(1, `采购${role}人才库`)) {
      render();
      return;
    }
    if (!spendCompanyFunds(1, `采购${role}人才库`)) {
      state.decisionPoints += 1;
      render();
      return;
    }
    state.stash.push(createEntity("pool", 1, { role }));
    addLog(`${role}人才库已加入暂存区，拖进棋盘后即可稳定生产对应职能人才。`);
    render();
  }
}));

function recruitFromSelectedPool() {
  const selectedPool = getSelectedPool();
  if (!selectedPool) {
    return;
  }
  if (!spendDecisionPoint(1, "人才库招募")) {
    render();
    return;
  }

  const spawnIndex = getNearestEmptyIndexToIndex(selectedPool.index);
  if (spawnIndex === -1) {
    state.decisionPoints += 1;
    addLog("棋盘没有空位，无法继续招募。", "warning");
    render();
    return;
  }

  const level = randomFromWeighted(POOL_WEIGHTS[selectedPool.entity.level]);
  const role = state.specializationUnlocked ? (selectedPool.entity.role || "行政") : undefined;
  state.grid[spawnIndex] = createEntity("talent", level, role ? { role } : {});
  addLog(`人才库 Lv.${selectedPool.entity.level} 招募到 ${getTalentDisplayName(level, role)}。`);
  render();
  animateCell(selectedPool.index);
  animateCell(spawnIndex);
}

function canMergeEntities(source, target) {
  if (!source || !target) {
    return false;
  }
  if (source.type !== target.type || source.level !== target.level || source.level >= MAX_LEVEL) {
    return false;
  }
  if (source.type === "talent" && state.specializationUnlocked && source.role !== target.role) {
    return false;
  }
  if (source.type === "pool" && state.specializationUnlocked && (source.role || "行政") !== (target.role || "行政")) {
    return false;
  }
  return true;
}

function mergeEntities(fromIndex, toIndex) {
  const source = state.grid[fromIndex];
  const target = state.grid[toIndex];
  if (!canMergeEntities(source, target)) {
    return false;
  }

  const nextLevel = source.level + 1;
  const extra = source.type === "talent" && source.role ? { role: source.role } : {};
  const poolExtra = source.type === "pool" && source.role ? { role: source.role } : {};
  state.grid[fromIndex] = null;
  state.grid[toIndex] = createEntity(source.type, nextLevel, source.type === "pool" ? poolExtra : extra);

  if (source.type === "pool") {
    addLog(`人才库合成成功，获得 Lv.${nextLevel}${source.role ? `${source.role}` : ""}人才库。`);
  } else if (source.type === "skillWorker") {
    addLog(`员工.Skill 合成成功，获得 Lv.${nextLevel}。`);
  } else {
    addLog(`合成成功，获得 ${getTalentDisplayName(nextLevel, source.role)}。`);
    maybeSpawnBubble(nextLevel);
  }

  state.selectedCell = toIndex;
  render();
  animateCell(toIndex);
  return true;
}

function unlockLockedCell(fromIndex, toIndex) {
  const source = state.grid[fromIndex];
  const target = state.grid[toIndex];
  if (!source || !target || source.type !== "talent" || target.type !== "lockedTalent") {
    return false;
  }
  if (source.level !== target.level || source.level >= MAX_LEVEL) {
    addLog("积灰格只接受同等级人才来解锁。", "warning");
    return false;
  }
  if (state.specializationUnlocked && source.role !== target.role) {
    addLog("积灰格在第二阶段也需要同职能人才来解锁。", "warning");
    return false;
  }

  const nextLevel = source.level + 1;
  const extra = source.role ? { role: source.role } : {};
  state.grid[fromIndex] = null;
  state.grid[toIndex] = createEntity("talent", nextLevel, extra);
  state.totalUnlockedCells += 1;
  state.selectedCell = toIndex;
  addLog(`积灰格已解锁，并合成出 ${getTalentDisplayName(nextLevel, source.role)}。`);
  render();
  animateCell(toIndex);
  maybeSpawnBubble(nextLevel);
  return true;
}

function moveEntity(fromIndex, toIndex) {
  state.grid[toIndex] = state.grid[fromIndex];
  state.grid[fromIndex] = null;
  state.selectedCell = toIndex;
  render();
}

function maybeSpawnBubble(level) {
  if (level < 3 || Math.random() > 0.1) {
    return;
  }
  state.bubbles.push({
    id: createEntityId("bubble"),
    level,
    cost: level * 3,
    secondsLeft: 10,
    left: 8 + Math.random() * 78,
    top: 10 + Math.random() * 68,
    hasAnimated: false
  });
  renderBubbles();
}

function purchaseBubble(id) {
  const bubble = state.bubbles.find((item) => item.id === id);
  if (!bubble) {
    return;
  }
  if (state.tokens < bubble.cost) {
    addLog(`Token 不足，泡泡人才需要 ${bubble.cost} Token。`, "warning");
    return;
  }
  const emptyIndex = randomFromList(getEmptyIndices());
  if (emptyIndex === undefined) {
    addLog("棋盘没有空格，泡泡人才无处安置。", "warning");
    return;
  }
  state.tokens -= bubble.cost;
  const role = state.specializationUnlocked ? getRandomJobFunction() : undefined;
  state.grid[emptyIndex] = createEntity("talent", bubble.level, role ? { role } : {});
  state.bubbles = state.bubbles.filter((item) => item.id !== id);
  addLog(`泡泡人才入职成功：${getTalentDisplayName(bubble.level, role)}。`);
  render();
  animateCell(emptyIndex);
}

function tickBubbles() {
  let changed = false;
  state.bubbles = state.bubbles.filter((bubble) => {
    bubble.secondsLeft -= 1;
    if (bubble.secondsLeft <= 0) {
      addLog("一个泡泡人才消散了。", "warning");
      changed = true;
      return false;
    }
    changed = true;
    return true;
  });
  if (changed) {
    renderBubbles();
  }
}

function handleCellClick(index) {
  if (state.isGameOver) {
    return;
  }

  const entity = state.grid[index];
  if (!entity) {
    clearSelection();
    renderBoard();
    renderShop();
    return;
  }

  if (isLockedTalent(entity)) {
    addLog(`这里是 ${getEntityVisualMeta(entity).name}，需要拖入同等级员工来解锁。`);
    return;
  }

  if (state.selectedCell === null) {
    state.selectedCell = index;
    renderBoard();
    renderShop();
    return;
  }

  if (state.selectedCell === index) {
    if (entity.type === "pool") {
      recruitFromSelectedPool();
      return;
    }
    if (entity.type === "skillWorker") {
      addLog("双击 员工.Skill 可以弹出确认框，用 Token 换取公司资金。");
      return;
    }
    if (entity.type === "talent" && state.specializationUnlocked) {
      addLog("双击员工可以打开转岗窗口，消耗公司资金更换职能。");
      return;
    }
    renderBoard();
    renderShop();
    return;
  }

  const merged = mergeEntities(state.selectedCell, index);
  if (!merged) {
    state.selectedCell = index;
    renderBoard();
    renderShop();
  }
}

function handleBoardDrop(rawData, toIndex) {
  if (state.isGameOver || !rawData) {
    return;
  }

  if (rawData.startsWith("stash:")) {
    const stashId = rawData.slice(6);
    if (state.grid[toIndex]) {
      addLog("只能把暂存区资产拖到空格里。", "warning");
      return;
    }
    const stashIndex = state.stash.findIndex((entity) => entity.id === stashId);
    if (stashIndex === -1) {
      return;
    }
    state.grid[toIndex] = state.stash.splice(stashIndex, 1)[0];
    addLog(`${getEntityVisualMeta(state.grid[toIndex]).name} 已部署进棋盘。`);
    render();
    animateCell(toIndex);
    return;
  }

  if (!rawData.startsWith("cell:")) {
    return;
  }

  const fromIndex = Number(rawData.slice(5));
  if (fromIndex === toIndex || !state.grid[fromIndex]) {
    return;
  }

  if (!state.grid[toIndex]) {
    moveEntity(fromIndex, toIndex);
    return;
  }
  if (isLockedTalent(state.grid[toIndex])) {
    unlockLockedCell(fromIndex, toIndex);
    return;
  }
  mergeEntities(fromIndex, toIndex);
}

function getEntityLabel(entity) {
  const meta = getEntityVisualMeta(entity);
  return `${meta.name} Lv.${entity.level}`;
}

function renderBoard() {
  boardEl.innerHTML = "";
  state.grid.forEach((entity, index) => {
    const cell = document.createElement("button");
    cell.className = `cell ${entity ? "" : "empty"} ${state.selectedCell === index ? "selected" : ""}`;
    cell.dataset.index = String(index);
    cell.addEventListener("click", () => handleCellClick(index));
    cell.addEventListener("dblclick", () => {
      if (state.grid[index]?.type === "skillWorker") {
        openSkillWorkerModal(index);
      } else if (state.grid[index]?.type === "talent" && state.specializationUnlocked) {
        openTransferModal(index);
      }
    });
    cell.addEventListener("dragover", (event) => {
      event.preventDefault();
      cell.classList.add("merge-target");
    });
    cell.addEventListener("dragleave", () => {
      cell.classList.remove("merge-target");
    });
    cell.addEventListener("drop", (event) => {
      event.preventDefault();
      cell.classList.remove("merge-target");
      handleBoardDrop(event.dataTransfer.getData("text/plain"), index);
    });

    if (entity) {
      const meta = getEntityVisualMeta(entity);
      const card = document.createElement("div");
      const isMovable = entity.type !== "lockedTalent";
      card.className = `talent-card ${meta.colorClass} ${entity.type === "skillWorker" ? "skill-worker-card" : ""} ${isMovable && interactApi ? "js-draggable" : ""}`;
      card.draggable = isMovable && !interactApi;
      if (isMovable) {
        card.dataset.transfer = `cell:${index}`;
      }
      if (isMovable && !interactApi) {
        card.addEventListener("dragstart", (event) => {
          event.dataTransfer.setData("text/plain", `cell:${index}`);
        });
      }
      card.innerHTML = `
        <div class="talent-icon">${meta.icon}</div>
        <div class="talent-name">${meta.name}</div>
        <div class="talent-level">Lv.${entity.level}</div>
      `;
      cell.append(card);
      cell.title = entity.type === "talent" && state.specializationUnlocked
        ? `${getEntityLabel(entity)}，双击可转岗`
        : getEntityLabel(entity);
    }

    boardEl.append(cell);
  });
}

function renderTask() {
  if (!state.currentTask) {
    return;
  }
  const objective = state.currentTask.objective;
  const levelIcon = TALENT_META[objective.level]?.icon || "";
  const roleIcon = objective.role ? ROLE_ICONS[objective.role] : "";
  
  taskSubtitleEl.textContent =
    !state.tutorialComplete && state.currentTask.id.startsWith("tutorial-")
      ? `入职培训 · ${state.currentTask.title}`
      : "";
  taskDescriptionEl.textContent = state.currentTask.description;
  taskTargetEl.textContent = `任务进度：${getTaskProgress()} / ${objective.count} ${roleIcon}${levelIcon}`;
  taskRewardEl.textContent = getCurrentTaskRewardText();
  submitTaskButtonEl.disabled = !isTaskComplete() || state.isGameOver;
}

function renderStash() {
  stashCountLabelEl.textContent = `${state.stash.length} 个`;
  stashPanelEl.classList.toggle("stash-pending", state.stash.length > 0);
  stashListEl.innerHTML = "";
  if (state.stash.length === 0) {
    stashListEl.innerHTML = `<div class="small-text">暂无待部署资产。</div>`;
    return;
  }

  state.stash.forEach((entity) => {
    const meta = getEntityVisualMeta(entity);
    const item = document.createElement("button");
    item.className = `stash-item ${interactApi ? "js-draggable" : ""}`;
    item.draggable = !interactApi;
    item.dataset.transfer = `stash:${entity.id}`;
    item.textContent = `${meta.icon} ${meta.name} Lv.${entity.level}`;
    if (!interactApi) {
      item.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", `stash:${entity.id}`);
      });
    }
    stashListEl.append(item);
  });
}

function renderShop() {
  shopListEl.innerHTML = "";
  const template = document.querySelector("#shopItemTemplate");
  const selectedTalent = isSelectedTalent() ? state.grid[state.selectedCell] : null;

  SHOP_ITEMS.forEach((item) => {
    const button = template.content.firstElementChild.cloneNode(true);
    let costText = item.costLabel;
    let descText = item.description;

    if (item.id === "distill" && selectedTalent) {
      costText = `返还 ${getDecomposeReward(selectedTalent.level)} Token`;
      descText = `蒸馏当前选中的 ${getTalentDisplayName(selectedTalent.level, selectedTalent.role)}，返还 ${getDecomposeReward(selectedTalent.level)} Token。`;
    }

    button.querySelector(".shop-title").textContent = item.name;
    button.querySelector(".shop-cost").textContent = costText;
    button.querySelector(".shop-desc").textContent = descText;
    button.disabled = item.isDisabled();
    button.addEventListener("click", () => item.use());
    shopListEl.append(button);
  });
}

function renderPoolStore() {
  poolStorePanelEl.classList.toggle("hidden", !state.specializationUnlocked);
  poolStorePanelEl.setAttribute("aria-hidden", String(!state.specializationUnlocked));
  poolStoreListEl.innerHTML = "";
  if (!state.specializationUnlocked) {
    return;
  }

  const template = document.querySelector("#shopItemTemplate");
  SPECIALIZED_POOL_ITEMS.forEach((item) => {
    const button = template.content.firstElementChild.cloneNode(true);
    button.querySelector(".shop-title").textContent = item.name;
    button.querySelector(".shop-cost").textContent = item.costLabel;
    button.querySelector(".shop-desc").textContent = item.description;
    button.disabled = item.isDisabled();
    button.addEventListener("click", () => item.use());
    poolStoreListEl.append(button);
  });
}

function renderResources() {
  decisionPointsEl.textContent = String(state.decisionPoints);
  companyFundsEl.textContent = String(state.companyFunds);
  tokenCountEl.textContent = String(state.tokens);
  kpiCountEl.textContent = String(state.kpi);
}

function renderBubbles() {
  bubbleLayerEl.innerHTML = "";
  state.bubbles.forEach((bubble) => {
    const el = document.createElement("button");
    el.className = "bubble";
    el.style.left = `${bubble.left}%`;
    el.style.top = `${bubble.top}%`;
    el.innerHTML = `
      <strong>泡泡人才</strong>
      <span>${TALENT_META[bubble.level].name}</span>
      <span>${bubble.cost} Token</span>
      <span>${bubble.secondsLeft}s</span>
    `;
    el.addEventListener("click", () => purchaseBubble(bubble.id));
    bubbleLayerEl.append(el);
    if (!bubble.hasAnimated) {
      animateWithGsap(el, {
        opacity: 0,
        y: 16,
        scale: 0.9
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.22,
        ease: "back.out(1.3)",
        clearProps: "transform,opacity"
      });
      bubble.hasAnimated = true;
    }
  });
}

function render() {
  renderResources();
  renderTask();
  renderStash();
  renderPoolStore();
  renderBoard();
  renderShop();
  renderBubbles();
}

function restartGame() {
  state.grid = createInitialGrid();
  state.stash = [];
  state.decisionPoints = 0;
  state.companyFunds = STARTING_COMPANY_FUNDS;
  state.tokens = STARTING_TOKENS;
  state.kpi = 0;
  state.currentTask = null;
  state.selectedCell = null;
  state.bubbles = [];
  state.isGameOver = false;
  state.tutorialIndex = 0;
  state.tutorialComplete = false;
  state.totalUnlockedCells = 0;
  state.totalDistilled = 0;
  state.completedFreeplayTasks = 0;
  state.specializationUnlocked = false;
  state.pendingSkillWorkerIndex = null;
  state.pendingTransferIndex = null;

  assignTutorialTask();
  showFailureModal(false);
  showSpecializationModal(false);
  closeSkillWorkerModal();
  closeTransferModal();
  addLog("你重生了，这一世你再次入职成功。新的培训任务已经发到你的桌上。");
  render();
}

initializeEnhancedInteractions();
restartGame();
window.setInterval(tickBubbles, 1000);
