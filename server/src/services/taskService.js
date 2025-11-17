const NotFoundException = require('../exceptions/NotFoundException');
const ValidationException = require('../exceptions/ValidationException');
const Joi = require('joi');
const RestApiException = require('../exceptions/RestApiException');
const { TaskStatus, StatusCommon, TaskType } = require('../enums');
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../configs/dbConnection');
const Task = require('../models/task');
const { convertBitToBoolean } = require('../utils/convertUtil');
const { getProjectById } = require('./projectService');
const { getScriptNameById, getScriptIdByName } = require('./scriptService');

const taskSchema = Joi.object({
  name: Joi.string().trim().required().max(255).messages({
    'string.base': 'Tên task phải là chuỗi', // Joi.string
    'string.empty': 'Tên task không được bỏ trống!', // Joi.string
    'any.required': 'Tên task không được bỏ trống!', // Joi.required => {name: undefined}, {empty field name} => invalid
    'string.max': 'Tên task chỉ đươc phép dài tối đa 255 ký tự!', // Joi.max
  }),
  project_id: Joi.string().trim().required().max(36).messages({
    'string.base': 'Project id phải là chuỗi',
    'string.empty': 'Project id không được bỏ trống!',
    'any.required': 'Project id không được bỏ trống!',
    'string.max': 'Project id chỉ đươc phép dài tối đa 36 ký tự!',
  }),
  script_id: Joi.string()
    .trim()
    .max(255)
    .allow('')
    .messages({
      'string.base': 'Script id phải là chuỗi',
      'string.empty': 'Script id không được bỏ trống!',
      'any.required': 'Script id không được bỏ trống!',
      'string.max': 'Script id chỉ đươc phép dài tối đa 255 ký tự!',
    }),
  points: Joi.number().integer().min(1).max(2000000000)
    .allow(null)
    .messages({
      'number.base': 'Points phải là số!',
      'number.integer': 'Points phải là số nguyên!',
      'number.min': 'Points phải lớn hơn 0!',
      'number.max': 'Points phải bé hơn 2,000,000,000!',
    }),
  // Không dùng Joi.required => {name: undefined}, {empty field name} => valid => field ko bao gồm trong data sau khi validate
  // Nhưng khi {name: value} => Joi.string yêu cầu value phải là string và ko empty => sử dụng allow('') để cho phép "value" empty
  url: Joi.string()
    .trim()
    .max(1000)
    .allow('')
    .messages({
      'string.base': 'Url phải là chuỗi',
      'string.max': 'Url chỉ đươc phép dài tối đa 1,000 ký tự!',
    }),
  description: Joi.string()
    .trim()
    .max(10000)
    .allow('')
    .messages({
      'string.base': 'Mô tả phải là chuỗi',
      'string.max': 'Mô tả chỉ đươc phép dài tối đa 10,000 ký tự!',
    }),
  has_manual: Joi.boolean()
    .valid(true, false)
    .messages({
      'any.only': 'Manual phải là true hoặc false!',
    }),
  // due_date: Joi.date().iso().allow(null).optional().messages({
  //   'date.base': 'Ngày hết hạn không hợp lệ!',
  //   'date.format': 'Ngày hết hạn phải có định dạng YYYY-MM-DD!',
  //   'any.required': 'Ngày hết hạn không được bỏ trống!',
  // }),
  type: Joi
    .valid(
      TaskType.REG,
      TaskType.LOGIN,
      TaskType.DAILY,
      TaskType.POINTS,
      TaskType.OFF_CHAIN,
      TaskType.AIRDROP,
    )
    .messages({
      'any.only': 'Loại task không hợp lệ!',
    }),
  status: Joi
    .valid(StatusCommon.UN_ACTIVE, StatusCommon.IN_ACTIVE)
    .messages({
      'any.only': 'Trạng thái task không hợp lệ!'
    }),
});

const taskStatusValidation = Joi.object({
  status: Joi.required()
    .valid(TaskStatus.TO_DO, TaskStatus.COMPLETED, TaskStatus.TO_REVIEW, TaskStatus.IN_PROGRESS)
    .messages({
      'any.only': 'Trạng thái task không hợp lệ!',
      'any.required': 'Trạng thái task không được bỏ trống!',
    }),
});

