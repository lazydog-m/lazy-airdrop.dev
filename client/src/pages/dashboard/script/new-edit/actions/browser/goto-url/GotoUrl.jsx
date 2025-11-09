import { DELAY_TIME_SCRIPT, ERROR_MESSAGE, SIZE_ICON_ACTION, SUCCESS_MESSAGE, TIMEOUT_DIVIDE, TIMEOUT_SCRIPT } from "@/enums/enum";
import { createCodeEndDuration, createCodeLog, createCodeAutomation, createCodeStartDuration, createCommentHeader, randomDelay, createCodeTryCatch, createCodeBlock, createCodeBody } from "@/utils/commonUtil";
import { Globe } from "lucide-react";
import GotoUrlNewEditForm from "./GotoUrlNewEditForm";

const getCodeGotoUrl = ({
  // formData
  description = '',
  delayTime = DELAY_TIME_SCRIPT,
  url = '',
  timeout = TIMEOUT_SCRIPT,

  // other
  action = '',
}) => {
  const lines = [];

  if (delayTime > 0) {
    lines.push(`await page.waitForTimeout(${delayTime});`);
  }

  lines.push(`await page.goto("${url}");`);
  // lines.push(`await page.goto("${url}", {timeout: 3000});`);
  lines.push(`await page.waitForLoadState('networkidle');`);

  // return lines.join('\n');
  const code = lines.join('\n');
  const header = createCommentHeader({
    action,
    target: url,
    description,
  });
  return `${header}\n${code}`;

  // body
  // const startDuration = createCodeStartDuration();
  // const tryCatch = createCodeTryCatch({
  //   tryBlock: [
  //     createCodeAutomation(lines),
  //     createCodeLog({ type: SUCCESS_MESSAGE, action }),
  //   ],
  //   catchBlock: [
  //     createCodeLog({ type: ERROR_MESSAGE, action })
  //   ]
  // });

  // const header = createCommentHeader({ action, description });
  // const body = createCodeBody([
  //   startDuration,
  //   tryCatch,
  // ])
  // const block = createCodeBlock({ header, body });
  // const block = createCodeBlock({ header, body: lines.join('\n') });
  //
  // return block;
};

const getPlaceholderGotoUrl = ({
  delayTime = DELAY_TIME_SCRIPT,
  url = '',
  timeout = TIMEOUT_SCRIPT
}) => {
  const parts = [];

  parts.push(`${delayTime / TIMEOUT_DIVIDE}s`);

  // if (url !== '') {
  // parts.push(`'${url}' ${timeout !== 0 ? `(${timeout})` : ''}`);
  parts.push(`'${url || null}'`);
  // }

  if (parts.length === 0) return '';

  return ` ${parts.join(' 🡆 ')}`;
};

export const GotoUrl = {
  type: 'goto-url',
  name: 'Goto URL',
  icon: <Globe size={SIZE_ICON_ACTION} />,
  formComponent: GotoUrlNewEditForm,
  formData: {
    description: '',
    delayTime: DELAY_TIME_SCRIPT,
    url: '',
    timeout: TIMEOUT_SCRIPT,
  },
  placeholder: getPlaceholderGotoUrl,
  code: ``,
  buildCode: getCodeGotoUrl,
};
