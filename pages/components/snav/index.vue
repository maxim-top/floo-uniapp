<template>
  <view class="navbar custom-class" :style="'height:' + navHeight + 'px;background-color:' + bgColor">
    <view class="navbar-action-wrap" :style="'top:' + navWrapTop + 'px;'">
      <slot></slot>
    </view>
    <view v-if="title" class="navbar-title" :style="'top:' + navTop + 'px'">
      <text class="stitle">{{ title }}</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      navHeight: 0,
      navTop: 0,
      navWrapTop: 0
    };
  },

  components: {},
  props: {
    title: {
      type: String,
      // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      default: ''
    },
    bgColor: {
      type: String,
      default: 'white'
    }
  },
  beforeMount: function () {
    this.setData({
      navHeight: getApp().getNavHeight(),
      navTop: getApp().getNavTop(),
      navWrapTop: getApp().getNavTop() - 3
    });
  },
  methods: {}
};
</script>
<style>
@import './index.css';
</style>
