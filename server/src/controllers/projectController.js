const express = require('express');
const api = express.Router();
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  updateProjectStatus,
  deleteProject,
  getAllProjectNames
} = require('../services/projectService');
const apiRes = require('../utils/apiResponse');

// Get all projects
api.get('/', async (req, res, next) => {
  try {
    const projects = await getAllProjects(req);
    return apiRes.toJson(res, projects);
  } catch (error) {
    next(error);
  }
});

// Get all projects
api.get('/name/limit', async (req, res, next) => {
  try {
    const projects = await getAllProjectNames(req);
    return apiRes.toJson(res, projects);
  } catch (error) {
    next(error);
  }
});

// Get project by ID
api.get('/:id', async (req, res, next) => {
  try {
    const project = await getProjectById(req.params.id);
    return apiRes.toJson(res, project);
  } catch (error) {
    next(error);
  }
});

// Create a new project
api.post('/', async (req, res, next) => {
  const { body } = req;
  try {
    const createdProject = await createProject(body);
    return apiRes.toJson(res, createdProject);
  } catch (error) {
    next(error);
  }
});


// Update a project
api.put('/', async (req, res, next) => {
  const { body } = req;
  try {
    const updatedProject = await updateProject(body);
    return apiRes.toJson(res, updatedProject);
  } catch (error) {
    next(error);
  }
});

// Update project status
api.put('/status', async (req, res, next) => {
  const { body } = req;
  try {
    const updatedProjectStatus = await updateProjectStatus(body);
    return apiRes.toJson(res, updatedProjectStatus);
  } catch (error) {
    next(error);
  }
});

// Delete a project
api.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const deletedProject = await deleteProject(id);
    return apiRes.toJson(res, deletedProject);
  } catch (error) {
    next(error);
  }
});

module.exports = api;
