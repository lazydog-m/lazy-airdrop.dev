const { chromium } = require('playwright')
const config = require('../../playwrightConfig');
const path = require('path')
const fs = require('fs')
const { getSocket } = require('../configs/socket');
const RestApiException = require('../exceptions/RestApiException');
const { exec } = require('child_process');

let browsers = [];

const addBrowser = (br) => {
  browsers.push(br);
};

const getBrowsers = () => browsers;

const removeBrowserById = (id) => {
  const newList = browsers.filter(b => b?.profile?.id !== id);
  browsers.length = 0;
  browsers.push(...newList);
};

const currentProfiles = () => browsers.map((br) => br?.profile?.id);

const BASE_PORT = 9222;
const usedPorts = new Set();

const getPortFree = () => {
  let port = BASE_PORT;
  while (usedPorts.has(port)) {
    port++;
  }
  usedPorts.add(port);
  return port;
};

const closingByApiIds = new Set();

let isStop = false;
const setIsStop = (value) => { isStop = value; };

// chạy sript tối đa 21 profile 1 luồng
function createGridLayoutScript(profileCount) {
  const profileWidth = config.PROFILE_SCRIPT_WIDTH;
  const profileHeight = config.PROFILE_SCRIPT_HEIGHT;

  // Tính số cột sao cho vừa với độ rộng màn hình
  const cols = Math.floor(config.SCREEN_WIDTH_FULL / profileWidth);

  const layouts = [];
  for (let i = 0; i < profileCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    layouts.push({
      x: col * profileWidth,
      y: row * profileHeight,
      width: profileWidth,
      height: profileHeight
    });
  }
  return layouts;
}

// sort tối đa 12 profile 1 luồng
// Căn chỉnh theo dạng lưới theo số lượng cửa sổ
function createGridLayout(profileCount) {
  const cols = Math.ceil(Math.sqrt(profileCount));
  const rows = Math.ceil(profileCount / cols);
  const width = Math.floor(config.SCREEN_WIDTH / cols);
  const height = Math.floor(config.SCREEN_HEIGHT / rows);

  const layouts = [];
  for (let i = 0; i < profileCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    layouts.push({
      x: col * width,
      y: row * (height + 0),
      width,
      height
    });
  }
  return layouts;
}

function getLayout(layout) {
  const defaultLayout = {
    x: 0,
    y: 0,
    width: config.SCREEN_WIDTH / 2,
    height: config.SCREEN_HEIGHT
  }

  if (!layout) {
    return defaultLayout;
  }

  return layout;
}

async function sortGridLayout() {
  const layout = createGridLayout(browsers.length);

  for (let i = 0; i < browsers.length; i++) {
    const { chrome, context } = browsers[i];
    const pages = getValidPages(context);
    const getPage = pages[0] || await context.newPage();
    const client = await getPage.context().newCDPSession(getPage); // kết nối đến profile dựa trên page

    const { windowId } = await client.send("Browser.getWindowForTarget");
    const pos = layout[i];

    await client.send("Browser.setWindowBounds", {
      windowId,
      bounds: {
        left: pos.x,
        top: pos.y,
        width: pos.width,
        height: pos.height,
        windowState: "normal"
      }
    });

    // Nổi cửa sổ
    activeChrome(chrome.pid)
  }
}

