<template>
  <view class="loginreminder-box" :hidden="isHidden">
    <view class="loginreminder-content contentFontColor">
      <view v-if="title" class="loginreminder-title">
        <text>{{ title }}</text>
      </view>
      <image class="loginreminder-cimage" src="/static/pages/image/blogo.png"></image>
      <view class="loginreminder-btn-group">
        <button class="btn-item loginreminder-cancel-btn contentFontColor" @tap="hide">
          {{ btn_cancel }}
        </button>
        <button class="btn-item loginreminder-certain-btn" @tap="confirmFun">{{ btn_certain }}</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isHidden: true
    };
  },

  components: {},
  props: {
    title: {
      type: String,
      default: '您还未登录'
    },
    btn_cancel: {
      type: String,
      default: '暂不登录'
    },
    btn_certain: {
      type: String,
      default: '立即登录'
    }
  },
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  methods: {
    hide: function () {
      this.setData({
        isHidden: true
      });
    },
    show() {
      this.setData({
        isHidden: false
      });
    },
    cancelFun() {
      this.setData({
        isHidden: true
      });
    },
    confirmFun() {
      this.setData({
        isHidden: false
      });
      uni.reLaunch({
        url: '../account/login/index'
      });
    }
  }
};
</script>
<style>
@import './index.css';
</style>
