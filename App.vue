<script>
import flooim from './sdk/index';
import { toNumber } from './third/tools';

const AUTO_LOGIN_DELAY = 2000; // ms
const AUTO_LOGIN_TIMES_MAX = 3;
let autoLoginTimes = 0;
const INIT_CHECK_TIMES_MAX = 20;

export default {
  onLaunch: function () {
    const host = uni.getSystemInfoSync().host;
    if (host && host.env && host.env === 'WeChat') {
      this.globalData.isWeChat = true;
      uni.showShareMenu();
    }
  },

  onLoad() {
    if (!this.globalData.initWindowParams) {
      this.setNavPosition();
    }
  },

  onShow() {
    if (!this.globalData.initWindowParams) {
      this.setNavPosition();
    }
    let options = uni.getEnterOptionsSync();
    if (options && options.query && options.query.link) {
      if (this.globalData.intent.oldLink != options.query.link) {
        this.globalData.intent.link = options.query.link;
        this.globalData.intent.hasParseLink = false;
      }

      if (options.query.code && this.globalData.intent.oldCode != options.query.code) {
        this.globalData.intent.code = options.query.code;
        this.globalData.intent.hasParseCode = false;
      }
    }
    this.ensureIMLogin();
  },

  onUnload() {
    this.removeIMListeners();
  },

  onHide() {
    // if (this.getIM().disConnect) {
    //   console.log('disconnect onHide ....');
    //   this.getIM().disConnect();
    // }
  },

  globalData: {
    im: {},
    initWindowParams: false,
    navTop: 45,
    navHeight: 85,
    menuButtonWidth: 0,
    // dnsServer: "https://dns.lanyingim.com/v2/app_dns",
    ws: true,
    autoLogin: true,
    intent: {
      hasParseLink: false,
      hasParseCode: false,
      link: null,
      code: null,
      oldLink: null,
      oldCode: null
    },
    isWeChat: false,
    callMap: new Map(),
    callInfo: {
      callId: '',
      callInviteInfo: null,
      pickupTime: 0,
      caller: false
    }
  },

  methods: {
    ensureIMLogin() {
      const im = this.getIM();
      if (!(im && im.isReady)) {
        this.initFlooIM();
      }
      this.waitForFlooReadyAndLogin(0);
    },

    waitForFlooReadyAndLogin(times) {
      const im = this.getIM();
      //通常来讲，初始化过程会非常快，但由于涉及网络调用，这个时间并无法保证；如果你的业务非常依赖初始化成功，请等待；
      if (im && im.isReady && im.isReady()) {
        console.log('flooim 初始化成功 ', times);
        if (this.globalData.intent.link && !this.globalData.intent.hasParseLink) {
          this.parseLink();
        } else {
          if (this.globalData.intent.code && !this.globalData.intent.hasParseCode) {
            this.codeLogin();
          } else {
            this.imLogin();
          }
        }
        return;
      }
      if (times < INIT_CHECK_TIMES_MAX) {
        setTimeout(() => this.waitForFlooReadyAndLogin(times + 1), 1000);
      } else {
        console.error('flooim 初始化失败，请重新初始化');
      }
    },

    parseLink() {
      const im = this.getIM();
      if (!im) return;

      const linkServer = im.sysManage.getLinkServer();
      let that = this;
      im.sysManage
        .aysncParseLink(linkServer, {
          link: this.globalData.intent.link
        })
        .then((res) => {
          that.globalData.intent.add_id = res.app_id;
          that.globalData.intent.uid = parseInt(res.uid);
          that.globalData.intent.text = res.text;
          that.globalData.intent.type = res.type;
          that.globalData.intent.parseLink = true;
          if (that.getAppid() == that.globalData.intent.add_id) {
            if (that.globalData.intent.code && !that.globalData.intent.hasParseCode) {
              that.codeLogin();
            } else {
              that.imLogin();
            }
          } else {
            that.setupIM(that.globalData.intent.add_id);
          }
        })
        .catch((err) => {
          if (err.data) {
            console.log('Link无效： ' + err.data.code + ':' + err.data.message);
          }
          uni.showToast({ title: 'Link无效 : ' + err.message });
        });
      this.globalData.intent.oldLink = this.globalData.intent.link;
    },

    codeLogin() {
      const im = this.getIM();
      if (!im) return;

      let that = this;
      im.userManage
        .asyncSendSecretInfo({
          code: this.globalData.intent.code
        })
        .then((res) => {
          const info = JSON.parse(res.secret_text);
          that.saveLoginInfo({
            username: info.username,
            password: info.password
          });
          that.imLogin();
        })
        .catch((err) => {
          if (err.data) {
            console.log('登录失败, code无效 : ' + err.data.code + ':' + err.data.message);
          }
          uni.showToast({ title: 'code无效 : ' + err.message });
        });
      this.globalData.intent.oldCode = this.globalData.intent.code;
      this.globalData.intent.hasParseCode = true;
    },

    imLogin() {
      const im = this.getIM();
      if (!im) return;

      if (!this.isIMLogin()) {
        const loginInfo = this.getLoginInfo();

        if (loginInfo && loginInfo.username) {
          im.login({
            //TODO: change name to username
            name: loginInfo.username,
            password: loginInfo.password
          });
        } else if (loginInfo && loginInfo.user_id) {
          im.idLogin({
            user_id: loginInfo.user_id,
            password: loginInfo.password
          });
        } else {
          console.log('没有用户信息不能登录');
        }
      }
    },

    initFlooIM() {
      const appid = this.getAppid();
      const dnsServer = this.globalData.dnsServer;
      const ws = this.globalData.ws;
      const autoLogin = this.globalData.autoLogin;
      const logLevel = process.env.NODE_ENV === 'production' ? 'off' : 'debug'; // debug|info|warn|error|off
      console.log('Init flooim for ', appid);
      const config = {
        autoLogin,
        dnsServer,
        appid,
        ws,
        logLevel
      };
      const im = flooim(config);
      this.globalData.im = im;
      this.addIMListeners();
    },

    getIM() {
      return this.globalData.im;
    },

    getCallInfo() {
      return this.globalData.callInfo;
    },

    setCallInfo(info) {
      this.globalData.callInfo = Object.assign(this.globalData.callInfo, info);
    },

    clearCallInfo() {
      this.globalData.callInfo = {
        callId: '',
        callInviteInfo: null,
        pickupTime: 0,
        caller: false
      };
    },

    isWeChatEnvironment() {
      return this.globalData.isWeChat;
    },

    setupIM(appid) {
      console.log('Change appid to ', appid);
      this.saveAppid(appid);
      this.saveAppidList(appid);

      const im = this.getIM();
      im && im.logout && im.logout();

      this.globalData.im = null;
      this.ensureIMLogin();
    },

    isIMLogin() {
      const im = this.getIM();
      return im && im.isLogin && im.isLogin();
    },

    saveAppid(appid) {
      wx.setStorageSync('lanying_im_appid', appid);
    },
    getAppid() {
      return wx.getStorageSync('lanying_im_appid') || 'welovemaxim';
    },

    saveAppidList(appid) {
      let appidList = this.getAppidList();
      const index = appidList.findIndex((a) => a == appid);
      if (index < 0) {
        appidList.push(appid);
      }
      wx.setStorageSync('lanying_im_appid_list', appidList);
    },

    getAppidList() {
      return wx.getStorageSync('lanying_im_appid_list') || ['welovemaxim'];
    },

    clearAppidList() {
      return wx.setStorageSync('lanying_im_appid_list', ['welovemaxim']);
    },

    saveLoginInfo(info) {
      wx.setStorageSync('lanying_im_logininfo', info);
    },

    getLoginInfo() {
      return wx.getStorageSync('lanying_im_logininfo') || {};
    },

    removeLoginInfo() {
      wx.removeStorageSync('lanying_im_logininfo');
    },

    imLogout() {
      const info = this.getLoginInfo();
      const isWeChat = this.isWeChatEnvironment();
      this.getIM().logout();
      this.clearCallInfo();
      this.removeLoginInfo();
      uni.reLaunch({
        url: isWeChat ? '/pages/profile/index' : '/pages/account/login/index'
      });
    },

    addIMListeners() {
      const im = this.getIM();
      if (!im) return;

      im.on({
        loginSuccess: this.onLoginSuccess,
        loginFail: this.onLoginFail,
        onMessageRecalled: ({ mid }) => {
          console.log('消息被撤回：' + mid);
          this.deleteMessage(mid);
        },
        onRosterRTCMessage: (message) => {
          if (!this.globalData.isWeChat) {
            this.rosterCall(message);
          }
        },
        flooNotice: (msg) => {
          const { category, desc } = msg;
          console.log('Floo Notice: ' + category + ' : ' + desc);
          switch (category) {
            case 'action':
              if ('relogin' == desc) {
                if (autoLoginTimes >= AUTO_LOGIN_TIMES_MAX) {
                  console.log('自动登录失败次数过多，请手工登录。');
                  wx.showToast({ title: '请手工登录' });
                  this.imLogout();
                  autoLoginTimes = 0;
                } else {
                  console.log('Token失效，尝试自动登录中:', autoLoginTimes);
                  setTimeout(() => {
                    this.ensureIMLogin();
                  }, autoLoginTimes * AUTO_LOGIN_DELAY);
                  autoLoginTimes++;
                }
              } else if ('relogin_manually' == desc) {
                wx.showToast({ title: '请重新登录' });
                this.imLogout();
              } else {
                console.log('Floo Notice: unknown action ', desc);
              }
              break;
            case 'userNotice':
              console.log('Floo Notice: 收到用户/设备通知 : ', desc);
            case 'loginMessage':
              console.log('IM login message: ', desc);
              break;
            default:
              console.log('Floo Notice: unknown category ' + category);
          }
        },
        flooError: (msg) => {
          const { category, desc } = msg;
          switch (category) {
            case 'USER_BANNED':
              wx.showToast({ title: '用户错误:' + desc });
              break;
            case 'DNS_FAILED':
              wx.showToast({ title: 'DNS错误: 无法访问 ' + desc });
              break;
            case 'LICENSE':
              wx.showToast({ title: '服务需要续费: ' + desc });
              break;
            default:
              console.log('Floo Error: ' + category + ' ' + desc);
          }
        }
      });
    },

    //如果你在原生App中集成Web版，尤其是Uniapp这样的场景，你才可能需要绑定 DeviceToken 以利用厂商推送通道。
    //其中 notifier_name 为证书名称，也即在蓝莺IM控制台内上传证书时候设置的名称。
    bindDeviceToken(device_token, notifier_name) {
      const imUser = this.getIM().userManage;
      const device_sn = imUser.getDeviceSN();
      imUser
        .asyncBindDeviceToken({
          device_sn,
          device_token,
          notifier_name
        })
        .then(() => {
          wx.showToast({ title: '设备绑定成功:' + device_sn });
        })
        .catch((err) => {
          wx.showToast({ title: '设备绑定失败:' + err.code + ':' + err.errMsg });
        });
    },
    unbindDeviceToken() {
      const imUser = this.getIM().userManage;
      const device_sn = imUser.getDeviceSN();
      imUser
        .asyncUnbindDeviceToken({
          deviceSn: device_sn
        })
        .then(() => {
          wx.showToast({ title: '设备解绑成功:' + device_sn });
        })
        .catch((err) => {
          wx.showToast({ title: '设备解绑失败:' + err.code + ':' + err.errMsg });
        });
    },

    deleteMessage(mid) {
      // refresh ui
    },

    removeDelayCall(callId) {
      if (this.globalData.callMap.has(callId)) {
        clearTimeout(this.globalData.callMap.get(callId));
        this.globalData.callMap.delete(callId);
      }
    },

    rosterCall(message) {
      const im = this.getIM();
      if (!im) return;

      let that = this;
      const { config, isHistory, isNative } = message;
      const fromUid = toNumber(message.from);
      const toUid = toNumber(message.to);
      const uid = im.userManage.getUid();
      const callStatus = im.rtcManage.getInCallStatus();

      if (!isHistory && config && !isNative) {
        if (config.action && config.action === 'call' && config.initiator) {
          if (callStatus == false) {
            this.globalData.callMap.set(
              config.callId,
              setTimeout(function () {
                if (config.initiator !== uid && toUid === uid) {
                  that.globalData.callInfo.callId = config.callId;
                  that.globalData.callInfo.callInviteInfo = config;
                  that.globalData.callInfo.caller = false;
                  if (config.type == 1) {
                    uni.navigateTo({
                      url: '/pages_chat/roster/videocall/index?uid=' + config.initiator + '&caller=false'
                    });
                  } else {
                    uni.navigateTo({
                      url: '/pages_chat/roster/audiocall/index?uid=' + config.initiator + '&caller=false'
                    });
                  }
                } else {
                  // current user other device launch call，just display message and do nothing.
                }
              }, 1000)
            );
          } else {
            if (config.initiator !== uid && toUid === uid) {
              im.rtcManage.sendRTCMessage({
                uid: fromUid,
                content: 'busy',
                config: JSON.stringify({
                  action: 'hangup',
                  callId: config.callId,
                  initiator: config.initiator,
                  pushMessageLocKey: 'callee_busy'
                })
              });
            } else {
              // should nerver come here.
            }
          }
        } else if (config.action && config.action == 'pickup') {
          this.removeDelayCall(config.callId);
          if (fromUid === uid) {
            // current use other device pickup call.
            this.clearCallInfo();
          } else {
            im.rtcManage.joinRoom();
          }
        } else if (config.action && config.action == 'hangup') {
          this.removeDelayCall(config.callId);
          this.clearCallInfo();
        } else if (config.action && config.action == 'record') {
          this.removeDelayCall(config.callId);
          if (fromUid === uid) {
            // current user other device hangup call. just display message and do nothing.
          } else {
            if (callStatus) {
              im.rosterManage.readRosterMessage(fromUid, message.id);
            }
          }
        }
      }
    },

    removeIMListeners() {
      const im = this.getIM();
      if (im) {
        im.off('loginSuccess', this.onLoginSuccess);
        im.off('loginerror', this.onLoginFail);
      }
    },

    onLoginSuccess() {
      wx.hideLoading(); //FIXME: chanage tester account

      // this.bindDeviceToken( device_token, notifier_name );

      const info = this.getLoginInfo();
      const username = info ? info.username : '';

      if (this.globalData.intent.uid) {
        uni.navigateTo({
          url: '/pages_chat/roster/index?uid=' + this.globalData.intent.uid
        });
      } else {
        uni.switchTab({
          url: '/pages/contact/index'
        });
      }
    },

    onLoginFail(msg) {
      wx.hideLoading();
      wx.showToast({
        title: '登录出错:' + msg
      });
    },

    getNavTop() {
      // this.setNavPosition();
      return this.globalData.navTop;
    },

    getNavHeight() {
      // this.setNavPosition();
      return this.globalData.navHeight;
    },

    getMenuButtonWidth() {
      return this.globalData.menuButtonWidth;
    },

    setNavPosition() {
      this.globalData.initWindowParams = true;
      if (this.globalData.isWeChat) {
        let menuButtonObject = uni.getMenuButtonBoundingClientRect();
        if (!menuButtonObject) {
          this.globalData.navTop = 24;
          this.globalData.navHeight = 60;
          return;
        }
        uni.getSystemInfo({
          success: (res) => {
            let statusBarHeight = res.statusBarHeight;
            this.globalData.navTop = menuButtonObject.top - 3; //胶囊按钮与顶部的距离
            this.globalData.navHeight = menuButtonObject.bottom + (menuButtonObject.top - statusBarHeight) / 2; //导航高度
            this.globalData.menuButtonWidth = menuButtonObject.width;
          },
          fail: (err) => {
            console.log(err);
          }
        });
      } else {
        this.globalData.navTop = 24;
        this.globalData.navHeight = 60;
      }
    }
  }
};
</script>
<style>
@import './app.css';
</style>
