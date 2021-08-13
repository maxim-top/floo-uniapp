<template>
  <view>
    <!-- index.wxml -->
    <snav>
      <!-- <view class="back" catchtap="backClick">
    <image class='back_kmg' src="../../image/back.png"></image>
  </view> -->
    </snav>
    <view class="container" :style="'padding-top:' + navHeight + 'px'">
      <view class="fs48 mt100">
        <text>绑定手机号</text>
      </view>
      <view class="inputFrame">
        <input :value="mobile" type="text" placeholder="手机号" @input="mobileHandler" />
      </view>
      <view class="inputFrame">
        <input type="text" style="width: 40%; float: left" :value="code" password placeholder="输入登录密码" @input="codeHandler" />
        <text class="getCode colorb" style="float: right" @tap="getCode">{{ codeText }}</text>
      </view>
      <view class="buttonFrame" @tap="sbind">
        <text class="login_btn" type="primary">绑定</text>
      </view>
      <view class="colorb tc fs28 mt30">
        <text class="mr20" @tap="goContact">跳过</text>
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
      timerValue: 0
    };
  },

  components: {},
  props: {},
  onLoad: function () {
    this.setData({
      navHeight: getApp().navH
    });
  },
  methods: {
    sbind() {
      if (!this.mobile || !this.code) {
        wx.showToast({
          title: '请输入信息!'
        });
        return;
      } else {
        wx.showLoading({
          title: '绑定中'
        });
        getApp()
          .getIM()
          .userManage.asyncUserBindMobile({
            // error message on base/index.js .. needs modify here ..
            mobile: this.mobile,
            captcha: this.code
          })
          .then(() => {
            wx.hideLoading();
            this.goContact();
          })
          .catch((ex) => {
            wx.hideLoading();
            wx.showToast({
              title: '绑定失败！'
            });
          });
      }
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
        wx.showToast('手机不正确');
        return;
      }

      this.setData({
        timerValue: 60
      });
      wx.showLoading({
        title: '发送中'
      });
      getApp()
        .getIM()
        .userManage.asyncUserSendSms({
          // error message on base/index.js .. needs modify here ..
          mobile: this.mobile
        })
        .then(() => {
          wx.hideLoading();
          setTimeout(() => {
            this.stimera();
          }, 1000);
        })
        .catch((ex) => {
          wx.hideLoading();
          this.setData({
            timerValue: 0,
            codeText: '获取验证码'
          });
        });
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
    }
  }
};
</script>
<style>
@import './index.css';
</style>
