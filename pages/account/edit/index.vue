<template>
  <view>
    <snav title="配置">
      <view class="back" @tap.stop="backClick">
        <image class="back_kmg" src="/static/pages/image/back.png"></image>
      </view>
    </snav>
    <view class="container" :style="'padding-top:' + navHeight + 'px'">
      <view class="inputFrame">
        <text class="tips" style="float: left">App ID</text>
        <input :value="appid" @input="appidHandler" />
      </view>
      <view class="custome">
        <view class="item">
          <view class="sleft">
            <text>自定义服务</text>
          </view>
          <view class="sright">
            <switch class="sright_switch" @change="customeSeviceChange"></switch>
          </view>
        </view>
        <view class="item">
          <view class="sleft">
            <text>IM Server</text>
          </view>
          <view class="sright">
            <input :disabled="!isCustom" :value="imServer" @input="imServerHandler" placeholder="默认" />
          </view>
        </view>
        <view class="item">
          <view class="sleft">
            <text>IM Port</text>
          </view>
          <view class="sright">
            <input :disabled="!isCustom" :value="imPort" @input="imPortHandler" placeholder="默认" />
          </view>
        </view>
        <view class="item">
          <view class="sleft">
            <text>Rest Server</text>
          </view>
          <view class="sright">
            <input :disabled="!isCustom" :value="restServer" @input="restServerHandler" placeholder="默认" />
          </view>
        </view>
      </view>
      <text class="tips_text">如果正在使用微信小程序，请确保上述地址已加入安全网址白名单。</text>
      <view class="buttonFrame" @tap="saveClick">
        <button class="button_item">保存</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      navHeight: 0,
      menuButtonWidth: 0,
      appid: '',
      isCustom: false,
      imServer: '',
      imPort: '',
      restServer: ''
    };
  },

  components: {},
  props: {},
  onLoad: function () {
    const appid = getApp().getAppid();
    this.setData({
      appid,
      navHeight: getApp().getNavHeight(),
      menuButtonWidth: getApp().getMenuButtonWidth()
    });
  },

  methods: {
    backClick() {
      uni.navigateBack();
    },
    appidHandler(e) {
      this.setData({
        appid: e.detail.value
      });
    },
    saveClick() {
      getApp().setupIM(this.appid);
      getApp().addIMListeners();
      uni.showToast({
        title: '设置成功'
      });
    },
    customeSeviceChange(e) {
      this.setData({
        isCustom: e.detail.value
      });
      if (!this.isCustom) {
        this.setData({
          imServer: '',
          imPort: '',
          restServer: ''
        });
      }
    },
    imServerHandler(e) {
      this.setData({
        imServer: e.detail.value
      });
    },
    imPortHandler(e) {
      this.setData({
        imPort: e.detail.value
      });
    },
    restServerHandler(e) {
      this.setData({
        restServer: e.detail.value
      });
    }
  }
};
</script>

<style>
@import './index.css';
</style>
