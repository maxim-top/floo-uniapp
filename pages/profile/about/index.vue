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
      <view class="txtFrame" style="font-size: 28rpx; margin-top: 350rpx">
        <text>一键启用多云架构的即时通讯云服务</text>
      </view>
      <view class="txtFrame" style="margin-top: 50rpx">
        <text>官网 https://www.maximtop.com</text>
      </view>
      <view class="txtFrame" style="margin-top: 15rpx">
        <text>联系商务 400-666-0162</text>
      </view>
      <view class="txtFrame" style="margin-top: 15rpx">
        <text>美信拓扑IM v1.2.5</text>
      </view>
    </view>
    <view class="btm">
      <text>© 2019 美信拓扑</text>
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
