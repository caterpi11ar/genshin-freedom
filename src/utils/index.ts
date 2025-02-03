/**
 * 执行一个操作，并在失败时进行重试，直到达到最大失败次数
 * @param success 成功执行的回调
 * @param error 失败执行的回调
 * @param maxFailureCount 最大重试次数
 * @returns
 */
export const attemptWithRetries = async (
  task: () => void | Promise<void>,
  success?: Function,
  error?: (errors?: Error[]) => void,
  maxFailureCount = 3
) => {
  let failureCount = 0;
  let ok = false;
  const errors: Error[] = [];

  while (failureCount < maxFailureCount && !ok) {
    try {
      await task()
      success?.();
      ok = true;
    } catch (e) {
      errors.push(e as Error);
      failureCount++;
    }
  }

  if (failureCount >= maxFailureCount) {
    error?.(errors);
  }

  return errors;
};
