<template>
  <view>
    <snav>
      <view v-if="showBack" class="back" @tap.stop="backClick">
        <image class="back_kmg" src="/static/pages/image/back.png"></image>
      </view>
    </snav>
    <view class="container" :style="'padding-top:' + navHeight + 'px'">
      <view class="panel">
        <text class="appid_name">{{ prompt }}</text>
        <image class="appid_icon" src="/static/pages/image/tips.png" @click="clickHelp"></image>
        <view class="inputList">
          <view class="inputFrame">
            <input :value="appid" type="text" focus placeholder="请输入appid" @input="appidHandler" />
            <image v-if="appid.length" class="close_icon" src="/static/pages/image/close.png" @click="clickClear()"></image>
            <picker @change="bindPickerChange" :range="appidList">
              <image class="drop_icon" src="/static/pages/image/drop_down.png"></image>
            </picker>
          </view>
          <image class="scan_icon" src="/static/pages/image/scan_w.png" @click="clickSacn()"></image>
        </view>
        <view @tap="appidConfirm">
          <button class="buttonFrame">继续</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      navHeight: 0,
      prompt: '请输入App ID ',
      isWeChat: false,
      showBack: false,
      appid: '',
      appidList: [],
      clearList: '清空列表',
      href: 'https://docs.lanyingim.com/faq/what-is-app-id.html'
    };
  },

  components: {},
  props: {},
  onLoad: function () {
    const appid = getApp().getAppid();
    let appidList = getApp().getAppidList();
    appidList.push(this.clearList);
    this.setData({
      navHeight: getApp().getNavHeight(),
      isWeChat: getApp().isWeChatEnvironment(),
      appid: appid ? appid : 'welovemaxim',
      appidList
    });
    if (getCurrentPages().length > 1) {
      this.setData({
        showBack: true
      });
    }
  },
  onShow: function () {
    const appid = getApp().getAppid();
    let appidList = getApp().getAppidList();
    appidList.push(this.clearList);
    this.setData({
      appid: appid ? appid : 'welovemaxim',
      appidList
    });
  },

  methods: {
    backClick() {
      uni.navigateBack();
    },
    clickHelp() {
      if (this.isWeChat) {
        uni.navigateTo({
          url: '../../components/ulink/index?url=' + this.href
        });
      } else {
        window.open(this.href);
      }
    },
    clickClear() {
      this.setData({
        appid: ''
      });
    },
    bindPickerChange(e) {
      let index = e.detail.value;
      let appid = this.appidList[index];
      if (appid == this.clearList) {
        appid = '';
        getApp().clearAppidList();
        this.setData({
          appidList: [this.clearList]
        });
      }
      this.setData({
        appid
      });
    },
    clickSacn() {
      if (this.isWeChat) {
        let that = this;
        uni.scanCode({
          scanType: ['qrCode'],
          success: function (res) {
            let config = JSON.parse(res.result);
            if (config && config.action && config.info) {
              if (config.action == 'app' || config.action == 'login') {
                console.log(config);
                let appid = config.info.app_id;
                if (appid) {
                  console.log(appid);
                  let username = config.info.username;
                  let password = config.info.password;
                  let url = '../login/index';
                  if (username) {
                    url += '?username=' + username;
                    if (password) {
                      url += '&password=' + password;
                    }
                  }
                  console.log(url);
                  that.setData({
                    appid
                  });
                  getApp().setupIM(that.appid);
                  getApp().addIMListeners();
                  console.log('work here start to navigateTo');
                  uni.navigateTo({
                    url
                  });
                }
              }
            }
          }
        });
      } else {
        uni.showToast({
          title: 'H5不支持扫码'
        });
      }
    },
    clearAppid() {
      this.setData({
        appid: '',
        appidList: ['清空列表']
      });
      getApp().clearAppidList();
    },
    appidHandler(e) {
      const svalue = e.detail.value;
      this.setData({
        appid: svalue
      });
    },
    appidConfirm() {
      getApp().setupIM(this.appid);
      getApp().addIMListeners();
      uni.navigateTo({
        url: '../login/index'
      });
    }
  }
};
</script>

<style>
@import './index.css';
</style>
