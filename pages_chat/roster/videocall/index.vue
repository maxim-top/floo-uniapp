<template>
  <view class="container" style="height: 100%">
    <view>
      <p v-if="isGetThrough" class="call_time">{{ callTime }}</p>
    </view>
    <view class="header_view" :style="{ 'z-index': isGetThrough ? (peerCameraClose ? ' 4 ' : '0') : '3' }">
      <image :src="profile.avatar" class="avatar"></image>
      <view class="nick">
        <text class="nick_text" :style="{ color: peerCameraClose ? 'white' : 'black' }">{{ profile.nick_name || profile.username }}</text>
        <text v-if="caller" class="nick_tips" :style="{ display: isGetThrough ? 'none' : 'block' }">正在等待对方接受邀请...</text>
        <text v-if="!caller" class="nick_tips" :style="{ display: isGetThrough ? 'none' : 'block' }">收到一个视频通话请求...</text>
      </view>
    </view>
    <view class="buttons">
      <view class="button_item" @tap="micChangeStatus">
        <image :src="micPic" class="button_avatar"></image>
        <text v-if="mic">麦克风打开</text>
        <text v-if="!mic">麦克风关闭</text>
      </view>
      <view class="button_item" @tap="callOperation">
        <image :src="phonePic" class="button_avatar"></image>
        <text v-if="caller || isGetThrough">挂断</text>
        <text v-if="!caller && !isGetThrough">接通</text>
      </view>
      <view class="button_item" @tap="cameraChangeStatus">
        <image :src="cameraPic" class="button_avatar"></image>
        <text v-if="camera">摄像头打开</text>
        <text v-if="!camera">摄像头关闭</text>
      </view>
    </view>
    <view class="button_item button_hangup" v-if="!caller && !isGetThrough" @tap="rejectCall">
      <image src="/static/pages/image/call/hangup.png" class="button_avatar"></image>
      <text>挂断</text>
    </view>
    <view class="remote_video_panel">
      <video ref="rVideo" object-fit="cover" show-center-play-btn="false" autoplay muted></video>
      <audio ref="rAudio" class="hide" autoplay muted />
    </view>
    <view class="local_video_panel">
      <video ref="lVideo" object-fit="cover" show-center-play-btn="false" autoplay muted></video>
    </view>
  </view>
</template>

