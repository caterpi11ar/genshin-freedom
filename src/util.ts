/**
 * @description 根据间隔执行回调函数若干次
 * @param interval 间隔时间
 * @param times 执行次数
 * @param callback 回调函数
 */
export async function timedFunction(interval: number, times: number, callback: (count: number) => void) {
  return new Promise<void>((resolve) => {
    let count: number = 0
    const intervalId = setInterval(async () => {
      if (count < times) {
        callback(count)
        count++
      }
      else {
        clearInterval(intervalId)
        resolve()
      }
    }, interval)
  })
}
