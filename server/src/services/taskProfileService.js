const NotFoundException = require('../exceptions/NotFoundException');
const ValidationException = require('../exceptions/ValidationException');
const Joi = require('joi');
const RestApiException = require('../exceptions/RestApiException');
const { Sequelize, QueryTypes } = require('sequelize');
const ProjectProfile = require('../models/projectProfile');
const TaskProfile = require('../models/taskProfile');
const sequelize = require('../configs/dbConnection');
const { Pagination, StatusCommon, WEB3_WALLET_RESOURCE_IDS } = require('../enums');
const { convertArr } = require('../utils/convertUtil');
const { currentProfiles, getPortFree, addBrowser, openProfile } = require('../utils/playwrightUtil');
const { getProfileById } = require('./profileService');

const taskProfileSchema = Joi.object({
  task_id: Joi.string().trim().required().max(36).messages({
    'string.base': 'Task id phải là chuỗi',
    'string.empty': 'Task id không được bỏ trống!',
    'any.required': 'Task id không được bỏ trống!',
    'string.max': 'Task id chỉ đươc phép dài tối đa 36 ký tự!',
  }),
  project_profile_id: Joi.string().trim().required().max(36).messages({
    'string.base': 'Profile id phải là chuỗi',
    'string.empty': 'Profile id không được bỏ trống!',
    'any.required': 'Profile id không được bỏ trống!',
    'string.max': 'Profile id chỉ đươc phép dài tối đa 36 ký tự!',
  }),
});

const statusValidation = Joi.object({
  status: Joi.required()
    .valid(StatusCommon.UN_ACTIVE, StatusCommon.IN_ACTIVE)
    .messages({
      'any.only': 'Trạng thái không hợp lệ!',
      'any.required': 'Trạng thái không được bỏ trống!',
    }),
});

const getAllProfilesByProjectTask = async (req) => {

  const {
    projectId
  } = req.params;

  const {
    page,
    search,
    selectedTab,
  } = req.query;

  const currentPage = Number(page) || 1;
  const offset = (currentPage - 1) * Pagination.limit;

  let whereClause = `
    WHERE p.deletedAt IS NULL
      AND p.status = '${StatusCommon.IN_ACTIVE}'
`;

  const conditions = [];
  const replacements = [];

  if (search) {
    conditions.push(`
      (
        p.email LIKE ?
      )
  `);
    replacements.push(`%${search}%`);
  }

  if (conditions.length > 0) {
    whereClause += ' AND ' + conditions.join(' AND ');
  }

  const query = `
    SELECT 
	    pp.id as pp_id,
	    pp.status,
		  pr.*
    FROM 
      project_profiles pp
    JOIN
		 (
		 SELECT
			p.id,
			p.email,
      p.email_password, 
      p.discord_email, 
      p.discord_email_password, 
      p.discord_password, 
      p.discord_username, 
      p.x_email, 
      p.x_email_password, 
      p.x_username, 
      p.telegram_email, 
      p.telegram_email_password, 
      p.telegram_username, 
      p.telegram_phone, 
      GROUP_CONCAT(DISTINCT w.resource_id) AS web3_wallet_ids
		  FROM 
      profiles p
      LEFT JOIN profile_web3_wallets pw ON pw.profile_id = p.id AND pw.deletedAt IS NULL
      LEFT JOIN web3_wallets w ON pw.wallet_id = w.id AND w.deletedAt IS NULL AND w.status = '${StatusCommon.IN_ACTIVE}'
      ${whereClause}
			GROUP BY p.id
			) pr ON pr.id = pp.profile_id
     WHERE pp.project_id = '${projectId}' AND pp.status = '${StatusCommon.IN_ACTIVE}'
     ORDER BY pp.createdAt DESC
     LIMIT ${Pagination.limit} OFFSET ${offset}
  `;

  const data = await sequelize.query(query, {
    replacements: replacements,
    type: QueryTypes.SELECT
  });

  const countQuery = `
 SELECT COUNT(*) AS total FROM (
    SELECT pp.id as pp_id
    FROM 
      project_profiles pp
    JOIN
		 (
		 SELECT
			p.id
		  FROM 
      profiles p
      ${whereClause}
			GROUP BY p.id
			) pr ON pr.id = pp.profile_id
     WHERE pp.project_id = '${projectId}' AND pp.status = '${StatusCommon.IN_ACTIVE}'
  ) AS subquery
   `;

  const countResult = await sequelize.query(countQuery, {
    replacements: replacements,
    type: QueryTypes.SELECT
  });

  const total = countResult[0]?.total;
  const totalPages = Math.ceil(total / Pagination.limit);

  const RESOURCE_MAP = {
    google: ['email', 'email_password'],
    discord: ['discord_email', 'discord_email_password', 'discord_username', 'discord_password'],
    x: ['x_email', 'x_email_password', 'x_username'],
    telegram: ['telegram_email', 'telegram_email_password', 'telegram_username', 'telegram_phone'],
  };

  const dataConverted = data?.map(p => {
    const { web3_wallet_ids, ...rest } = p;
    const accountResources = Object.entries(RESOURCE_MAP)
      .filter(([_, fields]) => fields.every(field => p[field]))
      .map(([key]) => key);

    const web3WalletResources = web3_wallet_ids
      ? web3_wallet_ids.split(',')
        .map(s => s.trim())
        .filter(Boolean) // bỏ chuỗi rỗng
      : [];

    return {
      ...rest,
      resources: [...accountResources, ...web3WalletResources],
    };
  });

  // const totalActive = await countByProject(projectId);
  // const totalUnActive = await countByProjectUnActive(projectId);
  // const totalFree = await countByResources(projectId, resources);

  return {
    browsers: currentProfiles(),
    data: dataConverted,
    pagination: {
      page: parseInt(currentPage, 10),
      totalItems: total,
      // totalItemsActive: totalActive,
      // totalItemsUnActive: totalUnActive,
      // totalItemsFree: totalFree,
      totalPages,
      // isTabFree: false,
      hasNext: currentPage < totalPages,
      hasPre: currentPage > 1
    }
  };
}

