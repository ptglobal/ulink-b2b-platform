function stringifyError(error) {
  if (!error) return '';
  if (error instanceof Error) return error.stack ?? error.message;

  try {
    return JSON.stringify(error, null, 2);
  } catch {
    return String(error);
  }
}

export function logInfo(message) {
  console.log(`[INFO] ${message}`);
}

export function logStep(message) {
  console.log(`\n[STEP] ${message}`);
}

export function logPass(message) {
  console.log(`[PASS] ${message}`);
}

export function logFail(message) {
  console.error(`[FAIL] ${message}`);
}

export function logDone(message) {
  console.log(`[DONE] ${message}`);
}

export function logFatal(message, error) {
  console.error(`[FATAL] ${message}`);
  if (error) {
    console.error(stringifyError(error));
  }
}
