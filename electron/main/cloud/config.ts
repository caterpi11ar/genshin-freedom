export interface Config {
  /** 最大失败次数 */
  maxFailureCount: number

  /** 云原神地址 */
  url: string

  /** 开始按钮类名 */
  startClassname: string

  /** 游戏主体类名 */
  gameBodyClassname: string

  /** 最长排队时间 */
  maxQueueTime: number
  /** 最长登录响应时间 */
  maxLoginTime: number

  simulateClick: {
    /** 横坐标 */
    x: number
    /** 纵坐标 */
    y: number
    /** 间隔 */
    interval: number
    /** 次数 */
    times: number
  }

  /** cookie 文件名称 */
  cookieFileName: string
}

const defaultConfig: Config = {
  maxFailureCount: 3,

  url: 'https://ys.mihoyo.com/cloud/#/',

  startClassname: '.wel-card__content--start',

  gameBodyClassname: '.game-player__video',

  maxQueueTime: 600000,

  maxLoginTime: 60000,

  /** 模拟点击 */
  simulateClick: {
    x: 500,

    y: 390,

    interval: 5000,

    times: 15,
  },

  cookieFileName: 'cookie.json',
}

export default defaultConfig
