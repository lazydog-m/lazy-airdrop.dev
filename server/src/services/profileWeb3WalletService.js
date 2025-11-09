const NotFoundException = require('../exceptions/NotFoundException');
const ValidationException = require('../exceptions/ValidationException');
const Joi = require('joi');
const RestApiException = require('../exceptions/RestApiException');
const { Sequelize } = require('sequelize');
const ProfileWeb3Wallet = require('../models/profileWeb3Wallet');
const sequelize = require('../configs/dbConnection');
const { Pagination, StatusCommon } = require('../enums');
const { getProfileById } = require('./profileService');
const { getWeb3WalletById } = require('./web3WalletService');

const profileWeb3WalletSchema = Joi.object({
  wallet_address: Joi.string().trim().required().max(1000).messages({
    'string.base': 'Địa chỉ ví phải là chuỗi',
    'string.empty': 'Địa chỉ ví không được bỏ trống!',
    'any.required': 'Địa chỉ ví không được bỏ trống!',
    'string.max': 'Địa chỉ ví chỉ đươc phép dài tối đa 1000 ký tự!',
  }),
  wallet_id: Joi.string().trim().required().max(36).messages({
    'string.base': 'Wallet id phải là chuỗi',
    'string.empty': 'Wallet id không được bỏ trống!',
    'any.required': 'Wallet id không được bỏ trống!',
    'string.max': 'Wallet id chỉ đươc phép dài tối đa 36 ký tự!',
  }),
  profile_id: Joi.string().trim().required().max(36).messages({
    'string.base': 'Profile id phải là chuỗi',
    'string.empty': 'Profile id không được bỏ trống!',
    'any.required': 'Profile id không được bỏ trống!',
    'string.max': 'Profile id chỉ đươc phép dài tối đa 36 ký tự!',
  }),
  secret_phrase: Joi.string().trim().required()
    .max(1000)
    .messages({
      'string.base': 'Cụm từ bí mật phải là chuỗi',
      'string.empty': 'Cụm từ bí mật không được bỏ trống!',
      'any.required': 'Cụm từ bí mật không được bỏ trống!',
      'string.max': 'Cụm từ bí mật chỉ đươc phép dài tối đa 1000 ký tự!',
    }),
});

const getAllWeb3WalletsByProfileId = async (req) => {

  const { page, search } = req.query;
  const { profileId } = req.params;

  const currentPage = Number(page) || 1;
  const offset = (currentPage - 1) * Pagination.limit;

  await getProfileById(profileId);

  const query = `
    SELECT 
    pw.id, pw.createdAt, pw.profile_id, pw.wallet_id, pw.wallet_address, pw.secret_phrase, 
           w.name, w.password, w.url, w.resource_id 
    FROM profile_web3_wallets pw
    JOIN web3_wallets w ON pw.wallet_id = w.id
    WHERE pw.deletedAt IS NULL
      AND w.deletedAt IS NULL 
      AND w.status = :status 
      AND pw.profile_id = :profileId 
      AND w.name LIKE :searchQuery 
    ORDER BY pw.createdAt DESC
    LIMIT ${Pagination.limit} OFFSET ${offset}
  `;
  const data = await sequelize.query(query, {
    replacements: {
      profileId,
      status: StatusCommon.IN_ACTIVE,
      searchQuery: `%${search}%`
    },
  });

  const countQuery = `
SELECT COUNT(*) AS total 
    FROM profile_web3_wallets pw
    JOIN web3_wallets w ON pw.wallet_id = w.id
    WHERE pw.deletedAt IS NULL
    AND w.deletedAt IS NULL 
    AND w.status = :status 
    AND pw.profile_id = :profileId 
    AND w.name LIKE :searchQuery 
`;

  const countResult = await sequelize.query(countQuery, {
    replacements: {
      profileId,
      status: StatusCommon.IN_ACTIVE,
      searchQuery: `%${search}%`
    },
  });

  const total = countResult[0][0]?.total;
  const totalPages = Math.ceil(total / Pagination.limit);

  return {
    data: data[0],
    pagination: {
      page: parseInt(currentPage, 10),
      totalItems: total,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPre: currentPage > 1
    }
  };
}

const createProfileWeb3Wallet = async (body) => {
  const {
    profile_id,
    wallet_id,
  } = body;
  const data = validateProfileWeb3Wallet(body);

  await getProfileById(profile_id);
  await getWeb3WalletById(wallet_id);

  const profileWeb3WalletExists = await sequelize.query(queryAddProfileWeb3WalletExists, {
    replacements: {
      profileId: profile_id,
      walletId: wallet_id
    }
  });

  if (profileWeb3WalletExists[0].length > 0) {
    throw new RestApiException(`Ví Web3 đã tồn tại trong hồ sơ này!`);
  }

  const createdProfileWeb3Wallet = await ProfileWeb3Wallet.create({
    ...data,
  });

  return createdProfileWeb3Wallet;
}

const updateProfileWeb3Wallet = async (body) => {
  const {
    id,
    profile_id,
    wallet_id,
  } = body;
  const data = validateProfileWeb3Wallet(body);

  await getProfileById(profile_id);
  await getWeb3WalletById(wallet_id);

  const profileWeb3WalletExists = await sequelize.query(queryUpdateProfileWeb3WalletExists, {
    replacements: {
      profileId: profile_id,
      walletId: wallet_id,
      id,
    }
  });

  if (profileWeb3WalletExists[0].length > 0) {
    throw new RestApiException(`Ví Web3 đã tồn tại trong hồ sơ này!`);
  }

  const [updatedCount] = await ProfileWeb3Wallet.update({
    ...data,
  }, {
    where: {
      id: id,
    }
  });

  if (!updatedCount) {
    throw new NotFoundException('Không tìm thấy ví Web3 này!');
  }

  const updatedProfileWeb3Wallet = await ProfileWeb3Wallet.findByPk(id);

  return updatedProfileWeb3Wallet;
}

const deleteProfileWeb3Wallet = async (id) => {
  const [deletedCount] = await ProfileWeb3Wallet.update({
    deletedAt: Sequelize.fn('NOW'),
  }, {
    where: {
      id: id,
    }
  });

  if (!deletedCount) {
    throw new NotFoundException('Không tìm ví Web3 này!');
  }

  return id;
}

const validateProfileWeb3Wallet = (data) => {
  const { error, value } = profileWeb3WalletSchema.validate(data, { stripUnknown: true });

  if (error) {
    throw new ValidationException(error.details[0].message);
  }

  return value;
};

const queryUpdateProfileWeb3WalletExists = `
  SELECT pw.id FROM profile_web3_wallets pw
  WHERE pw.profile_id = :profileId
  AND pw.wallet_id = :walletId
  AND pw.deletedAt IS NULL
  AND pw.id != :id
  LIMIT 1;
`;

const queryAddProfileWeb3WalletExists = `
  SELECT pw.id FROM profile_web3_wallets pw
  WHERE pw.profile_id = :profileId
  AND pw.wallet_id = :walletId
  AND pw.deletedAt IS NULL
  LIMIT 1;
`;

module.exports = {
  getAllWeb3WalletsByProfileId,
  createProfileWeb3Wallet,
  updateProfileWeb3Wallet,
  deleteProfileWeb3Wallet
};
