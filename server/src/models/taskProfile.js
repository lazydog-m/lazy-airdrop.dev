const { DataTypes } = require('sequelize');
const db = require('../configs/dbConnection');
const { StatusCommon } = require('../enums');

const TaskProfile = db.define('task_profiles', {
  id: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  project_profile_id: {
    type: DataTypes.UUID,
    references: {
      model: 'project_profiles',
      key: 'id'
    },
    allowNull: false,
  },
  task_id: {
    type: DataTypes.UUID,
    references: {
      model: 'tasks',
      key: 'id'
    },
    allowNull: false,
  },
  // status: {
  //   type: DataTypes.ENUM,
  //   values: [StatusCommon.UN_ACTIVE, StatusCommon.IN_ACTIVE],
  //   defaultValue: StatusCommon.IN_ACTIVE,
  // },
  // deletedAt: {
  //   type: DataTypes.DATE,
  // },
  // note: {
  //   type: DataTypes.TEXT,
  // },
  //status, note?
},
  {
    timestamps: true,
  });

module.exports = TaskProfile;
