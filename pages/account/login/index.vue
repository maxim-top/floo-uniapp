<template>
  <view>
    <!-- index.wxml -->
    <snav>
      <text style="font-size: 32rpx"></text>
    </snav>
    <prompt ref="appidPrompt" title="修改APPID" btn_certain="确定" @confirm="confirm"></prompt>
    <view class="container" :style="'padding-top:' + navHeight + 'px'">
      <view @tap="appidTapHandler">
        <text class="appid_text">APPID：{{ appid }}</text>
        <image class="edit_logo" src="/static/pages/image/edit.png"></image>
      </view>
      <view class="logo">
        <image class="logo_image" src="/static/pages/image/slogo.png"></image>
      </view>
      <view class="buttonFrame" @tap="wxAuth">
        <button class="buttonFrame" open-type="getUserInfo" @getuserinfo="saveUserInfo">微信快速登录</button>
      </view>
      <view class="colorb tc fs28 mt30">
        <text class="mr20" @tap="goLogin">账号登录</text>
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
      openId: '',
      appid: '',
      navHeight: 0,
      wxinfo: {}
    };
  },

  components: {},
  props: {},
  onLoad: function () {
    const appid = getApp().getAppid();
    this.setData({
      appid
    });
    this.setData({
      navHeight: getApp().getNavHeight()
    });

    if (getApp().isIMLogin()) {
      this.goContact();
      return;
    }
  },

  methods: {
    appidTapHandler() {
      this.$refs.appidPrompt.show(getApp().getAppid());
    },

    confirm(p) {
      const { value } = p.detail;
      this.setData({
        appid: value
      });
      getApp().setupIM(value);
      getApp().addIMListeners();
    },

    saveUserInfo(e) {
      // 登录的点击....
      if (e.detail.userInfo) {
        let wxinfo = this.wxinfo;
        wxinfo.data = e.detail.encryptedData;
        wxinfo.iv = e.detail.iv;
        this.setData({
          wxinfo
        });
      } else {
        wx.showToast({
          title: '微信登录需要授权'
        });
      }
    },

    wxAuth() {
      // 获取 用户信息的。。页面加载就触发
      wx.login({
        success: (res) => {
          if (res.code) {
            let wxinfo = this.wxinfo;
            wxinfo.code = res.code;
            this.setData({
              wxinfo
            });
            this.wechatLogin();
          } else {
            wx.hideLoading();
            wx.showToast({
              title: '微信授权失败'
            });
          }
        }
      });
    },

    wechatLogin() {
      wx.showLoading({
        title: '加载中'
      });
      getApp()
        .getIM()
        .sysManage.asyncWxlogin({
          code: this.wxinfo.code,
          iv: this.wxinfo.iv,
          data: this.wxinfo.data
        })
        .then((res) => {
          wx.hideLoading();

          if (res.openid) {
            //未绑定
            this.setData({
              openId: res.openid
            });
            getApp().openId = res.openid;
            wx.showToast({
              title: '未绑定微信!',
              icon: 'none',
              duration: 2000,
              success: () => {
                wx.redirectTo({
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
          wx.hideLoading();
          wx.showToast({
            title: '微信登陆失败' //这里没有code
          });
        });
    },

    goContact() {
      console.log('In Login success');
      wx.switchTab({
        url: '/pages/contact/index'
      });
    },

    goLogin() {
      wx.redirectTo({
        url: '../loginpass/index'
      });
    },

    goreg() {
      wx.redirectTo({
        url: '../reg/index?from=home'
      });
    }
  }
};
</script>
<style>
@import './index.css';
</style>
