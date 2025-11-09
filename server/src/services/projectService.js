const Project = require('../models/project');
const NotFoundException = require('../exceptions/NotFoundException');
const ValidationException = require('../exceptions/ValidationException');
const Joi = require('joi');
const RestApiException = require('../exceptions/RestApiException');
const { ProjectType, ProjectStatus, DailyTaskRefresh, Pagination } = require('../enums');
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../configs/dbConnection');
const DailyTaskCompleted = require('../models/daily_task_completed');
const { convertArr } = require('../utils/convertUtil');

const projectSchema = Joi.object({
  name: Joi.string().trim().required().max(50).messages({
    'string.base': 'Tên dự án phải là chuỗi',
    'string.empty': 'Tên dự án không được bỏ trống!',
    'any.required': 'Tên dự án không được bỏ trống!',
    'string.max': 'Tên dự án chỉ đươc phép dài tối đa 50 ký tự!',
  }),
  resources: Joi.array()
    .items(
      Joi.string().trim().messages({
        'string.base': 'Tài nguyên phải là chuỗi',
        'string.empty': 'Tài nguyên không được bỏ trống',
      })
    )
    .messages({
      'array.base': 'Tài nguyên phải là một mảng',
    }),
  url: Joi.string()
    .trim()
    .max(1000)
    .allow('')
    .messages({
      'string.base': 'Link dự án phải là chuỗi',
      'string.max': 'Link dự án chỉ đươc phép dài tối đa 1,000 ký tự!',
    }),
  note: Joi.string()
    .trim()
    .max(10000)
    .allow('')
    .messages({
      'string.base': 'Ghi chú phải là chuỗi',
      'string.max': 'Ghi chú chỉ đươc phép dài tối đa 10,000 ký tự!',
    }),
  type: Joi
    .valid(ProjectType.GAME, ProjectType.DEPIN, ProjectType.TESTNET, ProjectType.WEB, ProjectType.GALXE, ProjectType.RETROACTIVE)
    .messages({
      'any.only': 'Mảng dự án không hợp lệ!'
    }),
  daily_tasks_refresh: Joi.string()
    .valid(DailyTaskRefresh.UNKNOWN, DailyTaskRefresh.COUNT_DOWN_TIME_IT_UP, DailyTaskRefresh.NEW_TASK, DailyTaskRefresh.UTC0)
    .messages({
      'any.only': 'Thời điểm làm mới task hằng ngày không hợp lệ!'
    }),
  status: Joi
    .valid(ProjectStatus.DOING, ProjectStatus.END_PENDING_UPDATE, ProjectStatus.TGE, ProjectStatus.SNAPSHOT, ProjectStatus.END_AIRDROP)
    .messages({
      'any.only': 'Trạng thái dự án không hợp lệ!'
    }),
});

const projectStatusValidation = Joi.object({
  status: Joi.required()
    .valid(ProjectStatus.DOING, ProjectStatus.END_PENDING_UPDATE, ProjectStatus.TGE, ProjectStatus.SNAPSHOT, ProjectStatus.END_AIRDROP)
    .messages({
      'any.only': 'Trạng thái dự án không hợp lệ!',
      'any.required': 'Trạng thái dự án không được bỏ trống!',
    }),
});

