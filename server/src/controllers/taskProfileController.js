const express = require('express');
const api = express.Router();
const apiRes = require('../utils/apiResponse');
const { getAllProfilesByProjectTask, createTaskProfile, runTaskProfiles, } = require('../services/taskProfileService');

// Get all profiles by project task
api.get('/:projectId', async (req, res, next) => {
  try {
    const profiles = await getAllProfilesByProjectTask(req);
    return apiRes.toJson(res, profiles);
  } catch (error) {
    next(error);
  }
});

api.get('/:projectId/run', async (req, res, next) => {
  try {
    const profiles = await runTaskProfiles(req);
    return apiRes.toJson(res, profiles);
  } catch (error) {
    next(error);
  }
});

// Get all ids by project
// api.get('/ids/:projectId', async (req, res, next) => {
//   try {
//     const ids = await getAllIdsByProject(req);
//     return apiRes.toJson(res, ids);
//   } catch (error) {
//     next(error);
//   }
// });

// Create a new task profile
api.post('/', async (req, res, next) => {
  const { body } = req;
  try {
    const createdTaskProfile = await createTaskProfile(body);
    return apiRes.toJson(res, createdTaskProfile);
  } catch (error) {
    next(error);
  }
});

// api.get('/:profileId/open', async (req, res, next) => {
//   try {
//     const id = await openTaskProfileById(req)
//     return apiRes.toJson(res, id);
//   } catch (error) {
//     next(error);
//   }
// });
//
// // Create a new project profiles
// api.post('/multiple', async (req, res, next) => {
//   const { body } = req;
//   try {
//     const createdProjectProfiles = await createProjectProfiles(body);
//     return apiRes.toJson(res, createdProjectProfiles);
//   } catch (error) {
//     next(error);
//   }
// });
// //
// // // Update a profile
// // api.put('/', async (req, res, next) => {
// //   const { body } = req;
// //   try {
// //     const updatedProfile = await updateProfile(body);
// //     return apiRes.toJson(res, updatedProfile);
// //   } catch (error) {
// //     next(error);
// //   }
// // });
// //
// // // Update profile status
// // api.put('/status', async (req, res, next) => {
// //   const { body } = req;
// //   try {
// //     const updatedProfileStatus = await updateProfileStatus(body);
// //     return apiRes.toJson(res, updatedProfileStatus);
// //   } catch (error) {
// //     next(error);
// //   }
// // });
// //
//
// // Update status
// api.put('/status', async (req, res, next) => {
//   const { body } = req;
//   try {
//     const updatedStatus = await updateProjectProfileStatus(body);
//     return apiRes.toJson(res, updatedStatus);
//   } catch (error) {
//     next(error);
//   }
// });
//
// // Delete profiles
// api.delete('/multiple', async (req, res, next) => {
//   try {
//     const deletedProjectProfiles = await deleteProjectProfiles(req);
//     return apiRes.toJson(res, deletedProjectProfiles);
//   } catch (error) {
//     next(error);
//   }
// });
//
// // Delete a profile
// api.delete('/:id', async (req, res, next) => {
//   const { id } = req.params;
//   try {
//     const deletedProjectProfile = await deleteProjectProfile(id);
//     return apiRes.toJson(res, deletedProjectProfile);
//   } catch (error) {
//     next(error);
//   }
// });


module.exports = api;
