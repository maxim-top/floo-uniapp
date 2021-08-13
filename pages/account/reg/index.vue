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
        <text>注册</text>
      </view>
      <view class="inputFrame">
        <input :value="sname" type="text" placeholder="用户名 (字母开头，字母数字下划线组合)" @input="nameHandler" />
      </view>
      <view class="inputFrame">
        <input type="text" :value="spass" password placeholder="输入登录密码" @input="passHandler" />
      </view>
      <view class="buttonFrame" @tap="reg">
        <text class="login_btn" type="primary">继续</text>
      </view>
      <view class="colorb tc fs28 mt30">
        <text class="mr20" @tap="goCodeLogin">已有账号，去登录</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      openId: '',
      sname: '',
      spass: '',
      appid: '',
      /////
      ratelOk: false,
      authCode: '',
      navHeight: 0,
      from: ''
    };
  },

  components: {},
  props: {},
  onLoad: function (options) {
    this.setData({
      from: options.from
    });
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
    reg() {
      if (!this.sname || !this.spass) {
        wx.showToast({
          title: '请输入信息!'
        });
        return;
      } else {
        wx.showLoading({
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
            wx.showLoading({
              title: '登录中'
            });
            im.login({
              // error message on base/index.js .. needs modify here ..
              name: this.sname,
              password: this.spass
            });
          })
          .catch((ex) => {
            wx.hideLoading();
            wx.showToast({
              title: '注册失败'
            });
          });
      }
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

    onLogin() {
      getApp().saveLoginInfo({
        username: this.sname,
        passowrd: this.spass
      });
      wx.hideLoading();
      wx.redirectTo({
        url: '../regbind/index'
      });
    },

    backClick() {
      if (this.from == 'home') {
        wx.redirectTo({
          url: '../login/index'
        });
      } else if (this.from == 'loginpass') {
        wx.redirectTo({
          url: '../loginpass/index'
        });
      } else if (this.from == 'logincode') {
        wx.redirectTo({
          url: '../logincode/index'
        });
      }
    },

    onLoginFailure(msg) {
      wx.hideLoading();
      wx.showToast({
        title: '登录出错'
      });
    },

    goCodeLogin() {
      wx.redirectTo({
        url: '../loginpass/index?from=reg'
      });
    }
  }
};
</script>
<style>
@import './index.css';
</style>
