const BOARD_COLS = 6;
const BOARD_ROWS = 8;
const BOARD_SIZE = BOARD_COLS * BOARD_ROWS;
const MAX_LEVEL = 5;

const STARTING_TOKENS = 0;
const STARTING_COMPANY_FUNDS = 4;
const SKILL_WORKER_COST = 30;
const SKILL_WORKER_EXCHANGE_TOKEN = 6;
const KPI_TO_ACTION_COST = 10;
const SPECIALIZATION_UNLOCK_AFTER_TASKS = 2;
const TRANSFER_COST = 1;
const POOL_COOLDOWN_MS = 200;
const gsapApi = window.gsap ?? null;
const interactApi = window.interact ?? null;
const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
let enhancedInteractionsBound = false;

const JOB_FUNCTIONS = ["运营", "行政"];
const DEPARTMENTS = ["运营部", "行政部"];
const NEW_JOB_FUNCTIONS = ["财务", "设计"];
const NEW_DEPARTMENTS = ["财务部", "设计部"];

const TALENT_META = {
  1: { name: "实习生", icon: "☕", colorClass: "rarity-1" },
  2: { name: "应届生", icon: "📘", colorClass: "rarity-2" },
  3: { name: "高级员工", icon: "💡", colorClass: "rarity-3" },
  4: { name: "资深员工", icon: "🧠", colorClass: "rarity-4" },
  5: { name: "专家员工", icon: "👔", colorClass: "rarity-5" }
};

const ROLE_ICONS = {
  "运营": "📊",
  "行政": "📋",
  "财务": "💰",
  "设计": "🎨"
};

Object.assign(TALENT_META, {
  1: { ...TALENT_META[1], name: "实习生", icon: "🧑 💻" },
  2: { ...TALENT_META[2], name: "应届生", icon: "👨 💻" },
  3: { ...TALENT_META[3], name: "高级员工", icon: "👨‍💻 💻" },
  4: { ...TALENT_META[4], name: "资深员工", icon: "👨‍💼 💻" },
  5: { ...TALENT_META[5], name: "专家员工", icon: "👨‍🦳 💻" }
});

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
  }
};

const POOL_WEIGHTS = {
  1: { 1: 100 },
  2: { 1: 80, 2: 20 },
  3: { 1: 58, 2: 28, 3: 14 },
  4: { 1: 40, 2: 28, 3: 20, 4: 12 },
  5: { 1: 26, 2: 24, 3: 20, 4: 17, 5: 13 }
};

const CAR_SHOP_ITEMS = [
  { id: "maybach", name: "迈巴赫", emoji: "🚗", price: 19 },
  { id: "porsche", name: "保时捷", emoji: "🏎️", price: 30 },
  { id: "ferrari", name: "法拉利", emoji: "🚙", price: 40 },
  { id: "bentley", name: "宾利", emoji: "🚕", price: 50 }
];

const MODEL_SHOP_ITEMS = [
  { id: "model-1", name: "小美", emoji: "💃", price: 15 },
  { id: "model-2", name: "丽丽", emoji: "👩‍🦰", price: 20 },
  { id: "model-3", name: "安琪", emoji: "👸", price: 25 },
  { id: "model-4", name: "梦梦", emoji: "🧝‍♀️", price: 30 }
];

const OBEDIENCE_TRAINING_TASKS = [
  {
    id: "obedience-1",
    decisionPoints: 99,
    title: "服从训练 1 - 老板的迈巴赫",
    description: "🦹‍♂️高层管理：公司资金已经够了！\n老板一直想要一辆迈巴赫。\n打开4S店，帮老板买一辆迈巴赫吧！\n只需要19个公司资金！",
    rewardText: "奖励：老板的满意",
    rewardKpi: 15,
    objective: { type: "buy_car", carId: "maybach", count: 1 }
  },
  {
    id: "obedience-2",
    decisionPoints: 99,
    title: "服从训练 2 - 老板的嫩模",
    description: "🦹‍♂️高层管理：老板又有了新的需求。\n他想要一个嫩模。\n打开嫩模商店，召唤一个给老板吧！",
    rewardText: "奖励：老板的欢心",
    rewardKpi: 15,
    objective: { type: "buy_model", count: 1 }
  },
  {
    id: "obedience-3",
    decisionPoints: 99,
    title: "服从训练 3 - 新的权限",
    description: "🦹‍♂️高层管理：公司对你越来越信任了！\n给你开放了财务部和设计部的员工权限！\n棋盘也全部开放了！\n从技能商店购买一个财务部人才库和一个设计部人才库吧！",
    rewardText: "奖励：更多权力",
    rewardKpi: 20,
    objective: { type: "buy_new_role_pool", count: 2 }
  }
];

const TUTORIAL_TASKS = [
  {
    id: "tutorial-1",
    decisionPoints: 1,
    title: "入职培训 1 - 部署人才库 ",
    description: "🦹‍♂️高层管理：看到我们暂存区的📦人才库没有。\n 你只需要点击它就能完成今天的培训任务。",
    rewardText: "奖励：职业技巧与你的个人成长",
    objective: { type: "board_pool_count", count: 1 }
  },
  {
    id: "tutorial-2",
    decisionPoints: 1,
    title: "入职培训 2 - 学习招聘",
    description: "🦹‍♂️高层管理：点击棋盘中的人才库📦，进行一次招聘，每次招聘会消耗一个决策点。\n你必须在我们限制的决策点内完成任务，否则你就是名不称职的员工。 ",
    rewardText: "奖励：职业技巧与你的个人成长",
    objective: { type: "talent_level_count", level: 1, count: 1 }
  },
  {
    id: "tutorial-3",
    decisionPoints: 2,
    title: "入职培训 3 - 合成员工",
    description: "🦹‍♂️高层管理：再点击两次人才库，招聘到两名新实习的新员工。然后拖动其中一个到另一个人身上进行合成。\n别问为什么是合成，这就是我们公司对人才培养的设定。\n 将他们合成为 1 名应届生后提交。",
    rewardText: "奖励：职业技巧与你的个人成长",
    objective: { type: "talent_level_count", level: 2, count: 1 }
  },
  {
    id: "tutorial-5",
    decisionPoints: 1,
    title: "入职培训 5",
    description: "🦹‍♂️高层管理：公司的人员真是太臃肿了，这得花不少钱！\n你今天的任务是，任选一名员工执行一次裁员，把该员工拖动到裁员区即可。\n记住无论他们怎么求情也没用，你可是我花钱招聘来的员工。\n不想在这里上班尽管不服从安排。\n毕竟不你不干有的是人干。",
    rewardText: "奖励：职业技巧与你的个人成长",
    objective: { type: "distill_count", count: 1 }
  }
];

const FREEPLAY_TASKS = [
  { id: "task-1", decisionPoints: 8, rewardKpi: 10, objective: { type: "talent_level_count", level: 3, count: 2 } },
  { id: "task-2", decisionPoints: 12, rewardKpi: 14, objective: { type: "talent_level_count", level: 4, count: 1 } },
  { id: "task-3", decisionPoints: 16, rewardKpi: 20, objective: { type: "talent_level_count", level: 5, count: 1 } },
  { id: "task-4", decisionPoints: 6, rewardKpi: 12, objective: { type: "talent_level_count", level: 2, count: 2 } }
];

const BUSINESS_TRAINING_TASKS = [
  {
    id: "business-1",
    decisionPoints: 1,
    title: "业务培训 1",
    description: "🦹‍♂️高层管理：今天培训的内容很简单。点击暂存区的人才库，部署到棋盘格。然后合成人才库。你的任务就结束了。",
    rewardText: "奖励：职业技巧与你的个人成长",
    rewardKpi: 12,
    objective: { type: "merge_infp_count", count: 1 }
  },
  {
    id: "business-2",
    decisionPoints: 3,
    title: "业务培训 2",
    description: "🦹‍♂️高层管理：infp员工真是令人讨厌，他们自己的想法太多了。我最讨厌这样的员工了，真恨不得把他们统统分解掉。不过等他们等级高了，再分解会更具性价比。\n今天你会招聘到俩个infp员工，他们只能内部合成，简直是降低我们公司的效率。\n把这俩个人合成在一起！",
    rewardText: "奖励：职业技巧与你的个人成长",
    rewardKpi: 12,
    objective: { type: "merge_infp_count", count: 1 }
  },
  {
    id: "business-3",
    decisionPoints: 1,
    title: "业务培训 3",
    description: "🦹‍♂️高层管理：我们发放的决策点是绝对够用的，由于你的工作失误肯定会有决策点不足的时候。\n我会大发慈悲给你补救的机会。看到左上角的技能商店没有，点开使用一次用Kpi兑换决策点。\n我们公司还是太有良心了。",
    rewardText: "奖励：职业技巧与你的个人成长",
    rewardKpi: 12,
    objective: { type: "exchange_action", count: 1 }
  }
];

const BUSINESS_TRAINING_TASKS_2 = [
  {
    id: "business2-1",
    decisionPoints: 2,
    title: "业务培训 2-1",
    description: "🦹‍♂️高层管理：我大发慈悲的给你开放了新权限。\n现在你可以看到员工开始区分部门了。\n今后你要根据部门进行区分招聘。\n看到左上角的技能商店没有，购买一个运营人才库。\n然后放入棋盘格，你今天就可以下班了。",
    rewardText: "奖励：职业技巧与你的个人成长",
    rewardKpi: 12,
    objective: { type: "buy_role_pool", role: "运营", count: 1 }
  },
  {
    id: "business2-2",
    decisionPoints: 3,
    title: "业务培训 2-2",
    description: "🦹‍♂️高层管理：我发现了一种特别好用的员工。\n他们不仅不需要购买五险一金，还不会生病请假。\n只要给他们足够的token就能无限干活。\n你从左上角的技能商店帮我兑换一个这样的员工。\n你问我，Token不够怎么办？\n分解掉一些老员工，优先干掉那些不听话的infp员工！",
    rewardText: "奖励：职业技巧与你的个人成长",
    rewardKpi: 12,
    objective: { type: "board_skill_worker_count", count: 1 }
  },
  {
    id: "business2-3",
    decisionPoints: 3,
    title: "业务培训 2-3",
    description: "🦹‍♂️高层管理：现在你有了员工.Skill。\n双击它，消耗Token兑换公司资金。\n如果Token不足，你需要先分解一些员工。\n兑换一次后提交任务。",
    rewardText: "奖励：职业技巧与你的个人成长",
    rewardKpi: 12,
    objective: { type: "exchange_skill_worker", count: 1 }
  }
];

