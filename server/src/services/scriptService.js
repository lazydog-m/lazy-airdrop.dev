const NotFoundException = require('../exceptions/NotFoundException');
const ValidationException = require('../exceptions/ValidationException');
const Joi = require('joi');
const { Op, Sequelize } = require('sequelize');
const { Pagination, StatusCommon, Message } = require('../enums');
const RestApiException = require('../exceptions/RestApiException');
const sequelize = require('../configs/dbConnection');
const config = require('../../playwrightConfig');
const path = require('path')
const fs = require('fs');
const crypto = require('crypto');
const {
  openProfileTest,
  setBrowserTest,
  getBrowserTest,
  setIsStop,
  reConnectBrowser,
  delay,
  getValidPages,
  activeChrome,
} = require('../utils/playwrightUtil');
const { getSocket } = require('../configs/socket');
const { removeScript, getScripts, modifieScript } = require('../../scripts');
const { getProjectIdByName, getProjectNameById } = require('./projectService');

const scriptSchema = Joi.object({
  name: Joi.string().trim()
    .required()
    .max(255)
    .messages({
      'string.base': 'Tên script phải là chuỗi',
      'string.empty': 'Tên script không được bỏ trống!',
      'any.required': 'Tên script không được bỏ trống!',
      'string.max': 'Tên script chỉ đươc phép dài tối đa 255 ký tự!',
    }),
  description: Joi.string()
    .trim()
    .max(10000)
    .allow('')
    .messages({
      'string.base': 'Mô tả phải là chuỗi',
      'string.max': 'Mô tả chỉ đươc phép dài tối đa 10,000 ký tự!',
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

const getAllScripts = async (req) => {
  const { page, search, selectedStatusItems } = req.query;

  const currentPage = Number(page) || 1;
  const offset = (currentPage - 1) * Pagination.limit;

  const scripts = getScripts();

  let filtered = scripts;
  if (search) {
    const keyword = search.toLowerCase();
    filtered = scripts.filter(s =>
      s.name.toLowerCase().includes(keyword)
    );
  }

  if (selectedStatusItems?.length > 0) {
    filtered = filtered.filter(s =>
      selectedStatusItems.includes(s.status)
    );
  }

  filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const total = filtered.length;
  const totalPages = Math.ceil(total / Pagination.limit);
  const result = filtered.slice(offset, offset + Pagination.limit);

  const convertedData = await Promise.all(
    result.map(async (item) => {
      const project_name = await getProjectNameById(item.project_id);
      return { ...item, project_name };
    })
  );


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

const getAllScriptsByProject = async (req) => {
  const { id } = req.params;

  const scripts = getScripts();

  let filtered = scripts.filter(s => s.project_id === id && s.status === StatusCommon.IN_ACTIVE);

  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return {
    data: filtered,
    pagination: {
      totalItems: filtered.length,
    }
  };
}

const getScriptNameById = (id) => {
  const scripts = getScripts();

  const script = scripts.find(s => s.id === id);

  if (!script) {
    return "";
  }

  return script.name

}

const getScriptIdByName = (name) => {
  const scripts = getScripts();

  const script = scripts.find(s => s.name === name);

  if (!script) {
    throw new NotFoundException(`Không tìm thấy script này!`)
  }

  return script.id;
}

const getScriptById = async (id) => {
  const scripts = getScripts();

  const script = scripts.find(s => s.id === id);

  if (!script) {
    throw new NotFoundException(`Không tìm thấy script này!`)
  }

  const project_name = script?.project_id ? await getProjectNameById(script.project_id) : null;
  const data = {
    project_name: project_name || '',
    ...script,
  }

  const profileTestOpenning = getCurrentBrowserTest();

  return { data, profileTestOpenning };
}

const getCurrentBrowserTest = () => {
  const profileTest = getBrowserTest();

  if (Object.keys(profileTest).length <= 0) {
    return false;
  }

  return true;
}

const createScript = async (body) => {
  const data = validateScript(body);
  const name = data.name;
  const { logicItems, project_name } = body;
  const scripts = getScripts();

  const project_id = project_name ? await getProjectIdByName(project_name) : null;

  const id = `${crypto.randomUUID()}_${Date.now()}`;
  const now = new Date();
  scripts.push({
    id,
    name,
    project_id: project_id || '',
    createdAt: now,
    updatedAt: now,
    status: StatusCommon.IN_ACTIVE,
    description: data?.description || '',
    logicItems,
  })
  modifieScript(scripts);

  return id;
}

const updateScript = async (body) => {
  const data = validateScript(body);
  const name = data.name;
  const { id, logicItems, project_name } = body;
  const scripts = getScripts();

  const script = scripts.find(s => s.id === id);

  if (!script) {
    throw new NotFoundException(`Không tìm thấy script này!`)
  }

  const project_id = project_name ? await getProjectIdByName(project_name) : null;
  const now = new Date();
  script.name = name;
  script.project_id = project_id || '';
  script.updatedAt = now;
  script.description = data?.description || '';
  script.logicItems = logicItems || [];
  modifieScript(scripts);

  return script;
}

const updateScriptStatus = async (body) => {
  const { id } = body;
  const data = validateStatus(body);
  const scripts = getScripts();

  const script = scripts.find(s => s.id === id);

  if (!script) {
    throw new NotFoundException(`Không tìm thấy script này!`)
  }

  script.status = data.status === StatusCommon.IN_ACTIVE ? StatusCommon.UN_ACTIVE : StatusCommon.IN_ACTIVE;
  modifieScript(scripts);

  return script.status;
}

const deleteScript = async (id) => {
  const scripts = getScripts();

  const script = scripts.find(s => s.id === id);

  if (!script) {
    throw new NotFoundException(`Không tìm thấy script này!`)
  }
  const filtered = scripts.filter(s => s.id !== id);

  modifieScript(filtered);

  return id;
}

let needSendSocket = true;

const script = async ({ page, context, chrome, codes }) => {

  const wrapCode = codes.map(code => {
    const line = code.split('\n').find(l => l.includes('🎬 Action:'));
    const match = line?.match(/Action:\s*(.*?)\s*(?:🡆\s*(.*))?$/m);
    const actionName = match?.[1]?.trim() || 'Unknown Action';
    const target = match?.[2]?.trim() || null;

    return `{
  const start = Date.now();
  let status = "${Message.SUCCESS}";
  let errorMsg = "";

  try {
    ${code}
  } catch (error) {
    status = "Failed";
    errorMsg = error.message;
    // Optionally: không throw để script chạy tiếp action sau
    // throw error; // (nếu muốn dừng toàn bộ script)
    throw error;
  } finally {
    const log = {
      time: new Date().toLocaleTimeString("en-GB", { hour12: false, timeZone: "Asia/Ho_Chi_Minh" }),
      action: "${actionName}",
      target: "${target}",
      duration: Date.now() - start,
      status,
      errorMsg,
    };
    socket.emit('logs', { log });
  }
}`;
  });

  const code = wrapCode.join('\n\n');
  const socket = getSocket();

  const fn = new Function("page", "context", "chrome", "socket", `
    return (async () => {
    ${code}
    const log = {
      time: new Date().toLocaleTimeString("en-GB", { hour12: false, timeZone: "Asia/Ho_Chi_Minh" }),
      action: "finished",
      status: 'Finished',
    };
    socket.emit('logs', { log });
    socket.emit('scriptCompleted', { completed: true });
  })();
  `);

  // ko await script chạy xong mới done api => done khi đã mở xong profile
  fn(page, context, chrome, socket).catch(err => {
    console.error("❌ Có lỗi khi chạy script:", err);
    if (!needSendSocket) {
      needSendSocket = true;
      return;
    }
    socket.emit('scriptCompleted', { completed: true }); // có lỗi trong code mà ko bắt try catch thì dừng luôn
  });

}
const runScript = async (req) => {

  const { codes } = req.query;

  const profileTest = getBrowserTest();

  if (Object.keys(profileTest).length <= 0) {
    const { context, page, chrome } = await openProfileTest({ runScript: true });

    setBrowserTest({
      context,
      page,
      chrome,
    });

    // khi chưa mở profile
    // chạy script ở page[0] => nếu đóng page đó thì script bị lỗi => dừng script
    script({ context, page, chrome, codes })

  }
  else {
    const { page, context, chrome } = await stopScript(true);

    if (chrome) {
      script({ context, page, chrome, codes })
      // Nổi cửa sổ
      activeChrome(chrome.pid)
    }
  }
}

const stopScript = async (needSocket = false) => {

  const profileTest = getBrowserTest();
  const { chrome } = profileTest;

  if (Object.keys(profileTest).length <= 0) {
    return true;
  }

  setIsStop(true);

  if (!needSocket) {
    needSendSocket = false;
  }
  // context.close sẽ ăn vào disconnected => isStop là true => set isStop = false
  await profileTest?.context?.close(); // nếu đang chạy code js sẽ ko dừng ngay mà chờ đến khi chạy code playwright mới dừng
  // attach lại event disconnected
  const { browser } = await reConnectBrowser({ chrome });

  if (browser) {
    const getContext = browser?.contexts()[0];
    const pages = getValidPages(getContext);
    const getPage = pages[0] || await getContext?.newPage();

    setBrowserTest({
      context: getContext,
      page: getPage,
      chrome,
    });

    return {
      page: getPage,
      context: getContext,
      chrome,
    };
  }

  return true;
};


const openProfile = async () => {

  const { context, page, chrome } = await openProfileTest({ runScript: false });

  setBrowserTest({
    context,
    page,
    chrome,
  });

  return true;
};

const closeProfile = async () => {

  const profileTest = getBrowserTest();

  if (Object.keys(profileTest).length <= 0) {
    return true;
  }

  await profileTest?.chrome?.kill();
  setBrowserTest({})

  return true;
};

const validateStatus = (data) => {
  const { error, value } = statusValidation.validate(data, { stripUnknown: true });

  if (error) {
    throw new ValidationException(error.details[0].message);
  }

  return value;
};

const validateScript = (data) => {
  const { error, value } = scriptSchema.validate(data, { stripUnknown: true });

  if (error) {
    throw new ValidationException(error.details[0].message);
  }

  return value;
};


module.exports = {
  createScript,
  getScriptById,
  getScriptIdByName,
  getScriptNameById,
  updateScript,
  updateScriptStatus,
  getAllScripts,
  deleteScript,
  runScript,
  openProfile,
  closeProfile,
  stopScript,
  getAllScriptsByProject,
  getCurrentBrowserTest,
};