function activeChrome(pid) {
  if (getOs() === 'win32') {
    const pathNircmd = path.join(config.TOOL_DIR, 'nircmd-x64', 'nircmd.exe');
    exec(`"${pathNircmd}" win min process /${pid}`);
    exec(`"${pathNircmd}" win activate process /${pid}`);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function closeExtensionPages(context, browser) {
  const extConfig = JSON.parse(fs.readFileSync(path.join(config.EXTENSION_DIR, 'config.json'), 'utf8'));

  const startupExts = extConfig
    .filter(ext => ext.openOnStartup);

  let closedExtCount = 0;
  let startupExtTotal = startupExts.length;

  return new Promise(async (resolve, reject) => {
    // nếu như await promise này, thì khi close browser nó mà chưa đóng đủ ext sẽ bị treo api
    browser?.on('disconnected', () => {
      reject(new RestApiException('Chưa sẵn sàng chạy kịch bản!'));
    });

    if (startupExtTotal === 0) {
      resolve(true);
      return;
    }

    context.on('page', async (page) => {
      page.on('framenavigated', async (frame) => {
        // Các page ext (của các ví như metamask, sui...) sẽ được mở bởi các case sau:
        // 1. Chạy profile với 'load-extension' (tùy ví).
        // 2. Do click vào ext ví trên toolbar nếu như ví chưa login ví (tùy ví).
        // 3. Connect ví trong các dApp airdrop sẽ mở popup page ext.

        // Khi 1 page mới được mở, dù có điều hướng đến trang nào đó thì Url của page đó vẫn
        // là blank. Vì nó nhận Url sau khi page mới được mở chứ ko đợi điều hướng đến trang
        // cụ thể rồi mới nhận Url. Ngay cả khi dùng newPage.goto() thì trươc đó newPage
        // cũng đã được mở từ context rồi mới điều hướng trang nên Url cũng sẽ là blank.

        // page.on('framenavigated', async (frame) => {})
        // Đợi page mới mở điều hướng đến trang đích rồi mới nhận Url => phù hợp các case
        // Các page ext ví được mở bởi các case trên sẽ giống như kiểu framenavigated

        const url = frame.url();

        if (closedExtCount >= startupExtTotal) {
          // closed đủ số ext cần close rồi thì thôi
          return;
        }

        if (url.startsWith('chrome-extension://')) {
          try {
            await page.close();
            closedExtCount++; // case bi thieu count se ko done dc loading (mo cung luc se bi)

            if (closedExtCount >= startupExtTotal) { //  chẳng may đóng ko đủ thì bị treo api
              resolve(true);
            }
          } catch (err) {
            console.error(`Lỗi đóng page exception:`, err);
          }
        }
      })
    });
  });
}

function closeProfileListener(browser, profileId) {
  browser.on('disconnected', () => {
    try {
      if (closingByApiIds.has(profileId)) {
        closingByApiIds.delete(profileId);
        return;
      }

      const profile = browsers.find(b => b?.profile?.id === profileId);

      if (!profile) {
        return;
      }

      usedPorts.delete(profile?.port);
      removeBrowserById(profileId);

      const socket = getSocket();
      socket.emit('profileIdClosed', { id: profileId });
    } catch (error) {
      console.error('Có lỗi khi đóng hồ sơ', error.message);
    }
  });
}

const getOs = () => process.platform;

async function openProfile({ profile, port, layout, activate = false, runScript = false }) {
  const profilePath = path.join(config.PROFILE_DIR, profile.name);

  if (!fs.existsSync(profilePath)) {
    fs.mkdirSync(profilePath, { recursive: true });
  }

  const chromeLauncher = await import('chrome-launcher');
  const chromePath = getOs() === 'win32'
    ? 'C:\\GoogleChromePortable64\\App\\Chrome-bin\\chrome.exe' // version 138 mới có thể dùng load-extension (change dir)
    : '/usr/bin/google-chrome';

  const profileLayout = getLayout(layout);
  const extensions = fs.readdirSync(config.EXTENSION_DIR)
    .map(ext => path.join(config.EXTENSION_DIR, ext))
    .filter(extPath => fs.statSync(extPath).isDirectory());

  const chromeFlags = [
    // `--app=data:text/html,<html></html>`,
    `--window-position=${profileLayout.x},${profileLayout.y}`,
    `--window-size=${profileLayout.width},${profileLayout.height}`,
    '--no-default-browser-check',
    '--hide-crash-restore-bubble',
    '--no-first-run',
    '--enable-extensions',
    `--load-extension=${extensions.join(',')}`,
    `--disable-extensions-except=${extensions.join(',')}`,
  ];

  if (getOs() !== 'win32') { // linux thì sẽ dùng kiểu này nếu ko sẽ bị tạo folder sai khi dùng userDataDir
    chromeFlags.push(`--user-data-dir=${profilePath}`);
  }

  // trong quá trình khởi chạy chrome (loading api mở profile) có thể gặp các lỗi liên quan đến connect và browser

  // có thể bị lỗi 'connect' khi close nhanh bằng X trong lúc đang khởi chạy nhưng chưa hoàn tất các thành phần => launcher failed => bị treo api 1 lúc
  let chrome;

  try {
    chrome = await chromeLauncher.launch({
      port,
      chromePath,
      userDataDir: getOs() === 'win32' ? profilePath : undefined, // win32 thì sẽ dùng kiểu này nếu ko sẽ bị mất cache khi sử dụng user-data-dir
      chromeFlags,
    });
  } catch (error) {
    usedPorts.delete(port);
    throw new RestApiException(`Mở hồ sơ thất bại: ${error.message}`);
  }

  let context;
  let page;

  try {
    // có thể bị lỗi 'connect' khi close nhanh bằng X trong lúc đang connect CDP
    // xảy ra khi chrome chưa hoàn tất CDP (tức launcher thành công và đầy đủ nhưng chưa done CDP)
    const browser = await chromium.connectOverCDP(`http://127.0.0.1:${chrome.port}`);

    closeProfileListener(browser, profile.id);

    context = browser.contexts()[0];

    // có thể bị lỗi 'newPage || open new tab' khi close nhanh bằng X trong lúc đang gọi page từ context
    // xảy ra khi context đã bị detach do browser bị disconnect
    page = context.pages()[0] || await context.newPage();

    // ko await khi mở tay profile tránh load lâu api
    // if (runScript) {
    //   await closeExtensionPages(context) // chỉ await khi chạy script tránh xung đọt thao tác
    // }
    // else {
    closeExtensionPages(context)
    // }

    // window ko active cửa sổ chrome như linux
    if (activate) {
      activeChrome(chrome.pid)
    }


  } catch (error) {
    usedPorts.delete(port);
    throw new RestApiException(`Mở hồ sơ thất bại: ${error.message}`);
  }

  return { context, page, chrome };
}

let browserTest = {};

const setBrowserTest = (br) => {
  browserTest = br;
};

const getBrowserTest = () => browserTest;

// test
async function openProfileTest({ runScript = false }) {
  const profilePath = path.join(config.PROFILE_DIR, 'profile_test');

  if (!fs.existsSync(profilePath)) {
    fs.mkdirSync(profilePath, { recursive: true });
  }

  const chromeLauncher = await import('chrome-launcher');
  const chromePath = getOs() === 'win32'
    ? 'C:\\GoogleChromePortable64\\App\\Chrome-bin\\chrome.exe' // version 138 mới có thể dùng load-extension (change dir)
    : '/usr/bin/google-chrome';

  // const defaultLayout = {
  //   x: 0,
  //   y: 0,
  //   width: config.SCREEN_WIDTH,
  //   height: config.SCREEN_HEIGHT
  // }
  const profileLayout = getLayout();
  const extensions = fs.readdirSync(config.EXTENSION_DIR)
    .map(ext => path.join(config.EXTENSION_DIR, ext))
    .filter(extPath => fs.statSync(extPath).isDirectory());

  const chromeFlags = [
    `--window-position=${profileLayout.x},${profileLayout.y}`,
    `--window-size=${profileLayout.width},${profileLayout.height}`,
    '--no-default-browser-check',
    '--hide-crash-restore-bubble',
    '--no-first-run',
    '--enable-extensions',
    `--load-extension=${extensions.join(',')}`,
    `--disable-extensions-except=${extensions.join(',')}`,
  ];

  if (getOs() !== 'win32') { // linux thì sẽ dùng kiểu này nếu ko sẽ bị tạo folder sai khi dùng userDataDir
    chromeFlags.push(`--user-data-dir=${profilePath}`);
  }

  // trong quá trình khởi chạy chrome (loading api mở profile) có thể gặp các lỗi liên quan đến connect và browser

  // có thể bị lỗi 'connect' khi close nhanh bằng X trong lúc đang khởi chạy nhưng chưa hoàn tất các thành phần => launcher failed => bị treo api 1 lúc
  let chrome;

  try {
    chrome = await chromeLauncher.launch({
      port: 9221,
      chromePath,
      userDataDir: getOs() === 'win32' ? profilePath : undefined, // win32 thì sẽ dùng kiểu này nếu ko sẽ bị mất cache khi sử dụng user-data-dir
      chromeFlags,
    });
  } catch (error) {
    throw new RestApiException(`Mở hồ sơ thất bại: ${error.message}`);
  }

  let context;
  let page;

  try {
    // có thể bị lỗi 'connect' khi close nhanh bằng X trong lúc đang connect CDP
    // xảy ra khi chrome chưa hoàn tất CDP (tức launcher thành công và đầy đủ nhưng chưa done CDP)
    const browser = await chromium.connectOverCDP(`http://127.0.0.1:${chrome.port}`);

    closeProfileTestListener(browser);

    context = browser.contexts()[0];

    // có thể bị lỗi 'newPage || failed open new tab' khi close nhanh bằng X trong lúc đang gọi page từ context
    // xảy ra khi context đã bị detach do browser bị disconnect
    page = context.pages()[0] || await context.newPage();

    // ko await khi mở tay profile tránh load lâu api
    // if (runScript) {
    //   await closeExtensionPages(context, browser) // chỉ await khi chạy script tránh xung đọt thao tác
    // }
    // else {
    closeExtensionPages(context)
    // }

    activeChrome(chrome.pid)

  } catch (error) {
    if (error instanceof RestApiException) {
      throw new RestApiException(error.message);
    }
    throw new RestApiException(`Mở hồ sơ thất bại: ${error.message}`);
  }

  return { context, page, chrome };
}

const reConnectBrowser = async ({ chrome }) => {
  // đây là reConnect tức chrome đã mở sẵn => đầy đủ các thành phần (CDP)
  // close nhanh bằng X trong lúc đang reConnect CDP:
  // có thể bị lỗi 'connect' => xảy ra trong khi chrome đã bị kill (mất CDP)
  // có thể lỗi ui bên fe (vì khi close context đã mất event disconnected => ko socket)
  let browser;
  // connect lỗi do chrome bị kill => vào catch
  // connect thành công ăn event disconnected => sau mà close bằng X thì vẫn dính socket
  try {
    browser = await chromium.connectOverCDP(`http://127.0.0.1:${chrome.port}`);

    // dính lại event disconnected cho browser
    closeProfileTestListener(browser);

    // nếu ko lỗi ở connectOverCDP thì sẽ done socket
  } catch (error) {
    setBrowserTest({})

    const socket = getSocket();
    socket.emit('profileTestClosed', { closed: true });
  }

  return { browser };
}

const getValidPages = (context) => {
  return context?.pages()?.filter(p => {
    const url = p?.url();
    return !/offscreen\.html$/.test(url) && !/background\.html$/.test(url);
  });
};

function closeProfileTestListener(browser) {
  browser.on('disconnected', async () => {
    try {
      if (isStop) {
        setIsStop(false);
        return;
      }

      // const profileTest = getBrowserTest();

      // if (Object.keys(profileTest).length <= 0) {
      //   return;
      // }

      setBrowserTest({})

      const socket = getSocket();
      socket.emit('profileTestClosed', { closed: true });

    } catch (error) {
      console.error('Có lỗi khi đóng hồ sơ', error.message);
    }
  });
}

module.exports = {
  openProfile,
  openProfileTest,
  createGridLayout,
  delay,
  browsers,
  getBrowsers,
  addBrowser,
  removeBrowserById,
  currentProfiles,
  closingByApiIds,
  usedPorts,
  getPortFree,
  sortGridLayout,
  setBrowserTest,
  getBrowserTest,
  setIsStop,
  reConnectBrowser,
  getValidPages,
  activeChrome,
}