Object.assign(TUTORIAL_TASKS[1], {
  description: "🦹‍♂️高层管理：我给你开放了决策点，你点击一次人才库就可以进行招聘。你尝试招聘一个新员工。"
});
Object.assign(TUTORIAL_TASKS[2], {
  description: "🦹‍♂️高层管理：再点击两次人才库，获得两名实习生。将他们合成为 1 名应届生。别问为什么是合成，这是我们公司的设定。"
});

const state = {
  grid: [],
  stash: [],
  decisionPoints: 0,
  companyFunds: STARTING_COMPANY_FUNDS,
  tokens: STARTING_TOKENS,
  kpi: 0,
  currentTask: null,
  selectedCell: null,
  isGameOver: false,
  tutorialIndex: 0,
  tutorialComplete: false,
  totalUnlockedCells: 0,
  totalDistilled: 0,
  completedFreeplayTasks: 0,
  freeplayTaskIndex: 1,
  specializationUnlocked: false,
  businessTrainingIndex: 0,
  businessTrainingComplete: false,
  businessTraining2Index: 0,
  businessTraining2Complete: false,
  freeplayAfterBusinessTraining: 0,
  totalSkillWorkerExchanges: 0,
  totalExchanged: 0,
  boardExpanded: false,
  pendingSkillWorkerIndex: null,
  pendingTransferIndex: null,
  usedSkillWorkerIndices: new Set(),
  fundTargetActive: false,
  fundTarget: 20,
  parkingCars: [],
  bossCarModalShown: false,
  obedienceTrainingIndex: 0,
  obedienceTrainingComplete: false,
  bossModels: [],
  newDepartmentsUnlocked: false
};

state.incomingCells = new Set();
state.mergeHintCells = new Set();
state.lastInteractionAt = Date.now();
state.poolCooldowns = new Map();

const boardEl = document.querySelector("#board");
const decisionPointsEl = document.querySelector("#decisionPoints");
const companyFundsEl = document.querySelector("#companyFunds");
const tokenCountEl = document.querySelector("#tokenCount");
const kpiCountEl = document.querySelector("#kpiCount");
const taskSubtitleEl = document.querySelector("#taskSubtitle");
const taskDescriptionEl = document.querySelector("#taskDescription");
const taskTargetEl = document.querySelector("#taskTarget");
const taskRewardEl = document.querySelector("#taskReward");
const submitTaskButtonEl = document.querySelector("#submitTaskButton");
const taskPanelEl = document.querySelector("#taskPanel");
const stashCountLabelEl = document.querySelector("#stashCountLabel");
const stashListEl = document.querySelector("#stashList");
const stashPanelEl = document.querySelector("#stashPanel");
const poolStorePanelEl = document.querySelector("#poolStorePanel");
const poolStoreListEl = document.querySelector("#poolStoreList");
const shopListEl = document.querySelector("#shopList");
const failureModalEl = document.querySelector("#failureModal");
const quitGameButtonEl = document.querySelector("#quitGameButton");
const restartGameButtonEl = document.querySelector("#restartGameButton");
const introModalEl = document.querySelector("#introModal");
const startGameButtonEl = document.querySelector("#startGameButton");
const specializationModalEl = document.querySelector("#specializationModal");
const closeSpecializationButtonEl = document.querySelector("#closeSpecializationButton");
const tutorialCompleteModalEl = document.querySelector("#tutorialCompleteModal");
const closeTutorialCompleteButtonEl = document.querySelector("#closeTutorialCompleteButton");
const businessTrainingCompleteModalEl = document.querySelector("#businessTrainingCompleteModal");
const closeBusinessTrainingButtonEl = document.querySelector("#closeBusinessTrainingButton");
const businessTraining2ModalEl = document.querySelector("#businessTraining2Modal");
const closeBusinessTraining2ButtonEl = document.querySelector("#closeBusinessTraining2Button");
const fundTargetModalEl = document.querySelector("#fundTargetModal");
const closeFundTargetButtonEl = document.querySelector("#closeFundTargetButton");
const gameWinModalEl = document.querySelector("#gameWinModal");
const gameWinRestartButtonEl = document.querySelector("#gameWinModal #restartGameButton");
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
const distillDropZoneEl = document.querySelector("#distillDropZone");
const distillStoryModalEl = document.querySelector("#distillStoryModal");
const storySpeakerEl = document.querySelector("#storySpeaker");
const storyDialogEl = document.querySelector(".story-dialog");
const storyTextEl = document.querySelector("#storyText");
const storyChoicesEl = document.querySelector("#storyChoices");
const storyResultEl = document.querySelector("#storyResult");
const storyResultTextEl = document.querySelector("#storyResultText");
const storyRewardEl = document.querySelector("#storyReward");
const closeStoryButtonEl = document.querySelector("#closeStoryButton");
const toastEl = document.querySelector("#toast");
const bossCarModalEl = document.querySelector("#bossCarModal");
const closeBossCarButtonEl = document.querySelector("#closeBossCarButton");
const parkingPanelEl = document.querySelector("#parkingPanel");
const parkingLotEl = document.querySelector("#parkingLot");
const open4sButtonEl = document.querySelector("#open4sButton");
const carShopModalEl = document.querySelector("#carShopModal");
const closeCarShopButtonEl = document.querySelector("#closeCarShopButton");
const carShopListEl = document.querySelector("#carShopList");
const modelPanelEl = document.querySelector("#modelPanel");
const modelLotEl = document.querySelector("#modelLot");
const openModelShopButtonEl = document.querySelector("#openModelShopButton");
const modelShopModalEl = document.querySelector("#modelShopModal");
const closeModelShopButtonEl = document.querySelector("#closeModelShopButton");
const modelShopListEl = document.querySelector("#modelShopList");
const obedience2ModalEl = document.querySelector("#obedience2Modal");
const closeObedience2ButtonEl = document.querySelector("#closeObedience2Button");
const obedience3ModalEl = document.querySelector("#obedience3Modal");
const closeObedience3ButtonEl = document.querySelector("#closeObedience3Button");
const obedienceCompleteModalEl = document.querySelector("#obedienceCompleteModal");
const closeObedienceCompleteButtonEl = document.querySelector("#closeObedienceCompleteButton");

const winAudio = new Audio("audio/win.mp3");
const mergeAudio = new Audio("audio/linhmitto-bubblepop-254773.mp3");
const recruitAudio = new Audio("audio/creatorshome-pop-cartoon-328167.mp3");
const clickAudio = new Audio("audio/creatorshome-low-pop-368761.mp3");

function playClickSound() {
  clickAudio.currentTime = 0;
  clickAudio.volume = 0.5;
  clickAudio.play().catch(() => {});
}

function playRecruitSound() {
  recruitAudio.currentTime = 0;
  recruitAudio.play().catch(() => {});
}

let pendingDistillEntity = null;
let pendingDistillIndex = null;
let toastTimer = null;

const DISTILL_STORIES = {
  pleas: [
    "请不要裁掉我，我需要这份工作养活自己。",
    "请不要裁掉我，我还有房贷要还，孩子要养。",
    "求求你了，给我一次机会吧，我会更加努力的。",
    "我在公司工作了这么久，没有功劳也有苦劳啊。",
    "能不能再给我一个月的时间证明自己？",
    "我家里还有老人要照顾，这份工作对我真的很重要。",
    "我刚结婚，老婆还怀孕了，这个节骨眼失业我们怎么办？",
    "我上个月刚买了车，每个月都要还车贷，求求你了。",
    "我父母身体不好，医药费全靠我这份工资，求你了。",
    "我孩子明年就要高考了，这时候失业会毁了他的前程。",
    "我老婆刚做完手术，还在康复期，我不能没有工作。",
    "我刚把老家房子卖了来城里，现在裁我，我回不去了。",
    "我弟弟妹妹还在上学，学费都是我出的，求求你。",
    "我单身一个人，这份工作是我唯一的寄托，别赶我走。",
    "我在这干了五年了，从没迟到早退过，给个机会吧。",
    "我愿意降薪，只要能留下，降多少都行。",
    "我可以加班，周末也可以来，只要不被裁。",
    "我老婆刚生二胎，奶粉钱都靠这份工资啊。",
    "我上有老下有小，全家都指望我这份收入。",
    "我知道最近表现不好，但我会改的，真的会改的。"
  ],
  leaderInstructions: [
    "这个员工已经不符合我们的需求了。你来负责处理这个情况。",
    "公司需要优化人力成本，这个员工需要被裁员。你来执行。",
    "这个人的绩效一直不达标，是时候让他离开了。",
    "我们已经讨论过了，这个职位要被撤销。你负责处理后续。",
    "这个员工的存在影响了团队效率，你需要让他离开。",
    "经过评估，这位员工的表现未能达到公司标准。",
    "公司发展方向调整，这个岗位不再需要人了。",
    "这个员工的能力与我们的要求不符，你来安排一下。"
  ],
  choices: [
    {
      text: "你的能力不足，无法胜任工作。你应该主动离职谢罪。",
      type: 1,
      reward: { kpi: 3 },
      leaderResponse: [
        "做得好，你很有管理者的潜质。懂得用合适的方式处理问题，这才是专业。",
        "漂亮。记住，管理就是要让员工自己选择离开，这样公司才能保持良好形象。",
        "你越来越像个真正的管理者了。继续保持这种专业素养。",
        "很好，你学会了最重要的管理技能：让员工自己承担责任。这才是高手的做法。",
        "优秀。这种话术既保全了公司形象，又让员工无话可说。你进步很快。",
        "不愧是我看中的人。处理这种事情，就该干净利落，不留后患。",
        "你已经开始理解职场的本质了。记住，善良是管理者的奢侈品。",
        "完美。员工离职是他自己的选择，公司没有任何责任。这就是专业。"
      ]
    },
    {
      text: "这是公司的决定，我也只是个执行人。",
      type: 2,
      reward: { kpi: 1 },
      leaderResponse: [
        "还可以，但你可以更专业一些。下次试着让员工觉得这是他自己的选择。",
        "中规中矩。记住，好的管理者要学会把责任推给制度，而不是自己扛。",
        "你还需要再磨练一下。处理这种事情，要更狠一些。",
        "太直白了。你应该学会用更委婉的方式，让员工觉得你也是受害者。",
        "勉强及格。但你要记住，管理者永远不要站在员工的对立面。",
        "下次可以更圆滑一些。让员工觉得你尽力了，是公司不给他机会。",
        "你的话术还需要打磨。好的管理者，要让员工感恩戴德地离开。",
        "还不够老练。记住，你只是传话筒，不要让自己成为矛盾的焦点。"
      ]
    },
    {
      text: "我去尝试帮你跟领导争取一些补偿。",
      type: 3,
      reward: { funds: -1 },
      leaderResponse: [
        "你太心软了。公司不是做慈善，记住这一点。",
        "其实，我对你最近的表现是有一些失望的。当初把你放到这个能力档位，不是因为你已经完全达到了，而是我认为你有潜力在真实任务里快速成长起来。",
        "我的预期不是让你把指令执行完就结束了，而是希望你能逐步形成更强的任务理解、抽象总结和自主判断能力。",
        "你在浪费公司的钱。记住，每一分补偿都是从利润里扣的。",
        "你的同情心用错了地方。员工是资源，不是朋友。",
        "我需要重新评估你的管理潜力。这种软弱的表现让我很担忧。",
        "你以为你在做好事？你只是在纵容无能，拖累团队。",
        "记住今天的教训。职场不相信眼泪，也不相信同情。"
      ]
    }
  ]
};

