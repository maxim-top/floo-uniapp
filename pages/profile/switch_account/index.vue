<template>
  <view>
    <snav title="切换账号">
      <view class="back" @tap.stop="backClick">
        <image class="back_kmg" src="/static/pages/image/back.png"></image>
      </view>
    </snav>
    <view class="container" :style="'padding-top:' + navHeight + 'px'">
      <view class="account_list">
        <view v-for="(item, index) in accountList" :key="item.user_id" :data-idx="index" class="item" @tap="selectAccount">
          <text class="info uname">{{ item.username + ' (AppID:' + item.app_id + ')' }}</text>
          <text class="info uid">{{ item.user_id }}</text>
          <image src="/static/pages/image/check.png" v-if="item.flag" class="check"></image>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      navHeight: 0,
      accountList: []
    };
  },

  components: {},
  props: {},
  onLoad: function () {
    this.setData({
      navHeight: getApp().getNavHeight()
    });
    this.getAccountList();
  },
  methods: {
    backClick() {
      uni.navigateBack();
    },

    getAccountList() {
      const im = getApp().getIM();
      if (!im) return;

      let list = getApp().getLoginInfoList();
      list.forEach((item) => {
        if (item.user_id == im.userManage.getUid()) {
          item.flag = true;
        } else {
          item.flag = false;
        }
      });
      this.setData({
        accountList: list
      });
    },

    selectAccount(e) {
      let idx = e.currentTarget.dataset.idx;
      let info = this.accountList[idx];
      if (!info.flag) {
        getApp().switchLogin(info);
      }
    }
  }
};
</script>

<style>
@import './index.css';
</style>
