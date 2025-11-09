const NotFoundException = require('../exceptions/NotFoundException');
const ValidationException = require('../exceptions/ValidationException');
const Joi = require('joi');
const RestApiException = require('../exceptions/RestApiException');
const { Sequelize, Op, QueryTypes } = require('sequelize');
const Profile = require('../models/profile');
const sequelize = require('../configs/dbConnection');
const {
  Pagination,
  StatusCommon,
  WEB3_WALLET_RESOURCE_IDS
} = require('../enums');
const {
  openProfile,
  browsers,
  currentProfiles,
  closingByApiIds,
  delay,
  getPortFree,
  usedPorts,
  getBrowsers,
  addBrowser,
  removeBrowserById,
  sortGridLayout
} = require('../utils/playwrightUtil');
const { convertArr } = require('../utils/convertUtil');

const profileSchema = Joi.object({
  email: Joi.string().trim().lowercase().required().max(255).messages({
    'string.base': '(Google) Email phải là chuỗi!',
    'string.empty': '(Google) Email không được bỏ trống!',
    'any.required': '(Google) Email không được bỏ trống!',
    'string.max': '(Google) Email chỉ đươc phép dài tối đa 255 ký tự!',
  }),
  email_password: Joi.string().trim().required()
    .max(255)
    .messages({
      'string.base': '(Google) Mật khẩu email phải là chuỗi!',
      'string.empty': '(Google) Mật khẩu email không được bỏ trống!',
      'any.required': '(Google) Mật khẩu email không được bỏ trống!',
      'string.max': '(Google) Mật khẩu email chỉ đươc phép dài tối đa 255 ký tự!',
    }),
  discord_email: Joi.string().trim().lowercase()
    .max(255)
    .allow('')
    .messages({
      'string.base': '(Discord) Email phải là chuỗi!',
      'string.max': '(Discord) Email chỉ đươc phép dài tối đa 255 ký tự!',
    }),
  discord_email_password: Joi.string().trim()
    .max(255)
    .allow('')
    .messages({
      'string.base': '(Discord) Mật khẩu email phải là chuỗi!',
      'string.max': '(Discord) Mật khẩu email chỉ đươc phép dài tối đa 255 ký tự!',
    }),
  discord_username: Joi.string().trim()
    .max(255)
    .allow('')
    .messages({
      'string.base': 'Username discord phải là chuỗi!',
      'string.max': 'Username discord chỉ đươc phép dài tối đa 255 ký tự!',
    }),
  discord_password: Joi.string().trim()
    .max(255)
    .allow('')
    .messages({
      'string.base': 'Mật khẩu discord phải là chuỗi!',
      'string.max': 'Mật khẩu discord chỉ đươc phép dài tối đa 255 ký tự!',
    }),
  x_email: Joi.string().trim().lowercase()
    .max(255)
    .allow('')
    .messages({
      'string.base': '(Twitter) Email phải là chuỗi!',
      'string.max': '(Twitter) Email chỉ đươc phép dài tối đa 255 ký tự!',
    }),
  x_email_password: Joi.string().trim()
    .max(255)
    .allow('')
    .messages({
      'string.base': '(Twitter) Mật khẩu email phải là chuỗi!',
      'string.max': '(Twitter) Mật khẩu email chỉ đươc phép dài tối đa 255 ký tự!',
    }),
  x_username: Joi.string().trim()
    .max(255)
    .allow('')
    .messages({
      'string.base': 'Username twitter phải là chuỗi!',
      'string.max': 'Username twitter chỉ đươc phép dài tối đa 255 ký tự!',
    }),
  telegram_email: Joi.string().trim().lowercase()
    .max(255)
    .allow('')
    .messages({
      'string.base': '(Telegram) Email phải là chuỗi!',
      'string.max': '(Telegram) Email chỉ đươc phép dài tối đa 255 ký tự!',
    }),
  telegram_email_password: Joi.string().trim()
    .max(255)
    .allow('')
    .messages({
      'string.base': '(Telegram) Mật khẩu email phải là chuỗi!',
      'string.max': '(Telegram) Mật khẩu email chỉ đươc phép dài tối đa 255 ký tự!',
    }),
  telegram_phone: Joi.string().trim()
    .max(10)
    .allow('')
    .messages({
      'string.base': 'SĐT telegram phải là chuỗi',
      'string.max': 'SĐT telegram chỉ đươc phép dài tối đa 10 ký tự!',
    }),
  telegram_username: Joi.string().trim()
    .max(255)
    .allow('')
    .messages({
      'string.base': 'Username telegram phải là chuỗi!',
      'string.max': 'Username telegram chỉ đươc phép dài tối đa 255 ký tự!',
    }),
  note: Joi.string().trim()
    .max(10000)
    .allow('')
    .messages({
      'string.base': 'Ghi chú phải là chuỗi',
      'string.max': 'Ghi chú chỉ đươc phép dài tối đa 10,000 ký tự!',
    }),
});

