<template>
  <view>
    <snav title="详细信息">
      <view class="back" @tap.stop="backClick">
        <image class="back_kmg" src="/static/pages/image/back.png"></image>
      </view>
    </snav>
    <view class="container">
      <image :src="avatar" class="avatar"></image>
      <view class="txtFrame">
        <view class="left">
          <text>姓名:</text>
        </view>
        <view class="right">
          <text>{{ name }}</text>
        </view>
      </view>

      <view class="txtFrame">
        <view class="left">
          <text>职位:</text>
        </view>
        <view class="right">
          <text>{{ offer }}</text>
        </view>
      </view>

      <view class="buttonFrame">
        <button type="primary" @tap="goChat">反馈问题</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      name: '',
      offer: '',
      avatar: '',
      uid: -1
    };
  },

  components: {},
  props: {},
  onLoad: function (options) {
    const { uid } = options;
    const offs = ['Web工程师', 'iOS工程师', 'web工程师', 'C++架构师', '运维主管', '后端主管'];
    const names = ['雨彤', '雪娇', '稍辉', '羽鹏', '金海', '姜维'];
    this.setData({
      name: names[uid - 1],
      offer: offs[uid - 1],
      avatar: '../../image/work/' + uid + '.jpeg',
      uid
    });
  },
  methods: {
    goChat(e) {
      const sids = [6601470303424, 6597271331072, 6597321479872, 6597321892992, 6597271396128, 6597271396128];
      wx.navigateTo({
        url: '../../roster/index?uid=' + sids[this.uid - 1]
      });
    },

    backClick() {
      wx.navigateBack();
    }
  }
};
</script>
<style>
@import './index.css';
</style>
