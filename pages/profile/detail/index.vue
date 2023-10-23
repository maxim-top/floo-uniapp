<template>
  <view>
    <snav title="账号管理">
      <view class="back" @tap.stop="backClick">
        <image class="back_kmg" src="/static/pages/image/back.png"></image>
      </view>
    </snav>
    <view class="container" :style="'padding-top:' + navHeight + 'px'">
      <view class="item">
        <view class="sleft">
          <text>ID</text>
        </view>
        <view class="sright">
          <text>{{ profile.user_id }}</text>
        </view>
      </view>
      <view class="item">
        <view class="sleft">
          <text>用户名</text>
        </view>
        <view class="sright">
          <text>{{ profile.username }}</text>
        </view>
      </view>
      <view class="item">
        <view class="sleft">
          <text>昵称</text>
        </view>
        <view class="sright">
          <text>{{ profile.nick_name }}</text>
        </view>
      </view>
      <view class="item">
        <view class="sleft">
          <text>手机号</text>
        </view>
        <view class="sright">
          <text>{{ profile.mobile }}</text>
        </view>
      </view>
      <view class="item">
        <view class="sleft">
          <text>邮箱</text>
        </view>
        <view class="sright">
          <text>{{ profile.email }}</text>
        </view>
      </view>
      <view class="buttonFrame" @tap="logout">
        <text>退出登录</text>
      </view>
      <view class="deleteFrame">
        <text style="border-bottom: 2rpx solid #9b9b9b" @tap="deleteUser">注销账号</text>
        <text @tap="deleteUser">，注销后无法恢复，请谨慎操作</text>
      </view>
      <uni-popup ref="popup" :is-mask-click="false">
        <view class="popup-content">
          <text class="title">注销账号</text>
          <view class="inputFrame">
            <input type="text" password focused :value="spass" placeholder="请输入密码" @input="passHandler" />
          </view>
          <view class="button_items">
            <button class="btn_item btn_cancel" @click="cancelLogout">取消</button>
            <button class="btn_item btn_confirm" @click="confirmLogout">确定</button>
          </view>
        </view>
      </uni-popup>
    </view>
  </view>
</template>

<script>
import { readDoubleBE } from 'protobufjs/src/float';

export default {
  data() {
    return {
      profile: {},
      navHeight: 0,
      isLogin: false,
      spass: ''
    };
  },

  components: {},
  props: {},

  onLoad: function () {
    const isLogin = getApp().isIMLogin();
    this.setData({
      navHeight: getApp().getNavHeight() + 30,
      isLogin,
      isWechat: getApp().isWeChatEnvironment()
    });

    if (this.isLogin) {
      this.fetchUserInfo();
    }
  },

  onShow: function () {
    const isLogin = getApp().isIMLogin();
    this.setData({
      isLogin
    });
    if (isLogin && !this.profile.user_id) {
      this.fetchUserInfo();
    }
  },

  methods: {
    backClick() {
      uni.navigateBack();
    },

    fetchUserInfo() {
      const im = getApp().getIM();
      const token = im.userManage.getToken();
      const app_id = im.userManage.getAppid();
      im.userManage.asyncGetProfile(true).then((profile) => {
        this.setData({
          profile
        });
      });
    },

    logout() {
      if (this.isLogin) {
        uni.showModal({
          title: '提示',
          content: '确定要退出登录吗？',
          success: function (res) {
            if (res.confirm) {
              getApp().imLogout();
            } else if (res.cancel) {
              // do nothing.
            }
          }
        });
      } else {
        uni.navigateTo({
          url: '../account/loginreminder/index'
        });
      }
    },

    deleteUser() {
      if (this.isLogin) {
        this.$refs.popup.open('center');
      } else {
        uni.navigateTo({
          url: '../account/loginreminder/index'
        });
      }
    },

    passHandler(e) {
      this.setData({
        spass: e.detail.value
      });
    },

    cancelLogout() {
      this.$refs.popup.close();
      this.setData({
        spass: ''
      });
    },

    confirmLogout() {
      this.$refs.popup.close();
      const im = getApp().getIM();
      im.userManage
        .asyncDeleteUser({
          password: this.spass
        })
        .then(() => {
          getApp().imLogout();
        })
        .catch((err) => {
          console.log(err);
          uni.showToast({ title: '账号删除失败！' });
        });
      this.setData({
        spass: ''
      });
    }
  }
};
</script>

<style>
@import './index.css';
</style>
