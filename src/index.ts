import type { Browser, Cookie, Page } from "puppeteer";
import type { Config, UserConfig } from "./config";
import puppeteer from "puppeteer";
import defaultConfig from "./config";
import { deleteCookies, loadCookies, saveCookies } from "./cookie";
import { timedFunction } from "./util";

/** 创建启动浏览器和页面的通用函数 */
async function launchBrowser(cookies: Cookie[], config: Config) {
  const browser = await puppeteer.launch({
    args: [],
    headless: cookies.length !== 0, // 无 cookies 时开启 headless 模式
  });
  const page = await browser.newPage();

  if (!!cookies.length) await browser.setCookie(...cookies);

  await page.goto(config.url);
  await page.waitForNavigation({ waitUntil: "domcontentloaded" });

  return { browser, page };
}

/** 等待并点击元素 */
async function waitAndClick(page: Page, selector: string, timeout: number) {
  try {
    const element = await page.waitForSelector(selector, { timeout });
    if (element) await element.click();
    return true;
  } catch {
    return false;
  }
}

/** 登录并排队 */
async function loginAndQueue(page: Page, browser: Browser, config: Config) {
  console.log("等待登录...");
  const start = await page.waitForSelector(config.startClassname, {
    timeout: config.maxLoginTime,
  });
  console.log("登录成功");

  console.log("保存 cookie 中...");
  await saveCookies(await browser.cookies(), config.cookieFileName);
  console.log("保存成功");

  // 执行其他点击操作
  await waitAndClick(page, "cancel", 3000); // 网络测速
  await waitAndClick(page, "van-action-bar-button--first", 3000); // 月卡奖励

  console.log("排队中...");
  await start?.click();
  await page.waitForSelector(config.gameBodyClassname, {
    timeout: config.maxQueueTime,
  });
  console.log("排队结束");
}

/** 模拟点击游戏 */
async function simulateGameClick(page: Page, config: Config) {
  console.log("准备进入游戏...");
  const { x, y, times, interval } = config.simulateClick;

  await timedFunction(interval, times, async () => {
    await page.mouse.click(x, y);
  });

  console.log("已完成");
}

export async function run(userConfig?: UserConfig) {
  const config: Config = {
    ...defaultConfig,
    cookieFileName: userConfig?.cookieFileName ?? defaultConfig.cookieFileName,
  };

  const onError = userConfig?.onError;
  const onSuccess = userConfig?.onSuccess;

  let failureCount = 0;
  let ok = false;
  const cookieFileName = config.cookieFileName;
  let browser: Browser | undefined;
  let page: Page | undefined;
  while (failureCount < config.maxFailureCount && !ok) {
    try {
      const cookies = await loadCookies(cookieFileName);
      ({ browser, page } = await launchBrowser(cookies, config));

      await loginAndQueue(page, browser, config);
      await simulateGameClick(page, config);

      ok = true;
      await browser.close();
    } catch (e) {
      failureCount++;
      console.error("运行失败:", e);
    }
  }

  if (failureCount >= config.maxFailureCount) {
    await browser?.close();
    console.log("达到最大失败次数，删除 cookie 文件");
    await deleteCookies(cookieFileName);
    onError?.(new Error("失败次数达到最大"));
  } else {
    onSuccess?.();
  }
}

run();