submitTaskButtonEl.addEventListener("click", () => {
  submitCurrentTask();
});

restartGameButtonEl.addEventListener("click", () => {
  restartGame();
});

quitGameButtonEl.addEventListener("click", () => {
  playClickSound();
  showFailureModal(true);
});

startGameButtonEl.addEventListener("click", () => {
  playClickSound();
  introModalEl.classList.add("hidden");
  introModalEl.setAttribute("aria-hidden", "true");
  render();
});

closeSpecializationButtonEl.addEventListener("click", () => {
  playClickSound();
  showSpecializationModal(false);
});

closeTutorialCompleteButtonEl.addEventListener("click", () => {
  playClickSound();
  showTutorialCompleteModal(false);
});

closeBusinessTrainingButtonEl.addEventListener("click", () => {
  playClickSound();
  showBusinessTrainingCompleteModal(false);
  state.freeplayAfterBusinessTraining = 1;
  assignFreeplayTask();
  render();
});

closeBusinessTraining2ButtonEl.addEventListener("click", () => {
  playClickSound();
  showBusinessTraining2Modal(false);
  assignRolesToExistingBoardTalents();
  convertExistingPoolsToAdminPools();
  addLog("职能分配完成，之后人才库将分配职能。");
  state.specializationUnlocked = true;
  render();
});

closeFundTargetButtonEl.addEventListener("click", () => {
  playClickSound();
  showFundTargetModal(false);
  assignFreeplayTask();
  render();
});

closeBossCarButtonEl.addEventListener("click", () => {
  playClickSound();
  bossCarModalEl.classList.add("hidden");
  bossCarModalEl.setAttribute("aria-hidden", "true");
  render();
});

open4sButtonEl.addEventListener("click", () => {
  playClickSound();
  renderCarShop();
  carShopModalEl.classList.remove("hidden");
  carShopModalEl.setAttribute("aria-hidden", "false");
  animateModalEntrance(carShopModalEl);
});

closeCarShopButtonEl.addEventListener("click", () => {
  playClickSound();
  carShopModalEl.classList.add("hidden");
  carShopModalEl.setAttribute("aria-hidden", "true");
});

openModelShopButtonEl.addEventListener("click", () => {
  playClickSound();
  renderModelShop();
  modelShopModalEl.classList.remove("hidden");
  modelShopModalEl.setAttribute("aria-hidden", "false");
  animateModalEntrance(modelShopModalEl);
});

closeModelShopButtonEl.addEventListener("click", () => {
  playClickSound();
  modelShopModalEl.classList.add("hidden");
  modelShopModalEl.setAttribute("aria-hidden", "true");
});

closeObedience2ButtonEl.addEventListener("click", () => {
  playClickSound();
  obedience2ModalEl.classList.add("hidden");
  obedience2ModalEl.setAttribute("aria-hidden", "true");
  render();
});

closeObedience3ButtonEl.addEventListener("click", () => {
  playClickSound();
  obedience3ModalEl.classList.add("hidden");
  obedience3ModalEl.setAttribute("aria-hidden", "true");
  render();
});

closeObedienceCompleteButtonEl.addEventListener("click", () => {
  playClickSound();
  obedienceCompleteModalEl.classList.add("hidden");
  obedienceCompleteModalEl.setAttribute("aria-hidden", "true");
  assignFreeplayTask();
  render();
});

gameWinRestartButtonEl.addEventListener("click", () => {
  playClickSound();
  showGameWinModal(false);
  restartGame();
});

cancelSkillWorkerButtonEl.addEventListener("click", () => {
  playClickSound();
  closeSkillWorkerModal();
});

confirmSkillWorkerButtonEl.addEventListener("click", () => {
  playClickSound();
  confirmSkillWorkerExchange();
});

cancelTransferButtonEl.addEventListener("click", () => {
  playClickSound();
  closeTransferModal();
});

openShopButtonEl.addEventListener("click", () => {
  playClickSound();
  shopModalEl.classList.remove("hidden");
  shopModalEl.setAttribute("aria-hidden", "false");
  renderShop();
});

closeShopButtonEl.addEventListener("click", () => {
  playClickSound();
  shopModalEl.classList.add("hidden");
  shopModalEl.setAttribute("aria-hidden", "true");
});

shopModalEl.addEventListener("click", (event) => {
  if (event.target === shopModalEl) {
    shopModalEl.classList.add("hidden");
    shopModalEl.setAttribute("aria-hidden", "true");
  }
});

document.addEventListener("pointerdown", () => {
  markInteraction();
}, true);

closeStoryButtonEl.addEventListener("click", () => {
  playClickSound();
  closeDistillStoryModal();
});

distillStoryModalEl.addEventListener("click", (event) => {
  if (event.target === distillStoryModalEl && !storyResultEl.classList.contains("hidden")) {
    playClickSound();
    closeDistillStoryModal();
  }
});

distillDropZoneEl.addEventListener("dragover", (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  distillDropZoneEl.classList.add("drag-over");
});

distillDropZoneEl.addEventListener("dragleave", () => {
  distillDropZoneEl.classList.remove("drag-over");
});

