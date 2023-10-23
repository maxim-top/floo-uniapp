<template>
  <view>
    <!-- index.wxml -->
    <snav title="关于我们">
      <view class="back" @tap.stop="backClick">
        <image class="back_kmg" src="/static/pages/image/back.png"></image>
      </view>
    </snav>
    <view class="container" style="height: 100%">
      <view class="logo">
        <image class="logo_image" src="/static/pages/image/slogo.png"></image>
      </view>
      <view class="txtFrame" style="font-size: 32rpx; margin-top: 200rpx">
        <text>构建新一代智能聊天APP</text>
        <br />
        <text>用蓝莺IM专业SDK！</text>
      </view>
      <view class="txtFrame" style="margin-top: 100rpx">
        <text>官网 https://www.lanyingim.com</text>
      </view>
      <view class="txtFrame" style="margin-top: 15rpx">
        <text>联系商务 400-666-0162</text>
      </view>
      <view class="txtFrame" style="margin-top: 50rpx">
        <text>蓝莺IM v3.0.1</text>
      </view>
      <view class="txtFrame" style="margin-top: 15rpx">
        <text>Floo/SDK v3.0.1</text>
      </view>
    </view>
    <view class="btm">
      <text>© 2019-2023 美信拓扑</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      navHeight: 0,
      showing: false
    };
  },

  components: {},
  props: {},
  onUnload: function () {
    this.setData({
      showing: false
    });
  },
  onLoad: function () {
    this.setData({
      navHeight: getApp().getNavHeight()
    });
  },
  methods: {
    backClick() {
      wx.navigateBack();
    }
  }
};
</script>
<style>
@import './index.css';
</style>
