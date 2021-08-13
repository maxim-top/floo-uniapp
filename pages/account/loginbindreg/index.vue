<template>
  <view>
    <!-- index.wxml -->
    <snav>
      <view class="back" @tap.stop="backClick">
        <image class="back_kmg" src="/static/pages/image/back.png"></image>
      </view>
    </snav>
    <view class="container" :style="'padding-top:' + navHeight + 'px'">
      <view class="fs48 mt100">
        <text>注册并绑定账户</text>
      </view>
      <view class="inputFrame">
        <input :value="sname" type="text" placeholder="用户名" @input="nameHandler" />
      </view>
      <view class="inputFrame">
        <input type="text" :value="spass" password placeholder="密码" @input="passHandler" />
      </view>
      <view class="buttonFrame" @tap="bindHandler">
        <text class="login_btn" type="primary">继续</text>
      </view>
      <view class="colorb tc fs28 mt30">
        <text class @tap="goBind">已有账户，直接绑定</text>
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
      navHeight: 0,
      sign: '',
      mobile: '',
      openId: ''
    };
  },

  components: {},
  props: {},
  onLoad: function (p) {
    if (p.openId) {
      this.setData({
        openId: p.openId
      });
    } else if (p.sign) {
      this.setData({
        sign: p.sign,
        mobile: p.mobile
      });
    }

    this.setData({
      navHeight: getApp().navH
    });
    getApp().addIMListeners();
  },

  onUnload() {
    getApp().removeIMListeners();
  },

  methods: {
    bindHandler() {
      // 继续点击
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
            username: this.sname,
            password: this.spass
          })
          .then(() => {
            wx.showLoading({
              title: '登录中'
            });
            getApp().saveLoginInfo({
              username: this.sname,
              password: this.spass
            });
            getApp().ensureIMLogin();
          })
          .catch((ex) => {
            wx.hideLoading();
            wx.showToast({
              title: '注册失败'
            });
          });
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

    onLogin() {
      wx.hideLoading();

      if (this.openId) {
        this.bindWechat();
      } else {
        this.bindPhone();
      }
    },

    goContact() {
      wx.switchTab({
        url: '/pages/contact/index'
      });
    },

    goCodeLogin() {
      wx.redirectTo({
        url: '../logincode/index'
      });
    },

    backClick() {
      this.goCodeLogin();
    },

    goBind() {
      if (this.openId) {
        wx.redirectTo({
          url: '../loginbind/index?openId=' + this.openId
        });
      } else if (this.mobile) {
        wx.redirectTo({
          url: '../loginbind/index?mobile=' + this.mobile + '&sign=' + this.sign
        });
      }
    },

    onLoginFailure(msg) {
      wx.hideLoading();
      wx.showToast({
        title: '登录出错'
      });
    },

    bindPhone() {
      wx.showLoading({
        title: '绑定手机中'
      });
      getApp()
        .getIM()
        .userManage.asyncUserMobileBindSign({
          mobile: this.mobile,
          sign: this.sign
        })
        .then(() => {
          wx.hideLoading();
          this.goContact();
        })
        .catch((ex) => {
          wx.hideLoading();
          this.goContact();
        });
    },

    bindWechat() {
      wx.showLoading({
        title: '绑定微信中'
      });
      getApp()
        .getIM()
        .sysManage.asyncWxbind({
          // bind 账号...
          open_id: this.openId,
          type: 1
        })
        .then((res) => {
          wx.hideLoading();
          this.goContact();
        })
        .catch((ex) => {
          wx.hideLoading();
          wx.showToast({
            title: '绑定失败',
            success: () => {
              setTimeout(() => {
                this.goContact();
              }, 2000);
            }
          });
        });
    }
  }
};
</script>
<style>
@import './index.css';
</style>
