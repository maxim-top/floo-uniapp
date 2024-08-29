import io from './io/index';
import { infoStore, recentStore, messageStore, rosterStore, groupStore } from '../../utils/store';
import log from '../../utils/log';
import { bind, fire, unBind } from '../../utils/cusEvent';
import './messageReceiver';
import rosterManage from '../../manage/rosterManage';
import groupManage from '../../manage/groupManage';
import dnsManager from '../../manage/dnsManager';
import userManage from '../../manage/userManage';

let config = {};
let loginSwap = null;
let sdkOk = false;
let isLogin = false;

const webim = function ({
  autoLogin = true,
  dnsServer = 'https://dns.lanyingim.com/v2/app_dns',
  appid = 'welovemaxim',
  ws = false,
  logLevel = 'debug',
  linkServer = 'https://lanying.link/info'
}) {
  log.setLogLevel(logLevel);
  infoStore.saveAppid(appid);
  infoStore.saveLinkServer(linkServer);
  dnsManager
    .asyncGetDns(dnsServer, appid, ws)
    .then((res) => {
      const { ratel, fireplace } = res;
      if (!ratel || !fireplace) {
        log.log('DNS error, check the server: ', dnsServer);
        fire('flooError', { category: 'DNS_FAILED', desc: dnsServer });
        return;
      }

      setup_servers(appid);

      config = {
        appid,
        baseUrl: ratel,
        autoLogin,
        fireplace
      };
      webim.baseUrl = config.baseUrl;
      sdkOk = true;

      if (loginSwap) {
        const { type } = loginSwap;
        if (type == 'login') webim.login(loginSwap.opt);
        if (type == 'qrlogin') webim.qrlogin(loginSwap.opt);
        if (type == 'tokenLogin') webim.tokenLogin(loginSwap.user_id, loginSwap.token);
        return;
      }

      if (config.autoLogin) {
        isLogin = true;
        const user_id = infoStore.getUid();
        const token = infoStore.getToken();
        const tokenAppId = infoStore.getTokenAppId();
        if (user_id && token && tokenAppId == appid) {
          infoStore.saveUid(user_id);
          const rosterRequest = rosterManage.asyncGetRosterIdList(true);
          const groupRequet = groupManage.asyncGetJoinedGroups(true);
          Promise.all([rosterRequest, groupRequet])
            .then((res) => {
              const rosters = res[0];
              const groups = res[1];
              fire('imRostersGroupslistReady', {
                rosters,
                groups
              });
              log.log('get roster, group over .... will io connect');
              io.connect(config);
            })
            .catch((ex) => {
              fire('flooNotice', {
                category: 'loginMessage',
                desc: 'get roster list failure:' + ex.message
              });
            });
        }
      }
    })
    .catch((ex) => {
      console.log('flooim init error, please retry later: ', ex);
      fire('flooError', { category: 'DNS_FAILED', desc: ex.message });
    });
};

const setup_servers = function (appID) {
  log.log('setup servers for app: ', appID);
  const { ratel, fireplace } = dnsManager.getServers(appID) || {};
  fire('refresh_ratel', ratel);
  fire('refresh_fireplace', fireplace);
};

// 系统相关 ////////////////////////////////////////////////////////////
webim.login = function (opt) {
  console.log('webim.login', opt, 'sdkOk:', sdkOk);
  if (!sdkOk) {
    loginSwap = {
      type: 'login',
      opt
    };
    return;
  }
  fire('flooNotice', { category: 'loginMessage', desc: 'getting token...' });
  io.tokenUser(opt)
    .then((res) => {
      const { token, user_id, public_key } = res;
      infoStore.saveUid(user_id);
      infoStore.saveToken(token);
      infoStore.saveTokenAppId(infoStore.getAppid());
      infoStore.saveAesKey(public_key);
      const rosterRequest = rosterManage.asyncGetRosterIdList(true);
      const groupRequet = groupManage.asyncGetJoinedGroups(true);
      console.log('Get token success');
      isLogin = true;

      fire('flooNotice', {
        category: 'loginMessage',
        desc: 'token sucecc, getting roster lists..'
      });
      Promise.all([rosterRequest, groupRequet])
        .then((res) => {
          const rosters = res[0];
          const groups = res[1];
          fire('imRostersGroupslistReady', {
            rosters,
            groups
          });
          log.log('get roster, group over .... will io connect');
          config = Object.assign(
            {
              uid: user_id,
              token
            },
            config
          );
          io.connect(config);
          loginSwap = null;
        })
        .catch((ex) => {
          fire('flooNotice', {
            category: 'loginMessage',
            desc: 'get roster list failure:' + ex.message
          });
        });
    })
    .catch((ex) => {
      fire('loginFail', 'token failure:' + ex.message);
    });
};

webim.qrlogin = function (opt) {
  console.log('webim.qrlogin', opt);
  if (!sdkOk) {
    loginSwap = {
      type: 'qrlogin',
      opt
    };
    return;
  }

  fire('flooNotice', { category: 'loginMessage', desc: 'getting token...' });
  io.tokenId(opt)
    .then((res) => {
      const { token, user_id, public_key } = res;
      infoStore.saveUid(user_id);
      infoStore.saveToken(token);
      infoStore.saveTokenAppId(infoStore.getAppid());
      infoStore.saveAesKey(public_key);
      const rosterRequest = rosterManage.asyncGetRosterIdList(true);
      const groupRequet = groupManage.asyncGetJoinedGroups(true);
      fire('flooNotice', {
        category: 'loginMessage',
        desc: 'token sucecc, getting roster lists..'
      });
      isLogin = true;

      Promise.all([rosterRequest, groupRequet])
        .then((res) => {
          const rosters = res[0];
          const groups = res[1];
          fire('imRostersGroupslistReady', {
            rosters,
            groups
          });
          log.log('get roster, group over .... will io connect');
          config = Object.assign(
            {
              uid: user_id,
              token
            },
            config
          );
          io.connect(config);
          loginSwap = null;
        })
        .catch((ex) => {
          fire('flooNotice', {
            category: 'loginMessage',
            desc: 'get roster list failure:' + ex.message
          });
        });
    })
    .catch((ex) => {
      fire('loginFail', 'token failure:' + ex.message);
    });
};

