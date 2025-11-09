
const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  FORBIDDEN: "403",
  BAD_REQUEST: 400,
  VALIDATION: 422,
  UNAUTHORIZED: 401,
};

const Message = {
  SUCCESS: "Success",
  ERROR: "Error",
};

const HttpStatusCode = {
  OK: "OK",
  CREATED: "CREATED",
  NO_CONTENT: "NO_CONTENT",
  NOT_FOUND: "NOT_FOUND",
  SERVER_ERROR: "SERVER_ERROR",
  FORBIDDEN: "FORBIDDEN",
  BAD_REQUEST: "BAD_REQUEST",
  VALIDATION: "VALIDATION",
  UNAUTHORIZED: "UNAUTHORIZED",
};

const Metadata = {
  name: "AirdropHub",
}

const ProjectStatus = {
  DOING: 'doing',
  END_PENDING_UPDATE: 'end_pending_update',
  SNAPSHOT: 'snapshot',
  TGE: 'tge',
  END_AIRDROP: 'end_airdrop',
}

const WalletStatus = {
  IN_ACTIVE: 'in_active',
  UN_ACTIVE: 'un_active',
}

const StatusCommon = {
  IN_ACTIVE: 'in_active',
  UN_ACTIVE: 'un_active',
}

const ProjectCost = {
  FREE: 'free',
  FEE: 'fee',
  HOLD: 'hold',
}

const ProjectType = {
  DEPIN: 'depin',
  TESTNET: 'testnet',
  RETROACTIVE: 'retroactive',
  WEB: 'web',
  GALXE: 'galxe',
  GAME: 'game',
}

const DailyTaskRefresh = {
  UTC0: 'utc0',
  NEW_TASK: 'new_task',
  COUNT_DOWN_TIME_IT_UP: 'count_down_time_it_up',
  UNKNOWN: 'unknown',
}

const TaskStatus = {
  TO_DO: 'to_do',
  IN_PROGRESS: 'in_progress',
  TO_REVIEW: 'to_review',
  COMPLETED: 'completed',
}

const TaskType = {
  DAILY: 'daily',
  POINTS: 'points',
  OFF_CHAIN: 'off_chain',
  AIRDROP: 'airdrop',
  REG: 'reg',
  LOGIN: 'login',
}

const TaskRank = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}

const TRASH_DATA_TYPE = 'TRASH_DATA_TYPE';
const CURRENT_DATA_TYPE = 'CURRENT_DATA_TYPE';

const WEB3_WALLET_RESOURCE_IDS = [
  'metamask', 'suiwallet', 'backpack',
]

const Pagination = {
  limit: 12,
}

module.exports = {
  HttpStatus,
  Message,
  Metadata,
  ProjectStatus,
  ProjectType,
  DailyTaskRefresh,
  ProjectCost,
  HttpStatusCode,
  WalletStatus,
  TaskRank,
  TaskStatus,
  TaskType,
  TRASH_DATA_TYPE,
  CURRENT_DATA_TYPE,
  Pagination,
  StatusCommon,
  WEB3_WALLET_RESOURCE_IDS,
};
