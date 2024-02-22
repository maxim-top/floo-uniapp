<template>
  <view>
    <snav title="群成员列表">
      <view class="back" @tap.stop="backClick">
        <image class="back_kmg" src="/static/pages/image/back.png"></image>
      </view>
    </snav>
    <view class="container" :style="'padding-top:' + navHeight + 'px'">
      <view class="member_list">
        <view v-for="(item, index) in memberList" :key="item.user_id" :data-idx="index" class="item">
          <image :src="rImage(item.avatar)" class="avatar"></image>
          <text class="uname">{{ item.display_name }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      gid: 0,
      memberList: [],
      navHeight: 0
    };
  },

  components: {},
  props: {},
  onLoad: function (options) {
    const { gid } = options;
    this.setData({
      gid,
      navHeight: getApp().getNavHeight()
    });
    this.getMemberList();
  },

  methods: {
    backClick() {
      uni.navigateBack();
    },

    getMemberList() {
      const im = getApp().getIM();
      if (!im) return;

      im.groupManage
        .asyncGetGroupMembers(this.gid)
        .then((res) => {
          this.setData({
            memberList: im.groupManage.getGroupMembers(this.gid)
          });
        })
        .catch((ex) => {
          if (err.data) {
            console.log('获取群成员列表失败 : ' + err.data.code + ':' + err.data.message);
          }
          uni.showToast({ title: '获取群成员列表失败 : ' + err.message });
        });
    },

    rImage(avatar) {
      const im = getApp().getIM();
      if (!im) return;

      return im.sysManage.getImage({
        avatar
      });
    }
  }
};
</script>

<style>
@import './index.css';
</style>
