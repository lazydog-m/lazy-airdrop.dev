import { RESOURCES } from "@/commons/Resources";
import { Color, DailyTaskRefresh, DAILY_TASK_TEXT, ProjectCost, ProjectStatus, ProjectType, StatusCommon, TaskStatus, TaskType } from "@/enums/enum";

export const convertProjectStatusEnumToText = (status) => {

  switch (status) {
    case ProjectStatus.DOING:
      return "Đang làm"
    case ProjectStatus.END_PENDING_UPDATE:
      return "End - Chờ Update"
    case ProjectStatus.SNAPSHOT:
      return "Snapshot"
    case ProjectStatus.TGE:
      return "TGE Soon"
    case ProjectStatus.END_AIRDROP:
      return "Airdrop"
    default: return status
  }
}

export const convertProjectStatusEnumToColorHex = (status) => {

  switch (status) {
    case ProjectStatus.DOING:
      return Color.SUCCESS
    case ProjectStatus.END_PENDING_UPDATE:
      return Color.WARNING
    case ProjectStatus.TGE:
      return Color.PRIMARY
    case ProjectStatus.SNAPSHOT:
      return Color.SECONDARY
    case ProjectStatus.END_AIRDROP:
      return Color.ORANGE
    default: return null
  }

}

export const convertProjectTypeEnumToColorHex = (type) => {

  switch (type) {
    case ProjectType.WEB:
      return Color.ORANGE
    case ProjectType.GALXE:
      return Color.SECONDARY
    case ProjectType.TESTNET:
      return Color.SUCCESS
    case ProjectType.GAME:
      return Color.PRIMARY
    case ProjectType.DEPIN:
      return Color.WARNING
    case ProjectType.RETROACTIVE:
      return Color.BROWN1
    default: return null
  }

}

export const convertProjectCostTypeEnumToColorHex = (costType) => {

  switch (costType) {
    case ProjectCost.FREE:
      return Color.INFO
    case ProjectCost.FEE:
      return Color.ORANGE1
    case ProjectCost.HOLD:
      return Color.BROWN
    default: return null
  }

}

export const convertProjectTaskItemsToColorHex = (item) => {

  switch (item) {
    case convertStatusCommonEnumToText(StatusCommon.IN_COMPLETE):
      return Color.ORANGE
    case convertDailyTaskRefreshEnumToText(DailyTaskRefresh.UTC0):
      return Color.PRIMARY
    case convertDailyTaskRefreshEnumToText(DailyTaskRefresh.COUNT_DOWN_TIME_IT_UP):
      return Color.WARNING
    default: return Color.SUCCESS
  }

}

export const convertStatusCommonEnumToText = (status) => {

  switch (status) {
    case StatusCommon.IN_ACTIVE:
      return 'Đang hoạt động'
    case StatusCommon.UN_ACTIVE:
      return 'Ngừng Hoạt Động'
    case StatusCommon.COMPLETED:
      return 'Đã hoàn thành'
    case StatusCommon.IN_COMPLETE:
      return 'Chưa hoàn thành'
    default: return null
  }

}

export const convertStatusCommonEnumToColorHex = (status) => {

  switch (status) {
    case StatusCommon.IN_ACTIVE:
      return Color.PRIMARY
    case StatusCommon.UN_ACTIVE:
      return Color.ORANGE
    default: return null
  }

}

export const convertResource = (id) => {

  const findRes = RESOURCES.find(res => res?.id === id);
  return `${findRes?.title}`;

}

export const convertWalletStatusEnumToText = (status) => {

  switch (status) {
    case StatusCommon.IN_ACTIVE:
      return 'Đang hoạt động'
    case StatusCommon.UN_ACTIVE:
      return 'Ngừng Hoạt Động'
    default: return null
  }

}

export const convertWalletStatusEnumToReverse = (status) => {

  switch (status) {
    case StatusCommon.IN_ACTIVE:
      return StatusCommon.UN_ACTIVE
    case StatusCommon.UN_ACTIVE:
      return StatusCommon.IN_ACTIVE
    default: return null
  }

}

export const convertWalletStatusEnumToColorHex = (status) => {

  switch (status) {
    case StatusCommon.IN_ACTIVE:
      return Color.PRIMARY
    case StatusCommon.UN_ACTIVE:
      return Color.ORANGE
    default: return null
  }

}

export const convertDailyTaskRefreshEnumToText = (type) => {

  switch (type) {
    case DailyTaskRefresh.UNKNOWN:
      return DailyTaskRefresh.UNKNOWN
    case DailyTaskRefresh.UTC0:
      return '7:00 AM'
    case DailyTaskRefresh.COUNT_DOWN_TIME_IT_UP:
      return 'CD-24'
    case DailyTaskRefresh.NEW_TASK:
      return 'Random trong ngày'
    default: return null
  }

}

export const convertEmailToEmailUsername = (email) => {
  const username = email?.split('@')[0] || null;
  return username;
}

export const shortenAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const convertBitToBoolean = (bit) => {

  switch (bit) {
    case 1:
      return true
    case 0:
      return false
    default: return null
  }

}

export const convertProjectTaskTypeEnumToText = (type) => {

  switch (type) {
    case TaskType.REG:
      return "Reg"
    case TaskType.LOGIN:
      return "Login"
    case TaskType.DAILY:
      return "Daily"
    case TaskType.POINTS:
      return "Points/Connect"
    case TaskType.OFF_CHAIN:
      return "Off-Chain"
    case TaskType.AIRDROP:
      return "Airdrop"
    default: return type
  }

}


export const convertTaskStatusEnumToText = (status) => {

  switch (status) {
    case TaskStatus.TO_DO:
      return "Cần làm"
    case TaskStatus.IN_PROGRESS:
      return "Đang làm"
    case TaskStatus.TO_REVIEW:
      return "Cần xem lại"
    case TaskStatus.COMPLETED:
      return "Đã hoàn thành"
    default: return status
  }

}

export const convertTaskStatusEnumToColorHex = (status) => {

  switch (status) {
    case TaskStatus.TO_DO:
      return Color.WARNING
    case TaskStatus.IN_PROGRESS:
      return Color.PRIMARY
    case TaskStatus.TO_REVIEW:
      return Color.SECONDARY
    case TaskStatus.COMPLETED:
      return Color.SUCCESS
    default: return null
  }

}

export const getMasked = (data) => {
  const masked = "*".repeat(data.length);
  return masked;
}

export const lightenColor = (hex, percent = 0.05) => {
  if (!hex?.startsWith("#") || hex.length !== 7) return hex;

  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  r = Math.min(255, Math.floor(r + (255 - r) * percent));
  g = Math.min(255, Math.floor(g + (255 - g) * percent));
  b = Math.min(255, Math.floor(b + (255 - b) * percent));

  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export const darkenColor = (hex, percent = 0.60) => {
  if (!hex?.startsWith('#') || hex.length !== 7) return hex;

  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  r = Math.max(0, Math.floor(r * (1 - percent)));
  g = Math.max(0, Math.floor(g * (1 - percent)));
  b = Math.max(0, Math.floor(b * (1 - percent)));

  return `#${r.toString(16).padStart(2, '0')}${g
    .toString(16)
    .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export const parseNumber = (timeout = 0) => {
  return parseInt(timeout, 10) || 0;
}

export const textTrim = (text = '') => {
  return text.trim();
}

export const textCapitalize = (text = '') => {
  return text?.toLowerCase()?.replace(/\b\w/g, c => c?.toUpperCase());
}
