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
        <view class="sright" @tap="changeNickName">
          <text>{{ profile.nick_name || '点击设置' }}</text>
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
      <view class="item">
        <view class="sleft">
          <text>好友验证</text>
        </view>
        <view class="sright_switch">
          <switch color="#3477EC" style="transform: scale(0.6)" :checked="auth_check" @change="switchRosterCheck" />
        </view>
      </view>
      <view class="item">
        <view class="sleft">
          <text>群邀请验证</text>
        </view>
        <view class="sright_switch">
          <switch color="#3477EC" style="transform: scale(0.6)" :checked="group_confirm" @change="switchGroupCheck" />
        </view>
      </view>
      <view class="buttonFrame" @tap="logout">
        <text>退出登录</text>
      </view>
      <view class="deleteFrame">
        <text style="border-bottom: 2rpx solid #9b9b9b" @tap="deleteUser">注销账号</text>
        <text @tap="deleteUser">，注销后无法恢复，请谨慎操作</text>
      </view>
      <uni-popup ref="changeNickNamePopup" :is-mask-click="false">
        <view class="popup-content">
          <text class="title">修改昵称</text>
          <view class="inputFrame">
            <input type="text" focused :value="sNickname" placeholder="请输入新昵称" @input="nickNameHandler" />
          </view>
          <view class="button_items">
            <button class="btn_item btn_cancel" @click="cancelChangeNickName">取消</button>
            <button class="btn_item btn_cancel" @click="confirmChangeNickName">确定</button>
          </view>
        </view>
      </uni-popup>
      <uni-popup ref="deletePopup" :is-mask-click="false">
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
      spass: '',
      sNickname: '',
      auth_mode: 0,
      auth_check: false,
      group_confirm: false
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
      this.fetchUserSettingInfo();
    }
  },

  onShow: function () {
    const isLogin = getApp().isIMLogin();
    this.setData({
      isLogin
    });
    if (isLogin && !this.profile.user_id) {
      this.fetchUserInfo();
      this.fetchUserSettingInfo();
    }
  },

  methods: {
    backClick() {
      uni.navigateBack();
    },

    fetchUserInfo() {
      const im = getApp().getIM();
      if (!im) return;
      im.userManage.asyncGetProfile(true).then((profile) => {
        this.setData({
          profile
        });
      });
    },

    fetchUserSettingInfo() {
      const im = getApp().getIM();
      if (!im) return;
      im.userManage.asyncGetSettings().then((res) => {
        this.setData({
          auth_mode: res.auth_mode,
          auth_check: res.auth_mode === 1 ? true : false,
          group_confirm: res.group_confirm
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

    changeNickName() {
      if (this.profile.nick_name && this.profile.nick_name.length) {
        this.setData({
          sNickname: this.profile.nick_name
        });
      }
      this.$refs.changeNickNamePopup.open('center');
    },

    nickNameHandler(e) {
      this.setData({
        sNickname: e.detail.value
      });
    },

    cancelChangeNickName() {
      this.$refs.changeNickNamePopup.close();
      this.setData({
        sNickname: ''
      });
    },

    confirmChangeNickName() {
      this.$refs.changeNickNamePopup.close();
      const im = getApp().getIM();
      let that = this;

      if (!im) return;

      if (this.sNickname === this.profile.nick_name) {
        uni.showToast({ title: '新昵称与原昵称相同！' });
      } else {
        im.userManage
          .asyncUpdateNickName({ nick_name: this.sNickname })
          .then(() => {
            that.fetchUserInfo();
          })
          .catch((err) => {
            console.log(err);
            uni.showToast({ title: '更新昵称失败！' });
          });
        this.setData({
          sNickname: ''
        });
      }
    },

    switchRosterCheck() {
      if (this.isLogin) {
        let that = this;
        const im = getApp().getIM();
        if (!im) return;

        const auth_mode = this.auth_mode === 1 ? 0 : 1;
        im.userManage
          .asyncUpdateSettings({ auth_mode, user_id: this.profile.user_id })
          .then(() => {
            that.setData({
              auth_mode: auth_mode,
              auth_check: auth_mode === 1 ? true : false
            });
          })
          .catch((err) => {
            console.log(err);
            uni.showToast({ title: '更新好友验证失败！' });
          });
      }
    },

    switchGroupCheck() {
      if (this.isLogin) {
        let that = this;
        const im = getApp().getIM();
        if (!im) return;

        const group_confirm = !this.group_confirm;
        im.userManage
          .asyncUpdateSettings({ group_confirm, user_id: this.profile.user_id })
          .then(() => {
            that.setData({
              group_confirm: group_confirm
            });
          })
          .catch((err) => {
            console.log(err);
            uni.showToast({ title: '更新群邀请验证失败！' });
          });
      }
    },

    deleteUser() {
      if (this.isLogin) {
        this.$refs.deletePopup.open('center');
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
      this.$refs.deletePopup.close();
      this.setData({
        spass: ''
      });
    },

    confirmLogout() {
      this.$refs.deletePopup.close();
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
