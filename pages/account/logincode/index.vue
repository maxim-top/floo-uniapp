<template>
  <view>
    <!-- index.wxml -->
    <snav>
      <view class="back" @tap.stop="backClick">
        <image class="back_kmg" src="/static/pages/image/back.png"></image>
      </view>
    </snav>
    <prompt ref="appidPrompt" title="修改APPID" btn_certain="确定" @confirm="confirm"></prompt>
    <view class="container" :style="'padding-top:' + navHeight + 'px'">
      <view @tap="appidTapHandler">
        <text class="appid_text">APPID：{{ appid }}</text>
        <image class="edit_logo" src="/static/pages/image/edit.png"></image>
      </view>
      <view class="fs48 mt100">
        <text>验证码登录</text>
      </view>
      <view class="inputFrame">
        <input :value="mobile" type="text" placeholder="手机号" @input="mobileHandler" />
      </view>
      <view class="inputFrame">
        <input type="text" style="width: 40%; float: left" :value="code" placeholder="输入验证码" @input="codeHandler" />
        <text class="getCode colorb" style="float: right" @tap="getCode">{{ codeText }}</text>
      </view>
      <view class="buttonFrame" @tap="sbind">
        <text class="login_btn" type="primary">继续</text>
      </view>
      <view class="colorb tc fs28 mt30">
        <text class="mr20" @tap="backClick">密码登录</text>
        <text class="mr20">|</text>
        <text @tap="goreg">注册</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      mobile: '',
      code: '',
      navHeight: 0,
      codeText: '获取验证码',
      timerValue: 0,
      openId: '',
      appid: '',
      ratelOk: false,
      authCode: ''
    };
  },

  components: {},
  props: {},
  onLoad: function () {
    const appid = getApp().getAppid();
    this.setData({
      appid,
      navHeight: getApp().navH
    });
    getApp().addIMListeners();
  },

  onUnload() {
    getApp().removeIMListeners();
  },

  methods: {
    sbind() {
      // 点击继续的按钮
      if (!/^((13[0-9])|(14[0-9])|(15[^4,\D])|(166)|(17[0-9])|(18[0-9]))\d{8}$/.test(this.mobile)) {
        wx.showToast({
          title: '请输入正确的手机号'
        });
        return;
      }

      if (!this.code) {
        wx.showToast({
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
          captcha: this.code,
          mobile: this.mobile
        })
        .then((res) => {
          if (res.sign) {
            wx.redirectTo({
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
          wx.showToast({
            title: '验证码登录失败'
          });
        });
    },

    appidTapHandler() {
      this.$refs.appidPrompt.show(getApp().getAppid());
    },

    confirm(p) {
      const { value } = p.detail;
      this.setData({
        ratelOk: false,
        authCode: '',
        appid: value
      });
      getApp().setupIM(value);
      getApp().addIMListeners();
    },

    mobileHandler(evt) {
      const mobile = evt.detail.value;
      this.setData({
        mobile
      });
    },

    codeHandler(evt) {
      const code = evt.detail.value;
      this.setData({
        code
      });
    },

    goContact() {
      wx.switchTab({
        url: '/pages/contact/index'
      });
    },

    getCode() {
      if (this.timerValue > 0) {
        return;
      }

      if (!/^((13[0-9])|(14[0-9])|(15[^4,\D])|(166)|(17[0-9])|(18[0-9]))\d{8}$/.test(this.mobile)) {
        wx.showToast({
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
          mobile: this.mobile
        })
        .then(() => {
          // wx.hideLoading();
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
      } // const codeText = '（' + timerValue + '）秒'

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

    goreg() {
      wx.redirectTo({
        url: '../reg/index?from=logincode'
      });
    },

    backClick() {
      wx.redirectTo({
        url: '../loginpass/index'
      });
    }
  }
};
</script>
<style>
@import './index.css';
</style>
