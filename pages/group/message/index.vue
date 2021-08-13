<template>
  <!-- index.wxml -->
  <view>
    <view class="time">
      <text>{{ time }}</text>
    </view>
    <view class="msgcontainer">
      <view :class="cls">
        <view class="rosterInfo">
          <image class="avatar" :src="avatar" @tap="goUserProfile"></image>
        </view>
        <view class="name_frame" v-if="cls == 'roster'">
          <text>{{ username }}</text>
        </view>
        <view class="c_content">
          <text v-if="type == 'text'">
            {{ content }}
            <br />
            <text v-if="ext">ext: {{ ext }}</text>
          </text>
          <image class="cimage" v-if="type == 'image'" :src="attachImage"></image>
          <video class="cimage" v-if="type == 'video'" :src="video"></video>
          <!-- <audio name="音频文件" wx:if="{{type == 'image'}}" author="" src="{{audio}}" class="saudio" controls></audio> -->
          <view class="voice_frmae" v-if="type == 'audio'" @tap="splayAudio">
            <image class="voice" v-if="playing == false" src="/static/pages/image/voice/stop.png"></image>
            <image class="voice" v-if="playing == true" src="/static/pages/image/voice/start.png"></image>
            <text class="voice_duration">'{{ attach.duration }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
//index.js
//获取应用实例
import { toNumber, numToString } from '../../../third/tools';
import moment from '../../../third/moment';

export default {
  data() {
    return {
      cls: '',
      username: '',
      avatar: '',
      contentType: 0,
      content: '',
      ext: '',
      attachImage: '',
      videoCover: '',
      video: '',
      audio: '',
      messageType: 0,
      time: '',
      playing: false,
      from: '',
      attach: '',
      type: '',
      toType: ''
    };
  },

  components: {},
  props: {
    message: {
      type: Object,
      // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      default: () => ({})
    }
  },
  beforeMount: function () {
    const message = this.message;
    const im = getApp().getIM(); //FIXME: check im undefined
    const uid = im.userManage.getUid();
    const from = message.from;
    const cls = uid == from ? 'self' : 'roster';
    const type = message.type;
    const toType = message.toType;
    let content = message.content || '';
    let ext = message.ext || '';
    let username = '';
    const fromUserObj = im.rosterManage.getRosterInfo(from);

    let avatar = im.sysManage.getImage({
      avatar: fromUserObj.avatar,
      sdefault: '/static/pages/image/r.png'
    });
    username = fromUserObj.nick_name || fromUserObj.username || '';

    if (from == uid) {
      username = '我自己';
    }

    const attach = message.attach || {};
    let url = attach.url || '';

    if (url && type === 'image') {
      url = im.sysManage.getImage({
        avatar: url
      });
    }

    let videoCover = '';
    if (url && type === 'video') {
      let tUrl = attach.tUrl || '';
      videoCover = im.sysManage.getImage({
        avatar: tUrl,
        thumbnail: true
      });
      url = im.sysManage.getChatFile({ url });
    }

    if (url && type === 'audio') {
      // 1. use the audio url;
      let audio = im.sysManage.getAudio({
        url
      });
      console.log('getAudio: ', audio);
      this.setData({
        audio
      }); // 2. download audio to local file
      // const that = this;
      // im.sysManage.downloadAudio({url}).then((res) => {
      //   console.log("getAudio: ", res);
      //   that.setData({
      //     audio: res,
      //   });
      // }).catch((ex) => {
      //   console.error("getAudio error: ", ex);
      // });
    }

    let { timestamp } = message;
    timestamp = toNumber(timestamp);
    let time = moment(timestamp).calendar('', {
      sameDay: '[今天] HH:mm',
      lastDay: '[昨天] HH:mm',
      sameElse: 'YYYY-MM-DD HH:mm'
    });
    this.setData({
      attach,
      cls,
      username,
      avatar,
      type,
      toType,
      content,
      ext,
      attachImage: url,
      videoCover,
      video: url,
      time,
      from
    });
  },
  onShow: function () {
    const im = getApp().getIM();
    const message = this.message;

    // Message displayed as read
    const fromUid = toNumber(message.from);
    const uid = im.userManage.getUid();
    if (fromUid !== uid && message.status !== 'read') {
      im.groupManage.readGroupMessage(this.uid, this.message.id);
    }
  },
  methods: {
    splayAudio: function () {
      const innerAudioContext = wx.createInnerAudioContext(); // innerAudioContext.autoplay = true

      innerAudioContext.obeyMuteSwitch = false;
      innerAudioContext.loop = false;
      innerAudioContext.src = this.audio;
      this.setData({
        playing: true
      });
      innerAudioContext.onPlay(() => {
        setTimeout(() => {
          innerAudioContext.stop();
        }, (this.attach.duration + 3) * 1000);
      });
      innerAudioContext.onError((res) => {
        this.setData({
          playing: false
        });
      });
      innerAudioContext.onStop((res) => {
        this.setData({
          playing: false
        });
      });
      innerAudioContext.play();
    },

    goUserProfile() {
      if (this.cls == 'roster') {
        wx.navigateTo({
          url: '/pages/profile/userinfo/index?uid=' + this.from
        });
      }
    } ////
  }
};
</script>
<style>
@import './index.css';
</style>