const statusValidation = Joi.object({
  status: Joi.required()
    .valid(StatusCommon.UN_ACTIVE, StatusCommon.IN_ACTIVE)
    .messages({
      'any.only': 'Trạng thái profile không hợp lệ!',
      'any.required': 'Trạng thái profile không được bỏ trống!',
    }),
});

const getAllProfiles = async (req) => {

  const {
    page,
    search,
    selectedStatusItems,
    selectedResourceItems
  } = req.query;

  const resourceArr = convertArr(selectedResourceItems);
  const statusArr = convertArr(selectedStatusItems);

  const currentPage = Number(page) || 1;
  const offset = (currentPage - 1) * Pagination.limit;

  let whereClause = 'WHERE p.deletedAt IS NULL';
  const conditions = [];
  const replacements = [];

  if (search) {
    conditions.push(`
      (
        p.email LIKE ?
        OR p.discord_email LIKE ?
        OR p.discord_username LIKE ?
        OR p.x_email LIKE ?
        OR p.x_username LIKE ?
        OR p.telegram_email LIKE ?
        OR p.telegram_username LIKE ?
        OR p.telegram_phone LIKE ?
      )
  `);
    replacements.push(...Array(8).fill(`%${search}%`));
  }

  if (statusArr?.length > 0) {
    const statusPlaceholders = statusArr.map((_, index) => `?`).join(',');
    conditions.push(`p.status IN (${statusPlaceholders})`);
    replacements.push(...statusArr);
  }

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
      p.createdAt,
      p.status,
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
      accounts: accountResources,
      web3Wallets: web3WalletResources
    };
  });

  return {
    browsers: currentProfiles(),
    data: dataConverted,
    pagination: {
      page: parseInt(currentPage, 10),
      totalItems: total,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPre: currentPage > 1
    }
  };
}

const getProfileById = async (id) => {
  const profile = await Profile.findByPk(id);

  if (!profile) {
    throw new NotFoundException('Không tìm thấy profile này!');
  }

  return profile;
}

const createProfile = async (body) => {
  const data = validateProfile(body);

  const fieldsToCheck = [
    'email',
    'discord_email',
    'discord_username',
    'x_email',
    'x_username',
    'telegram_email',
    'telegram_username',
    'telegram_phone',
  ];

  const messagesErr = {
    email: '(Google) Email đã tồn tại!',
    discord_email: '(Discord) Email đã tồn tại!',
    x_email: '(Twitter) Email đã tồn tại!',
    telegram_email: '(Telegram) Email đã tồn tại!',
    discord_username: 'Username discord đã tồn tại!',
    x_username: 'Username twitter đã tồn tại!',
    telegram_username: 'Username telegram đã tồn tại!',
    telegram_phone: 'SĐT telegram đã tồn tại!',
  };

  // Lọc ra các field cần check có dữ liệu trong data
  const fieldsHasData = fieldsToCheck.filter(field => data[field]);

  const orConditions = fieldsHasData
    .map(key => ({ [key]: data[key] })).filter(Boolean);

  const existing = await Profile.findOne({
    where: {
      [Op.or]: orConditions,
      deletedAt: null,
    },
  });

  if (existing) {
    for (const key of fieldsHasData) {
      if (existing[key] === data[key]) {
        throw new RestApiException(messagesErr[key]);
      }
    }
  }

  const createdProfile = await Profile.create({
    ...data,
  });

  return createdProfile;
}

const updateProfile = async (body) => {
  const { id } = body;
  const data = validateProfile(body);

  const fieldsToCheck = [
    'email',
    'discord_email',
    'discord_username',
    'x_email',
    'x_username',
    'telegram_email',
    'telegram_username',
    'telegram_phone',
  ];

  const messagesErr = {
    email: '(Google) Email đã tồn tại!',
    discord_email: '(Discord) Email đã tồn tại!',
    x_email: '(Twitter) Email đã tồn tại!',
    telegram_email: '(Telegram) Email đã tồn tại!',
    discord_username: 'Username discord đã tồn tại!',
    x_username: 'Username twitter đã tồn tại!',
    telegram_username: 'Username telegram đã tồn tại!',
    telegram_phone: 'SĐT telegram đã tồn tại!',
  };

  // Lọc ra các field cần check có dữ liệu trong data
  const fieldsHasData = fieldsToCheck.filter(field => data[field]);

  const orConditions = fieldsHasData
    .map(key => ({ [key]: data[key] })).filter(Boolean);

  const existing = await Profile.findOne({
    where: {
      [Op.or]: orConditions,
      id: { [Op.ne]: id },
      deletedAt: null,
    },
  });

  if (existing) {
    for (const key of fieldsHasData) {
      if (existing[key] === data[key]) {
        throw new RestApiException(messagesErr[key]);
      }
    }
  }

  const [updatedCount] = await Profile.update({
    ...data,
  }, {
    where: {
      id: id,
    }
  });

  if (!updatedCount) {
    throw new NotFoundException('Không tìm thấy profile này!');
  }

  const updatedProfile = await Profile.findByPk(id);

  return updatedProfile;
}

