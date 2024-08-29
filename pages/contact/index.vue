<template>
  <view>
    <snav>
      <view class="aheader">
        <view data-num="0" :class="'tag ' + (menuCurr == 0 ? 'sel' : '')" @tap.stop="menuClick">
          <text>好友</text>
        </view>
        <view data-num="1" :class="'tag ' + (menuCurr == 1 ? 'sel' : '')" @tap.stop="menuClick">
          <text>群组</text>
        </view>
        <view data-num="2" :class="'tag ' + (menuCurr == 2 ? 'sel' : '')" @tap.stop="menuClick">
          <text>客服</text>
        </view>
      </view>
    </snav>
    <view class="container" :style="'padding-top:' + navHeight + 'px'">
      <view v-if="menuCurr == 0">
        <view class="item" @tap="addRoster">
          <image src="/static/pages/image/add.png" class="avatar"></image>
          <text class="uname">添加好友</text>
        </view>
        <view class="background" v-if="!isLogin || (isLogin && rosterList.length === 0)">
          <image class="background_kmg" src="/static/pages/image/background.png"></image>
          <view v-if="!isLogin">
            <text>你还没有登录，请先在设置页面进行登录操作</text>
          </view>
          <view v-if="isLogin && rosterList.length === 0">
            <text>你还没有添加好友，可以点击添加好友头像进行操作</text>
          </view>
        </view>
        <view v-for="item in rosterList" :key="item.user_id" :data-uid="item.user_id" :data-nick="item.nick_name || item.username || item.user_id" class="item" @tap="goChat">
          <image :src="item.avatar" class="avatar"></image>
          <text class="uname">{{ item.nick_name || item.username || item.user_id }}</text>
        </view>
      </view>
      <view v-if="menuCurr == 1">
        <view class="item" @tap="createGroup">
          <image src="/static/pages/image/cgroup.png" class="avatar"></image>
          <text class="uname">创建群组</text>
        </view>
        <view class="item" @tap="joinGroup">
          <image src="/static/pages/image/cgroup.png" class="avatar" :style="'filter: brightness(1) invert(0.3)'"></image>
          <text class="uname">加入群组</text>
        </view>
        <view class="background" v-if="!isLogin || (isLogin && groupList.length === 0)">
          <image class="background_kmg" src="/static/pages/image/background.png"></image>
          <view v-if="!isLogin">
            <text>你还没有登录，请先在设置页面进行登录操作</text>
          </view>
          <view v-if="isLogin && groupList.length === 0">
            <text>你还没有加入群组，可以点击创建群组头像进行操作</text>
          </view>
        </view>
        <view v-for="item in groupList" :key="item.group_id" :data-gid="item.group_id" class="item" @tap="goGroup">
          <image :src="item.avatar" class="avatar"></image>
          <text class="uname">{{ item.name }}</text>
        </view>
      </view>
      <view v-if="menuCurr == 2">
        <view class="background" v-if="!isLogin || (isLogin && !showsupports)">
          <image class="background_kmg" src="/static/pages/image/background.png"></image>
          <view v-if="!isLogin">
            <text>如果想联系技术支持，请将App ID切换成"welovemaxim"后进行登录操作</text>
          </view>
          <view v-if="isLogin && !showsupports">
            <text>如果想联系技术支持,请退出后,将App ID切换成"welovemaxim"</text>
          </view>
        </view>
        <view v-for="item in staticList" v-if="showsupports" :key="item.user_id" :data-uid="item.user_id" :data-nick="item.nickname" class="item" @tap="goChat">
          <image :src="item.avatar" class="avatar"></image>
          <text class="uname">{{ item.nick_name || item.nickname || item.username }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      rosterList: [],
      groupList: [],
      staticList: [],
      showRoster: true,
      showGroup: true,
      menuCurr: 0,
      navHeight: 0,
      showsupports: false,
      isLogin: false,
      isWeChat: false
    };
  },

  components: {},
  props: {},
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
      im.on('loginerror', (err) => {
        console.log('Login error due to ', err);
      });
      im.on('onRosterListUpdate', () => {
        this.getRosterList();
      });
      im.on('onGroupListUpdate', () => {
        this.getGroupList();
      });
    }

    const isLogin = getApp().isIMLogin();
    this.setData({
      isLogin
    });

    if (isLogin) {
      this.getRosterList();
      this.getGroupList();
    }
    const showsupports = getApp().getAppid() == 'welovemaxim';
    if (showsupports) {
      this.asyncGetStatics();
    }

    this.setData({
      showsupports
    });
  },
  onShow: function () {
    const isLogin = getApp().isIMLogin();
    const showsupports = getApp().getAppid() == 'welovemaxim';
    this.setData({
      isLogin,
      showsupports
    });
    if (!isLogin) {
      this.setData({
        rosterList: [],
        groupList: [],
        staticList: []
      });
      getApp().isLoginPage = true;
      const isWeChat = getApp().isWeChatEnvironment();
      if (!isWeChat) {
        uni.reLaunch({
          url: '../login/index'
        });
      }
    } else {
      if (this.rosterList.length == 0) {
        this.getRosterList();
      }
      if (this.groupList.length == 0) {
        this.getGroupList();
      }
      if (this.showsupports && this.staticList.length == 0) {
        this.asyncGetStatics();
      }
    }
  },
  methods: {
    //事件处理函数
    goChat: function (e) {
      var id = e.currentTarget.dataset.uid;
      const nick = e.currentTarget.dataset.nick;
      wx.navigateTo({
        url: '../../pages_chat/roster/index?uid=' + id + '&nick=' + nick
      });
    },
    goGroup: function (e) {
      var gid = e.currentTarget.dataset.gid;
      wx.navigateTo({
        url: '../../pages_chat/group/index?gid=' + gid
      });
    },

    getRosterList() {
      const im = getApp().getIM();
      im.rosterManage
        .asyncGetRosterIdList()
        .then((res) => {
          const uid = im.userManage.getUid();
          res = res.filter((x) => x !== uid);
          im.rosterManage.asnycGetRosterListDetailByIds(res).then(() => {
            const allMaps = im.rosterManage.getAllRosterDetail() || {};
            const retObj = res.map((i) => {
              const rosterInfo = allMaps[i] || { user_id: i };
              const unreadCount = im.rosterManage.getUnreadCount(i);
              let avatar = rosterInfo.avatar;
              avatar = im.sysManage.getImage({
                avatar: rosterInfo.avatar,
                sdefault: '/static/pages/image/r_b.png'
              });
              return Object.assign({}, rosterInfo, {
                unreadCount,
                avatar
              });
            });
            this.setData({
              rosterList: retObj
            });
          });
        })
        .catch((ex) => {
          console.error('Get roster list exception: ', ex);
          wx.showToast({
            title: '获取用户列表失败'
          });
        });
    },

    getGroupList() {
      const im = getApp().getIM();
      im.groupManage
        .asyncGetJoinedGroups()
        .then((res) => {
          const retObj = res.map((i) => {
            const unreadCount = im.groupManage.getUnreadCount(i.group_id);
            let avatar = i.avatar;
            avatar = im.sysManage.getImage({
              avatar: avatar,
              type: 'group',
              sdefault: '/static/pages/image/g.png'
            });
            return Object.assign({}, i, {
              unreadCount,
              avatar
            });
          });
          this.setData({
            groupList: retObj
          });
        })
        .catch((ex) => {
          wx.showToast({
            title: '获取群列表失败'
          });
        });
    },

    menuClick: function (e) {
      this.setData({
        menuCurr: e.currentTarget.dataset.num
      });
    },
    asyncGetStatics: function () {
      const im = getApp().getIM();
      im.sysManage.asyncGetStaticContact().then((res) => {
        res = res.map((x) => {
          x.avatar = im.sysManage.getImage({
            avatar: x.avatar,
            sdefault: '/static/pages/image/r_b.png'
          });
          return x;
        });
        this.setData({
          staticList: res
        });
      });
    },
    addRoster: function () {
      if (this.isLogin) {
        uni.navigateTo({
          url: '../../pages_chat/roster/add/index'
        });
      } else {
        uni.navigateTo({
          url: '../account/loginreminder/index'
        });
      }
    },
    createGroup: function () {
      if (this.isLogin) {
        uni.navigateTo({
          url: '../../pages_chat/group/create/index'
        });
      } else {
        uni.navigateTo({
          url: '../account/loginreminder/index'
        });
      }
    },
    joinGroup: function () {
      if (this.isLogin) {
        uni.navigateTo({
          url: '../../pages_chat/group/join/index'
        });
      } else {
        uni.navigateTo({
          url: '../account/loginreminder/index'
        });
      }
    }
  }
};
</script>
<style>
@import './index.css';
</style>
