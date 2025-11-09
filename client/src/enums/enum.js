export const DAILY_TASK_TEXT = 'Task hằng ngày';

export const ProjectStatus = {
  DOING: 'doing',
  END_PENDING_UPDATE: 'end_pending_update',
  SNAPSHOT: 'snapshot',
  TGE: 'tge',
  END_AIRDROP: 'end_airdrop',
}

export const PROJECT_STATUS_ARR = [
  ProjectStatus.DOING,
  ProjectStatus.END_PENDING_UPDATE,
  ProjectStatus.SNAPSHOT,
  ProjectStatus.TGE,
  ProjectStatus.END_AIRDROP
]

export const TaskType = {
  DAILY: 'daily',
  POINTS: 'points',
  OFF_CHAIN: 'off_chain',
  AIRDROP: 'airdrop',
  REG: 'reg',
  LOGIN: 'login',
}

export const PROJECT_TASK_TYPE_ARR = [
  TaskType.REG,
  TaskType.LOGIN,
  TaskType.DAILY,
  TaskType.POINTS,
  TaskType.OFF_CHAIN,
  TaskType.AIRDROP,
]

export const ProjectCost = {
  FREE: 'free',
  FEE: 'fee',
  HOLD: 'hold',
}

export const ProjectType = {
  DEPIN: 'depin',
  TESTNET: 'testnet',
  RETROACTIVE: 'retroactive',
  WEB: 'web',
  GALXE: 'galxe',
  GAME: 'game',
}

export const PROJECT_TYPE_ARR = [
  ProjectType.WEB,
  ProjectType.TESTNET,
  ProjectType.DEPIN,
  ProjectType.RETROACTIVE,
  ProjectType.GAME,
  // ProjectType.GALXE,
]


export const Color = {
  SUCCESS: '#22C55E',
  DANGER: '#fd5c63',
  WARNING: '#FCB700',
  ORANGE: '#FA8072',
  SECONDARY: '#7173F2',
  PRIMARY: '#0EA5E9',
  INFO: '#87CEEB',
  ORANGE1: '#ffb4a2',
  BROWN: '#F5DEB3',
  BROWN1: '#C19A6B',
  MAIN: '#D97757',
}

export const WalletStatus = {
  IN_ACTIVE: 'in_active',
  UN_ACTIVE: 'un_active',
}

export const StatusCommon = {
  IN_ACTIVE: 'in_active',
  UN_ACTIVE: 'un_active',
  IN_COMPLETE: 'in_complete',
  COMPLETED: 'completed',
}

export const DailyTaskRefresh = {
  UTC0: 'utc0',
  NEW_TASK: 'new_task',
  COUNT_DOWN_TIME_IT_UP: 'count_down_time_it_up',
  UNKNOWN: 'unknown',
}

export const NOT_AVAILABLE = 'N/A';
export const TRASH_DATA_TYPE = 'TRASH_DATA_TYPE';
export const CURRENT_DATA_TYPE = 'CURRENT_DATA_TYPE';


export const TaskStatus = {
  TO_DO: 'to_do',
  IN_PROGRESS: 'in_progress',
  TO_REVIEW: 'to_review',
  COMPLETED: 'completed',
}

export const TaskRank = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}

export const DELAY_TIME_SCRIPT = 5000;
export const SIZE_ICON_ACTION = '18px';
export const TIMEOUT_SCRIPT = 30000;
export const TIMEOUT_DIVIDE = 1000;
export const STEP_DEFAULT_TIMEOUT = 1000;

export const ERROR_MESSAGE = 'Error';
export const SUCCESS_MESSAGE = 'Success';