const updateProfileStatus = async (body) => {
  const { id } = body;
  const data = validateStatus(body);

  const [updatedCount] = await Profile.update({
    status: data.status === StatusCommon.IN_ACTIVE ? StatusCommon.UN_ACTIVE : StatusCommon.IN_ACTIVE,
  }, {
    where: {
      id: id,
    }
  });

  if (!updatedCount) {
    throw new NotFoundException('Không tìm thấy profile này!');
  }

  const updatedProfile = await Profile.findByPk(id);

  return updatedProfile;
}

const deleteProfile = async (id) => {
  const [deletedCount] = await Profile.update({
    deletedAt: Sequelize.fn('NOW'),
  }, {
    where: {
      id: id,
    }
  });

  if (!deletedCount) {
    throw new NotFoundException('Không tìm thấy profile này!');
  }

  return id;
}

const validateProfile = (data) => {
  const { error, value } = profileSchema.validate(data, { stripUnknown: true });

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

const openProfileById = async (req) => {

  const { id } = req.params;
  const { url } = req.query;

  const profileData = await getProfileById(id);

  const profile = {
    id: profileData.id,
    name: profileData.email,
  };

  const port = getPortFree();

  const { context, page, chrome } = await openProfile({ profile, port, activate: true });

  addBrowser({
    context,
    page,
    chrome,
    profile,
    port,
  });

  if (url) {
    // muốn bắt lỗi nhưng không muốn block api => catch bắt lỗi nội bộ
    page.goto(url).catch((error) => {
      console.error("❌ Có lỗi khi chạy url:", error);
    });
  }

  return profile.id;
};

const closeProfileById = async (id) => {

  const profile = getBrowsers().find(b => b?.profile?.id === id);

  if (!profile) {
    return id;
  }

  closingByApiIds.add(id);

  await profile?.chrome?.kill();
  usedPorts.delete(profile?.port);
  removeBrowserById(id);

  return id;
};

const sortProfileLayouts = async () => {
  await sortGridLayout();
}

const openProfilesByIds = async (req) => {
  const { ids, url } = req.query;

  //1 2 3 4     // 1 2 dang mo ko lay => lay 3,4 chua dc mo
  const filteredIds = ids?.filter((id) => !currentProfiles().includes(id));

  if (filteredIds?.length > 0) {
    const promisesProfile = filteredIds.map(id => getProfileById(id));
    const profilesData = await Promise.all(promisesProfile);

    const profiles = profilesData.map((profile) => {
      return {
        id: profile.id,
        name: profile.email,
      }
    })

    const promises = [];

    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      const port = getPortFree();

      // Chạy song song profile  // Bỏ promise sẽ chạy lần lượt
      const promise = new Promise(async (resolve, reject) => {
        try {
          const { context, page, chrome } = await openProfile({ profile, port });
          addBrowser({ context, page, chrome, profile, port });

          if (url) {
            // muốn bắt lỗi nhưng không muốn block api => catch bắt lỗi nội bộ
            page.goto(url).catch((error) => {
              console.error("❌ Có lỗi khi chạy url:", error);
            });
          }

          resolve();
        } catch (err) {
          reject(err); // 1 reject sẽ failed all promises => not return ids
        }
      });
      promises.push(promise);
    }

    await Promise.all(promises);
    await sortGridLayout(browsers);

    return filteredIds;
  }

  return [];
};

const closeProfilesByIds = async (ids) => {
  //1 2 3 4      // 1 2 dang mo => lay 1,2 de dong => 3,4 chua mo ko lay

  const filteredIds = ids?.filter((id) => currentProfiles().includes(id));

  if (filteredIds?.length > 0) {
    const closePromisesProfile = filteredIds.map(async (id) => {
      const profile = getBrowsers().find(b => b?.profile?.id === id);

      if (profile) {
        closingByApiIds.add(id);

        await profile?.chrome?.kill();
        usedPorts.delete(profile?.port);
        removeBrowserById(id);
      }
    });

    await Promise.all(closePromisesProfile);

    return filteredIds;
  }

  return [];
};

module.exports = {
  getAllProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  updateProfileStatus,
  deleteProfile,
  openProfileById,
  closeProfileById,
  openProfilesByIds,
  closeProfilesByIds,
  sortProfileLayouts,
};
