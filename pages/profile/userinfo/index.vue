<template>
  <view>
    <snav>
      <view class="back" @tap.stop="backClick">
        <image class="back_kmg" src="/static/pages/image/back.png"></image>
      </view>
    </snav>
    <view v-if="uid">
      <view class="header_view" :style="'padding-top:' + navHeight + 'px'">
        <image :src="profile.avatar" class="avatar"></image>
        <view class="nick">
          <text class="nick_text">{{ profile.nick_name || profile.username }}</text>
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
        <view class="item">
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
    </view>
    <view v-else>
      <view class="header_view" :style="'padding-top:' + navHeight + 'px'">
        <image :src="groupInfo.avatar" class="avatar"></image>
        <view class="nick">
          <text class="nick_text">{{ groupInfo.name }}</text>
        </view>
        <view class="id">
          <text>ID:{{ groupInfo.group_id }}</text>
        </view>
      </view>
      <view class="container">
        <view class="item">
          <view class="sleft">
            <text class="ltext">ID</text>
          </view>
          <view class="sright">
            <text class="rtext">{{ groupInfo.group_id }}</text>
          </view>
        </view>
        <view class="item">
          <view class="sleft">
            <text class="ltext">owner ID</text>
          </view>
          <view class="sright">
            <text class="rtext">{{ groupInfo.owner_id }}</text>
          </view>
        </view>
        <view class="item">
          <view class="sleft">
            <text class="ltext">群名称</text>
          </view>
          <view class="sright">
            <text class="rtext">{{ groupInfo.name }}</text>
          </view>
        </view>
        <view class="item">
          <view class="sleft">
            <text class="ltext">群描述</text>
          </view>
          <view class="sright">
            <text class="rtext">{{ groupInfo.description }}</text>
          </view>
        </view>
      </view>
    </view>
    <view class="buttonFrame" @tap="goChat">
      <button class="button_item">开始聊天</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      profile: {},
      groupInfo: {},
      navHeight: 0,
      uid: 0,
      gid: 0
    };
  },

  components: {},
  props: {},
  onLoad: function (p) {
    if (p.uid) {
      this.setData({
        uid: p.uid,
        navHeight: getApp().getNavHeight()
      });
      this.getUserInfo();
    } else {
      this.setData({
        gid: p.gid,
        navHeight: getApp().getNavHeight()
      });
      this.getGroupInfo();
    }
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
            avatar: res.avatar,
            sdefault: '/static/pages/image/r_b.png'
          });
          this.setData({
            profile: res
          });
        })
        .catch((ex) => {
          uni.showToast({
            title: '联系人信息获取失败'
          });
        });
    },

    getGroupInfo() {
      const im = getApp().getIM();
      im.groupManage
        .asyncGetInfo({
          group_id: this.gid
        })
        .then((res) => {
          res.avatar = im.sysManage.getImage({
            avatar: res.avatar,
            sdefault: '/static/pages/image/cgroup.png'
          });
          this.setData({
            groupInfo: res
          });
          console.log(res);
        })
        .catch((ex) => {
          uni.showToast({
            title: '群信息获取失败'
          });
        });
    },

    backClick() {
      wx.navigateBack();
    },

    goChat() {
      if (this.uid) {
        uni.navigateTo({
          url: '/pages_chat/roster/index?uid=' + this.uid
        });
      } else {
        uni.navigateTo({
          url: '/pages_chat/group/index?gid=' + this.gid
        });
      }
    }
  }
};
</script>
<style>
@import './index.css';
</style>
