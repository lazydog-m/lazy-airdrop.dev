const express = require('express');
const api = express.Router();
const apiRes = require('../utils/apiResponse');
const {
  getAllWeb3Wallets,
  getWeb3WalletById,
  createWeb3Wallet,
  updateWeb3Wallet,
  updateWeb3WalletStatus,
  deleteWeb3Wallet,
  getAllWeb3WalletsNoPage
} = require('../services/web3WalletService');

// Get all web3 wallets
api.get('/', async (req, res, next) => {
  try {
    const web3Wallets = await getAllWeb3Wallets(req);
    return apiRes.toJson(res, web3Wallets);
  } catch (error) {
    next(error);
  }
});

// Get all web3 wallets no page
api.get('/active', async (req, res, next) => {
  try {
    const web3WalletsNoPage = await getAllWeb3WalletsNoPage(req);
    return apiRes.toJson(res, web3WalletsNoPage);
  } catch (error) {
    next(error);
  }
});

// Get web3 wallet by ID
api.get('/:id', async (req, res, next) => {
  try {
    const web3Wallet = await getWeb3WalletById(req.params.id);
    return apiRes.toJson(res, web3Wallet);
  } catch (error) {
    next(error);
  }
});

// Create a new web3 wallet
api.post('/', async (req, res, next) => {
  const { body } = req;
  try {
    const createdWeb3Wallet = await createWeb3Wallet(body);
    return apiRes.toJson(res, createdWeb3Wallet);
  } catch (error) {
    next(error);
  }
});

// Update a web3 wallet
api.put('/', async (req, res, next) => {
  const { body } = req;
  try {
    const updatedWeb3Wallet = await updateWeb3Wallet(body);
    return apiRes.toJson(res, updatedWeb3Wallet);
  } catch (error) {
    next(error);
  }
});

// Update web3 wallet status
api.put('/status', async (req, res, next) => {
  const { body } = req;
  try {
    const updatedWeb3WalletStatus = await updateWeb3WalletStatus(body);
    return apiRes.toJson(res, updatedWeb3WalletStatus);
  } catch (error) {
    next(error);
  }
});

// Delete a web3 wallet
api.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const deletedWeb3Wallet = await deleteWeb3Wallet(id);
    return apiRes.toJson(res, deletedWeb3Wallet);
  } catch (error) {
    next(error);
  }
});

module.exports = api;
