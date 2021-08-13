<template>
  <view>
    <snav title="人员列表"></snav>
    <view class="container">
      <view v-for="(item, index) in rosterList" :key="index" :data-uid="item.user_id" class="item" @tap="goChat">
        <image :src="item.avatar" class="avatar"></image>
        <text class="uname">{{ item.username }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      rosterList: [
        {
          user_id: 1,
          avatar: '/static/pages/image/work/1.jpeg',
          username: '雨彤'
        },
        {
          user_id: 2,
          avatar: '/static/pages/image/work/2.jpeg',
          username: '雪娇'
        },
        {
          user_id: 3,
          avatar: '/static/pages/image/work/3.jpeg',
          username: '稍辉'
        },
        {
          user_id: 4,
          avatar: '/static/pages/image/work/4.jpeg',
          username: '羽鹏'
        },
        {
          user_id: 5,
          avatar: '/static/pages/image/work/5.jpeg',
          username: '金海'
        },
        {
          user_id: 6,
          avatar: '/static/pages/image/work/7.jpeg',
          username: '姜维'
        }
      ]
    };
  },

  components: {},
  props: {},
  methods: {
    //事件处理函数
    goChat: function (e) {
      var id = e.currentTarget.dataset.uid;
      wx.navigateTo({
        url: '../detail/index?uid=' + id
      });
    }
  }
};
</script>
<style>
@import './index.css';
</style>
