<template>
  <view>
    <!-- index.wxml -->
    <snav>
      <view class="back" @tap.stop="backClick">
        <image class="back_kmg" src="/static/pages/image/back.png"></image>
      </view>
    </snav>
    <view class="container" :style="'padding-top:' + navHeight + 'px'">
      <view class="title_text">
        <text>{{ title }}</text>
      </view>
      <view class="inputFrame">
        <input :value="sname" type="text" placeholder="用户名" @input="nameHandler" />
      </view>
      <view class="inputFrame">
        <input type="text" :value="spass" password placeholder="密码" @input="passHandler" />
      </view>
      <view class="buttonFrame" @tap="clickLogin">
        <button class="button_item">继续</button>
      </view>
      <view class="colorb tc fs28 mt30 switch_text">
        <view v-if="menuCurr == 0">
          <text class @tap="clickExistBind">已有账户，直接绑定</text>
        </view>
        <view v-else>
          <text class @tap="clickRegBind">暂无账户，点击创建</text>
        </view>
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
      openId: '',
      menuCurr: 0,
      title: '注册并绑定账户'
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
      navHeight: getApp().getNavHeight()
    });
    getApp().addIMListeners();

    const im = getApp().getIM();
    if (im) {
      im.on({
        loginSuccess: this.onLogin
      });
    }
  },

  onUnload() {
    getApp().removeIMListeners();
    const im = getApp().getIM();
    if (im) {
      im.off({
        loginSuccess: this.onLogin
      });
    }
  },

  methods: {
    clickLogin() {
      if (this.menuCurr == 0) {
        this.bindRegHandler();
      } else if (this.menuCurr == 1) {
        this.bindExistHandler();
      }
    },

    bindRegHandler() {
      // 继续点击
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
            username: this.sname,
            password: this.spass
          })
          .then(() => {
            uni.showLoading({
              title: '登录中'
            });
            getApp().saveLoginInfo({
              username: this.sname,
              password: this.spass
            });
            getApp().ensureIMLogin();
          })
          .catch((ex) => {
            uni.hideLoading();
            uni.showToast({
              title: '注册失败'
            });
          });
      }
    },

    bindExistHandler() {
      if (!this.sname || !this.spass) {
        uni.showToast({
          title: '请输入信息!'
        });
      } else {
        const im = getApp().getIM();
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

    clickExistBind() {
      this.setData({
        menuCurr: 1,
        title: '绑定已有账户'
      });
    },

    clickRegBind() {
      this.setData({
        menuCurr: 0,
        title: '注册并绑定账户'
      });
    },

    onLogin() {
      uni.hideLoading();

      if (this.openId) {
        this.bindWechat();
      } else {
        this.bindPhone();
      }
    },

    goContact() {
      uni.switchTab({
        url: '/pages/contact/index'
      });
    },

    backClick() {
      uni.navigateBack();
    },

    onLoginFailure(msg) {
      uni.hideLoading();
      uni.showToast({
        title: '登录出错'
      });
    },

    bindPhone() {
      uni.showLoading({
        title: '绑定手机中'
      });
      getApp()
        .getIM()
        .userManage.asyncUserMobileBindSign({
          mobile: this.mobile,
          sign: this.sign
        })
        .then(() => {
          uni.hideLoading();
          this.goContact();
        })
        .catch((ex) => {
          uni.hideLoading();
          this.goContact();
        });
    },

    bindWechat() {
      uni.showLoading({
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
          uni.hideLoading();
          this.goContact();
        })
        .catch((ex) => {
          uni.hideLoading();
          uni.showToast({
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