webim.tokenLogin = function (user_id, token, public_key) {
  console.log('webim.tokenLogin', user_id);
  if (!sdkOk) {
    loginSwap = {
      type: 'tokenLogin',
      user_id,
      token
    };
    return;
  }

  infoStore.saveUid(user_id);
  infoStore.saveToken(token);
  infoStore.saveTokenAppId(infoStore.getAppid());
  infoStore.saveAesKey(public_key);
  const rosterRequest = rosterManage.asyncGetRosterIdList(true);
  const groupRequet = groupManage.asyncGetJoinedGroups(true);
  fire('flooNotice', {
    category: 'loginMessage',
    desc: 'token sucecc, getting roster lists..'
  });
  isLogin = true;

  Promise.all([rosterRequest, groupRequet])
    .then((res) => {
      const rosters = res[0];
      const groups = res[1];
      fire('imRostersGroupslistReady', {
        rosters,
        groups
      });
      log.log('get roster, group over .... will io connect');
      config = Object.assign(
        {
          uid: user_id,
          token
        },
        config
      );
      io.connect(config);
      loginSwap = null;
    })
    .catch((ex) => {
      fire('flooNotice', {
        category: 'loginMessage',
        desc: 'get roster list failure:' + ex.message
      });
    });
};

// 系统相关 ////////////////////////////////////////////////////////////
webim.idLogin = function (opt) {
  io.tokenId(opt)
    .then((res) => {
      const { token, user_id, public_key } = res;
      infoStore.saveUid(user_id);
      infoStore.saveToken(token);
      infoStore.saveTokenAppId(infoStore.getAppid());
      infoStore.saveAesKey(public_key);
      const rosterRequest = rosterManage.asyncGetRosterIdList(true);
      const groupRequet = groupManage.asyncGetJoinedGroups(true);
      fire('flooNotice', {
        category: 'loginMessage',
        desc: 'token success, getting roster lists..'
      });
      isLogin = true;

      Promise.all([rosterRequest, groupRequet])
        .then((res) => {
          const rosters = res[0] || [];
          rosters.push(user_id);
          const groups = res[1];
          fire('imRostersGroupslistReady', { rosters, groups });
          log.log('get roster, group over .... will io connect');
          config = Object.assign({ uid: user_id, token }, config);
          io.connect(config);
          loginSwap = null;
        })
        .catch((ex) => {
          fire('flooNotice', {
            category: 'loginMessage',
            desc: 'get roster list failure:' + ex.message
          });
        });
    })
    .catch((ex) => {
      fire('loginFail', 'token failure:' + ex.message);
    });
};

webim.wxlogin = function () {};

webim.cleanup = function () {
  log.log('FLOO: IM logout, cleanup the data.');
  recentStore.clear();
  rosterStore.clear();
  groupStore.clear();
  infoStore.clear();
  messageStore.clearAll();
};

webim.isLogin = function () {
  return isLogin && infoStore.getUid() && infoStore.getToken() && infoStore.getAppid() == infoStore.getTokenAppId();
};

webim.on = webim.listen = function (options, ext) {
  if (ext) {
    bind(options, ext);
  } else {
    const eventNames = Object.keys(options);
    eventNames.forEach((eventName) => {
      bind(eventName, options[eventName]);
    });
  }
};

webim.off = function (options, ext) {
  if (ext) {
    unBind(options, ext);
  } else {
    const eventNames = Object.keys(options);
    eventNames.forEach((eventName) => {
      unBind(eventName, options[eventName]);
    });
  }
};

webim.kickAllWeb = function () {
  userManage
    .asyncGetDeviceList()
    .then((device_list) => {
      if (device_list && device_list.length) {
        if (device_list.length === 1) {
          webim.cleanup();
        } else {
          let arr = [];
          device_list.forEach((device) => {
            if (device.device_sn != userManage.getDeviceSN() && device.platform === 6) {
              arr.push(
                new Promise((resolve, reject) => {
                  userManage
                    .asyncKickDevice({ device_sn: device.device_sn })
                    .then(() => {
                      resolve();
                    })
                    .catch((ex) => {
                      reject(ex);
                    });
                })
              );
            }
          });
          Promise.all(arr).then(() => {
            webim.cleanup();
          });
        }
      }
    })
    .catch((ex) => {
      console.log('flooim asyncGetDeviceList error: ', ex);
    });
};
webim.logout = function (opt) {
  io.disConnect();
  isLogin = false;
  if (opt) {
    if (opt.quitAllWeb) {
      webim.kickAllWeb();
    }
    if (!opt.linkLogin) {
      webim.cleanup(); // for wx uni app, only one page login, need cleanup.
    }
  } else {
    webim.cleanup(); // for wx uni app, only one page login, need cleanup.
  }
};

webim.isReady = function () {
  return sdkOk;
};

webim.setLogLevel = function (logLevel) {
  log.setLogLevel(logLevel);
};

webim.disConnect = io.disConnect;

export default webim;