distillDropZoneEl.addEventListener("drop", (event) => {
  event.preventDefault();
  distillDropZoneEl.classList.remove("drag-over");
  const transferData = event.dataTransfer.getData("text/plain");
  if (transferData) {
    handleDistillDrop(transferData);
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
  const roles = state.newDepartmentsUnlocked
    ? [...JOB_FUNCTIONS, ...NEW_JOB_FUNCTIONS]
    : JOB_FUNCTIONS;
  return randomFromList(roles);
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
  const grid = Array.from({ length: BOARD_SIZE }, () => null);
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
  const baseActive = state.tutorialComplete ? [3, 4, 5, 9, 10, 11, 15, 16, 17] : [4, 5, 10, 11];
  const expandedActive = state.boardExpanded ? [2, 3, 4, 5, 8, 9, 10, 11, 14, 15, 16, 17, 20, 21, 22, 23] : baseActive;
  const allActive = state.newDepartmentsUnlocked ? Array.from({ length: BOARD_SIZE }, (_, i) => i) : expandedActive;
  return state.grid
    .map((entity, index) => (entity ? -1 : index))
    .filter((index) => index !== -1 && allActive.includes(index));
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

function markInteraction() {
  state.lastInteractionAt = Date.now();
  if (state.mergeHintCells.size > 0) {
    state.mergeHintCells.clear();
    renderBoard();
  }
}

function setPoolCooldown(index, durationMs = POOL_COOLDOWN_MS) {
  state.poolCooldowns.set(index, Date.now() + durationMs);
}

function getPoolCooldownProgress(index) {
  const cooldownEnd = state.poolCooldowns.get(index);
  if (!cooldownEnd) {
    return 0;
  }

  const remaining = cooldownEnd - Date.now();
  if (remaining <= 0) {
    state.poolCooldowns.delete(index);
    return 0;
  }

  return remaining / POOL_COOLDOWN_MS;
}

function isPoolCoolingDown(index) {
  return getPoolCooldownProgress(index) > 0;
}

function showToast(message, type = "info") {
  if (!toastEl) {
    return;
  }

  if (toastTimer) {
    window.clearTimeout(toastTimer);
  }

  toastEl.textContent = message;
  toastEl.className = `toast ${type} show`;
  toastEl.classList.remove("hidden");

  toastTimer = window.setTimeout(() => {
    toastEl.classList.remove("show");
    window.setTimeout(() => {
      toastEl.classList.add("hidden");
      toastEl.className = "toast hidden";
    }, 220);
  }, 1800);
}

function getFirstEmptyIndex() {
  const empties = getEmptyIndices();
  return empties.length > 0 ? empties[0] : -1;
}

function getEntityCardInnerMarkup(entity) {
  const meta = getEntityVisualMeta(entity);
  const isPoolDisabled = entity.type === "pool" && state.decisionPoints <= 0;
  const disabledIcon = isPoolDisabled ? "🚫" : "";
  return `
    <div class="talent-icon">${meta.icon}${disabledIcon}</div>
    <div class="talent-name">${meta.name}</div>
    <div class="talent-level">Lv.${entity.level}</div>
  `;
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

function showTutorialCompleteModal(visible) {
  tutorialCompleteModalEl.classList.toggle("hidden", !visible);
  tutorialCompleteModalEl.setAttribute("aria-hidden", String(!visible));
  if (visible) {
    animateModalEntrance(tutorialCompleteModalEl);
  }
}

function showBusinessTrainingCompleteModal(visible) {
  businessTrainingCompleteModalEl.classList.toggle("hidden", !visible);
  businessTrainingCompleteModalEl.setAttribute("aria-hidden", String(!visible));
  if (visible) {
    animateModalEntrance(businessTrainingCompleteModalEl);
  }
}

function showBusinessTraining2Modal(visible) {
  businessTraining2ModalEl.classList.toggle("hidden", !visible);
  businessTraining2ModalEl.setAttribute("aria-hidden", String(!visible));
  if (visible) {
    animateModalEntrance(businessTraining2ModalEl);
  }
}

function showFundTargetModal(visible) {
  fundTargetModalEl.classList.toggle("hidden", !visible);
  fundTargetModalEl.setAttribute("aria-hidden", String(!visible));
  if (visible) {
    animateModalEntrance(fundTargetModalEl);
  }
}

function showGameWinModal(visible) {
  gameWinModalEl.classList.toggle("hidden", !visible);
  gameWinModalEl.setAttribute("aria-hidden", String(!visible));
  if (visible) {
    animateModalEntrance(gameWinModalEl);
  }
}

function openSkillWorkerModal(index) {
  const entity = state.grid[index];
  if (!entity || entity.type !== "skillWorker") {
    return;
  }
  const exchangeFunds = getSkillWorkerExchangeFunds(entity.level);
  const hasEnoughTokens = state.tokens >= SKILL_WORKER_EXCHANGE_TOKEN;
  const hasEnoughDecisionPoints = state.decisionPoints >= 1;
  const tokenWarning = hasEnoughTokens ? "" : `\n⚠️ Token不足（需要${SKILL_WORKER_EXCHANGE_TOKEN}点）！`;
  const decisionPointWarning = hasEnoughDecisionPoints ? "" : "\n⚠️ 决策点不足（需要1点）！";
  skillWorkerModalTextEl.textContent =
    `将消耗 ${SKILL_WORKER_EXCHANGE_TOKEN} Token 和 1 决策点，换取 ${exchangeFunds} 点公司资金。` +
    ` 当前是 Lv.${entity.level}，等级越高越划算。` +
    tokenWarning +
    decisionPointWarning;
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
      playClickSound();
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
    const animationHandled = card && (
      className === "pool-spawn"
        ? !!gsapApi && !prefersReducedMotion && (() => {
            gsapApi.killTweensOf(card);
            const timeline = gsapApi.timeline({
              defaults: { overwrite: "auto" },
              onComplete: () => gsapApi.set(card, { clearProps: "transform,opacity" })
            });
            timeline
              .fromTo(card, {
                scale: 0.9,
                y: 10,
                opacity: 0.45
              }, {
                scale: 1.015,
                y: -1,
                opacity: 1,
                duration: 0.11,
                ease: "power2.out"
              })
              .to(card, {
                scale: 0.996,
                y: 0.5,
                duration: 0.0225,
                ease: "sine.inOut"
              })
              .to(card, {
                scale: 1,
                y: 0,
                duration: 0.0225,
                ease: "sine.out"
              });
            return true;
          })()
        : className === "pool-idle-prompt"
          ? (() => {
              if (!gsapApi || prefersReducedMotion) {
                return false;
              }
              gsapApi.killTweensOf(card);
              const tl = gsapApi.timeline({ repeat: -1 });
              tl.to(card, {
                scale: 1.04,
                duration: 0.12,
                ease: "sine.inOut"
              })
              .to(card, {
                scale: 1.08,
                duration: 0.1,
                ease: "sine.inOut"
              })
              .to(card, {
                scale: 1.04,
                duration: 0.1,
                ease: "sine.inOut"
              })
              .to(card, {
                scale: 1,
                duration: 0.12,
                ease: "sine.inOut"
              })
              .to(card, {
                scale: 1.04,
                duration: 0.12,
                ease: "sine.inOut"
              })
              .to(card, {
                scale: 1.08,
                duration: 0.1,
                ease: "sine.inOut"
              })
              .to(card, {
                scale: 1.04,
                duration: 0.1,
                ease: "sine.inOut"
              })
              .to(card, {
                scale: 1,
                duration: 0.12,
                ease: "sine.inOut"
              })
              .to(card, {
                scale: 1,
                duration: 1.2,
                ease: "sine.inOut"
              });
              return true;
            })()
          : animateWithGsap(card, { scale: 0.82, y: 8 }, {
              scale: 1,
              y: 0,
              duration: 0.24,
              ease: "back.out(1.5)",
              clearProps: "transform"
            })
    );
    if (animationHandled) {
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

  interactApi(distillDropZoneEl).dropzone({
    accept: ".js-draggable",
    overlap: 0.3,
    ondragenter(event) {
      event.target.classList.add("drag-over");
    },
    ondragleave(event) {
      event.target.classList.remove("drag-over");
    },
    ondrop(event) {
      event.target.classList.remove("drag-over");
      const transferData = event.relatedTarget.dataset.transfer;
      if (!transferData) {
        return;
      }
      handleDistillDrop(transferData);
    }
  });
}

function handleDistillDrop(transferData) {
  const parts = transferData.split(":");
  if (parts.length < 2) {
    return;
  }
  
  const source = parts[0];
  const idOrIndex = parts[1];
  
  if (source === "cell" || source === "board") {
    const index = parseInt(idOrIndex, 10);
    const entity = state.grid[index];
    if (!entity || entity.type !== "talent") {
      addLog("只能放入员工，无法放入其他类型的资产。", "warning");
      return;
    }
    
    pendingDistillEntity = entity;
    pendingDistillIndex = index;
    pendingDistillSource = "board";
    
    showDistillStoryModal(entity);
  } else if (source === "stash") {
    const stashIndex = state.stash.findIndex(e => e.id === idOrIndex);
    if (stashIndex === -1) {
      return;
    }
    const entity = state.stash[stashIndex];
    if (!entity || entity.type !== "talent") {
      addLog("只能蒸馏员工，无法蒸馏其他类型的资产。", "warning");
      return;
    }
    
    pendingDistillEntity = entity;
    pendingDistillIndex = stashIndex;
    pendingDistillSource = "stash";
    showDistillStoryModal(entity);
  }
}

let pendingDistillSource = "board";

function showDistillStoryModal(entity) {
  const displayName = getTalentDisplayName(entity.level, entity.role);
  const plea = randomFromList(DISTILL_STORIES.pleas);

  storySpeakerEl.textContent = `👤 ${displayName}`;
  storyTextEl.textContent = plea;
  storyDialogEl.classList.remove("hidden");

  storyChoicesEl.innerHTML = "";
  DISTILL_STORIES.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.className = `story-choice choice-${choice.type}`;
    button.textContent = choice.text;
    button.addEventListener("click", () => {
      playClickSound();
      handleStoryChoice(choice, entity);
    });
    storyChoicesEl.appendChild(button);
  });

  storyResultEl.classList.add("hidden");
  closeStoryButtonEl.classList.add("hidden");

  distillStoryModalEl.classList.remove("hidden");
  distillStoryModalEl.setAttribute("aria-hidden", "false");
  animateModalEntrance(distillStoryModalEl);
}

function handleStoryChoice(choice, entity) {
  const displayName = getTalentDisplayName(entity.level, entity.role);
  const leaderResponse = randomFromList(choice.leaderResponse);

  if (choice.reward.kpi) {
    state.kpi += choice.reward.kpi;
  }
  if (choice.reward.funds) {
    state.companyFunds += choice.reward.funds;
  }

  const tokenReward = getDecomposeReward(entity.level);
  state.tokens += tokenReward;
  state.totalDistilled += 1;

  if (pendingDistillSource === "stash") {
    state.stash.splice(pendingDistillIndex, 1);
  } else {
    state.grid[pendingDistillIndex] = null;
  }

  storyDialogEl.classList.add("hidden");
  storyChoicesEl.innerHTML = "";
  storyResultTextEl.textContent = leaderResponse;

  let rewardText = `获得 ${tokenReward} Token`;
  if (choice.reward.kpi) {
    rewardText += `，${choice.reward.kpi > 0 ? "获得" : "扣除"} ${Math.abs(choice.reward.kpi)} KPI`;
  }
  if (choice.reward.funds) {
    rewardText += `，${choice.reward.funds > 0 ? "获得" : "消耗"} ${Math.abs(choice.reward.funds)} 公司资金`;
  }
  storyRewardEl.textContent = rewardText;

  storyResultEl.classList.remove("hidden");
  closeStoryButtonEl.classList.remove("hidden");
  
  addLog(`裁员完成：${displayName} 已离职。${rewardText}`);
  
  render();
}

function closeDistillStoryModal() {
  const panel = distillStoryModalEl.querySelector(".modal");
  animateWithGsap(panel, {
    opacity: 0,
    y: 16,
    scale: 0.95
  }, {
    opacity: 0,
    duration: 0.15,
    ease: "power2.in",
    onComplete: () => {
      distillStoryModalEl.classList.add("hidden");
      distillStoryModalEl.setAttribute("aria-hidden", "true");
      panel.style.opacity = "";
      panel.style.transform = "";
      storyDialogEl.classList.remove("hidden");
      storyChoicesEl.innerHTML = "";
    }
  });
  pendingDistillEntity = null;
  pendingDistillIndex = null;
}

function isSelectedTalent() {
  return state.selectedCell !== null && state.grid[state.selectedCell]?.type === "talent";
}

function isSelectedTalentUpgradeable() {
  return isSelectedTalent() && state.grid[state.selectedCell].level < MAX_LEVEL;
}

function getRoleIcon(entity) {
  if (!entity || !entity.role) return null;
  const baseIcon = TALENT_META[entity.level]?.icon?.split(" ")[0] || "";
  const roleIcon = ROLE_ICONS[entity.role];
  if (roleIcon) {
    return baseIcon + " " + roleIcon;
  }
  return null;
}

function getEntityVisualMeta(entity) {
  if (entity.type === "talent") {
    const baseMeta = ENTITY_META.talent[entity.level];
    const baseIcon = baseMeta.icon || "";
    const attrIcon = entity.attribute === "INFP" ? "🦋" : "";
    
    let iconText;
    if (entity.role) {
      const basePersonIcon = baseIcon.split(" ")[0] || "";
      const roleIcon = ROLE_ICONS[entity.role] || "";
      iconText = [basePersonIcon, roleIcon, attrIcon].filter(Boolean).join(" ");
    } else {
      iconText = [baseIcon, attrIcon].filter(Boolean).join(" ");
    }
    
    const attrText = entity.attribute ? ` [${entity.attribute}]` : "";
    let colorClass = baseMeta.colorClass;
    if (entity.role === "运营") {
      colorClass = `role-ops-${entity.level}`;
    } else if (entity.role === "行政") {
      colorClass = `role-admin-${entity.level}`;
    } else if (entity.role === "财务") {
      colorClass = `role-finance-${entity.level}`;
    } else if (entity.role === "设计") {
      colorClass = `role-design-${entity.level}`;
    }
    return {
      ...baseMeta,
      name: getTalentDisplayName(entity.level, entity.role) + attrText,
      icon: iconText || baseMeta.icon,
      colorClass
    };
  }

  if (entity.type === "pool") {
    const baseMeta = ENTITY_META.pool[entity.level];
    const baseIcon = baseMeta.icon || "";
    const attrIcon = entity.attribute === "INFP" ? "🦋" : "";
    
    let iconText;
    if (entity.role) {
      const basePersonIcon = baseIcon.split(" ")[0] || "";
      const roleIcon = ROLE_ICONS[entity.role] || "";
      iconText = [basePersonIcon, roleIcon, attrIcon].filter(Boolean).join(" ");
    } else {
      iconText = [baseIcon, attrIcon].filter(Boolean).join(" ");
    }
    
    const attrText = entity.attribute ? ` [${entity.attribute}]` : "";
    let colorClass = baseMeta.colorClass;
    if (entity.role === "运营") {
      colorClass = `role-ops-pool-${entity.level}`;
    } else if (entity.role === "行政") {
      colorClass = `role-admin-pool-${entity.level}`;
    } else if (entity.role === "财务") {
      colorClass = `role-finance-pool-${entity.level}`;
    } else if (entity.role === "设计") {
      colorClass = `role-design-pool-${entity.level}`;
    }
    return {
      ...baseMeta,
      name: (entity.role ? `${entity.role}人才库` : baseMeta.name) + attrText,
      icon: iconText || baseMeta.icon,
      colorClass
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
      if (objective.excludeAttribute && entity.attribute === objective.excludeAttribute) {
        return false;
      }
      if (!objective.role) {
        return true;
      }
      return entity.role === objective.role;
    }).length;
  }

  if (objective.type === "distill_count") {
    return state.totalDistilled;
  }
  
  if (objective.type === "merge_infp_count") {
    if (task.id === "business-1") {
      const lv2Entities = state.grid.filter((entity) => {
        if (!entity) return false;
        if (entity.type === "pool" && entity.level >= 2) return true;
        if (entity.type === "talent" && entity.level >= 2) return true;
        return false;
      });
      return lv2Entities.length > 0 ? 1 : 0;
    }
    if (task.id === "business-2") {
      const infpTalents = state.grid.filter((entity) => entity?.type === "talent" && entity.attribute === "INFP");
      const infpAtMaxLevel = infpTalents.some((entity) => entity.level >= 2);
      return infpAtMaxLevel ? 1 : 0;
    }
    return 0;
  }

  if (objective.type === "exchange_action") {
    return state.totalExchanged;
  }

  if (objective.type === "none") {
    return 1;
  }

  if (objective.type === "buy_role_pool") {
    const hasRolePool = state.grid.some((entity) => entity && entity.type === "pool" && entity.role === objective.role);
    return hasRolePool ? 1 : 0;
  }

  if (objective.type === "board_skill_worker_count") {
    const skillWorkerCount = state.grid.filter((entity) => entity && entity.type === "skillWorker").length;
    return skillWorkerCount;
  }

  if (objective.type === "exchange_skill_worker") {
    return state.totalSkillWorkerExchanges || 0;
  }

  if (objective.type === "buy_car") {
    const carCount = state.parkingCars.filter((c) => c.id === objective.carId).length;
    return carCount;
  }

  if (objective.type === "buy_model") {
    return state.bossModels.length;
  }

  if (objective.type === "buy_new_role_pool") {
    const newRoles = ["财务", "设计"];
    const newRolePools = state.grid.filter((entity) => entity && entity.type === "pool" && newRoles.includes(entity.role));
    return newRolePools.length;
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

    const needsExcludeInfp = Math.random() < 0.5;
    if (needsExcludeInfp) {
      objective.excludeAttribute = "INFP";
      return {
        ...baseTask,
        department: getDepartmentName(role),
        description: `${getDepartmentName(role)}需要 ${objective.count} 名${roleIcon}${role}${targetName}，（不要infp）`,
        objective
      };
    }

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
  state.freeplayTaskIndex += 1;
  state.usedSkillWorkerIndices = new Set();
  clearSelection();
}

function assignRolesToExistingBoardTalents() {
  state.grid = state.grid.map((entity) => {
    if (!entity) {
      return null;
    }
    if (entity.type === "talent" && !entity.role) {
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
  addLog("我扩大了你的业务权限，职能系统已开启。之后只有同职能、同等级的员工才能合成，派发的任务也会开始指定职能。");
  showSpecializationModal(true);
}

function finishTutorial() {
  state.tutorialComplete = true;
  addLog("你的入职培训完成了，接下来自己摸索吧。如果没在规定的决策点内完成任务，你就应该辞职谢罪。");
  assignFreeplayTask();
  showTutorialCompleteModal(true);
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
    if (task.objective.excludeAttribute && entity.attribute === task.objective.excludeAttribute) {
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

function playMergeSound() {
  mergeAudio.currentTime = 0;
  mergeAudio.play().catch(() => {});
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
  
  if (!state.specializationUnlocked && !state.businessTrainingComplete && state.completedFreeplayTasks >= SPECIALIZATION_UNLOCK_AFTER_TASKS) {
    if (!state.currentTask.id.startsWith("business-")) {
      state.usedSkillWorkerIndices = new Set();
      state.currentTask = { ...BUSINESS_TRAINING_TASKS[0] };
      state.decisionPoints = state.currentTask.decisionPoints;
      state.businessRecruitCount = 0;
      state.totalExchanged = 0;
      state.stash.push(createEntity("pool", 1));
      render();
      return;
    }
  }
  
  if (state.businessTrainingComplete && !state.businessTraining2Complete && state.freeplayAfterBusinessTraining > 0 && !state.currentTask.id.startsWith("business2-")) {
    state.freeplayAfterBusinessTraining += 1;
    if (state.freeplayAfterBusinessTraining > 2) {
      state.usedSkillWorkerIndices = new Set();
      state.currentTask = { ...BUSINESS_TRAINING_TASKS_2[0] };
      state.decisionPoints = state.currentTask.decisionPoints;
      showBusinessTraining2Modal(true);
      render();
      return;
    }
    assignFreeplayTask();
    render();
    return;
  }

  if (state.businessTrainingIndex >= BUSINESS_TRAINING_TASKS.length && !state.businessTrainingComplete) {
    state.businessTrainingComplete = true;
    showBusinessTrainingCompleteModal(true);
  } else if (!state.businessTrainingComplete && state.currentTask.id.startsWith("business-")) {
    state.businessTrainingIndex += 1;
    if (state.businessTrainingIndex >= BUSINESS_TRAINING_TASKS.length) {
      state.boardExpanded = true;
      state.totalUnlockedCells = 16;
      state.businessTrainingComplete = true;
      addLog("公司扩张完成，棋盘已扩大。");
      showBusinessTrainingCompleteModal(true);
      render();
      return;
    } else {
      state.usedSkillWorkerIndices = new Set();
      state.currentTask = { ...BUSINESS_TRAINING_TASKS[state.businessTrainingIndex] };
      state.decisionPoints = state.currentTask.decisionPoints;
      state.businessRecruitCount = 0;
      state.totalExchanged = 0;
    }
  } else if (state.currentTask.id.startsWith("business2-")) {
    if (isTaskComplete()) {
      state.businessTraining2Index += 1;
      if (state.businessTraining2Index >= BUSINESS_TRAINING_TASKS_2.length) {
        state.businessTraining2Complete = true;
        state.fundTargetActive = true;
        showFundTargetModal(true);
      } else {
        state.usedSkillWorkerIndices = new Set();
        state.currentTask = { ...BUSINESS_TRAINING_TASKS_2[state.businessTraining2Index] };
        state.decisionPoints = state.currentTask.decisionPoints;
      }
    } else {
      showBusinessTraining2Modal(true);
    }
    render();
    return;
  } else if (state.currentTask.id.startsWith("obedience-")) {
    state.obedienceTrainingIndex += 1;
    if (state.obedienceTrainingIndex >= OBEDIENCE_TRAINING_TASKS.length) {
      state.obedienceTrainingComplete = true;
      state.newDepartmentsUnlocked = true;
      state.boardExpanded = true;
      state.totalUnlockedCells = BOARD_SIZE;
      state.fundTargetActive = false;
      addLog("服从训练全部完成！财务部和设计部权限已开放，棋盘全部解锁！");
      showObedienceCompleteModal(true);
    } else {
      const nextTask = OBEDIENCE_TRAINING_TASKS[state.obedienceTrainingIndex];
      state.currentTask = { ...nextTask };
      state.decisionPoints = state.currentTask.decisionPoints;
      if (nextTask.id === "obedience-2") {
        state.companyFunds += 20;
        addLog("公司资金 +20，用于老板的嫩模开销。");
        showObedience2Modal(true);
      } else if (nextTask.id === "obedience-3") {
        state.companyFunds += 5;
        addLog("公司资金 +5，用于采购新部门人才库。");
        showObedience3Modal(true);
      }
    }
    render();
    return;
  } else {
    assignFreeplayTask();
  }
  render();
}

function triggerGameOver() {
  if (state.isGameOver || isTaskComplete()) {
    return;
  }
  state.isGameOver = true;
  addLog("神秘高层：其实，我对你最近的表现是非常失望的。当初把你放到这个能力档位，是我对你的信任！你辜负了我对你的信任，你完全不称职。", "warning");
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

  if (state.decisionPoints < 1) {
    addLog(`决策点不足，无法进行兑换。`, "warning");
    closeSkillWorkerModal();
    return;
  }

  if (state.usedSkillWorkerIndices.has(index)) {
    addLog("该员工.Skill 已经在本任务中兑换过了。", "warning");
    closeSkillWorkerModal();
    return;
  }

  state.tokens -= SKILL_WORKER_EXCHANGE_TOKEN;
  state.decisionPoints -= 1;
  state.companyFunds += exchangeFunds;
  state.totalSkillWorkerExchanges += 1;
  state.usedSkillWorkerIndices.add(index);
  clearSelection();
  addLog(`员工.Skill 完成协助，消耗 ${SKILL_WORKER_EXCHANGE_TOKEN} Token 和 1 点决策点，换取 ${exchangeFunds} 点公司资金。`);
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
    id: "buy-skill-worker",
    name: "员工.Skill",
    costLabel: `${SKILL_WORKER_COST} Token`,
    description: "购买后放入棋盘，双击并消耗 Token 可换取公司资金。",
    isDisabled: () => state.tokens < SKILL_WORKER_COST || state.isGameOver,
    isVisible: () => state.currentTask?.id?.startsWith("business2-") || state.businessTraining2Complete,
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
      state.totalExchanged += 1;
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
    addLog(`${role}人才库已加入暂存区，点击即可自动部署到棋盘并稳定生产对应职能人才。`);
    render();
  }
}));

const NEW_DEPARTMENT_POOL_ITEMS = NEW_JOB_FUNCTIONS.map((role) => ({
  id: `buy-pool-${role}`,
  name: `${role}人才库`,
  costLabel: "1 决策点 + 1 资金",
  description: `采购一个 1 级${role}人才库，放入暂存区后可稳定产出${role}人才。`,
  isDisabled: () => !state.newDepartmentsUnlocked || state.decisionPoints < 1 || state.companyFunds < 1 || state.isGameOver,
  isVisible: () => state.newDepartmentsUnlocked,
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
    addLog(`${role}人才库已加入暂存区，点击即可自动部署到棋盘并稳定生产对应职能人才。`);
    render();
  }
}));

function recruitFromPool(poolIndex) {
  const entity = state.grid[poolIndex];
  if (!entity || entity.type !== "pool") {
    return;
  }
  if (isPoolCoolingDown(poolIndex)) {
    return;
  }
  const sourceRect = boardEl.querySelector(`[data-index="${poolIndex}"] .talent-card`)?.getBoundingClientRect() ?? null;
  if (!spendDecisionPoint(1, "人才库招募")) {
    render();
    return;
  }

  const spawnIndex = getNearestEmptyIndexToIndex(poolIndex);
  if (spawnIndex === -1) {
    state.decisionPoints += 1;
    addLog("棋盘没有空位，无法继续招募。", "warning");
    render();
    return;
  }

  const level = randomFromWeighted(POOL_WEIGHTS[entity.level]);
  const role = state.specializationUnlocked ? (entity.role || "行政") : undefined;
  
  let talentExtra = role ? { role } : {};
  let talentLevel = level;
  
  const isBusiness2Task = state.currentTask?.id === "business-2";
  if (isBusiness2Task && state.businessRecruitCount < 2) {
    talentExtra.attribute = "INFP";
    talentLevel = 1;
    state.businessRecruitCount = (state.businessRecruitCount || 0) + 1;
  } else if (state.businessTrainingComplete && Math.random() < 0.2) {
    talentExtra.attribute = "INFP";
  }
  
  state.grid[spawnIndex] = createEntity("talent", talentLevel, talentExtra);
  state.incomingCells.add(spawnIndex);
  setPoolCooldown(poolIndex);
  
  const attrText = talentExtra.attribute ? ` [${talentExtra.attribute}]` : "";
  addLog(`人才库 Lv.${entity.level} 招募到 ${getTalentDisplayName(talentLevel, role)}${attrText}。`);

  playRecruitSound();
  render();
  animateCell(poolIndex);
  animateRecruitFromPool(sourceRect, spawnIndex, state.grid[spawnIndex]);
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
  if (source.attribute !== target.attribute) {
    return false;
  }
  return true;
}

function getMergeHintIndices() {
  const pairs = [];
  for (let fromIndex = 0; fromIndex < state.grid.length; fromIndex += 1) {
    const source = state.grid[fromIndex];
    if (!source || state.incomingCells.has(fromIndex)) {
      continue;
    }

    for (let toIndex = fromIndex + 1; toIndex < state.grid.length; toIndex += 1) {
      const target = state.grid[toIndex];
      if (!target || state.incomingCells.has(toIndex)) {
        continue;
      }

      if (canMergeEntities(source, target)) {
        pairs.push([fromIndex, toIndex]);
      }
    }
  }

  return randomFromList(pairs) ?? [];
}

function pulseAvailablePools() {
  if (state.isGameOver || state.decisionPoints <= 0 || state.incomingCells.size > 0) {
    return;
  }

  state.grid.forEach((entity, index) => {
    if (entity?.type === "pool" && !isPoolCoolingDown(index)) {
      animateCell(index, "pool-idle-prompt");
    }
  });
}

function maybeShowMergeHints() {
  if (state.isGameOver || state.incomingCells.size > 0) {
    return;
  }

  const idleFor = Date.now() - state.lastInteractionAt;
  if (idleFor < 3000) {
    return;
  }

  const hintIndices = getMergeHintIndices();
  if (hintIndices.length !== 2) {
    return;
  }

  const nextHints = new Set(hintIndices);
  const isSame =
    state.mergeHintCells.size === nextHints.size &&
    [...nextHints].every((index) => state.mergeHintCells.has(index));

  if (!isSame) {
    state.mergeHintCells = nextHints;
    renderBoard();
  }
}

function tickPoolCooldowns() {
  if (state.poolCooldowns.size === 0) {
    return;
  }

  let changed = false;
  for (const [index, cooldownEnd] of state.poolCooldowns.entries()) {
    if (cooldownEnd <= Date.now()) {
      state.poolCooldowns.delete(index);
      changed = true;
    } else {
      changed = true;
    }
  }

  if (changed) {
    renderBoard();
  }
}

function mergeEntities(fromIndex, toIndex) {
  const source = state.grid[fromIndex];
  const target = state.grid[toIndex];
  if (!canMergeEntities(source, target)) {
    return false;
  }

  const nextLevel = source.level + 1;
  let extra = source.type === "talent" && source.role ? { role: source.role } : {};
  if (source.type === "talent" && source.attribute) {
    extra.attribute = source.attribute;
  }
  const poolExtra = source.type === "pool" && source.role ? { role: source.role } : {};
  state.grid[fromIndex] = null;
  state.grid[toIndex] = createEntity(source.type, nextLevel, source.type === "pool" ? poolExtra : extra);

  if (source.type === "pool") {
    addLog(`人才库合成成功，获得 Lv.${nextLevel}${source.role ? `${source.role}` : ""}人才库。`);
  } else if (source.type === "skillWorker") {
    addLog(`员工.Skill 合成成功，获得 Lv.${nextLevel}。`);
  } else {
    const attrText = extra.attribute ? ` [${extra.attribute}]` : "";
    addLog(`合成成功，获得 ${getTalentDisplayName(nextLevel, source.role)}${attrText}。`);
  }

  playMergeSound();
  state.selectedCell = toIndex;
  render();
  animateCell(toIndex);
  return true;
}

function moveEntity(fromIndex, toIndex) {
  state.grid[toIndex] = state.grid[fromIndex];
  state.grid[fromIndex] = null;
  state.selectedCell = toIndex;
  render();
}

function handleCellClick(index) {
  if (state.isGameOver) {
    return;
  }

  if (state.incomingCells.has(index)) {
    return;
  }

  const entity = state.grid[index];
  if (!entity) {
    return;
  }

  if (entity.type === "pool") {
    if (state.decisionPoints <= 0) {
      addLog("决策点不足，无法继续招募。", "warning");
      return;
    }
    recruitFromPool(index);
    return;
  }

  if (entity.type === "skillWorker") {
    addLog("双击 员工.Skill 可以弹出确认框，用 Token 换取公司资金。");
    return;
  }

  if (entity.type === "talent" && state.specializationUnlocked) {
    addLog("双击员工可以打开转岗窗口，消耗公司资金更换职能。");
  }
}

function handleBoardDrop(rawData, toIndex) {
  if (state.isGameOver || !rawData) {
    return;
  }

  if (state.incomingCells.has(toIndex)) {
    return;
  }

  const baseActive = state.tutorialComplete ? [3, 4, 5, 9, 10, 11, 15, 16, 17] : [4, 5, 10, 11];
  const expandedActive = state.boardExpanded ? [2, 3, 4, 5, 8, 9, 10, 11, 14, 15, 16, 17, 20, 21, 22, 23] : baseActive;
  const allActive = state.newDepartmentsUnlocked ? Array.from({ length: BOARD_SIZE }, (_, i) => i) : expandedActive;
  if (!allActive.includes(toIndex)) {
    addLog("该区域尚未解锁。", "warning");
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
    const isPool = state.grid[toIndex]?.type === "pool";
    animateCell(toIndex, isPool ? "pool-spawn" : "merge-pop");
    return;
  }

  if (!rawData.startsWith("cell:")) {
    return;
  }

  const fromIndex = Number(rawData.slice(5));
  if (fromIndex === toIndex || !state.grid[fromIndex]) {
    return;
  }

  if (!allActive.includes(toIndex)) {
    addLog("该区域尚未解锁。", "warning");
    return;
  }

  if (!state.grid[toIndex]) {
    moveEntity(fromIndex, toIndex);
    return;
  }
  mergeEntities(fromIndex, toIndex);
}

function animatePlacementFromStash(sourceEl, toIndex) {
  if (prefersReducedMotion || !sourceEl) {
    animateCell(toIndex);
    return;
  }

  const targetCard = boardEl.querySelector(`[data-index="${toIndex}"] .talent-card`);
  if (!targetCard) {
    animateCell(toIndex);
    return;
  }

  const sourceRect = sourceEl.getBoundingClientRect();
  const targetRect = targetCard.getBoundingClientRect();
  const clone = sourceEl.cloneNode(true);

  clone.classList.add("placement-ghost");
  clone.style.position = "fixed";
  clone.style.left = `${sourceRect.left}px`;
  clone.style.top = `${sourceRect.top}px`;
  clone.style.width = `${sourceRect.width}px`;
  clone.style.height = `${sourceRect.height}px`;
  clone.style.margin = "0";
  clone.style.pointerEvents = "none";
  clone.style.zIndex = "120";
  document.body.append(clone);

  if (gsapApi) {
    gsapApi.fromTo(clone, {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 0.96
    }, {
      x: targetRect.left - sourceRect.left,
      y: targetRect.top - sourceRect.top,
      scale: targetRect.width / Math.max(sourceRect.width, 1),
      opacity: 0.18,
      duration: 0.42,
      ease: "power2.inOut",
      onComplete: () => clone.remove()
    });
  } else {
    clone.style.transition = "transform 420ms ease, opacity 420ms ease";
    requestAnimationFrame(() => {
      clone.style.transform = `translate(${targetRect.left - sourceRect.left}px, ${targetRect.top - sourceRect.top}px) scale(${targetRect.width / Math.max(sourceRect.width, 1)})`;
      clone.style.opacity = "0.18";
    });
    window.setTimeout(() => clone.remove(), 440);
  }

  animateCell(toIndex);
}

function deployStashEntity(stashId, sourceEl = null) {
  if (state.isGameOver) {
    return;
  }

  const stashIndex = state.stash.findIndex((entity) => entity.id === stashId);
  if (stashIndex === -1) {
    return;
  }

  const emptyIndex = getFirstEmptyIndex();
  if (emptyIndex === -1) {
    const message = "棋盘空位不足，无法部署暂存区资产。";
    addLog(message, "warning");
    showToast(message, "warning");
    return;
  }

  state.grid[emptyIndex] = state.stash.splice(stashIndex, 1)[0];
  addLog(`${getEntityVisualMeta(state.grid[emptyIndex]).name} 已部署进棋盘。`);
  render();
  animatePlacementFromStash(sourceEl, emptyIndex);
}

function animateRecruitFromPool(sourceRect, toIndex, entity) {
  if (prefersReducedMotion || !sourceRect) {
    state.incomingCells.delete(toIndex);
    renderBoard();
    animateCell(toIndex, "pool-spawn");
    return;
  }

  const targetCell = boardEl.querySelector(`[data-index="${toIndex}"]`);
  if (!targetCell) {
    state.incomingCells.delete(toIndex);
    renderBoard();
    animateCell(toIndex, "pool-spawn");
    return;
  }

  const targetRect = targetCell.getBoundingClientRect();
  const ghost = document.createElement("div");
  const meta = getEntityVisualMeta(entity);
  ghost.className = `talent-card recruit-ghost ${meta.colorClass} ${entity.type === "skillWorker" ? "skill-worker-card" : ""}`;
  ghost.innerHTML = getEntityCardInnerMarkup(entity);
  ghost.style.position = "fixed";
  ghost.style.left = `${sourceRect.left + sourceRect.width / 2 - (targetRect.width - 10) / 2}px`;
  ghost.style.top = `${sourceRect.top + sourceRect.height / 2 - (targetRect.height - 10) / 2}px`;
  ghost.style.width = `${targetRect.width - 10}px`;
  ghost.style.height = `${targetRect.height - 10}px`;
  ghost.style.pointerEvents = "none";
  ghost.style.zIndex = "130";
  document.body.append(ghost);

  const startLeft = sourceRect.left + sourceRect.width / 2 - (targetRect.width - 10) / 2;
  const startTop = sourceRect.top + sourceRect.height / 2 - (targetRect.height - 10) / 2;
  const finalLeft = targetRect.left + 5;
  const finalTop = targetRect.top + 5;
  const deltaX = finalLeft - startLeft;
  const deltaY = finalTop - startTop;

  const revealRecruitedCard = () => {
    state.incomingCells.delete(toIndex);
    renderBoard();
    animateCell(toIndex, "pool-spawn");
  };

  if (gsapApi) {
    gsapApi.fromTo(ghost, {
      x: 0,
      y: 0,
      scale: 0.28,
      opacity: 0.16,
      rotate: -10
    }, {
      x: deltaX,
      y: deltaY,
      scale: 1.02,
      opacity: 1,
      rotate: 0,
      duration: 0.25,
      ease: "back.out(1.45)",
      onComplete: () => {
        ghost.remove();
        revealRecruitedCard();
      }
    });
  } else {
    ghost.style.transform = "scale(0.28) rotate(-10deg)";
    ghost.style.opacity = "0.16";
    ghost.style.transition = "transform 250ms cubic-bezier(0.22, 1.2, 0.36, 1), opacity 250ms ease";
    requestAnimationFrame(() => {
      ghost.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.02) rotate(0deg)`;
      ghost.style.opacity = "1";
    });
    window.setTimeout(() => {
      ghost.remove();
      revealRecruitedCard();
    }, 270);
  }
}

function getEntityLabel(entity) {
  const meta = getEntityVisualMeta(entity);
  return `${meta.name} Lv.${entity.level}`;
}

function renderBoard() {
  boardEl.innerHTML = "";

  const baseActive = state.tutorialComplete ? [3, 4, 5, 9, 10, 11, 15, 16, 17] : [4, 5, 10, 11];
  const expandedActive = state.boardExpanded ? [2, 3, 4, 5, 8, 9, 10, 11, 14, 15, 16, 17, 20, 21, 22, 23] : baseActive;
  const activeIndices = state.newDepartmentsUnlocked ? Array.from({ length: BOARD_SIZE }, (_, i) => i) : expandedActive;

  state.grid.forEach((entity, index) => {
    const isActiveCell = activeIndices.includes(index);
    const isIncoming = state.incomingCells.has(index);
    const isMergeHint = state.mergeHintCells.has(index);
    const visibleEntity = isIncoming ? null : entity;
    const cell = document.createElement("button");
    cell.className = `cell ${visibleEntity ? "" : "empty"} ${isIncoming ? "incoming-cell" : ""} ${isMergeHint ? "merge-hint-cell" : ""} ${!isActiveCell ? "locked-cell" : ""}`;
    cell.dataset.index = String(index);
    cell.addEventListener("click", () => handleCellClick(index));
    cell.addEventListener("dblclick", () => {
      if (state.incomingCells.has(index)) {
        return;
      }
      if (state.grid[index]?.type === "skillWorker") {
        if (state.usedSkillWorkerIndices.has(index)) {
          addLog("该员工.Skill 本任务已兑换过。", "warning");
          return;
        }
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

    if (visibleEntity) {
      const card = document.createElement("div");
      const isMovable = true;
      const meta = getEntityVisualMeta(visibleEntity);
      const cooldownProgress = visibleEntity.type === "pool" ? getPoolCooldownProgress(index) : 0;
      const isSkillWorkerUsed = visibleEntity.type === "skillWorker" && state.usedSkillWorkerIndices.has(index);
      card.className = `talent-card ${meta.colorClass} ${visibleEntity.type === "skillWorker" ? "skill-worker-card" : ""} ${isMovable && interactApi ? "js-draggable" : ""} ${isMergeHint ? "merge-hint-card" : ""} ${isSkillWorkerUsed ? "skill-worker-used" : ""}`;
      card.draggable = isMovable && !interactApi;
      if (isMovable) {
        card.dataset.transfer = `cell:${index}`;
      }
      if (isMovable && !interactApi) {
        card.addEventListener("dragstart", (event) => {
          event.dataTransfer.setData("text/plain", `cell:${index}`);
        });
      }
      card.innerHTML = getEntityCardInnerMarkup(visibleEntity);
      if (visibleEntity.type === "pool") {
        const cooldownEl = document.createElement("div");
        cooldownEl.className = `pool-cooldown ${cooldownProgress > 0 ? "active" : ""}`;
        cooldownEl.style.setProperty("--cooldown-progress", String(cooldownProgress));
        cooldownEl.innerHTML = `<span class="pool-cooldown-core"></span>`;
        card.append(cooldownEl);
        const costLabel = document.createElement("div");
        costLabel.className = "pool-cost-label";
        costLabel.textContent = "-1 决策点";
        card.append(costLabel);
      }
      if (isSkillWorkerUsed) {
        const usedLabel = document.createElement("div");
        usedLabel.className = "skill-worker-used-label";
        usedLabel.textContent = "本次不可使用";
        card.append(usedLabel);
      }
      cell.append(card);
      cell.title = visibleEntity.type === "talent" && state.specializationUnlocked
        ? `${getEntityLabel(visibleEntity)}，双击可转岗`
        : getEntityLabel(visibleEntity);
    }

    boardEl.append(cell);
  });
}

function renderTask() {
  if (!state.currentTask) {
    return;
  }

  taskPanelEl.classList.toggle("tutorial-flash",
    (!state.tutorialComplete && state.currentTask.id.startsWith("tutorial-")) ||
    (!state.businessTrainingComplete && state.currentTask.id.startsWith("business-")) ||
    state.currentTask.id.startsWith("business2-") ||
    state.currentTask.id.startsWith("obedience-")
  );

  const objective = state.currentTask.objective;
  const levelIcon = TALENT_META[objective.level]?.icon?.split(" ")[0] || "";
  const roleIcon = objective.role ? (objective.role === "运营" ? "📊" : "📋") : "";
  const iconText = [levelIcon, roleIcon].filter(Boolean).join(" ");
  
  const remainingTutorials = TUTORIAL_TASKS.length - state.tutorialIndex;
  const totalFreeplayTasks = FREEPLAY_TASKS.length;
  const remainingBusiness = BUSINESS_TRAINING_TASKS.length - state.businessTrainingIndex;
  const remainingBusiness2 = BUSINESS_TRAINING_TASKS_2.length - state.businessTraining2Index;
  const remainingObedience = OBEDIENCE_TRAINING_TASKS.length - state.obedienceTrainingIndex;
  
  if (!state.tutorialComplete && state.currentTask.id.startsWith("tutorial-")) {
    taskSubtitleEl.textContent = `入职培训 · ${state.currentTask.title}（剩余 ${remainingTutorials} 关）`;
  } else if (!state.businessTrainingComplete && state.currentTask.id.startsWith("business-")) {
    taskSubtitleEl.textContent = `业务培训 · ${state.currentTask.title}（剩余 ${remainingBusiness} 关）`;
  } else if (state.currentTask.id.startsWith("business2-")) {
    taskSubtitleEl.textContent = `业务培训扩大 · ${state.currentTask.title}（剩余 ${remainingBusiness2} 关）`;
  } else if (state.currentTask.id.startsWith("obedience-")) {
    taskSubtitleEl.textContent = `服从训练 · ${state.currentTask.title}（剩余 ${remainingObedience} 关）`;
  } else if (state.fundTargetActive) {
    taskSubtitleEl.textContent = `自由任务 · 第 ${state.freeplayTaskIndex || 1} 关 | 公司资金目标：${state.companyFunds} / ${state.fundTarget}`;
  } else {
    taskSubtitleEl.textContent = `自由任务 · 第 ${state.freeplayTaskIndex || 1} / ${totalFreeplayTasks} 关`;
  }
  taskDescriptionEl.textContent = state.currentTask.description;
  taskTargetEl.textContent = `任务进度：${getTaskProgress()} / ${objective.count}${iconText ? ` ${iconText}` : ""}`;
  taskRewardEl.textContent = getCurrentTaskRewardText();
  submitTaskButtonEl.disabled = !isTaskComplete() || state.isGameOver;
  submitTaskButtonEl.classList.toggle("task-complete-flash", isTaskComplete() && !state.isGameOver);
  submitTaskButtonEl.classList.toggle("task-ready", isTaskComplete() && !state.isGameOver);
}

function renderStash() {
  stashCountLabelEl.textContent = `${state.stash.length} 个`;
  const shouldFlash = (state.stash.length > 0) &&
    ((!state.tutorialComplete && state.currentTask?.id.startsWith("tutorial-")) ||
     (!state.businessTrainingComplete && state.currentTask?.id.startsWith("business-")));
  stashPanelEl.classList.toggle("stash-pending", state.stash.length > 0);
  stashPanelEl.classList.toggle("tutorial-flash", shouldFlash);
  stashListEl.innerHTML = "";
  if (state.stash.length === 0) {
    stashListEl.innerHTML = `<div class="stash-item-empty">暂无待部署资产。</div>`;
    return;
  }

  state.stash.forEach((entity) => {
    const item = document.createElement("button");
    item.className = "stash-item";
    item.type = "button";
    item.dataset.stashId = entity.id;
    const meta = getEntityVisualMeta(entity);
    item.innerHTML = `<div class="talent-card ${meta.colorClass} ${entity.type === "skillWorker" ? "skill-worker-card" : ""} stash-card">${getEntityCardInnerMarkup(entity)}</div>`;
    item.addEventListener("click", () => {
      playClickSound();
      deployStashEntity(entity.id, item);
    });
    stashListEl.append(item);
  });
}

function renderShop() {
  shopListEl.innerHTML = "";
  const template = document.querySelector("#shopItemTemplate");

  SHOP_ITEMS.forEach((item) => {
    if (item.isVisible && !item.isVisible()) {
      return;
    }
    const button = template.content.firstElementChild.cloneNode(true);
    button.id = item.id;
    button.querySelector(".shop-title").textContent = item.name;
    button.querySelector(".shop-cost").textContent = item.costLabel;
    button.querySelector(".shop-desc").textContent = item.description;
    button.disabled = item.isDisabled();
    button.addEventListener("click", () => {
      playClickSound();
      item.use();
    });
    shopListEl.appendChild(button);
  });

  if (state.specializationUnlocked) {
    SPECIALIZED_POOL_ITEMS.forEach((item) => {
      const button = template.content.firstElementChild.cloneNode(true);
      button.id = item.id;
      button.querySelector(".shop-title").textContent = item.name;
      button.querySelector(".shop-cost").textContent = item.costLabel;
      button.querySelector(".shop-desc").textContent = item.description;
      button.disabled = item.isDisabled();
      button.addEventListener("click", () => {
        playClickSound();
        item.use();
      });
      shopListEl.appendChild(button);
    });
  }

  if (state.newDepartmentsUnlocked) {
    NEW_DEPARTMENT_POOL_ITEMS.forEach((item) => {
      const button = template.content.firstElementChild.cloneNode(true);
      button.id = item.id;
      button.querySelector(".shop-title").textContent = item.name;
      button.querySelector(".shop-cost").textContent = item.costLabel;
      button.querySelector(".shop-desc").textContent = item.description;
      button.disabled = item.isDisabled();
      button.addEventListener("click", () => {
        playClickSound();
        item.use();
      });
      shopListEl.appendChild(button);
    });
  }
}

function renderPoolStore() {
  if (!poolStorePanelEl) return;
  poolStorePanelEl.classList.add("hidden");
  poolStorePanelEl.setAttribute("aria-hidden", "true");
}

function renderResources() {
  decisionPointsEl.textContent = String(state.decisionPoints);
  companyFundsEl.textContent = String(state.companyFunds);
  tokenCountEl.textContent = String(state.tokens);
  kpiCountEl.textContent = String(state.kpi);
}

function render() {
  renderResources();
  renderTask();
  renderStash();
  renderPoolStore();
  renderBoard();
  renderShop();
  renderDistillPanel();
  renderParking();
  renderModelPanel();

  if (state.fundTargetActive && state.companyFunds >= state.fundTarget && !state.isGameOver && !state.obedienceTrainingComplete && state.obedienceTrainingIndex === 0) {
    state.obedienceTrainingIndex = 0;
    state.currentTask = { ...OBEDIENCE_TRAINING_TASKS[0] };
    state.decisionPoints = state.currentTask.decisionPoints;
    showBossCarModal(true);
  }

  const isBusiness3 = state.currentTask && state.currentTask.id === "business-3";
  const isBusiness2_1 = state.currentTask && state.currentTask.id === "business2-1";
  const isObedience3 = state.currentTask && state.currentTask.id === "obedience-3";
  const showShop = isBusiness3 || isBusiness2_1 || state.businessTrainingComplete || isObedience3 || state.obedienceTrainingComplete;
  if (showShop) {
    openShopButtonEl.classList.remove("hidden");
  } else {
    openShopButtonEl.classList.add("hidden");
  }
}

function renderParking() {
  const shouldShow = state.fundTargetActive || state.bossCarModalShown;
  if (shouldShow) {
    parkingPanelEl.classList.remove("hidden");
  } else {
    parkingPanelEl.classList.add("hidden");
  }

  parkingLotEl.innerHTML = "";
  state.parkingCars.forEach((car) => {
    const carEl = document.createElement("div");
    carEl.className = "parking-car";
    carEl.textContent = car.emoji;
    carEl.title = car.name;
    parkingLotEl.appendChild(carEl);
  });
}

function renderCarShop() {
  carShopListEl.innerHTML = "";
  CAR_SHOP_ITEMS.forEach((car) => {
    const canAfford = state.companyFunds >= car.price;
    const itemEl = document.createElement("div");
    itemEl.className = "car-item" + (canAfford ? "" : " disabled");
    itemEl.innerHTML = `
      <span class="car-emoji">${car.emoji}</span>
      <div class="car-info">
        <span class="car-name">${car.name}</span>
        <span class="car-price">${car.price} 公司资金</span>
      </div>
    `;
    if (canAfford) {
      itemEl.addEventListener("click", () => {
        playClickSound();
        buyCar(car);
      });
    }
    carShopListEl.appendChild(itemEl);
  });
}

function buyCar(car) {
  if (state.companyFunds < car.price) {
    addLog(`公司资金不足，无法购买 ${car.name}`, "warning");
    return;
  }
  state.companyFunds -= car.price;
  state.parkingCars.push({ id: car.id, name: car.name, emoji: car.emoji });
  addLog(`成功购买 ${car.name} ${car.emoji}！`);
  carShopModalEl.classList.add("hidden");
  carShopModalEl.setAttribute("aria-hidden", "true");
  render();
  animateModalEntrance(parkingPanelEl);
}

function showBossCarModal(visible) {
  bossCarModalEl.classList.toggle("hidden", !visible);
  bossCarModalEl.setAttribute("aria-hidden", String(!visible));
  if (visible) {
    animateModalEntrance(bossCarModalEl);
  }
}

function renderModelPanel() {
  const shouldShow = state.obedienceTrainingIndex >= 1 || state.bossModels.length > 0;
  if (shouldShow) {
    modelPanelEl.classList.remove("hidden");
  } else {
    modelPanelEl.classList.add("hidden");
  }

  modelLotEl.innerHTML = "";
  state.bossModels.forEach((model) => {
    const modelEl = document.createElement("div");
    modelEl.className = "parking-car";
    modelEl.textContent = model.emoji;
    modelEl.title = model.name;
    modelLotEl.appendChild(modelEl);
  });
}

function renderModelShop() {
  modelShopListEl.innerHTML = "";
  MODEL_SHOP_ITEMS.forEach((model) => {
    const canAfford = state.companyFunds >= model.price;
    const itemEl = document.createElement("div");
    itemEl.className = "car-item" + (canAfford ? "" : " disabled");
    itemEl.innerHTML = `
      <span class="car-emoji">${model.emoji}</span>
      <div class="car-info">
        <span class="car-name">${model.name}</span>
        <span class="car-price">${model.price} 公司资金</span>
      </div>
    `;
    if (canAfford) {
      itemEl.addEventListener("click", () => {
        playClickSound();
        buyModel(model);
      });
    }
    modelShopListEl.appendChild(itemEl);
  });
}

function buyModel(model) {
  if (state.companyFunds < model.price) {
    addLog(`公司资金不足，无法召唤 ${model.name}`, "warning");
    return;
  }
  state.companyFunds -= model.price;
  state.bossModels.push({ id: model.id, name: model.name, emoji: model.emoji });
  addLog(`成功召唤 ${model.name} ${model.emoji}！`);
  modelShopModalEl.classList.add("hidden");
  modelShopModalEl.setAttribute("aria-hidden", "true");
  render();
  animateModalEntrance(modelPanelEl);
}

function showObedience2Modal(visible) {
  obedience2ModalEl.classList.toggle("hidden", !visible);
  obedience2ModalEl.setAttribute("aria-hidden", String(!visible));
  if (visible) {
    animateModalEntrance(obedience2ModalEl);
  }
}

function showObedience3Modal(visible) {
  obedience3ModalEl.classList.toggle("hidden", !visible);
  obedience3ModalEl.setAttribute("aria-hidden", String(!visible));
  if (visible) {
    animateModalEntrance(obedience3ModalEl);
  }
}

function showObedienceCompleteModal(visible) {
  obedienceCompleteModalEl.classList.toggle("hidden", !visible);
  obedienceCompleteModalEl.setAttribute("aria-hidden", String(!visible));
  if (visible) {
    animateModalEntrance(obedienceCompleteModalEl);
  }
}

function renderDistillPanel() {
  const distillPanel = document.querySelector("#distillPanel");
  const shouldShow = state.tutorialComplete || 
    (state.currentTask && state.currentTask.id === "tutorial-5");
  
  if (shouldShow) {
    distillPanel.classList.remove("hidden");
  } else {
    distillPanel.classList.add("hidden");
  }
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
  state.isGameOver = false;
  state.tutorialIndex = 0;
  state.tutorialComplete = false;
  state.totalUnlockedCells = 0;
  state.totalDistilled = 0;
  state.completedFreeplayTasks = 0;
  state.freeplayTaskIndex = 1;
  state.specializationUnlocked = false;
  state.businessTrainingIndex = 0;
  state.businessTrainingComplete = false;
  state.businessTraining2Index = 0;
  state.businessTraining2Complete = false;
  state.freeplayAfterBusinessTraining = 0;
  state.businessRecruitCount = 0;
  state.totalExchanged = 0;
  state.totalSkillWorkerExchanges = 0;
  state.boardExpanded = false;
  state.pendingSkillWorkerIndex = null;
  state.pendingTransferIndex = null;
  state.incomingCells = new Set();
  state.mergeHintCells = new Set();
  state.usedSkillWorkerIndices = new Set();
  state.lastInteractionAt = Date.now();
  state.poolCooldowns = new Map();
  state.fundTargetActive = false;
  state.parkingCars = [];
  state.bossCarModalShown = false;
  state.obedienceTrainingIndex = 0;
  state.obedienceTrainingComplete = false;
  state.bossModels = [];
  state.newDepartmentsUnlocked = false;

  if (!state.tutorialComplete && state.tutorialIndex === 0) {
    state.stash.push(createEntity("pool", 1));
  }

  assignTutorialTask();
  showFailureModal(false);
  showSpecializationModal(false);
  showTutorialCompleteModal(false);
  showBusinessTrainingCompleteModal(false);
  showBusinessTraining2Modal(false);
  showFundTargetModal(false);
  showBossCarModal(false);
  showObedience2Modal(false);
  showObedience3Modal(false);
  showObedienceCompleteModal(false);
  showGameWinModal(false);
  closeSkillWorkerModal();
  closeTransferModal();
  addLog("你重生了，这一世你再次入职成功。新的培训任务已经发到你的桌上。");
  render();
}

initializeEnhancedInteractions();
restartGame();
window.setInterval(tickPoolCooldowns, 100);
window.setInterval(pulseAvailablePools, 3000);
window.setInterval(maybeShowMergeHints, 1000);
