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
        <view v-if="showsupports" data-num="2" :class="'tag ' + (menuCurr == 2 ? 'sel' : '')" @tap.stop="menuClick">
          <text>支持</text>
        </view>
      </view>
    </snav>
    <view class="container" :style="'padding-top:' + navHeight + 'px'">
      <view v-if="menuCurr == 0" class="item" @tap="addRoster">
        <image src="/static/pages/image/add.png" class="avatar"></image>
        <text class="uname">添加好友</text>
      </view>
      <view v-if="menuCurr == 1" class="item" @tap="createGroup">
        <image src="/static/pages/image/cgroup.png" class="avatar"></image>
        <text class="uname">创建群组</text>
      </view>
      <view v-for="(item, index) in rosterList" :key="index" v-if="menuCurr == 0" :data-uid="item.user_id" :data-nick="item.nick_name || item.username || item.user_id" class="item" @tap="goChat">
        <image :src="item.avatar" class="avatar"></image>
        <text class="uname">{{ item.nick_name || item.username || item.user_id }}</text>
      </view>
      <view v-for="(item, index) in groupList" :key="index" v-if="menuCurr == 1" :data-gid="item.group_id" class="item" @tap="goGroup">
        <image :src="item.avatar" class="avatar"></image>
        <text class="uname">{{ item.name }}</text>
      </view>
      <view v-for="(item, index) in staticList" :key="index" v-if="menuCurr == 2" :data-uid="item.user_id" :data-nick="item.nickname" class="item" @tap="goChat">
        <image :src="item.avatar" class="avatar"></image>
        <text class="uname">{{ item.nick_name || item.nickname || item.username }}</text>
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
      showsupports: false
    };
  },

  components: {},
  props: {},
  onLoad: function () {
    this.setData({
      navHeight: getApp().getNavHeight()
    });
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

    this.getRosterList();
    this.getGroupList();
    const showsupports = getApp().getAppid() == 'welovemaxim';
    if( showsupports ) {
      this.asyncGetStatics();
    }

    this.setData({
      showsupports
    });
  },
  onShow: function () {
    if (!getApp().isIMLogin()) {
      getApp().isLoginPage = true;
      wx.reLaunch({
        url: '../login/index'
      });
    }
  },
  methods: {
    //事件处理函数
    goChat: function (e) {
      var id = e.currentTarget.dataset.uid;
      const nick = e.currentTarget.dataset.nick;
      wx.navigateTo({
        url: '../roster/index?uid=' + id + '&nick=' + nick
      });
    },
    goGroup: function (e) {
      var gid = e.currentTarget.dataset.gid;
      wx.navigateTo({
        url: '../group/index?gid=' + gid
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
              const rosterInfo = allMaps[i] || {user_id:i};
              const unreadCount = im.rosterManage.getUnreadCount(i);
              let avatar = rosterInfo.avatar;
              avatar = im.sysManage.getImage({
                avatar: rosterInfo.avatar,
                sdefault: '/static/pages/image/r.png'
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
            sdefault: '/static/pages/image/r.png'
          });
          return x;
        });
        this.setData({
          staticList: res
        });
      });
    },
    addRoster: function () {
      wx.navigateTo({
        url: '../roster/add/index'
      });
    },
    createGroup: function () {
      wx.navigateTo({
        url: '../group/create/index'
      });
    }
  }
};
</script>
<style>
@import './index.css';
</style>