const countByProjectUnActive = async (projectId = '') => {

  let whereClause = `
     WHERE pp.project_id = '${projectId}' AND pp.status = '${StatusCommon.UN_ACTIVE}'
`;

  const countQuery = `
  SELECT COUNT(*) AS total FROM (
    SELECT pp.id
    FROM 
      project_profiles pp
    JOIN profiles p ON p.id = pp.profile_id AND p.deletedAt IS NULL AND p.status = '${StatusCommon.IN_ACTIVE}'
    ${whereClause}
  ) AS subquery
   `;

  const countResult = await sequelize.query(countQuery, {
    type: QueryTypes.SELECT
  });

  const total = countResult[0]?.total;
  return total;
}

const countByProject = async (projectId = '') => {

  let whereClause = `
     WHERE pp.project_id = '${projectId}' AND pp.status = '${StatusCommon.IN_ACTIVE}'
`;

  const countQuery = `
  SELECT COUNT(*) AS total FROM (
    SELECT pp.id
    FROM 
      project_profiles pp
    JOIN profiles p ON p.id = pp.profile_id AND p.deletedAt IS NULL AND p.status = '${StatusCommon.IN_ACTIVE}'
    ${whereClause}
  ) AS subquery
   `;

  const countResult = await sequelize.query(countQuery, {
    type: QueryTypes.SELECT
  });

  const total = countResult[0]?.total;
  return total;
}

const getAllIdsByProject = async (req) => {
  const {
    projectId
  } = req.params;

  const {
    selectedTab,
  } = req.query;

  let whereClause = `
     WHERE pp.project_id = '${projectId}' AND pp.status = '${selectedTab}'
`;

  const query = `
    SELECT pp.id
    FROM 
      project_profiles pp
    JOIN profiles p ON p.id = pp.profile_id AND p.deletedAt IS NULL AND p.status = '${StatusCommon.IN_ACTIVE}'
    ${whereClause}
   `;

  const data = await sequelize.query(query, {
    type: QueryTypes.SELECT
  });

  const convertedData = data?.map(item => item.id);
  return convertedData;
}

const createTaskProfile = async (body) => {
  const {
    project_profile_id,
    task_id,
    // profile_name
  } = body;
  const data = validateTaskProfile(body);

  // const taskProfileExists = await sequelize.query(queryTaskProfileExists, {
  //   replacements: {
  //     profileId: profile_id,
  //     taskId: task_id,
  //   }
  // });

  // if (taskProfileExists[0].length > 0) {
  //   throw new RestApiException(`Profile đ tồn tại trong dự án này!`);
  //   // throw new RestApiException(`Profile ${profile_name} đã tồn tại trong dự án này!`);
  // }

  const createdTaskProfile = await TaskProfile.create({
    ...data,
  });

  return createdTaskProfile;
}

