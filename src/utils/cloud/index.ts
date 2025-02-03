/**
 * 云原神相关操作
 */
import puppeteer, { Cookie, type Browser, type Page } from "puppeteer";
import config, { type Config } from "./config";
import {
  deleteCookies,
  getCookieByUid,
  updateCookies,
} from "./cookie";
import { type IpcMainInvokeEvent } from "electron";
import { attemptWithRetries } from '../'

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
  const { x, y, times, interval } = config.simulateEvent;

  await timedFunction(interval, times, async () => {
    await page.mouse.click(x, y);
  });

  log("已成功领取月卡");
}

const formatTimestamp = (date: Date) => {
  // const year = date.getFullYear();
  // const month = String(date.getMonth() + 1).padStart(2, "0");
  // const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  // return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return `[${hours}:${minutes}:${seconds}]`;
};

export async function launch(uid: string, event: IpcMainInvokeEvent) {
  log = (message: string) => {
    event.sender.send(
      "log-update",
      `${formatTimestamp(new Date())} ${message}`
    );
  };

  let browser: Browser | undefined;
  let page: Page | undefined;
  const task = async () => {
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
  };
  const errorHandle = async () => {
    await browser?.close();
    log("达到最大失败次数");
    await deleteCookies(uid);
  };
  attemptWithRetries(task, browser?.close, errorHandle);
}
