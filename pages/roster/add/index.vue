<template>
  <view>
    <snav title="添加好友">
      <view class="back" @tap.stop="backClick">
        <image class="back_kmg" src="/static/pages/image/back.png"></image>
      </view>
    </snav>
    <view class="container" :style="'padding-top:' + navHeight + 'px'">
      <view class="inputFrame">
        <input type="text" :value="searchText" placeholder="输入要查找的好友用户名" @input="searchHandler" @confirm="search" />
      </view>
      <view v-if="rosterInfo.username">
        <view class="item" @tap="goChat">
          <image :src="rosterInfo.avatar" class="avatar"></image>
          <text class="uname">{{ rosterInfo.nick_name || rosterInfo.username }}</text>
        </view>
        <view class="inputFrame" v-if="rosterInfo.relation == 2 || rosterInfo.relation == 1">
          <input type="text" :value="alias" placeholder="好友别名" @input="aliasHandler" />
        </view>
        <view class="bindBtn sgray" v-if="rosterInfo.relation == 0">
          <text>已是好友</text>
        </view>
        <view class="bindBtn sblue" v-if="rosterInfo.relation == 2 || rosterInfo.relation == 1" @tap="addFriend">
          <text>添加好友</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      searchText: '',
      rosterInfo: {},
      alias: '',
      navHeight: 0
    };
  },

  components: {},
  props: {},
  onLoad: function () {
    this.setData({
      navHeight: getApp().getNavHeight()
    });
  },
  methods: {
    searchHandler(evt) {
      const searchText = evt.detail.value;
      this.setData({
        searchText
      });
    },

    aliasHandler(evt) {
      const alias = evt.detail.value;
      this.setData({
        alias
      });
    },

    search() {
      if (!this.searchText) {
        return;
      }
      const im = getApp().getIM();
      if (!im) return;

      wx.hideKeyboard();
      im.rosterManage
        .asyncSearchRosterByName({
          username: this.searchText
        })
        .then((res) => {
          res.avatar = im.sysManage.getImage({
            avatar: res.avatar,
            sdefault: '/static/pages/image/r.png'
          });
          this.setData({
            rosterInfo: res
          });
        });
    },

    backClick() {
      wx.navigateBack();
    },

    addFriend() {
      const user_id = this.rosterInfo.user_id;
      const alias = this.alias;
      getApp()
        .getIM()
        .rosterManage.asyncApply({
          user_id,
          alias
        })
        .then(() => {
          wx.showToast({
            title: '请求已发送'
          });
        });
    },

    goChat() {
      if (this.rosterInfo.relation == 0) {
        // 已是好友
        wx.navigateTo({
          url: '../index?uid=' + this.rosterInfo.user_id
        });
      }
    }
  }
};
</script>
<style>
@import './index.css';
</style>