const getAllTasksByProjectId = async (req) => {
  const { page, search, selectedTaskTab } = req.query;
  const { projectId } = req.params;

  await getProjectById(projectId);

  const currentPage = Number(page) || 1;
  const offset = (currentPage - 1) * 6;

  // const status = selectedStatus === StatusCommon.UN_ACTIVE ? 'AND t.status = :status' : '';

  const query = `
    SELECT 
    t.id, t.name, t.project_id, t.points, t.url, t.script_id, t.description, t.status, t.type,
    t.has_manual, t.order_star, t.createdAt 
    FROM tasks t
    WHERE t.deletedAt IS NULL
      AND t.project_id = :projectId 
      AND t.name LIKE :searchQuery 
      AND t.type = :type
    ORDER BY 
  CASE 
    WHEN t.order_star IS NOT NULL THEN 0 
    ELSE 1 
  END ASC,
  t.order_star ASC,
  t.createdAt DESC
  `;
  // LIMIT 6 OFFSET ${offset}
  // AND w.status = :status 
  const data = await sequelize.query(query, {
    replacements: {
      projectId,
      type: selectedTaskTab,
      searchQuery: `%${search}%`
    },
  });

  const countQuery = `
SELECT COUNT(*) AS total 
    FROM tasks t
    WHERE t.deletedAt IS NULL
      AND t.project_id = :projectId 
      AND t.name LIKE :searchQuery 
      AND t.type = :type
`;

  const countResult = await sequelize.query(countQuery, {
    replacements: {
      projectId,
      type: selectedTaskTab,
      searchQuery: `%${search}%`
    },
  });

  const total = countResult[0][0]?.total;
  const totalPages = Math.ceil(total / 6);

  const convertedData = data[0].map((item) => {
    return {
      ...item,
      has_manual: convertBitToBoolean(item.has_manual),
      script_name: item?.script_id ? getScriptNameById(item?.script_id) : '',
    }
  })

  const countByType = await countTaskByType(projectId);

  return {
    data: convertedData,
    pagination: {
      page: parseInt(currentPage, 10),
      totalCountType: countByType,
      totalItems: total,
      totalPages,
      type: selectedTaskTab,
      hasNext: currentPage < totalPages,
      hasPre: currentPage > 1
    }
  };
}

const countTaskByType = async (projectId) => {
  const countQuery = `
    SELECT 
      t.type,
      COUNT(*) AS total
    FROM tasks t
    WHERE t.deletedAt IS NULL
      AND t.project_id = :projectId
    GROUP BY t.type
  `;

  const [results] = await sequelize.query(countQuery, {
    replacements: { projectId },
  });

  return results;
}

const getTaskById = async (id) => {
  const task = await Task.findByPk(id);

  if (!task) {
    throw new NotFoundException('Không tìm thấy task này!');
  }

  return task;
}

const createTask = async (body) => {
  const data = validateTask(body);

  const existing = await Task.findOne({
    where: {
      name: data.name,
      project_id: data.project_id,
      type: data?.type,
      deletedAt: null,
    }
  });

  if (existing) {
    throw new RestApiException('Tên task đã tồn tại!');
  }

  const createdTask = await Task.create({
    ...data,
  });

  return createdTask;
}

const updateTask = async (body) => {
  const { id } = body;
  const data = validateTask(body);

  const existing = await Task.findOne({
    where: {
      name: data.name,
      id: { [Op.ne]: id },
      project_id: data.project_id,
      type: data?.type,
      deletedAt: null,
    }
  });

  if (existing) {
    throw new RestApiException('Tên task đã tồn tại!');
  }

  const [updatedCount] = await Task.update({
    ...data,
  }, {
    where: {
      id: id,
    },
  });

  if (!updatedCount) {
    throw new NotFoundException('Không tìm thấy task này!');
  }

  const updatedTask = await Task.findByPk(id);

  return updatedTask;
}

const updateTaskStatus = async (body) => {
  const { id } = body;
  const data = validateTaskStatus(body);

  const [updatedCount] = await Task.update({
    status: data.status === StatusCommon.IN_ACTIVE ? StatusCommon.UN_ACTIVE : StatusCommon.IN_ACTIVE,
  }, {
    where: {
      id: id,
    }
  });

  if (!updatedCount) {
    throw new NotFoundException('Không tìm thấy task này!');
  }

  const updatedTask = await Task.findByPk(id);

  return updatedTask;
}

const updateTaskOrderStar = async (body) => {
  const { id, orderStar } = body;

  const [updatedCount] = await Task.update({
    order_star: orderStar === null ? Sequelize.fn('NOW') : null,
  }, {
    where: {
      id: id,
    }
  });

  if (!updatedCount) {
    throw new NotFoundException('Không tìm thấy task này!');
  }

  const updatedTask = await Task.findByPk(id);

  return updatedTask;

}

const deleteTask = async (id) => {
  const [deletedCount] = await Task.update({
    deletedAt: Sequelize.fn('NOW'),
  }, {
    where: {
      id: id,
    }
  });

  if (!deletedCount) {
    throw new NotFoundException('Không tìm thấy task này!');
  }

  return id;
}

const validateTask = (data) => {
  const { error, value } = taskSchema.validate(data, { stripUnknown: true });

  if (error) {
    throw new ValidationException(error.details[0].message);
  }

  return value;
};

const validateTaskStatus = (data) => {
  const { error, value } = taskStatusValidation.validate(data, { stripUnknown: true });

  if (error) {
    throw new ValidationException(error.details[0].message);
  }

  return value;
};

module.exports = {
  getAllTasksByProjectId,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskById,
  updateTaskOrderStar
};



