<template>
  <view>
    <snav>
      <text class="atitle">蓝莺IM</text>
    </snav>
    <view class="container" :style="'padding-top:' + navHeight + 'px'">
      <view class="background" v-if="!isLogin || (isLogin && conversationList.length === 0)">
        <image class="background_kmg" src="/static/pages/image/background.png"></image>
        <view v-if="!isLogin">
          <text>你还没有登录，请先在设置页面进行登录操作</text>
        </view>
        <view v-if="isLogin && conversationList.length === 0">
          <text>你没有聊天会话，可以在联系人页面下操作添加好友或创建群组</text>
        </view>
      </view>
      <view v-for="conversation in conversationList" :key="conversation.sid" @tap="touchConversation" :data-type="conversation.type" :data-sid="conversation.sid" class="item">
        <view v-if="conversation.unread != 0" class="unread_number">
          <text>{{ conversation.unread }}</text>
        </view>

        <view v-if="conversation.sid == 0">
          <image :src="system_avatar.avatar" class="avatar"></image>
          <view class="name">
            <text>{{ system_avatar.name }}</text>
          </view>
        </view>
        <view v-else>
          <image :src="conversation.avatar" class="avatar"></image>
          <view class="name">
            <text>{{ conversation.name }}</text>
          </view>
        </view>
        <view class="last_msg">
          <text v-if="conversation.hasAt" class="at_tips">[有人@我]</text>
          <text>{{ conversation.content }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      conversationList: [],
      navHeight: 0,
      isLogin: false,
      isWeChat: false,
      system_avatar: {
        name: '系统通知',
        avatar: '/static/pages/image/tab/setting.png'
      }
    };
  },

  components: {},
  props: {},
  onShow: function () {
    const isLogin = getApp().isIMLogin();

    this.setData({
      isLogin
    });

    if (!isLogin) {
      this.setData({
        conversationList: []
      });
      if (getApp().isLoginPage === false) {
        getApp().isLoginPage = true;
        uni.reLaunch({
          url: this.isWeChat ? '../profile/index' : '../login/index'
        });
      }
    } else {
      this.getConversationList();
    }
  },
  onLoad: function () {
    this.setData({
      navHeight: getApp().getNavHeight(),
      isWeChat: getApp().isWeChatEnvironment()
    });

    if (this.isWeChat) {
      uni.showShareMenu({
        withShareTicket: false,
        menus: ['shareAppMessage', 'shareTimeline']
      });
    }

    const im = getApp().getIM();
    if (im) {
      im.on('onUnreadChange', (xid) => {
        // xid is either roster_id or group_id
        console.log('Got notice: onUnreadChange ', xid);

        // refresh unread
        this.getConversationList();
      });
      im.on('onRosterMessage', (message) => {
        this.getConversationList();
      });
      im.on('onGroupMessage', (message) => {
        this.getConversationList();
      });
      im.on('onRosterListUpdate', (message) => {
        this.getConversationList();
      });

      im.on('onDisconnect', () => {
        // im.userManage.deleteToken();
        // if (getApp().isLoginPage === false) {
        //   getApp().isLoginPage = true;
        //   wx.reLaunch({
        //     url: '../login/index',
        //   })
        // }
      });
    }
  },
  methods: {
    touchConversation(e) {
      var id = e.currentTarget.dataset.sid;
      const type = e.currentTarget.dataset.type;

      if (type === 'roster') {
        wx.navigateTo({
          url: '../../pages_chat/roster/index?uid=' + id
        });
      } else {
        const im = getApp().getIM();
        if (!im) return;
        im.groupManage.consumeGroupAtStatus(id);

        wx.navigateTo({
          url: '../../pages_chat/group/index?gid=' + id
        });
      }
    },

    getConversationList() {
      const im = getApp().getIM();
      const uid = im.userManage.getUid();
      let convList = im.userManage.getConversationList();
      convList = convList.filter((x) => x.id !== uid);
      const allGroupMap = im.groupManage.getAllGroupDetail();
      const allRosterMap = im.rosterManage.getAllRosterDetail() || {};
      const convListWithCount = convList.map((item, index) => {
        let name;
        const id = item.id;
        const content = item.content;
        const timestamp = item.timestamp;
        const hasAt = item.hasAt;
        let avatar = '';
        const unreadCount = item.type == 'roster' ? im.rosterManage.getUnreadCount(id) : im.groupManage.getUnreadCount(id);
        const unread = unreadCount > 0 ? unreadCount : 0;

        if (item.type === 'roster') {
          //roster
          const sroster = allRosterMap[id] || { user_id: id };
          name = sroster.nick_name || sroster.username || sroster.user_id;
          avatar = im.sysManage.getImage({
            avatar: sroster.avatar,
            sdefault: '/static/pages/image/r_b.png'
          });
        } else if (item.type === 'group') {
          //group
          const sgroup = allGroupMap[id] || {};
          name = sgroup.name || id;
          avatar = im.sysManage.getImage({
            avatar: sgroup.avatar,
            type: 'group',
            sdefault: '/static/pages/image/g.png'
          });
        }

        return {
          type: item.type,
          index,
          name,
          content,
          timestamp,
          avatar,
          unread,
          hasAt,
          sid: id
        };
      });

      const sortedConvList = convListWithCount.sort((a, b) => {
        return a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0;
      });
      this.setData({
        conversationList: [].concat(sortedConvList)
      });
    }
  }
};
</script>
<style>
@import './index.css';
</style>
