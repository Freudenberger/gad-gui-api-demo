const { getConfigValue } = require("../config/configSingleton");
const { ConfigKeys, LogLevels } = require("../config/enums");
const { getCurrentDateTime } = require("./datetime.helpers");
const { LimitedList } = require("./limitedList");

const logList = new LimitedList(100);

function getLogs() {
  return logList;
}

function logMsg(level, message) {
  const msg = `${level} ${message}`;
  console.log(msg);
  logList.addItem(`[${getCurrentDateTime()}]${msg}`);
}

function logMsgAndData(level, message, obj) {
  const msg = `${level} ${message} - ${JSON.stringify(obj)}`;
  console.log(msg);
  logList.addItem(`[${getCurrentDateTime()}]${msg}`);
}

function logDebug(msg, obj) {
  if (getConfigValue(ConfigKeys.CURRENT_LOG_LEVEL) < LogLevels.DEBUG) return;

  if (obj === undefined) {
    logMsg("[DEBUG]", msg);
  } else {
    logMsgAndData("[DEBUG]", msg, obj);
  }
}

function logTrace(msg, obj) {
  if (getConfigValue(ConfigKeys.CURRENT_LOG_LEVEL) < LogLevels.TRACE) return;

  if (obj === undefined) {
    logMsg("[TRACE]", msg);
  } else {
    logMsgAndData("[TRACE]", msg, obj);
  }
}

function logError(msg, obj) {
  if (getConfigValue(ConfigKeys.CURRENT_LOG_LEVEL) < LogLevels.ERROR) return;

  if (obj === undefined) {
    logMsg("[ERROR]", msg);
  } else {
    logMsgAndData("[ERROR]", msg, obj);
  }
}

function logWarn(msg, obj) {
  if (getConfigValue(ConfigKeys.CURRENT_LOG_LEVEL) < LogLevels.WARNING) return;

  if (obj === undefined) {
    logMsg("[WARN]", msg);
  } else {
    logMsgAndData("[WARN]", msg, obj);
  }
}

module.exports = {
  logDebug,
  logError,
  logWarn,
  logTrace,
  getLogs,
};
