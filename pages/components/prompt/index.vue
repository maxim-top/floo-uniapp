<template>
  <view class="prompt-box" :hidden="isHidden">
    <view class="prompt-content contentFontColor">
      <view v-if="title" class="prompt-title">
        <text>{{ title }}</text>
      </view>
      <input class="prompt-input" @input="inputFun" :value="svalue" placeholder="请输入" />
      <view class="prompt-btn-group">
        <button class="btn-item prompt-cancel-btn contentFontColor" @tap="cancelFun">
          {{ btn_cancel }}
        </button>
        <button class="btn-item prompt-certain-btn" @tap="confirmFun">{{ btn_certain }}</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isHidden: true,
      svalue: ''
    };
  },

  components: {},
  props: {
    title: {
      type: String,
      default: '标题'
    },
    btn_cancel: {
      type: String,
      default: '取消'
    },
    btn_certain: {
      type: String,
      default: '确定'
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

    show(preset) {
      this.setData({
        isHidden: false,
        svalue: preset
      });
    },

    /*
     * 内部私有方法建议以下划线开头
     * triggerEvent 用于触发事件
     */
    cancelFun() {
      const isHidden = true;
      this.setData({
        isHidden
      });
    },

    confirmFun() {
      const value = this.svalue;
      this.$emit('confirm', {
        detail: {
          value
        }
      });
      const isHidden = true;
      this.setData({
        isHidden
      });
    },

    inputFun(e) {
      const svalue = e.detail.value;
      this.setData({
        svalue
      });
    }
  }
};
</script>
<style>
@import './index.css';
</style>
