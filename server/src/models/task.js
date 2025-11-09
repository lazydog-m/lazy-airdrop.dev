const { DataTypes } = require('sequelize');
const db = require('../configs/dbConnection');
const { TaskType, TaskStatus, TaskRank, StatusCommon } = require('../enums');

const Task = db.define('tasks', {
  id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  project_id: {
    type: DataTypes.UUID,
    references: {
      model: 'projects',
      key: 'id'
    },
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  points: {
    type: DataTypes.INTEGER,
  },
  url: {
    type: DataTypes.STRING(1000),
  },
  type: {
    type: DataTypes.ENUM,
    values: [
      TaskType.REG,
      TaskType.LOGIN,
      TaskType.DAILY,
      TaskType.POINTS,
      TaskType.OFF_CHAIN,
      TaskType.AIRDROP,
    ],
    defaultValue: TaskType.DAILY,
  },
  script_id: {
    type: DataTypes.STRING(255),
  },
  description: {
    type: DataTypes.STRING(10000),
  },
  has_manual: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  order_star: {
    type: DataTypes.DATE,
  },
  status: {
    type: DataTypes.ENUM,
    values: [StatusCommon.IN_ACTIVE, StatusCommon.UN_ACTIVE],
    defaultValue: StatusCommon.IN_ACTIVE,
  },
  due_date: {
    type: DataTypes.DATEONLY,
  },
  deletedAt: {
    type: DataTypes.DATE,
  },
},
  {
    timestamps: true,
  });

module.exports = Task;
