import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import pkg from "../../package.json";
import { Cookie } from "puppeteer";

interface IConfig {
  
  cookies?: Record<string, Cookie[]>;
}

/** 获取配置文件路径 */
export const getConfigPath = () => {
  return path.join(os.homedir(), `.${pkg.name}`, "config.json");
};

/** 读取用户配置 */
export const readConfigSync = (): IConfig => {
  const configPath = getConfigPath();
  let config: IConfig | undefined = undefined;

  try {
    config = JSON.parse(fs.readFileSync(configPath).toString());
  } catch (error) {
    console.warn(
      `Unable to read argv.json configuration file in ${configPath}, `
    );
    createDefaultConfigSync(configPath);
  }

  // Fallback to default
  if (!config) config = {};

  return config;
};

/** 创建默认配置 */
export const createDefaultConfigSync = (configPath: string) => {
  try {
    // Ensure config parent exists
    const configPathDirname = path.dirname(configPath);
    if (!fs.existsSync(configPathDirname)) {
      fs.mkdirSync(configPathDirname);
    }

    // Default content
    const defaultConfigContent = ["{", "}"];

    // Create initial config.json with default content
    fs.writeFileSync(configPath, defaultConfigContent.join("\n"));
  } catch (error) {
    console.error(
      `Unable to create config.json configuration file in ${configPath}, falling back to defaults (${error})`
    );
  }
};

/**
 * 更新用户配置
 * @param newConfig IConfig
 */
export const updateConfigSync = (newConfig: IConfig) => {
  const configPath = getConfigPath();

  // 读取当前配置
  let currentConfig: IConfig = readConfigSync();

  // 更新配置
  currentConfig = { ...currentConfig, ...newConfig };

  // 写入更新后的配置
  try {
    fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2));
    console.log(`配置已更新: ${configPath}`);
  } catch (error) {
    console.error(`无法写入配置文件 ${configPath}: ${error}`);
  }
};
