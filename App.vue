<script>
import flooim from './sdk/index';

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
    isWeChat: false
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
        this.imLogin();
        return;
      }
      if (times < INIT_CHECK_TIMES_MAX) {
        setTimeout(() => this.waitForFlooReadyAndLogin(times + 1), 1000);
      } else {
        console.error('flooim 初始化失败，请重新初始化');
      }
    },

    imLogin() {
      const im = this.getIM();
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

      wx.switchTab({
        url: '/pages/contact/index'
      });
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
