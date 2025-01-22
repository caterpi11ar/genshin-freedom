import type { Cookie } from "puppeteer";
import { existsSync } from "node:fs";
import { readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

function getCookiePath(cookieFileName: string) {
  return path.join(__dirname, cookieFileName);
}

export async function loadCookies(cookieFileName: string) {
  const cookiePath = getCookiePath(cookieFileName);
  if (!existsSync(cookiePath)) return [];
  try {
    const cookies = await readFile(cookiePath, { encoding: "utf8" });
    if (cookies === "") throw new Error("The cookie file is empty");
    return JSON.parse(cookies) as Cookie[];
  } catch (error) {
    console.error(error);
    throw new Error("The cookie file is incorrect");
  }
}

export async function saveCookies(cookie: Cookie[], cookieFileName: string) {
  await writeFile(getCookiePath(cookieFileName), JSON.stringify(cookie));
}

export async function deleteCookies(cookieFileName: string) {
  const cookiePath = getCookiePath(cookieFileName);
  if (existsSync(cookiePath)) {
    await unlink(cookiePath);
    console.log(`Cookie 文件 ${cookieFileName} 已删除`);
  } else {
    console.log(`Cookie 文件 ${cookieFileName} 不存在`);
  }
}
