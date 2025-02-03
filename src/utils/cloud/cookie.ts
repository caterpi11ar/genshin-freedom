import type { Cookie } from "puppeteer";
import { readConfigSync, updateConfigSync } from "../config";

/**
 * 将 Cookie 字符串格式化为 JSON 对象
 * @param cookieString - 原始 Cookie 字符串
 * @returns 格式化后的 JSON 对象
 */
export const parseCookies = (cookieString: string): Record<string, string> => {
  const cookies: Record<string, string> = {};

  // 分割 Cookie 字符串为单个 Cookie
  const cookieArray = cookieString.split("; ");

  // 遍历每个 Cookie
  cookieArray.forEach((cookie) => {
    const [key, value] = cookie.split("=");
    if (key && value) {
      cookies[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  });

  return cookies;
};

/** 根据 UID 获取 Cookie */
export function getCookieByUid(uid: string): Cookie[] {
  const config = readConfigSync();
  const cookies = config.cookies ?? {};
  return cookies[uid] ?? [];
}

/**
 * 根据 UID 更新 Cookie
 * @param uid string
 * @param cookie Cookie[]
 */
export async function updateCookies(uid: string, cookie?: Cookie[]) {
  const config = readConfigSync();
  const cookies = config.cookies ?? {};

  if (!cookie) {
    delete cookies[uid]; // 如果没有提供 cookie，则删除该 UID 的 cookie
  } else {
    cookies[uid] = cookie; // 更新或添加 cookie
  }

  updateConfigSync({ cookies }); // 更新配置
}

/**
 * 根据 UID 删除 Cookie
 * @param uid string
 */
export async function deleteCookies(uid: string) {
  await updateCookies(uid); // 调用 updateCookies 删除指定 UID 的 cookie
}
