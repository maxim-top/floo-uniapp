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
        <text>密码登录</text>
      </view>
      <view class="inputFrame">
        <input :value="sname" type="text" placeholder="用户名/手机号" @input="nameHandler" />
      </view>
      <view class="inputFrame">
        <input type="text" :value="spass" password placeholder="输入登录密码" @input="passHandler" />
      </view>
      <view class="buttonFrame" @tap="bindHandler">
        <text class="login_btn" type="primary">登录</text>
      </view>
      <view class="colorb tc fs28 mt30">
        <text class="mr20" @tap="goCodeLogin">验证码登录</text>
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
      sname: '',
      spass: '',
      appid: '',
      /////
      ratelOk: false,
      authCode: '',
      navHeight: 0
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
    bindHandler() {
      // 点击登录
      if (!this.sname || !this.spass) {
        wx.showToast({
          title: '请输入信息!'
        });
        return;
      } else {
        wx.showLoading({
          title: '登录中'
        });
        getApp().saveLoginInfo({
          username: this.sname,
          password: this.spass
        });
        getApp().ensureIMLogin();
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

    goContact() {
      console.log('In Login success');
      wx.switchTab({
        url: '/pages/contact/index'
      });
    },

    goCodeLogin() {
      wx.redirectTo({
        url: '../logincode/index'
      });
    },

    goreg() {
      wx.redirectTo({
        url: '../reg/index?from=loginpass'
      });
    },

    backClick() {
      wx.redirectTo({
        url: '../login/index'
      });
    }
  }
};
</script>
<style>
@import './index.css';
</style>
