/**
 * 云原神相关操作
 */
import puppeteer, { type Browser, type Page } from "puppeteer";
import config, { type Config } from "./config";
import { deleteCookies, getCookieByUid, updateCookies } from "./cookie";
import { type IpcMainInvokeEvent } from "electron";

let log = (message: string) => console.log(message);

/**
 * @description 根据间隔执行回调函数若干次
 * @param interval 间隔时间
 * @param times 执行次数
 * @param callback 回调函数
 */
export async function timedFunction(
  interval: number,
  times: number,
  callback: (count: number) => void
) {
  return new Promise<void>((resolve) => {
    let count: number = 0;
    const intervalId = setInterval(async () => {
      if (count < times) {
        callback(count);
        count++;
      } else {
        clearInterval(intervalId);
        resolve();
      }
    }, interval);
  });
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
async function loginAndQueue(
  uid: string,
  page: Page,
  browser: Browser,
  config: Config
) {
  log("等待登录...");
  const start = await page.waitForSelector(config.startClassname, {
    timeout: config.maxLoginTime,
  });

  // 发送日志消息到前端
  log(`用户 ${uid} 登录成功`);

  log("保存 cookie 中...");
  await updateCookies(uid, await browser.cookies());

  log("cookie保存成功");

  // 执行其他点击操作
  await waitAndClick(page, "cancel", 5000); // 网络测速
  await waitAndClick(page, "van-action-bar-button--first", 5000); // 月卡奖励

  log("排队中...");

  await start?.click();
  await page.waitForSelector(config.gameBodyClassname, {
    timeout: config.maxQueueTime,
  });

  log("排队结束");
}

/** 模拟点击游戏 */
async function simulateGameClick(page: Page, config: Config) {
  log("准备进入游戏...");
  const { x, y, times, interval } = config.simulateClick;

  await timedFunction(interval, times, async () => {
    await page.mouse.click(x, y);
  });

  log("已成功领取月卡");
}

export async function launch(uid: string, event: IpcMainInvokeEvent) {
  let failureCount = 0;
  let ok = false;
  log = (message: string) => event.sender.send("log-update", message);

  let browser: Browser | undefined;
  let page: Page | undefined;
  while (failureCount < config.maxFailureCount && !ok) {
    try {
      const cookies = getCookieByUid(uid);
      browser = await puppeteer.launch({
        args: [],
        headless: cookies.length !== 0, // 无 cookies 时开启 headless 模式
      });
      page = await browser.newPage();

      if (cookies.length) await browser.setCookie(...cookies);

      await page.goto(config.url);
      await page.waitForNavigation({ waitUntil: "domcontentloaded" });

      await loginAndQueue(uid, page, browser, config);
      await simulateGameClick(page, config);

      ok = true;
      await browser.close();
    } catch (e) {
      failureCount++;
      log("运行失败");
    }
  }

  if (failureCount >= config.maxFailureCount) {
    await browser?.close();
    log("达到最大失败次数");
    await deleteCookies(uid);
  }
}
