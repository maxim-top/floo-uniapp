<template>
  <view>
    <snav>
      <view class="back" @tap.stop="backClick">
        <image class="back_kmg" src="/static/pages/image/back.png"></image>
      </view>
    </snav>
    <view class="container" :style="'padding-top:' + navHeight + 'px'">
      <view class="background">
        <image class="background_kmg" src="/static/pages/image/slogo.png" style="margin-top: 20rpx"></image>
      </view>
      <view class="buttonFrame" @tap="loginClick">
        <button class="buttonFrame">立即登录</button>
      </view>
      <view class="buttonFrame" @tap="backClick">
        <button class="buttonFrame" :style="'background:rgb(225, 235, 247)'">暂不登录</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      navHeight: 0
    };
  },

  components: {},
  props: {},
  onLoad: function () {
    this.setData({
      navHeight: getApp().getNavHeight()
    });
  },

  methods: {
    loginClick() {
      uni.navigateTo({
        url: '../setappid/index'
      });
    },

    backClick() {
      uni.navigateBack();
    }
  }
};
</script>

<style>
@import './index.css';
</style>
