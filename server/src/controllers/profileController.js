const express = require('express');
const api = express.Router();
const apiRes = require('../utils/apiResponse');
const {
  getAllProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
  closeProfileById,
  openProfileById,
  openProfilesByIds,
  closeProfilesByIds,
  sortProfileLayouts,
  updateProfileStatus
} = require('../services/profileService');
const { openProfile } = require('../utils/playwrightUtil');

// Get all profiles
api.get('/', async (req, res, next) => {
  try {
    const profiles = await getAllProfiles(req);
    return apiRes.toJson(res, profiles);
  } catch (error) {
    next(error);
  }
});

// Create a new profile
api.post('/', async (req, res, next) => {
  const { body } = req;
  try {
    const createdProfile = await createProfile(body);
    return apiRes.toJson(res, createdProfile);
  } catch (error) {
    next(error);
  }
});

// Update a profile
api.put('/', async (req, res, next) => {
  const { body } = req;
  try {
    const updatedProfile = await updateProfile(body);
    return apiRes.toJson(res, updatedProfile);
  } catch (error) {
    next(error);
  }
});

// Update profile status
api.put('/status', async (req, res, next) => {
  const { body } = req;
  try {
    const updatedProfileStatus = await updateProfileStatus(body);
    return apiRes.toJson(res, updatedProfileStatus);
  } catch (error) {
    next(error);
  }
});

// Delete a profile
api.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const deletedProfile = await deleteProfile(id);
    return apiRes.toJson(res, deletedProfile);
  } catch (error) {
    next(error);
  }
});

api.post('/profile', async (req, res, next) => {
  // const profiles = Array.from({ length: 2 }, (_, i) => `user${i + 1}`);
  // const layouts = createGridLayout(profiles.length);
  // const contexts = [];
  // const profileOpenPromises = [];
  // try {
  //   for (let i = 0; i < profiles.length; i++) {
  //     const profileName = profiles[i];
  //
  //     const promise = new Promise(resolve => {
  //       openProfile(profileName, layouts[i]).then(async ({ context, page }) => {
  //         // contexts.push(context);
  //         // browsers.push({ context, page });
  //         browsers.push({ context, page, profileName })
  //         resolve(); // ✅ done promise
  //       });
  //     });
  //
  //     // profileOpenPromises.push(promise);
  //   }
  //
  //   // await Promise.all(profileOpenPromises);
  //   // console.log('✅ Tất cả profile đã mở xong và đã scale layout!');
  //
  //   return res.json('✅ Tất cả profile đã mở xong và đã scale layout!')
  //
  //   // const automationPromises = browsers.map(({ page }, i) =>
  //   //   delay(i * 3000).then(async () => {
  //   //     await page.goto('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html')
  //   //     await page.getByRole("checkbox", { name: "I agree to MetaMask's Terms of use" }).click();
  //   //     await page.waitForTimeout(3000);
  //   //     await page.getByRole("button", { name: "Create a new wallet" }).click();
  //   //     await page.waitForTimeout(3000);
  //   //     await page.getByRole("button", { name: "I agree" }).click();
  //   //     console.log(`✅ Profile ${i + 1} đã automation sau ${i * 3}s`);
  //   //   })
  //   // );
  //
  //   // await Promise.all(automationPromises);
  //
  //   // await delay(3000);
  //
  //   // await Promise.all(browsers.map(b => b?.context?.close()));
  //   // console.log("✅ Tất cả profile đã được đóng!");
  //
  //   // await delay(100);
  //
  //   // contexts.length = 0;
  //   // profileOpenPromises.length = 0;
  // } catch (error) {
  //   next(error);
  // }
});

api.get('/:id/open', async (req, res, next) => {
  try {
    const id = await openProfileById(req)
    return apiRes.toJson(res, id);
  } catch (error) {
    next(error);
  }
});

api.get('/open-multiple', async (req, res, next) => {
  try {
    const newOpenningIds = await openProfilesByIds(req)
    return apiRes.toJson(res, newOpenningIds);
  } catch (error) {
    next(error);
  }
});

api.get('/:id/close', async (req, res, next) => {
  try {
    const id = await closeProfileById(req.params.id)
    return apiRes.toJson(res, id);
  } catch (error) {
    next(error);
  }
});

api.get('/close-multiple', async (req, res, next) => {
  try {
    const { ids } = req.query;
    const newOpenningIds = await closeProfilesByIds(ids)
    return apiRes.toJson(res, newOpenningIds);
  } catch (error) {
    next(error);
  }
});

api.get('/sort-layout', async (req, res, next) => {
  try {
    await sortProfileLayouts()
    return apiRes.toJson(res, null);
  } catch (error) {
    next(error);
  }
});

api.get('/test', async (req, res, next) => {
  try {
    await openProfile({
      profile: { name: 'abc4494' }, port: 9222
    })
    return apiRes.toJson(res, null);
  } catch (error) {
    next(error);
  }
});

module.exports = api;
