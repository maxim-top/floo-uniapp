<template>
  <view>
    <snav title="创建群组">
      <view class="back" @tap.stop="backClick">
        <image class="back_kmg" src="/static/pages/image/back.png"></image>
      </view>
    </snav>
    <view class="container" :style="'padding-top:' + navHeight + 'px'">
      <view class="inputFrame">
        <input type="text" :value="name" placeholder="输入群名称" @input="nameHandler" />
      </view>
      <view class="inputFrame th mt">
        <input class="th" type="textarea" :value="description" placeholder="输入群描述" @input="descriptionHandler" />
      </view>
      <view class="stxt">
        <text>选择群成员</text>
      </view>
      <view class="roster_list">
        <view v-for="(item, index) in rosterList" :key="item.user_id" :data-idx="index" class="item" @tap="tapRoster">
          <image :src="item.avatar" class="avatar"></image>
          <text class="uname">{{ item.nick_name || item.username }}</text>
          <image src="/static/pages/image/check.png" v-if="item.flag" class="check"></image>
        </view>
      </view>
      <view class="bindBtn sblue" @tap="create">
        <text>创建群组</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      name: '',
      description: '',
      rosterList: [],
      navHeight: 0,
      token: ''
    };
  },

  components: {},
  props: {},
  onLoad: function () {
    this.setData({
      navHeight: getApp().getNavHeight()
    });
    this.getRosterList();
  },
  methods: {
    nameHandler(evt) {
      const name = evt.detail.value;
      this.setData({
        name
      });
    },

    descriptionHandler(evt) {
      const description = evt.detail.value;
      this.setData({
        description
      });
    },

    getRosterList() {
      const im = getApp().getIM();
      if (!im) return;

      const token = im.userManage.getToken();
      im.rosterManage
        .asyncGetRosterIdList()
        .then((res) => {
          const uid = im.userManage.getUid();
          res = res.filter((x) => x !== uid);
          im.rosterManage.asnycGetRosterListDetailByIds(res).then(() => {
            const allMaps = im.rosterManage.getAllRosterDetail() || {};
            const retObj = res.map((i) => {
              const rosterInfo = allMaps[i];
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
              rosterList: retObj,
              token
            });
          });
        })
        .catch((ex) => {
          wx.showToast({
            title: '获取用户列表失败'
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

    tapRoster(e) {
      var idx = e.currentTarget.dataset.idx;
      const list = [].concat(this.rosterList);
      const obj = list[idx];
      obj.flag = !obj.flag;
      list[idx] = obj;
      this.setData({
        rosterList: list
      });
    },

    create() {
      let list = this.rosterList.filter((x) => x.flag);
      list = list.map((x) => x.user_id);

      if (!list.length) {
        wx.showToast({
          title: '请选择群成员'
        });
        return;
      }

      if (!this.name) {
        wx.showToast({
          title: '请输入群名称'
        });
        return;
      }

      getApp()
        .getIM()
        .groupManage.asyncCreate({
          name: this.name,
          type: 1,
          description: this.description,
          user_list: list
        })
        .then(() => {
          wx.showToast({
            title: '创建群成功',
            success: () => {
              setTimeout(() => {
                wx.navigateBack();
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
