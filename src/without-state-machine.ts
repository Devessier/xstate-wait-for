function waitForTimeout(timeout: number): [number, Promise<void>] {
  let timerID: number;

  const promise = new Promise<void>((resolve) => {
    timerID = setTimeout(() => {
      resolve();
    }, timeout);
  });

  return [timerID, promise];
}

function pollCallback<CallbackReturn>(
  callback: () => CallbackReturn | Promise<CallbackReturn>
): [number, Promise<CallbackReturn>] {
  const INTERVAL_BETWEEN_COMPUTES = 10

  let timerID: number;

  const promise = new Promise<CallbackReturn>((resolve) => {
    timerID = setInterval(async () => {
      try {
        const result = await callback();

        resolve(result);

        clearInterval(timerID);
      } catch (err) {}
    }, INTERVAL_BETWEEN_COMPUTES);
  });

  return [timerID, promise];
}

export async function waitFor<CallbackReturn>(
  callback: () => CallbackReturn | Promise<CallbackReturn>,
  timeout: number
): Promise<CallbackReturn> {
  let globalTimeoutID: number;
  let pollIntervalTimerID: number;

  try {
    const [_globalTimeoutID, globalTimerPromise] = waitForTimeout(timeout);
    const [_pollIntervalTimerID, pollPromise] = pollCallback(callback);
    globalTimeoutID = _globalTimeoutID;
    pollIntervalTimerID = _pollIntervalTimerID;

    let result: CallbackReturn;

    await Promise.race([
      globalTimerPromise.then(() => {
        throw new Error("Timer expired");
      }),
      pollPromise.then((res) => {
        result = res;
      }),
    ]);

    return result;
  } catch (err) {
    throw new Error("waitFor times out");
  } finally {
    clearTimeout(globalTimeoutID);
    clearInterval(pollIntervalTimerID);
  }
}
