import Long from 'long';

const formatJson = (obj) => {
  const isLong = obj instanceof Long;

  if (isLong) {
    return obj;
  }

  const type = typeof obj;

  if (type === 'bool' || type === 'string' || type === 'number') {
    return obj;
  }

  if (Array.isArray(obj)) {
    const arrRet = [];
    obj.forEach((item) => {
      arrRet.push(formatJson(item));
    });
    return arrRet;
  }

  const hashRet = {};
  const keys = Object.keys(obj);
  keys.forEach((key) => {
    hashRet[key] = formatJson(obj[key]);
  });
  return hashRet;
};

const transferToLong = (obj) => {
  const { low, high } = obj;

  if (typeof low !== 'undefined' && typeof high !== 'undefined') {
    const srret = new Long(low, high, true);
    return srret;
  }

  const type = typeof obj;

  if (type === 'bool' || type === 'string' || type === 'number') {
    return obj;
  }

  if (Array.isArray(obj)) {
    const arrRet = [];
    obj.forEach((item) => {
      arrRet.push(transferToLong(item));
    });
    return arrRet;
  }

  const hashRet = {};
  const keys = Object.keys(obj);
  keys.forEach((key) => {
    hashRet[key] = transferToLong(obj[key]);
  });
  return hashRet;
};

const toNumber = (obj = 0) => {
  if (typeof obj === 'string') {
    return obj - 0;
  }

  if (typeof obj === 'number') {
    return obj;
  }

  const { low, high, unsigned = true } = obj;

  if (typeof low !== 'undefined' && high !== 'undefined') {
    return new Long(low, high, unsigned).toNumber();
  }
};

const toLong = (obj) => {
  if (typeof obj === 'string') return Long.fromString(obj);
  const { low, high, unsigned = true } = obj;

  if (typeof low !== 'undefined' && high !== 'undefined') {
    return new Long(low, high, unsigned);
  }

  if (typeof obj === 'number') {
    return Long.fromNumber(obj);
  }

  return new Long();
};

const numToString = (obj) => {
  if (typeof obj === 'undefined') {
    ('');
  }

  if (typeof obj === 'string') return obj;
  if (typeof obj === 'number') return obj + '';

  if (typeof obj.low !== 'undefined' && typeof obj.high !== 'undefined') {
    return new Long(obj.low, obj.high, true).toString();
  }

  return new Long(obj).toString();
};

const Uint8ArrayToString = (fileData) => {
  var dataString = '';

  for (var i = 0; i < fileData.length; i++) {
    dataString += String.fromCharCode(fileData[i]);
  }

  return dataString;
};

const stringToUint8Array = (str) => {
  var arr = [];

  for (var i = 0, j = str.length; i < j; ++i) {
    arr.push(str.charCodeAt(i));
  }

  var tmpUint8Array = new Uint8Array(arr);
  return tmpUint8Array;
};

export { formatJson, transferToLong, toLong, toNumber, numToString, Uint8ArrayToString, stringToUint8Array };
