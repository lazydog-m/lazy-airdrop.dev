const NotFoundException = require('../exceptions/NotFoundException');
const ValidationException = require('../exceptions/ValidationException');
const Joi = require('joi');
const RestApiException = require('../exceptions/RestApiException');
const { Sequelize, QueryTypes } = require('sequelize');
const ProjectProfile = require('../models/projectProfile');
const sequelize = require('../configs/dbConnection');
const { Pagination, StatusCommon, WEB3_WALLET_RESOURCE_IDS } = require('../enums');
const { convertArr } = require('../utils/convertUtil');

const projectProfileSchema = Joi.object({
  project_id: Joi.string().trim().required().max(36).messages({
    'string.base': 'Project id phải là chuỗi',
    'string.empty': 'Project id không được bỏ trống!',
    'any.required': 'Project id không được bỏ trống!',
    'string.max': 'Project id chỉ đươc phép dài tối đa 36 ký tự!',
  }),
  profile_id: Joi.string().trim().required().max(36).messages({
    'string.base': 'Profile id phải là chuỗi',
    'string.empty': 'Profile id không được bỏ trống!',
    'any.required': 'Profile id không được bỏ trống!',
    'string.max': 'Profile id chỉ đươc phép dài tối đa 36 ký tự!',
  }),
  status: Joi
    .valid(StatusCommon.UN_ACTIVE, StatusCommon.IN_ACTIVE)
    .messages({
      'any.only': 'Trạng thái ví không hợp lệ!'
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

const getAllProfilesByResources = async (req) => {

  const {
    page,
    search,
    resources,
    projectId,
    selectedStatusItems,
  } = req.query;

  const resourceArr = convertArr(resources);
  // const statusArr = convertArr(selectedStatusItems);

  const currentPage = Number(page) || 1;
  const offset = (currentPage - 1) * Pagination.limit;

  let whereClause = `WHERE p.deletedAt IS NULL 
      AND p.status = '${StatusCommon.IN_ACTIVE}'`;

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

  // get cac profile ko nam trong project nay
  conditions.push(`
      NOT EXISTS (
        SELECT 1
        FROM project_profiles pp
        WHERE pp.profile_id = p.id
          AND pp.project_id = '${projectId}'
      )
  `);

  // if (selectedStatusItems?.length > 0) {
  //   const statusPlaceholders = selectedStatusItems.map((_, index) => `?`).join(',');
  //   conditions.push(`p.status IN (${statusPlaceholders})`);
  //   replacements.push(...selectedStatusItems);
  // }

  const ACCOUNT_FIELDS = {
    google: ['email', 'email_password'],
    x: ['x_email', 'x_email_password', 'x_username'],
    discord: ['discord_email', 'discord_email_password', 'discord_username', 'discord_password'],
    telegram: ['telegram_email', 'telegram_email_password', 'telegram_username', 'telegram_phone'],
  };

  if (resourceArr?.length > 0) {

    for (const resource of resourceArr) {
      const fields = ACCOUNT_FIELDS[resource];
      if (!fields) continue; // nếu resource không tồn tại trong map thì bỏ qua
      const fieldConditions = fields.map(field => `${field} <> ''`).join(' AND ');
      conditions.push(`(${fieldConditions})`);
    }
  }

  if (conditions.length > 0) {
    whereClause += ' AND ' + conditions.join(' AND ');
  }

  const w3w_resource_ids_filtered = resourceArr?.filter(res =>
    WEB3_WALLET_RESOURCE_IDS?.includes(res));

  const havingClause = w3w_resource_ids_filtered?.length > 0 ?
    ('HAVING ' + w3w_resource_ids_filtered?.map(w =>
      `FIND_IN_SET('${w}', web3_wallet_ids)`).join(' AND ')
    ) : ''
    ;
  const havingClauseCount = w3w_resource_ids_filtered?.length > 0 ?
    ('HAVING ' + w3w_resource_ids_filtered?.map(w =>
      `FIND_IN_SET('${w}', GROUP_CONCAT(DISTINCT w.resource_id))`).join(' AND ')
    ) : ''
    ;

  const query = `
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
    ${havingClause}
    ORDER BY p.createdAt DESC
    LIMIT ${Pagination.limit} OFFSET ${offset}
  `;

  const data = await sequelize.query(query, {
    replacements: replacements,
    type: QueryTypes.SELECT
  });

  const countQuery = `
 SELECT COUNT(*) AS total FROM (
    SELECT p.id
    FROM 
      profiles p
    LEFT JOIN profile_web3_wallets pw ON pw.profile_id = p.id AND pw.deletedAt IS NULL
    LEFT JOIN web3_wallets w ON pw.wallet_id = w.id AND w.deletedAt IS NULL AND w.status = '${StatusCommon.IN_ACTIVE}'
    ${whereClause}
    GROUP BY p.id
    ${havingClauseCount}
  ) AS subquery
   `;

  const countResult = await sequelize.query(countQuery, {
    replacements: replacements,
    type: QueryTypes.SELECT
  });

  const total = countResult[0]?.total;
  const totalPages = Math.ceil(total / Pagination.limit);

  const dataConverted = data?.map(p => {
    const { web3_wallet_ids, ...rest } = p;
    const accountResources = Object.entries(ACCOUNT_FIELDS)
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

  const totalActive = await countByProject(projectId);
  const totalUnActive = await countByProjectUnActive(projectId);
  const totalFree = await countByResources(projectId, resources);

  return {
    data: dataConverted,
    pagination: {
      page: parseInt(currentPage, 10),
      totalItems: total,
      totalItemsActive: totalActive,
      totalItemsUnActive: totalUnActive,
      totalItemsFree: totalFree,
      isTabFree: true,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPre: currentPage > 1
    }
  };
}

const getAllProfilesByProject = async (req) => {

  const {
    projectId
  } = req.params;

  const {
    page,
    search,
    resources,
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
	    pp.id,
	    pp.status,
		  pr.*
    FROM 
      project_profiles pp
    JOIN
		 (
		 SELECT
			p.id as profile_id,
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
			) pr ON pr.profile_id = pp.profile_id
     WHERE pp.project_id = '${projectId}' AND pp.status = '${selectedTab}'
     ORDER BY pp.createdAt DESC
     LIMIT ${Pagination.limit} OFFSET ${offset}
  `;

  const data = await sequelize.query(query, {
    replacements: replacements,
    type: QueryTypes.SELECT
  });

  const countQuery = `
 SELECT COUNT(*) AS total FROM (
    SELECT pp.id
    FROM 
      project_profiles pp
    JOIN
		 (
		 SELECT
			p.id as profile_id
		  FROM 
      profiles p
      ${whereClause}
			GROUP BY p.id
			) pr ON pr.profile_id = pp.profile_id
     WHERE pp.project_id = '${projectId}' AND pp.status = '${selectedTab}'
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

  const totalActive = await countByProject(projectId);
  const totalUnActive = await countByProjectUnActive(projectId);
  const totalFree = await countByResources(projectId, resources);

  return {
    // browsers: currentProfiles(),
    data: dataConverted,
    pagination: {
      page: parseInt(currentPage, 10),
      totalItems: total,
      totalItemsActive: totalActive,
      totalItemsUnActive: totalUnActive,
      totalItemsFree: totalFree,
      totalPages,
      isTabFree: false,
      hasNext: currentPage < totalPages,
      hasPre: currentPage > 1
    }
  };
}

const countByResources = async (projectId = '', resources) => {
  const resourceArr = convertArr(resources);

  let whereClause = `WHERE p.deletedAt IS NULL 
      AND p.status = '${StatusCommon.IN_ACTIVE}'`;

  const conditions = [];

  // get cac profile ko nam trong project nay
  conditions.push(`
      NOT EXISTS (
        SELECT 1
        FROM project_profiles pp
        WHERE pp.profile_id = p.id
          AND pp.project_id = '${projectId}'
      )
  `);

  const ACCOUNT_FIELDS = {
    google: ['email', 'email_password'],
    x: ['x_email', 'x_email_password', 'x_username'],
    discord: ['discord_email', 'discord_email_password', 'discord_username', 'discord_password'],
    telegram: ['telegram_email', 'telegram_email_password', 'telegram_username', 'telegram_phone'],
  };

  if (resourceArr?.length > 0) {

    for (const resource of resourceArr) {
      const fields = ACCOUNT_FIELDS[resource];
      if (!fields) continue; // nếu resource không tồn tại trong map thì bỏ qua
      const fieldConditions = fields.map(field => `${field} <> ''`).join(' AND ');
      conditions.push(`(${fieldConditions})`);
    }
  }

  if (conditions.length > 0) {
    whereClause += ' AND ' + conditions.join(' AND ');
  }

  const w3w_resource_ids_filtered = resourceArr?.filter(res =>
    WEB3_WALLET_RESOURCE_IDS?.includes(res));

  const havingClauseCount = w3w_resource_ids_filtered?.length > 0 ?
    ('HAVING ' + w3w_resource_ids_filtered?.map(w =>
      `FIND_IN_SET('${w}', GROUP_CONCAT(DISTINCT w.resource_id))`).join(' AND ')
    ) : ''
    ;

  const countQuery = `
 SELECT COUNT(*) AS total FROM (
    SELECT p.id
    FROM 
      profiles p
    LEFT JOIN profile_web3_wallets pw ON pw.profile_id = p.id AND pw.deletedAt IS NULL
    LEFT JOIN web3_wallets w ON pw.wallet_id = w.id AND w.deletedAt IS NULL AND w.status = '${StatusCommon.IN_ACTIVE}'
    ${whereClause}
    GROUP BY p.id
    ${havingClauseCount}
  ) AS subquery
   `;

  const countResult = await sequelize.query(countQuery, {
    type: QueryTypes.SELECT
  });

  const total = countResult[0]?.total;
  return total;
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

const getAllIdsByResources = async (req) => {
  const {
    projectId,
    resources,
  } = req.query;

  const resourceArr = convertArr(resources);

  let whereClause = `WHERE p.deletedAt IS NULL 
      AND p.status = '${StatusCommon.IN_ACTIVE}'`;

  const conditions = [];

  // get cac profile ko nam trong project nay
  conditions.push(`
      NOT EXISTS (
        SELECT 1
        FROM project_profiles pp
        WHERE pp.profile_id = p.id
          AND pp.project_id = '${projectId}'
      )
  `);

  const ACCOUNT_FIELDS = {
    google: ['email', 'email_password'],
    x: ['x_email', 'x_email_password', 'x_username'],
    discord: ['discord_email', 'discord_email_password', 'discord_username', 'discord_password'],
    telegram: ['telegram_email', 'telegram_email_password', 'telegram_username', 'telegram_phone'],
  };

  if (resourceArr?.length > 0) {

    for (const resource of resourceArr) {
      const fields = ACCOUNT_FIELDS[resource];
      if (!fields) continue; // nếu resource không tồn tại trong map thì bỏ qua
      const fieldConditions = fields.map(field => `${field} <> ''`).join(' AND ');
      conditions.push(`(${fieldConditions})`);
    }
  }

  if (conditions.length > 0) {
    whereClause += ' AND ' + conditions.join(' AND ');
  }

  const w3w_resource_ids_filtered = resourceArr?.filter(res =>
    WEB3_WALLET_RESOURCE_IDS?.includes(res));

  const havingClause = w3w_resource_ids_filtered?.length > 0 ?
    ('HAVING ' + w3w_resource_ids_filtered?.map(w =>
      `FIND_IN_SET('${w}', GROUP_CONCAT(DISTINCT w.resource_id))`).join(' AND ')
    ) : ''
    ;

  const countQuery = `
    SELECT p.id
    FROM 
      profiles p
    LEFT JOIN profile_web3_wallets pw ON pw.profile_id = p.id AND pw.deletedAt IS NULL
    LEFT JOIN web3_wallets w ON pw.wallet_id = w.id AND w.deletedAt IS NULL AND w.status = '${StatusCommon.IN_ACTIVE}'
    ${whereClause}
    GROUP BY p.id
    ${havingClause}
   `;

  const data = await sequelize.query(countQuery, {
    type: QueryTypes.SELECT
  });

  const convertedData = data?.map(item => item.id);
  return convertedData;
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

const getProfileWalletById = async (id) => {
  const profileWallet = await ProjectProfile.findByPk(id);

  if (!profileWallet) {
    throw new NotFoundException('Không tìm thấy profile này trong dự án!');
  }

  return profileWallet;
}

const createProjectProfile = async (body) => {
  const {
    profile_id,
    project_id,
    // profile_name
  } = body;
  const data = validateProjectProfile(body);

  const projectProfileExists = await sequelize.query(queryProjectProfileExists, {
    replacements: {
      profileId: profile_id,
      projectId: project_id,
    }
  });

  if (projectProfileExists[0].length > 0) {
    throw new RestApiException(`Profile đang tham gia dự án này!`);
    // throw new RestApiException(`Profile ${profile_name} đã tồn tại trong dự án này!`);
  }

  const createdProjectProfile = await ProjectProfile.create({
    ...data,
  });

  return createdProjectProfile;
}

const createProjectProfiles = async (body) => {
  const {
    profile_ids,
    project_id,
  } = body;

  const promises = profile_ids?.map(id => createProjectProfile({
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

const validateProjectProfile = (data) => {
  const { error, value } = projectProfileSchema.validate(data, { stripUnknown: true });

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

const queryProjectProfileExists = `
  SELECT pp.id FROM project_profiles pp
  WHERE pp.profile_id = :profileId
  AND pp.project_id = :projectId
  LIMIT 1;
`;

module.exports = {
  getAllProfilesByResources,
  getAllProfilesByProject,
  getAllIdsByResources,
  getAllIdsByProject,
  getProfileWalletById,
  createProjectProfile,
  createProjectProfiles,
  updateProjectProfileStatus,
  deleteProjectProfile,
  deleteProjectProfiles,
};



