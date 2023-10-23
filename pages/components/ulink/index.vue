<template>
  <view>
    <web-view :src="url" @message="getMessage"></web-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      url: ''
    };
  },

  components: {},
  props: {},

  onLoad: function (options) {
    console.log('web-view web-view web-view web-view + options.url = ' + options.url);
    if (options && options.url) {
      this.setData({
        url: options.url
      });
    }
  },

  methods: {
    getMessage(event) {
      console.log('getMessage getMessage getMessage getMessage ' + event);
      uni.showModal({
        content: JSON.stringify(event.detail),
        showCancel: false
      });
    }
  }
};
</script>

<style>
@import './index.css';
</style>
