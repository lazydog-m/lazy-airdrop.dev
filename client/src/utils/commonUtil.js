import { ERROR_MESSAGE, SUCCESS_MESSAGE } from "@/enums/enum";

export const delayApi = (callback) => {
  setTimeout(callback, 100);
};

export const delay = (callback, ms = 500) => {
  setTimeout(callback, ms);
};

export const formatNumberVN = (num) => {
  if (num == null) return '';
  return num.toLocaleString('vi-VN');
};

// script
export const randomDelay = () => {
  const delays = [5000, 6000, 7000, 8000, 9000, 10000];
  const randomIndex = Math.floor(Math.random() * delays.length);
  return delays[randomIndex];
};

const INDENT_DEFAULT = 2;

const indent = (code = '', spaces = INDENT_DEFAULT) => {
  if (!code) return '';
  const pad = " ".repeat(spaces);

  return code
    .split("\n")
    .map(line => pad + line)  // thêm indent vào mỗi dòng
    .join("\n");
};

export const createCodeBlock = ({ header = '', body = '' }) => {
  return [
    indent(header, INDENT_DEFAULT),
    indent("{", INDENT_DEFAULT),
    indent(body, INDENT_DEFAULT + INDENT_DEFAULT),
    indent("}", INDENT_DEFAULT)
  ].join("\n");
};

export const createCodeBody = (codes = []) => {
  return codes.join("\n");
};

export const createCodeTryCatch = ({ tryBlock = [], catchBlock = [] }) => {
  return [
    "try {",
    indent(createCodeBody(tryBlock), INDENT_DEFAULT),
    "} catch (error) {",
    indent(createCodeBody(catchBlock), INDENT_DEFAULT),
    "}"
  ].join("\n");
};

export const createCodeStartDuration = () => {
  return `const start = Date.now();`;
}

export const createCodeEndDuration = () => {
  return `Date.now() - start`;
}

export const createCodeTimeVN = () => {
  return `new Date().toLocaleTimeString("en-GB", { hour12: false, timeZone: "Asia/Ho_Chi_Minh" })`;
};

export const createCommentHeader = ({ action = '', target = '', description = '' }) => {

  // Tách desc theo xuống dòng, trim khoảng trắng thừa
  const lines = description
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  // Nếu desc có nhiều dòng → format dạng bullet
  let desc;
  if (lines.length === 0) {
    desc = "// 🎯 Description: ";
  } else if (lines.length === 1) {
    desc = `// 🎯 Description: ${lines[0]}`;
  } else {
    desc = [
      "// 🎯 Description:",
      ...lines.map(line => `//   🡆 ${line}`)
    ].join("\n");
  }

  return [
    '// ────────────────────────────────',
    `// 🎬 Action: ${action} 🡆 ${target}`,
    desc,
    '// ────────────────────────────────',
  ].join("\n");
}

export const createCodeAutomation = (codes = []) => {
  return [
    `// 🎭 Automation`,
    codes.map(code => `${code}`).join('\n'),
  ].join("\n");
}

export const createCodeLog = ({ type = SUCCESS_MESSAGE, action = '', message = '' }) => {

  const logComment = `// 🛰️ Log`;

  const fields = [
    `time: ${createCodeTimeVN()}`,
    `action: "${action}"`,
    `duration: ${createCodeEndDuration()}`,
    `status: "${type}"`,
    ...(type === ERROR_MESSAGE ? [`message: error.message`] : [])
  ]
    .map(field => indent(field, INDENT_DEFAULT))
    .join(",\n");

  return [
    ...(type === SUCCESS_MESSAGE ? [``] : []),
    logComment,
    `const log = {`,
    fields,
    `};`,
    `socket.emit('logs', { log });`,
  ].join("\n");
}
