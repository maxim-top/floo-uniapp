<template>
  <view>
    <snav title="加入群组">
      <view class="back" @tap.stop="backClick">
        <image class="back_kmg" src="/static/pages/image/back.png"></image>
      </view>
    </snav>
    <view class="container" :style="'padding-top:' + navHeight + 'px'">
      <view class="inputFrame">
        <input :value="searchText" placeholder="输入要查找的群组id" @input="searchHandler" @confirm="search" />
      </view>
      <view v-if="groupInfo.group_id">
        <view class="item" @tap="goChat">
          <image :src="groupInfo.avatar" class="avatar"></image>
          <text class="uname">{{ groupInfo.name }}</text>
        </view>
        <view class="bindBtn sgray" v-if="isJoined">
          <text>已加入群组</text>
        </view>
        <view class="bindBtn sblue" v-if="!isJoined" @tap="joinGroup">
          <text>申请加入群组</text>
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
      groupInfo: {},
      groupIdList: [],
      isJoined: false,
      navHeight: 0
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
      if (getApp().isIMLogin()) {
        this.getJoindedGroupIdList();
      }

      im.on('onGroupListUpdate', () => {
        console.log('onGroupListUpdate onGroupListUpdate onGroupListUpdate onGroupListUpdate onGroupListUpdate');
        this.getJoindedGroupIdList();
      });
    }
  },
  methods: {
    searchHandler(evt) {
      let searchText = evt.detail.value;
      this.$nextTick(() => {
        this.searchText = searchText.replace(/[^\d]/g, '');
      });
      this.setData({
        searchText
      });
    },

    search() {
      if (!this.searchText) {
        return;
      }
      let that = this;
      let group_id = this.searchText - 0;
      const im = getApp().getIM();
      if (!im) return;

      uni.hideKeyboard();
      im.groupManage
        .asyncGetInfo({
          group_id
        })
        .then((res) => {
          res.avatar = im.sysManage.getImage({
            avatar: res.avatar,
            sdefault: '/static/pages/image/cgroup.png'
          });
          this.setData({
            groupInfo: res,
            isJoined: that.groupIdList.findIndex((x) => x === group_id) >= 0
          });
        })
        .catch((ex) => {
          uni.showToast({
            title: '为找到指定群组',
            icon: 'error'
          });
        });
    },

    backClick() {
      uni.navigateBack();
    },

    getJoindedGroupIdList() {
      let that = this;
      let group_id = 0;
      if (this.searchText) {
        group_id = this.searchText - 0;
      }

      const im = getApp().getIM();
      im.groupManage
        .asyncGetJoinedGroups()
        .then((res) => {
          const group_list = res.map((item) => item.group_id || item);
          this.setData({
            groupIdList: group_list,
            isJoined: that.groupIdList.findIndex((x) => x === group_id) >= 0
          });
          console.log(that.group_list);
          console.log('isJoined = ' + that.isJoined);
        })
        .catch((ex) => {
          uni.showToast({
            title: '获取群列表失败'
          });
        });
    },

    goChat() {
      if (this.isJoined) {
        // 已加入群组
        uni.navigateTo({
          url: '../index?gid=' + this.groupInfo.group_id
        });
      }
    },

    joinGroup() {
      let that = this;
      const im = getApp().getIM();
      im.groupManage
        .asyncApply({ group_id: this.groupInfo.group_id, reason: '申请加入群' })
        .then(() => {
          uni.showToast({
            title: '发送入群申请成功'
          });
        })
        .catch((ex) => {
          uni.showToast({
            title: '发送入群申请失败'
          });
        });
    }
  }
};
</script>
<style>
@import './index.css';
</style>