<script>
import { toNumber } from '../../../third/tools';
export default {
  data() {
    return {
      navHeight: 0,
      uid: 0,
      profile: {},
      isGetThrough: false,
      peerCameraClose: false,
      callTime: '00:00:00',
      doHangup: false,

      ringAudioContext: null,
      mic: true,
      camera: true,
      caller: true,
      micPic: '/static/pages/image/call/mic_on.png',
      cameraPic: '/static/pages/image/call/camera_on.png',
      phonePic: '/static/pages/image/call/hangup.png'
    };
  },

  components: {},
  props: {},
  onUnload: function () {
    const im = getApp().getIM();
    im &&
      im.off({
        onRosterRTCMessage: this.onRosterRTCMessage
      });
  },

  onLoad: function (p) {
    const im = getApp().getIM();
    if (!im) return;

    if (p.uid) {
      let caller = true;
      if (p.caller && p.caller == 'false') {
        caller = false;
      }
      this.setData({
        uid: p.uid,
        caller,
        phonePic: caller ? '/static/pages/image/call/hangup.png' : '/static/pages/image/call/pickup.png',
        navHeight: getApp().getNavHeight()
      });
      this.getUserInfo();
      this.playPhoneRing();
    }

    im.on({
      onRosterRTCMessage: this.onRosterRTCMessage
    });
  },

  mounted: function () {
    const im = getApp().getIM();
    if (!im) return;

    const appid = im.userManage.getAppid();
    const id = im.userManage.getUid();
    const callInfo = getApp().getCallInfo();

    if (this.caller) {
      // 呼叫发起
      callInfo.callId = id.toString() + '_' + Date.now();
      im.rtcManage.initRTCEngine({
        server: im.sysManage.getServers(appid).rtc,
        id: id,
        caller: true,
        receiver: this.uid,
        roomId: 0,
        secret: this.randomString(8),
        callId: callInfo.callId,
        pin: this.randomString(8),
        hasVideo: true,
        hasAudio: true,
        getThrough: this.getThrough,
        hangupCall: this.hangupCall,
        getHangUpStatus: this.getHangUpStatus,
        attachStream: this.attachStream
      });

      this.startLocalRender();
    }
    this.$refs.rAudio.$refs.audio.muted = false;
  },

  beforeDestroy: function () {
    const im = getApp().getIM();
    if (!im) return;

    if (!this.doHangup) {
      if (this.caller) {
        this.hangupCall(false);
      } else {
        this.rejectCall();
      }
    }
    im.rtcManage.destroy();
  },

  methods: {
    getUserInfo() {
      const im = getApp().getIM();
      im.rosterManage
        .asyncSearchRosterById({
          user_id: this.uid
        })
        .then((res) => {
          res.avatar = im.sysManage.getImage({
            avatar: res.avatar,
            sdefault: '/static/pages/image/r_b.png'
          });
          this.setData({
            profile: res
          });
        })
        .catch((ex) => {
          uni.showToast({
            title: '联系人信息获取失败'
          });
        });
    },

    onRosterRTCMessage(message) {
      const im = getApp().getIM();
      if (!im) return;

      const { config, ext, isHistory, isNative } = message;
      const fromUid = toNumber(message.from);
      const toUid = toNumber(message.to);
      const uid = im.userManage.getUid();
      const callStatus = im.rtcManage.getInCallStatus();

      if (!isHistory && config && !isNative && (fromUid == this.uid || (fromUid == uid && toUid == this.uid))) {
        if (config.action && config.action === 'call' && config.initiator) {
          // do nothing here. App page already process.
        } else if (config.action && config.action == 'pickup') {
          if (fromUid === uid) {
            // current use other device pickup call.
            this.leaveCall();
          } else {
            // do nothing here.
          }
        } else if (config.action && config.action == 'hangup') {
          if (fromUid === uid) {
            // current user other device hangup call. just hangup and navigateBack.
          } else {
            // do nothing here.
          }
          this.leaveCall();
        } else if (config.action && config.action == 'record') {
          if (fromUid === uid) {
            // current user other device record, just ignore and navigateBack.
          } else {
            if (callStatus) {
              im.rosterManage.readRosterMessage(fromUid, message.id);
            }
          }
        }
      }

      if (!isHistory && callStatus && ext && message.from != im.userManage.getUid()) {
        const sext = JSON.parse(ext);
        const callInfo = getApp().getCallInfo();
        if (sext && sext.callId === callInfo.callId) {
          if (Object.prototype.hasOwnProperty.call(sext, 'mute_video')) {
            this.setData({
              peerCameraClose: sext.mute_video
            });
          }
        }
      }
    },

    leaveCall() {
      const im = getApp().getIM();
      if (!im) return;

      getApp().clearCallInfo();
      this.stopPhoneRing();
      this.setData({
        doHangup: true
      });
      im.rtcManage.leaveRoom();

      uni.navigateBack();
    },

    playPhoneRing() {
      let innerAudioContext = uni.createInnerAudioContext(); // innerAudioContext.autoplay = true
      innerAudioContext.obeyMuteSwitch = false;
      innerAudioContext.src = '/static/pages/audio/phone_ring.mp3';
      innerAudioContext.autoplay = true;
      innerAudioContext.loop = true;
      this.setData({
        ringAudioContext: innerAudioContext
      });
      innerAudioContext.onPlay(() => {
        console.log('phone rine play.');
      });
      innerAudioContext.onError((res) => {
        console.error("Can't play audio due to ", res);
      });
      innerAudioContext.onStop((res) => {});
      innerAudioContext.play();
    },

    stopPhoneRing() {
      this.ringAudioContext.stop();
    },

    micChangeStatus() {
      const im = getApp().getIM();
      let mic = !this.mic;
      this.setData({
        mic,
        micPic: mic ? '/static/pages/image/call/mic_on.png' : '/static/pages/image/call/mic_off.png'
      });
      im.rtcManage.muteLocalAudio(!this.mic);
    },

    cameraChangeStatus() {
      const im = getApp().getIM();
      const callInfo = getApp().getCallInfo();
      let camera = !this.camera;
      this.setData({
        camera,
        cameraPic: camera ? '/static/pages/image/call/camera_on.png' : '/static/pages/image/call/camera_off.png'
      });
      im.rtcManage.muteLocalVideo(!this.camera);

      im.rtcManage.sendRTCMessage({
        uid: this.uid,
        content: '',
        ext: JSON.stringify({
          callId: callInfo.callId,
          mute_video: !this.camera
        })
      });
    },

    startLocalRender() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ audio: false, video: true })
          .then((stream) => {
            this.$refs.lVideo.$refs.video.srcObject = stream;
            this.$refs.lVideo.$refs.video.play();
          })
          .catch(() => {});
      }
    },

    callOperation() {
      if (this.caller) {
        this.hangupCall(true);
      } else {
        if (this.isGetThrough) {
          this.hangupCall(true);
        } else {
          this.pickupCall();
        }
      }
    },

    hangupCall(active, timeout = false, peerDrop = false) {
      const im = getApp().getIM();
      if (!im) return;

      let callInfo = getApp().getCallInfo();
      if (active) {
        let pickupTime = callInfo.pickupTime;
        let content = '';
        let pushlocKey = 'call_duration';
        let callTime = [0, 0];
        if (pickupTime) {
          content = (Date.now() - pickupTime).toString();
          let intervalMsec = parseInt(content);
          let intervalSec = intervalMsec / 1000;
          callTime[0] = parseInt(intervalSec / 60);
          callTime[1] = parseInt(intervalSec - callTime[0] * 60);
        } else {
          if (timeout) {
            content = 'timeout';
            pushlocKey = 'callee_not_responding';
          } else {
            content = 'canceled';
            pushlocKey = 'call_canceled_by_caller';
          }
        }
        let callId = callInfo.callId;
        im.rtcManage.sendRTCMessage({
          uid: this.uid,
          content: content,
          config: JSON.stringify({
            action: 'hangup',
            callId: callId,
            initiator: toNumber(callId.split('_')[0]),
            peerDrop: peerDrop,
            pushMessageLocKey: pushlocKey,
            pushMessageLocArgs: callTime
          })
        });
      }
      this.leaveCall();
    },

    rejectCall() {
      // 拒绝接通呼叫。
      const im = getApp().getIM();
      if (!im) return;

      let callId = getApp().getCallInfo().callId;
      im.rtcManage.sendRTCMessage({
        uid: this.uid,
        content: 'rejected',
        config: JSON.stringify({
          action: 'hangup',
          callId: callId,
          initiator: toNumber(callId.split('_')[0]),
          pushMessageLocKey: 'call_rejected_by_callee'
        })
      });
      this.leaveCall();
    },

    pickupCall() {
      const im = getApp().getIM();
      if (!im) return;

      const appid = im.userManage.getAppid();
      const callInfo = getApp().getCallInfo();
      let callInviteInfo = null;
      if (callInfo) {
        callInviteInfo = callInfo.callInviteInfo;
      }
      if (!callInviteInfo) return;

      // 被呼叫接听
      im.rtcManage.initRTCEngine({
        server: im.sysManage.getServers(appid).rtc,
        id: this.uid,
        caller: false,
        receiver: callInviteInfo.initiator,
        roomId: callInviteInfo.roomId,
        secret: '',
        callId: '',
        pin: callInviteInfo.pin,
        hasVideo: true,
        hasAudio: true,
        getThrough: this.getThrough,
        hangupCall: this.hangupCall,
        getHangUpStatus: this.getHangUpStatus,
        attachStream: this.attachStream
      });
      this.$refs.rAudio.$refs.audio.muted = false;
    },

    getHangUpStatus() {
      return this.doHangup;
    },

    calculateDisplayTime() {
      let callInfo = getApp().getCallInfo();
      let intervalMsec = Date.now() - callInfo.pickupTime;
      let intervalSec = intervalMsec / 1000;
      let day = parseInt(intervalSec / 3600 / 24);
      let hour = parseInt((intervalSec - day * 24 * 3600) / 3600);
      let min = parseInt((intervalSec - day * 24 * 3600 - hour * 3600) / 60);
      let sec = parseInt(intervalSec - day * 24 * 3600 - hour * 3600 - min * 60);
      let callTime =
        (hour > 0 ? hour.toString() : '00') +
        ':' +
        (min >= 10 ? min.toString() : min > 0 ? '0' + min.toString() : '00') +
        ':' +
        (sec >= 10 ? sec.toString() : sec > 0 ? '0' + sec.toString() : '00');
      this.setData({
        callTime: callTime
      });
    },

    getThrough() {
      if (!this.isGetThrough) {
        let that = this;
        this.setData({
          isGetThrough: true,
          phonePic: '/static/pages/image/call/hangup.png'
        });

        getApp().getCallInfo().pickupTime = Date.now();
        this.stopPhoneRing();
        setInterval(that.calculateDisplayTime, 1000);
      }
    },
    stopTracks(stream) {
      if (stream) {
        let tracks = stream.getTracks();
        for (let mst of tracks) {
          if (mst && mst.dontStop !== true) {
            mst.stop();
          }
        }
      }
    },
    attachStream(stream, type, isLocal = false) {
      if (type === 'audio') {
        this.$refs.rAudio.$refs.audio.srcObject = stream;
        this.$refs.rAudio.$refs.audio.play();
      } else if (type === 'video') {
        if (isLocal) {
          this.stopTracks(this.$refs.lVideo.$refs.video.srcObject);
          this.$refs.lVideo.$refs.video.srcObject = stream;
          this.$refs.lVideo.$refs.video.play();
        } else {
          this.$refs.rVideo.$refs.video.srcObject = stream;
          this.$refs.rVideo.$refs.video.play();
        }
      }
    },

    randomString(len) {
      let charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let randomString = '';
      for (let i = 0; i < len; i++) {
        let randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.charAt(randomPoz);
      }
      return randomString;
    }
  }
};
</script>

<style>
@import './index.css';
</style>
