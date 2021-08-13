<template>
  <view>
    <snav bgColor="#4FA0FF">
      <view class="back" @tap.stop="backClick">
        <image class="back_kmg" src="/static/pages/image/back.png"></image>
      </view>
    </snav>
    <view class="header_view" :style="'padding-top:' + navHeight + 'px'">
      <image :src="profile.avatar" class="avatar"></image>
      <view class="nick">
        <text>{{ profile.nick_name || profile.username }}</text>
      </view>
      <view class="id">
        <text>ID:{{ profile.user_id }}</text>
      </view>
    </view>
    <view class="container">
      <view class="item">
        <view class="sleft">
          <text class="ltext">ID</text>
        </view>
        <view class="sright">
          <text class="rtext">{{ profile.user_id }}</text>
        </view>
      </view>
      <view class="item">
        <view class="sleft">
          <text class="ltext">用户名</text>
        </view>
        <view class="sright">
          <text class="rtext">{{ profile.username }}</text>
        </view>
      </view>
      <view class="item">
        <view class="sleft">
          <text class="ltext">昵称</text>
        </view>
        <view class="sright">
          <text class="rtext">{{ profile.nick_name }}</text>
        </view>
      </view>
      <view class="item" @tap="unbindMobile">
        <view class="sleft">
          <text class="ltext">手机号</text>
        </view>
        <view class="sright">
          <text class="rtext">{{ profile.mobile }}</text>
        </view>
      </view>
      <view class="item">
        <view class="sleft">
          <text class="ltext">邮箱</text>
        </view>
        <view class="sright">
          <text class="rtext">{{ profile.email }}</text>
        </view>
      </view>
    </view>
    <view class="bindBtn sblue mt50" @tap="goChat">
      <text>开始聊天</text>
    </view>
    <!-- <view class='bindBtn sblue' wx:if="{{!binded}}" bindtap='bindHandler'>
  <text>绑定微信</text>
</view> -->
  </view>
</template>

<script>
export default {
  data() {
    return {
      profile: {},
      navHeight: 0,
      uid: 0
    };
  },

  components: {},
  props: {},
  onLoad: function (p) {
    const { uid } = p;
    this.setData({
      uid,
      navHeight: getApp().navH
    });
    this.getUserInfo();
  },
  methods: {
    getUserInfo() {
      const im = getApp().getIM();
      im.rosterManage
        .asyncSearchRosterById({
          user_id: this.uid
        })
        .then((res) => {
          res.avatar = im.sysManage.getImage({
            avatar: res.avatar
          });
          this.setData({
            profile: res
          });
        });
    },

    backClick() {
      wx.navigateBack();
    },

    goChat() {
      wx.navigateTo({
        url: '/pages/roster/index?uid=' + this.profile.user_id
      });
    }
  }
};
</script>
<style>
@import './index.css';
</style>