const createProjectProfiles = async (body) => {
  const {
    profile_ids,
    project_id,
  } = body;

  const promises = profile_ids?.map(id => createTaskProfile({
    profile_id: id,
    project_id,
  }))

  const data = await Promise.all(promises);

  return data;
}

const updateProjectProfileStatus = async (body) => {
  const { id } = body;
  const data = validateStatus(body);

  const [updatedCount] = await ProjectProfile.update({
    status: data.status === StatusCommon.IN_ACTIVE ? StatusCommon.UN_ACTIVE : StatusCommon.IN_ACTIVE,
  }, {
    where: {
      id: id,
    }
  });

  if (!updatedCount) {
    throw new NotFoundException('Không tìm thấy profile này trong dự án!');
  }

  const updated = await ProjectProfile.findByPk(id);

  return updated;
}

const deleteProjectProfile = async (id) => {
  const deletedCount = await ProjectProfile.destroy({
    where: {
      id: id,
    }
  });

  if (deletedCount === 0) {
    throw new NotFoundException('Không tìm thấy profile này trong dự án!');
  }

  return id;
}

const deleteProjectProfiles = async (req) => {
  const {
    profile_ids,
  } = req.query;

  const promises = profile_ids?.map(id => deleteProjectProfile(id))

  const data = await Promise.all(promises);

  return data;
}

// const script = async ({ page, context, chrome, codes }) => {
//
//   const wrapCode = codes.map(code => {
//     const line = code.split('\n').find(l => l.includes('🎬 Action:'));
//     const match = line?.match(/Action:\s*(.*?)\s*(?:🡆\s*(.*))?$/m);
//     const actionName = match?.[1]?.trim() || 'Unknown Action';
//     const target = match?.[2]?.trim() || null;
//
//     return `{
//   const start = Date.now();
//   let status = "${Message.SUCCESS}";
//   let errorMsg = "";
//
//   try {
//     ${code}
//   } catch (error) {
//     status = "Failed";
//     errorMsg = error.message;
//     // Optionally: không throw để script chạy tiếp action sau
//     // throw error; // (nếu muốn dừng toàn bộ script)
//     throw error;
//   } finally {
//     const log = {
//       time: new Date().toLocaleTimeString("en-GB", { hour12: false, timeZone: "Asia/Ho_Chi_Minh" }),
//       action: "${actionName}",
//       target: "${target}",
//       duration: Date.now() - start,
//       status,
//       errorMsg,
//     };
//     socket.emit('logs', { log });
//   }
// }`;
//   });
//
//   const code = wrapCode.join('\n\n');
//   const socket = getSocket();
//
//   const fn = new Function("page", "context", "chrome", "socket", `
//     return (async () => {
//     ${code}
//     const log = {
//       time: new Date().toLocaleTimeString("en-GB", { hour12: false, timeZone: "Asia/Ho_Chi_Minh" }),
//       action: "finished",
//       status: 'Finished',
//     };
//     socket.emit('logs', { log });
//     socket.emit('scriptCompleted', { completed: true });
//   })();
//   `);
//
//   // ko await script chạy xong mới done api => done khi đã mở xong profile
//   fn(page, context, chrome, socket).catch(err => {
//     console.error("❌ Có lỗi khi chạy script:", err);
//     if (!needSendSocket) {
//       needSendSocket = true;
//       return;
//     }
//     socket.emit('scriptCompleted', { completed: true }); // có lỗi trong code mà ko bắt try catch thì dừng luôn
//   });
//
// }

const validateTaskProfile = (data) => {
  const { error, value } = taskProfileSchema.validate(data, { stripUnknown: true });

  if (error) {
    throw new ValidationException(error.details[0].message);
  }

  return value;
};

const validateStatus = (data) => {
  const { error, value } = statusValidation.validate(data, { stripUnknown: true });

  if (error) {
    throw new ValidationException(error.details[0].message);
  }

  return value;
};

const queryTaskProfileExists = `
  SELECT pp.id FROM project_profiles pp
  WHERE pp.profile_id = :profileId
  AND pp.project_id = :projectId
  LIMIT 1;
`;

module.exports = {
  getAllProfilesByProjectTask,
  // getAllIdsByResources,
  // getAllIdsByProject,
  // getProfileWalletById,
  createTaskProfile,
  // createProjectProfiles,
  // updateProjectProfileStatus,
  // deleteProjectProfile,
  // deleteProjectProfiles,
};