const getAllProjects = async (req) => {
  const {
    selectedTaskItems,
    selectedTask,
    selectedSortDate,
    selectedTypeItems,
    selectedStatusItems,
    page,
    search
  } = req.query;

  const statusArr = convertArr(selectedStatusItems);
  const typeArr = convertArr(selectedTypeItems);
  const taskArr = convertArr(selectedTaskItems);

  const currentPage = Number(page) || 1;
  const offset = (currentPage - 1) * Pagination.limit;

  let whereClause = 'WHERE p.deletedAt IS NULL';
  let orderByClause = '';
  const conditions = [];
  const replacements = [];

  if (search) {
    conditions.push(`p.name LIKE ?`);
    replacements.push(`%${search}%`);
  }

  if (statusArr?.length > 0) {
    const statusPlaceholders = statusArr.map((_, index) => `?`).join(',');
    conditions.push(`p.status IN (${statusPlaceholders})`);
    replacements.push(...statusArr);
  }

  if (typeArr?.length > 0) {
    const typePlaceholders = typeArr.map((_, index) => `?`).join(',');
    conditions.push(`p.type IN (${typePlaceholders})`);
    replacements.push(...typeArr);
  }

  if (selectedTask === 'Task hằng ngày') {
    conditions.push(`p.daily_tasks IS NOT NULL AND p.daily_tasks != ''`);
  }

  // if (selectedTask === 'Task Dự Án') {
  //   conditions.push(`p.daily_tasks IS NOT NULL AND p.daily_tasks != ''`);
  // }

  // if (selectedTaskItems?.length > 0) {
  //   const costPlaceholders = selectedCostItems.map((_, index) => `?`).join(',');
  //   conditions.push(`p.cost_type IN (${costPlaceholders})`);
  //   replacements.push(...selectedCostItems);
  // }

  if (selectedSortDate === 'Ngày Làm (by Desc)') {
    orderByClause = 'ORDER BY p.createdAt DESC';
  } else if (selectedSortDate === 'Ngày End (by Desc)') {
    orderByClause = 'ORDER BY p.end_date DESC';
  } else if (selectedSortDate === 'Ngày Làm (by Asc)') {
    orderByClause = 'ORDER BY p.createdAt ASC';
  } else if (selectedSortDate === 'Ngày End (by Asc)') {
    orderByClause = 'ORDER BY p.end_date ASC';
  }
  else {
    orderByClause = 'ORDER BY p.createdAt DESC';
  }

  if (taskArr?.length > 0) {
    const time = [];

    if (taskArr.includes('UTC+0')) time.push(DailyTaskRefresh.UTC0);
    if (taskArr.includes('CD-24')) time.push(DailyTaskRefresh.COUNT_DOWN_TIME_IT_UP);

    if (time.length > 0) {
      const timePlaceholders = time.map((_, index) => `?`).join(',');
      conditions.push(`p.daily_tasks_refresh IN (${timePlaceholders})`);
      replacements.push(...time);
    }

    // if (taskArr.includes('Chưa Hoàn Thành')) {
    //   const status = [ProjectStatus.DOING];
    //   conditions.push(`dtc.max_id IS NULL`);
    //   replacements.push(...status);
    // }
  }

  if (conditions.length > 0) {
    whereClause += ' AND ' + conditions.join(' AND ');
  }

  const query = `
    SELECT 
      p.id, 
      p.name, 
      p.url, 
      p.type, 
      p.status, 
      p.createdAt, 
      p.end_date, 
      p.resources, 
      p.note, 
      p.daily_tasks_refresh
    FROM 
      projects p
   ${whereClause} 
   ${orderByClause}
   LIMIT ${Pagination.limit} OFFSET ${offset};`;

  const data = await sequelize.query(query, {
    replacements: replacements,
  });

  const countQuery = `
  SELECT COUNT(*) AS total 
   FROM projects p
  ${whereClause};`;

  const countResult = await sequelize.query(countQuery, {
    replacements: replacements,
  });

  const total = countResult[0][0]?.total;
  const totalPages = Math.ceil(total / Pagination.limit);

  const convertedData = data[0].map((item) => {
    return {
      ...item,
      daily_tasks_completed: item.daily_tasks_completed === null ? false : true,
    }
  })

  return {
    data: convertedData,
    pagination: {
      page: parseInt(currentPage, 10),
      totalItems: total,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPre: currentPage > 1
    }
  };
}

const getAllProjectNames = async (req) => {
  const {
    search
  } = req.query;

  let whereClause = 'WHERE p.deletedAt IS NULL';
  const conditions = [];
  const replacements = [];

  if (search) {
    conditions.push(`p.name LIKE ?`);
    replacements.push(`%${search}%`);
  }

  if (conditions.length > 0) {
    whereClause += ' AND ' + conditions.join(' AND ');
  }

  const query = `
    SELECT 
      p.name 
    FROM 
      projects p
   ${whereClause} 
   LIMIT 20`;

  const data = await sequelize.query(query, {
    replacements: replacements,
  });

  return {
    data: data[0],
    pagination: {
      totalItems: data.length,
    }
  };
}

