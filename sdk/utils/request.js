import { infoStore } from './store';
import log from './log';
import queryString from 'query-string';
import { bind, fire } from './cusEvent';
let reqErr = {
  errTimer: null,
  errCount: 0
};
let baseUrl = '';

bind('refresh_ratel', (ratel) => {
  ratel && (baseUrl = ratel);
});

const paramCheck = (params = {}, checks = []) => {
  let error = [];
  checks.forEach((item) => {
    if (typeof item === 'string') {
      if (typeof params[item] === 'undefined') {
        error.push(item + ' can not be null..');
      }
    }
    if (Array.isArray(item)) {
      let has = false;
      item.forEach((innerItem) => {
        if (typeof params[innerItem] !== 'undefined') {
          has = true;
        }
      });
      if (!has) {
        error.push(item.join('、') + ' can not be all null');
      }
    }
  });
  return error;
};

const noTokenUrls = [
  'app_dns',
  'app/captcha/image',
  'app/captcha/sms',
  'app/captcha/sms_web',
  'app/user/info_pwd',
  'app/wechat_login',
  'mobile_bind_with_sign',
  'qr_code',
  'qr_login',
  'token/id',
  'token/user',
  'user/register'
];

const isTokenRequired = (url) => {
  let isRequired = true;
  noTokenUrls.forEach((x) => {
    if (url.indexOf(x) > -1) {
      isRequired = false;
    }
  });
  return isRequired;
};

const configHeader = (url) => {
  const token = infoStore.getToken();
  const app_id = infoStore.getAppid();

  if (isTokenRequired(url) && !token) {
    //triger token refresh
    fire('flooNotice', { category: 'action', desc: 'relogin' });
    throw new Error('you should login ...');
  }

  return {
    'access-token': token,
    app_id
  };
};

const dealParams = (param) => {
  if (param.group_id) param.group_id = param.group_id - 0;
  if (param.user_id) param.user_id = param.user_id - 0;
  if (param.new_owner) param.new_owner = param.new_owner - 0;
  if (param.apply_approval) param.apply_approval = param.apply_approval - 0;
  if (param.duration) param.duration = param.duration - 0;
  if (param.limit) param.limit = param.limit - 0;
  if (param.version) param.version = param.version - 0;
  if (param.announcement_id) param.announcement_id = param.announcement_id - 0;
  if (param.user_list && Array.isArray(param.user_list)) param.user_list = param.user_list.map((i) => i - 0);
  if (param.user_list && Array.isArray(param.user_list)) param.user_list = param.user_list.map((i) => i - 0);
  if (param.file_list && Array.isArray(param.file_list)) param.file_list = param.file_list.map((i) => i - 0);
  return param;
};

const request = (url, method = 'get', params = {}, checks = [], isQuery = false, config = {}) => {
  log.log('========request=============', url, method, params, checks, isQuery);
  const arr = paramCheck(params, checks);
  if (arr.length) {
    const errMsg = arr.join(',');
    return Promise.reject(new Error(errMsg));
  }

  let params2 = {};
  const _method = method.toLowerCase();
  if (_method === 'get' || (_method === 'post' && isQuery)) {
    if (url.indexOf('?') > 0) {
      url += '&';
    } else {
      url += '?';
    }
    url += queryString.stringify(params);
  } else {
    // change params to integer when necessary
    params2 = dealParams(params);
  }

  let header = config.headers || configHeader(url);

  if (url.indexOf('http') < 0) {
    url = baseUrl + url;
  }

  if (config.operation && config.operation === 'upload_file') {
    return new Promise((res, rej) => {
      const options = {
        url,
        header,
        filePath: params.filePath,
        formData: params.formData,
        name: params.name,
        success: function (response) {
          clearErrCounter(); // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容

          if (response.statusCode === 200) {
            console.log('Upload file success: ', response); // do not resolve until complete;

            res(response.tempFilePath);
          } else {
            console.error('Upload file error: ', response);
            rej(response);
          }
        },
        fail: function (err) {
          checkErrCounter();
          rej(err);
        }
      };
      wx.uploadFile(options);
    });
  }
  if (config.operation && config.operation === 'download_file') {
    return new Promise((res, rej) => {
      const options = {
        url,
        header,
        success: function (response) {
          clearErrCounter(); // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容

          if (response.statusCode === 200) {
            console.log('Download file success: ', response); // do not resolve until complete;

            res(response.tempFilePath);
          } else {
            console.error('Download file error: ', response);
            rej(response);
          }
        },
        fail: function (err) {
          checkErrCounter();
          rej(err);
        } // complete: function(response){
        //   res(response.tempFilePath);
        // }
      };
      wx.downloadFile(options);
    });
  }

  let content_type = config.content_type || 'application/json';
  header = Object.assign(header, {
    'Content-Type': content_type
  }); // return racePromise( new Promise((res, rej) => {

  return new Promise((res, rej) => {
    const options = {
      url,
      data: params2,
      header,
      method,
      dataType: 'json',
      success: function (response) {
        clearErrCounter();
        const { data = {} } = response;

        if (config.headers && Object.keys(config.headers).length !== 0) {
          // Request with additional config means will call the 3rd party, i.e. aliyun,
          // in which it's difficult to check success

          if (typeof data.data === 'boolean' && data.data) {
            //ceph
            return;
          } else if (typeof data.Status === 'string' && data.Status === 'OK') {
            //aliyun oss
            return;
          }

          console.log('====== request got unkonwn response, ', response);
          return Promise.reject({
            config,
            url
          });
        }

        const { data: innerData, code, message } = data;

        if (code === 200) {
          log.log('======request success, ', url, innerData);
          res(innerData);
        } else {
          if (code === 402) {
            //triger token refresh
            fire('flooNotice', { category: 'action', desc: 'relogin' });
          }

          log.req(url + '' === '' + message);
          rej({
            message,
            url,
            data
          });
        }
      },
      fail: function (err) {
        checkErrCounter();
        rej(err);
      },
      complete: function () {}
    };
    wx.request(options);
  });
};

function clearErrCounter() {
  reqErr.errTimer && clearTimeout(reqErr.errTimer);
  reqErr.errTimer = null;
  reqErr.errCount = 0;
}

function checkErrCounter() {
  reqErr.errTimer && clearTimeout(reqErr.errTimer);
  reqErr.errTimer = null;
  reqErr.errCount = reqErr.errCount + 1;
  if (reqErr.errCount >= 5) {
    reqErr.errCount = 0;
    fire('ratelError');
  } else {
    reqErr.errTimer = setTimeout(() => {
      reqErr.errCount = 0;
    }, 30 * 60 * 1000);
  }
}

function racePromise(proRequest) {
  return Promise.race([
    proRequest,
    new Promise((resolve, reject) => {
      setTimeout(() => {
        wx.hideLoading();
        reject();
      }, 40000);
    })
  ]);
}

export { request };
