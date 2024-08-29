<template>
  <view>
    <!-- index.wxml -->
    <snav>
      <view v-if="showBack" class="back" @tap.stop="backClick">
        <image class="back_kmg" src="/static/pages/image/back.png"></image>
      </view>
      <text style="font-size: 32rpx"></text>
    </snav>
    <view class="container" :style="'padding-top:' + navHeight + 'px'">
      <view v-if="menuCurr == 1">
        <view class="logo">
          <image class="logo_image" src="/static/pages/image/slogo.png"></image>
        </view>
      </view>
      <view v-if="menuCurr == 2 || menuCurr == 3 || menuCurr == 4">
        <view class="title_text">
          <text>{{ title }}</text>
        </view>
        <view class="inputFrame">
          <input :value="sname" type="text" :placeholder="pname" @input="nameHandler" />
        </view>
      </view>
      <view v-if="menuCurr == 2 || menuCurr == 4" class="inputFrame">
        <input type="text" :value="spass" password :placeholder="ppass" @input="passHandler" />
      </view>
      <view v-if="menuCurr == 3" class="inputFrame">
        <input type="text" style="width: 40%; float: left" :value="spass" :placeholder="ppass" @input="passHandler" />
        <text class="getCode colorb" style="float: right" @tap="codeHandler">{{ codeText }}</text>
      </view>
      <view class="check_button" v-if="menuCurr == 1 || menuCurr == 2 || menuCurr == 3 || menuCurr == 4">
        <label @click="clickLabel()">
          <radio value="check" :checked="check" />
          <text>我已阅读并同意</text>
          <text class="link_text" @click.stop="clickUser()">《用户服务》</text>
          <text>及</text>
          <text class="link_text" @click.stop="clickPrivacy()">《隐私条款》</text>
        </label>
      </view>
      <view v-if="menuCurr == 1 || menuCurr == 2 || menuCurr == 3 || menuCurr == 4">
        <view class="buttonFrame" @tap="clickLogin">
          <button class="button_item" :style="!check ? 'background:rgb(225, 235, 247)' : ''">{{ btn_title }}</button>
        </view>
      </view>
      <view v-if="menuCurr == 1">
        <view class="colorb tc fs28 mt30 switch_text">
          <text class="mr20" @tap="clickLoginPass">账号登录</text>
          <text class="mr20">|</text>
          <text class="mr20" @tap="clickLoginCode">验证码登录</text>
          <text class="mr20">|</text>
          <text @tap="clickReg">注册</text>
        </view>
      </view>
      <view v-if="menuCurr == 2">
        <view class="colorb tc fs28 mt30 switch_text">
          <text class="mr20" @tap="clickWxLogin">微信快速登录</text>
          <text class="mr20">|</text>
          <text class="mr20" @tap="clickLoginCode">验证码登录</text>
          <text class="mr20">|</text>
          <text @tap="clickReg">注册</text>
        </view>
      </view>
      <view v-if="menuCurr == 3">
        <view class="colorb tc fs28 mt30 switch_text">
          <text class="mr20" @tap="clickWxLogin">微信快速登录</text>
          <text class="mr20">|</text>
          <text class="mr20" @tap="clickLoginPass">账号登录</text>
          <text class="mr20">|</text>
          <text @tap="clickReg">注册</text>
        </view>
      </view>
      <view v-if="menuCurr == 4">
        <view class="colorb tc fs28 mt30 switch_text">
          <text class="mr20" @tap="clickWxLogin">微信快速登录</text>
          <text class="mr20">|</text>
          <text class="mr20" @tap="clickLoginPass">账号登录</text>
          <text class="mr20">|</text>
          <text @tap="clickLoginCode">验证码登录</text>
        </view>
      </view>
      <view class="toolbar" v-if="menuCurr == 1 || menuCurr == 2 || menuCurr == 3 || menuCurr == 4">
        <view class="toolbar_item" @tap="clickWxlogin">
          <image src="/static/pages/image/wx.png" class="icon"></image>
        </view>
        <view class="toolbar_item" @tap="clickScan">
          <image src="/static/pages/image/scan.png" class="icon"></image>
        </view>
        <view class="toolbar_item" @tap="clickEdit">
          <image src="/static/pages/image/edit.png" class="icon"></image>
        </view>
      </view>
      <view class="btm_text">
        <text>{{ appid }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      openId: '',
      appid: '',
      navHeight: 0,
      menuCurr: 1,
      /**
       * 1.微信快速默认页面。
       * 2.账号登录页面。
       * 3.验证码登录页面。
       * 4.注册账号界面。
       */
      title: '',
      btn_title: '微信快速登录',
      wxinfo: {},
      isWeChat: false,
      showBack: false,
      check: false,
      userHref: 'https://www.lanyingim.com/terms',
      privacyHref: 'https://www.lanyingim.com/privacy',
      sname: '',
      spass: '',
      pname: '',
      ppass: '',
      codeText: '获取验证码',
      timerValue: 0
    };
  },

  components: {},
  props: {},
  onLoad: function (p) {
    const appid = getApp().getAppid();
    this.setData({
      appid,
      navHeight: getApp().getNavHeight(),
      isWeChat: getApp().isWeChatEnvironment()
    });

    if (this.isWeChat) {
      uni.showShareMenu({
        withShareTicket: false,
        menus: ['shareAppMessage', 'shareTimeline']
      });
    }

    if (p.username) {
      if (p.password) {
        this.setData({
          sname: p.username,
          spass: p.password
        });
        this.bindHandler();
      } else {
        this.setData({
          sname: p.username,
          menuCurr: 2,
          title: '密码登录',
          btn_title: '登录',
          pname: '用户名/手机号',
          ppass: '登录密码'
        });
      }
    }

    if (getApp().isIMLogin()) {
      this.goContact();
      return;
    }
    if (getCurrentPages().length > 1) {
      this.setData({
        showBack: true
      });
    }
  },

  methods: {
    clickLogin() {
      if (this.check) {
        if (this.menuCurr == 1) {
          if (this.isWeChat) {
            this.wxAuth();
          } else {
            uni.showToast({
              title: 'H5不支持微信登录'
            });
          }
        } else if (this.menuCurr == 2) {
          this.bindHandler();
        } else if (this.menuCurr == 3) {
          this.mobileBindHandler();
        } else if (this.menuCurr == 4) {
          this.regHandler();
        }
      }
    },

    wxAuth() {
      // 获取 用户信息的。。页面加载就触发
      uni.login({
        success: (res) => {
          if (res.code) {
            let wxinfo = this.wxinfo;
            wxinfo.code = res.code;
            this.setData({
              wxinfo
            });
            this.wechatLogin();
          } else {
            uni.hideLoading();
            uni.showToast({
              title: '微信授权失败'
            });
          }
        }
      });
    },

    wechatLogin() {
      uni.showLoading({
        title: '加载中'
      });
      getApp()
        .getIM()
        .sysManage.asyncWxlogin({
          code: this.wxinfo.code
        })
        .then((res) => {
          uni.hideLoading();

          if (res.openid) {
            //未绑定
            this.setData({
              openId: res.openid
            });
            getApp().openId = res.openid;
            uni.showToast({
              title: '未绑定微信!',
              icon: 'none',
              duration: 2000,
              success: () => {
                uni.navigateTo({
                  url: '../loginbindreg/index?openId=' + res.openid
                });
              }
            });
          } else {
            getApp().saveLoginInfo(res);
            getApp().ensureIMLogin();
            getApp().addIMListeners();
          }
        })
        .catch((ex) => {
          console.log('Wechat login ex: ', ex);
          uni.hideLoading();
          uni.showToast({
            title: '微信登陆失败' //这里没有code
          });
        });
    },

    bindHandler() {
      if (!this.sname || !this.spass) {
        uni.showToast({
          title: '请输入信息!'
        });
      } else {
        uni.showLoading({
          title: '登录中'
        });
        getApp().saveLoginInfo({
          username: this.sname,
          password: this.spass
        });
        getApp().ensureIMLogin();
      }
    },

    mobileBindHandler() {
      if (!/^((13[0-9])|(14[0-9])|(15[^4,\D])|(166)|(17[0-9])|(18[0-9]))\d{8}$/.test(this.sname)) {
        uni.showToast({
          title: '请输入正确的手机号'
        });
        return;
      }

      if (!this.spass) {
        uni.showToast({
          title: '请输入验证码'
        });
        return;
      }

      /**
       *  先获取是否有账号密码，有的话直接登录进来。
       *  没有则跳转到 注册并绑定
       */
      getApp()
        .getIM()
        .userManage.asyncUserMobileLogin({
          captcha: this.spass,
          mobile: this.sname
        })
        .then((res) => {
          if (res.sign) {
            uni.navigateTo({
              url: '../loginbindreg/index?sign=' + res.sign + '&mobile=' + this.mobile
            });
          } else {
            getApp().saveLoginInfo({
              username: res.username,
              password: res.password
            });
            getApp().ensureIMLogin();
          }
        })
        .catch((ex) => {
          uni.showToast({
            title: '验证码登录失败'
          });
        });
    },

    regHandler() {
      if (!this.sname || !this.spass) {
        uni.showToast({
          title: '请输入信息!'
        });
      } else {
        uni.showLoading({
          title: '注册中'
        });
        const im = getApp().getIM();
        im.userManage
          .asyncRegister({
            // error message on base/index.js .. needs modify here ..
            username: this.sname,
            password: this.spass
          })
          .then(() => {
            uni.showLoading({
              title: '登录中'
            });
            im.login({
              // error message on base/index.js .. needs modify here ..
              name: this.sname,
              password: this.spass
            });
          })
          .catch((ex) => {
            uni.hideLoading();
            uni.showToast({
              title: '注册失败'
            });
          });
      }
    },

    goContact() {
      uni.switchTab({
        url: '/pages/contact/index'
      });
    },

    clickWxLogin() {
      this.setData({
        menuCurr: 1,
        btn_title: '微信快速登录'
      });
    },

    clickLoginPass() {
      this.setData({
        menuCurr: 2,
        title: '密码登录',
        btn_title: '登录',
        pname: '用户名/手机号',
        ppass: '登录密码'
      });
    },

    clickLoginCode() {
      this.setData({
        menuCurr: 3,
        title: '验证码登录',
        btn_title: '继续',
        pname: '手机号',
        ppass: '验证码'
      });
    },

    clickReg() {
      this.setData({
        menuCurr: 4,
        title: '注册',
        btn_title: '继续',
        pname: '用户名',
        ppass: '密码'
      });
    },

    backClick() {
      uni.navigateBack();
    },

    clickLabel() {
      let check = !this.check;
      this.setData({
        check
      });
    },

    clickUser() {
      if (this.isWeChat) {
        uni.navigateTo({
          url: '../../components/ulink/index?url=' + this.userHref
        });
      } else {
        window.open(this.userHref);
      }
    },

    clickPrivacy() {
      if (this.isWeChat) {
        uni.navigateTo({
          url: '../../components/ulink/index?url=' + this.privacyHref
        });
      } else {
        window.open(this.privacyHref);
      }
    },

    nameHandler(evt) {
      const sname = evt.detail.value;
      this.setData({
        sname
      });
    },

    passHandler(evt) {
      const spass = evt.detail.value;
      this.setData({
        spass
      });
    },

    codeHandler() {
      if (this.timerValue > 0) {
        return;
      }

      if (!/^((13[0-9])|(14[0-9])|(15[^4,\D])|(166)|(17[0-9])|(18[0-9]))\d{8}$/.test(this.sname)) {
        console.log('请输入正确的手机号 请输入正确的手机号 请输入正确的手机号 + this.');
        uni.showToast({
          title: '请输入正确的手机号'
        });
        return;
      }

      this.setData({
        timerValue: 60
      });

      getApp()
        .getIM()
        .userManage.asyncUserSendSms({
          // error message on base/index.js .. needs modify here ..
          mobile: this.sname
        })
        .then(() => {
          // uni.hideLoading();
          // this.goContact();
        });
      setTimeout(() => {
        this.stimera();
      }, 1000);
    },

    stimera() {
      const timerValue = this.timerValue - 1;
      let codeText = '（' + timerValue + '）秒';

      if (timerValue == 0) {
        codeText = '获取验证码';
      }

      this.setData({
        timerValue,
        codeText
      });

      if (timerValue > 0) {
        setTimeout(() => {
          this.stimera();
        }, 1000);
      }
    },

    clickWxlogin() {
      if (this.isWeChat) {
        if (this.check) {
          this.wxAuth();
        } else {
          uni.showToast({
            title: '请先同意服务条款'
          });
        }
      } else {
        uni.showToast({
          title: 'H5不支持微信登录'
        });
      }
    },

    clickScan() {
      let that = this;
      if (this.isWeChat) {
        uni.scanCode({
          scanType: ['qrCode'],
          success: function (res) {
            let config = JSON.parse(res.result);
            if (config && config.action && config.info) {
              if (config.action == 'app' || config.action == 'login') {
                let appid = config.info.app_id;
                if (appid) {
                  that.setData({
                    appid
                  });
                  getApp().setupIM(appid);
                  getApp().addIMListeners();
                  let username = config.info.username;
                  let password = config.info.password;
                  if (username) {
                    that.setData({
                      sname: username,
                      menuCurr: 2,
                      title: '密码登录',
                      btn_title: '登录',
                      pname: '用户名/手机号',
                      ppass: '登录密码'
                    });
                    if (password) {
                      that.setData({
                        spass: password
                      });
                      that.bindHandler();
                    }
                  }
                }
              }
            }
          }
        });
      } else {
        uni.showToast({
          title: 'H5不支持扫码'
        });
      }
    },

    clickEdit() {
      uni.navigateTo({
        url: '../edit/index'
      });
    }
  }
};
</script>
<style>
@import './index.css';
</style>