const countProject = async () => {
  const whereConditions = {
    deletedAt: null,
  };
  const count = await Project.count({
    where: whereConditions,
  });
  return count;
}

const getProjectNameById = async (id) => {
  const project = await Project.findOne({
    where: {
      id,
      deletedAt: null,
    }
  });

  if (!project) {
    return "";
  }

  return project.name;
}

const getProjectIdByName = async (name) => {
  const project = await Project.findOne({
    where: {
      name,
      deletedAt: null,
    }
  });

  if (!project) {
    throw new NotFoundException(`Không tìm thấy dự án này`)
  }

  return project.id;
}

const getProjectById = async (id) => {
  const project = await Project.findByPk(id);

  if (!project) {
    throw new NotFoundException(`Không tìm thấy dự án này`)
  }

  return project;
}

const completeDailyTasks = async (body) => {

  const { project_id } = body;

  const dailyTaskCompleted = await DailyTaskCompleted.create({
    project_id,
  });

  const result = await sequelize.query(queryAfterSave, {
    replacements: { id: dailyTaskCompleted.project_id },
  });

  const item = { ...result[0][0] };
  const convertedData = convertItem(item);
  // console.log(item)

  return convertedData;
}

const convertItem = (item) => {
  return {
    ...item,
    daily_tasks_completed: item.daily_tasks_completed === null ? false : true,
  }
}

const createProject = async (body) => {
  const data = validateProject(body);

  const existing = await Project.findOne({
    where: {
      name: data.name,
      deletedAt: null,
    }
  });

  if (existing) {
    throw new RestApiException('Tên dự án đã tồn tại!');
  }

  const createdProject = await Project.create({
    ...data,
  });

  return createdProject;
}

const updateProject = async (body) => {
  const { id } = body;
  const data = validateProject(body);

  const existing = await Project.findOne({
    where: {
      name: data.name,
      id: { [Op.ne]: id },
      deletedAt: null,
    }
  });

  if (existing) {
    throw new RestApiException('Tên dự án đã tồn tại!');
  }

  const [updatedCount] = await Project.update({
    ...data,
  }, {
    where: {
      id: id,
    }
  });

  if (!updatedCount) {
    throw new NotFoundException('Không tìm thấy dự án này!');
  }

  const updatedProject = await Project.findByPk(id);

  return updatedProject;
}

const updateProjectStatus = async (body) => {
  const { id, status } = body;
  validateProjectStatus(body);

  const [updatedCount] = await Project.update({
    status: status,
    end_date: status === ProjectStatus.END_AIRDROP ? Sequelize.fn('NOW') : null,
  }, {
    where: {
      id: id,
    }
  });

  if (!updatedCount) {
    throw new NotFoundException('Không tìm thấy dự án này!');
  }

  const updatedProject = await Project.findByPk(id);

  return updatedProject;
}

const deleteProject = async (id) => {

  const [deletedCount] = await Project.update({
    deletedAt: Sequelize.fn('NOW'),
  }, {
    where: {
      id: id,
    }
  });

  if (!deletedCount) {
    throw new NotFoundException('Không tìm thấy dự án này!');
  }

  return id;
}

const validateProject = (data) => {
  const { error, value } = projectSchema.validate(data, { stripUnknown: true });

  if (error) {
    throw new ValidationException(error.details[0].message);
  }

  return value;
};

const validateProjectStatus = (data) => {
  const { error, value } = projectStatusValidation.validate(data, { stripUnknown: true });

  if (error) {
    throw new ValidationException(error.details[0].message);
  }

  return value;
};

module.exports = {
  getAllProjects,
  getAllProjectNames,
  getProjectById,
  getProjectIdByName,
  getProjectNameById,
  createProject,
  updateProject,
  updateProjectStatus,
  deleteProject,
};



