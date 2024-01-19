<template>
  <view>
    <snav>
      <view class="back" @tap.stop="backClick">
        <image class="back_kmg" src="/static/pages/image/back.png"></image>
      </view>
      <text class="title" @click="goUserProfile()">{{ stitle }}</text>
      <view class="delete_button">
        <image class="back_kmg" src="/static/pages/image/close_circle.png" :style="isWeChat ? 'padding-right:' + menuButtonWidth + 'px' : ''" @click="deleteConversation()"></image>
      </view>
    </snav>
    <view class="history_button" @click="queryHistory()" :style="'top:' + hisbtnHeight + 'px'">{{ queryingHistory ? '正在拉取历史消息' : '查看历史' }}</view>
    <view class="container" :style="'padding-top:' + navHeight + 'px'">
      <scroll-view class="contentcontainer" :style="'height:' + wh + 'px'" scroll-y :scroll-top="scrolltop" @tap="hidenToolBarHandler">
        <view v-if="showList">
          <block v-for="message in messages" :key="message.id">
            <message :message="message" ref="vMessages"></message>
          </block>
        </view>
      </scroll-view>
      <hr class="split_line" />
      <view class="inputer">
        <image class="voice" src="/static/pages/image/voice.png" @tap="voiceHandler"></image>
        <input v-if="!showvoice" @input="inputChangeHandler" class="input" type="text" confirm-type="send" @confirm="sendMessageHandler" :value="inputValue" />
        <view v-else class="recorder" @touchstart="startRecord" @touchend="stopRecord">
          <text>{{ recordTxt }}</text>
        </view>
        <image class="plus" src="/static/pages/image/more.png" @tap="showToolBarHandler"></image>
      </view>
    </view>
    <view v-if="showToolBar" class="toolbar">
      <view class="toolbar_item" @tap="selectPictureHandler">
        <image class="icon" src="/static/pages/image/toolbar/picture.png"></image>
        <text class="text">照片</text>
      </view>
      <view class="toolbar_item" @tap="selectTakePhotoHandler">
        <image class="icon" src="/static/pages/image/toolbar/camera.png"></image>
        <text class="text">拍照</text>
      </view>
      <view class="toolbar_item" @tap="selectLocationHandler">
        <image class="icon" src="/static/pages/image/toolbar/loc.png"></image>
        <text class="text">位置</text>
      </view>
      <view class="toolbar_item" @tap="selectFileHandler">
        <image class="icon" src="/static/pages/image/toolbar/file.png"></image>
        <text class="text">文件</text>
      </view>
      <view v-if="!isWeChat" class="toolbar_item" @tap="selectTakeVideoHandler">
        <image class="icon" src="/static/pages/image/toolbar/video.png"></image>
        <text class="text">小视频</text>
      </view>
      <view class="toolbar_item" @tap="selectVideoCallHandler">
        <image class="icon" src="/static/pages/image/toolbar/video_call.png"></image>
        <text class="text">视频通话</text>
      </view>
      <view class="toolbar_item" @tap="selectAudioCallHandler">
        <image class="icon" src="/static/pages/image/toolbar/audio_call.png"></image>
        <text class="text">语音通话</text>
      </view>
      <view class="toolbar_item"></view>
      <view v-if="isWeChat" class="toolbar_item"></view>
    </view>
  </view>
</template>

<script>
//index.js
//获取应用实例
import { toLong, toNumber } from '../../third/tools';
import message from './message/index';
var JSONBigString = require('json-bigint');

export default {
  data() {
    return {
      messages: [],
      uid: 0,
      queryHistoryMessageId: 0,
      queryingHistory: false,
      showList: true,
      scrolltop: -1,
      inputValue: '',
      showing: false,
      stitle: '',
      wh: 0,
      ww: 0,
      navHeight: 0,
      hisbtnHeight: 0,
      menuButtonWidth: 0,
      showvoice: false,
      showToolBar: false,
      recordTxt: '按下录音',
      startTime: 0,
      duration: 0,
      timer: null,
      recordFile: '',
      isWeChat: false,
      scrollTimer: null
    };
  },

  components: {
    message
  },
  props: {},
  onShow: function () {
    this.setData({
      showing: true
    });
  },
  onUnload: function () {
    this.setData({
      showing: false
    });

    const im = getApp().getIM();
    im &&
      im.off({
        onRosterMessage: this.receiveNewMessage,
        onRosterMessageContentAppend: this.receiveContentAppendedMessage,
        onRosterMessageReplace: this.receiveReplaceMessage,
        onReceiveHistoryMsg: this.receiveHistoryMsg,
        onMessageStatusChanged: this.onMessageStatusChanged,
        onSendingMessageStatusChanged: this.onSendingMessageStatusChanged
      });
  },
  onLoad: function (options) {
    let { uid, nick = '' } = options;
    this.setData({
      uid: uid - 0
    });

    const im = getApp().getIM();
    if (im) {
      const messages = im.rosterManage.getRosterMessageByRid(uid - 0);
      this.appendMessage({
        messages
      });
      setTimeout(() => {
        this.scroll();
      }, 500);
      im.on({
        onRosterMessage: this.receiveNewMessage,
        onRosterMessageContentAppend: this.receiveContentAppendedMessage,
        onRosterMessageReplace: this.receiveReplaceMessage,
        onReceiveHistoryMsg: this.receiveHistoryMsg,
        onMessageStatusChanged: this.onMessageStatusChanged,
        onSendingMessageStatusChanged: this.onSendingMessageStatusChanged
      });
    }

    /** 设置title */

    const umaps = im.rosterManage.getAllRosterDetail();
    let fromUserObj = umaps[uid] || { user_id: uid };
    if (uid == 0) fromUserObj.username = '系统通知';
    this.setData({
      stitle: nick || fromUserObj.nick_name || fromUserObj.username || fromUserObj.user_id
    });
    const wh = uni.getSystemInfoSync().windowHeight - this.navHeight - 70;
    this.setData({
      navHeight: getApp().getNavHeight() + 25,
      hisbtnHeight: getApp().getNavHeight(),
      showing: false,
      isWeChat: getApp().isWeChatEnvironment(),
      wh: uni.getSystemInfoSync().windowHeight - getApp().getNavHeight() - 95,
      ww: uni.getSystemInfoSync().windowWidth > 560 ? 90 : 180,
      menuButtonWidth: getApp().getMenuButtonWidth()
    });
  },
  methods: {
    onMessageStatusChanged: ({ mid }) => {
      console.log('Message status changed, mid: ', mid);
      //TODO: refresh page
    },
    onSendingMessageStatusChanged: ({ status, mid }) => {
      console.log('Sending Message status changed to ', status, ' mid: ', mid);
    },

    appendMessage: function (data) {
      const messages = data.messages || [];
      const newMessages = messages.filter((message) => {
        const { type, config, ext } = message;
        if (type === 'rtc' && config && config.action && config.action !== 'record') {
          return false;
        }
        if (ext) {
          const sext = JSON.parse(ext);
          if (type == 'rtc' && sext && sext.callId) {
            return false;
          }
        }
        return true;
      });

      const isHistory = data.history;
      if (isHistory) {
        this.queryHistoryMessageId = data.next;
      }
      const uid = getApp().getIM().userManage.getUid();
      const oldMessages = this.messages || [];

      let allMessages = [];
      let i = 0,
        j = 0;
      while (i < newMessages.length && j < oldMessages.length) {
        const newMeta = newMessages[i];
        if (this.checkTyping(newMeta)) {
          i++;
          continue;
        }
        const { from, to } = newMeta;
        const fromUid = toNumber(from);
        const toUid = toNumber(to);
        let saveUid = fromUid === uid ? toUid : fromUid;
        if (saveUid + '' !== this.uid + '') {
          return; // rosterchat, 必须有一个id是 sid
        }

        const oldMeta = oldMessages[j];
        const c = toLong(newMeta.id).comp(toLong(oldMeta.id));
        if (-1 === c) {
          allMessages.push(newMeta);
          i++;
        } else if (1 === c) {
          allMessages.push(oldMeta);
          j++;
        } else {
          //same id, which means message info updated
          allMessages.push(newMeta);
          i++;
          j++;
        }
      }

      if (i < newMessages.length) {
        allMessages = allMessages.concat(newMessages.slice(i, newMessages.length));
      }

      if (j < oldMessages.length) {
        allMessages = allMessages.concat(oldMessages.slice(j, oldMessages.length));
      }
      this.setData({
        messages: [].concat(allMessages)
      });
    },

    receiveNewMessage(message) {
      const im = getApp().getIM();
      if (!im) return;

      const uid = im.userManage.getUid();
      const to = message.to;
      const from = message.from;
      const pid = this.uid;

      if ((uid == to && from == pid) || (uid == from && to == pid)) {
        if (!this.checkTyping(message)) {
          // we might reload all messages because of message operations, which could be message deletion;
          // const smessages = im.rosterManage.getRosterMessageByRid(this.uid - 0);
          // console.log('Got: ', message);
          this.appendMessage({ messages: [message] });
          if (message.ext) {
            let ext = JSONBigString.parse(message.ext);
            if (ext && ext.ai && ext.ai.stream && !ext.ai.finish) {
              this.calculateScroll(message);
            } else {
              setTimeout(() => {
                this.scroll();
              }, 500);
            }
          } else {
            setTimeout(() => {
              this.scroll();
            }, 500);
          }
        }
      }

      if (this.showing && from !== uid) {
        //do not read message sent by oneself
        im.rosterManage.readRosterMessage(this.uid, message.id);
      }
    },

    calculateScroll(message, maxInterval = 0) {
      if (message.ext) {
        let ext = JSONBigString.parse(message.ext);
        if (ext && ext.ai && ext.ai.stream) {
          this.scrollTimer && clearInterval(this.scrollTimer);
          let count = ext.ai.stream_interval * 5;
          if (maxInterval > ext.ai.stream_interval) {
            count = maxInterval * 5;
          }
          if (count) {
            let that = this;
            let start = 0;
            let scrollTimer = setInterval(() => {
              that.scroll(start++);
              if (count-- <= 0) {
                clearInterval(that.scrollTimer);
                that.setData({
                  scrollTimer: null
                });
              }
            }, 200);
            this.setData({
              scrollTimer
            });
          }
        }
      }
    },

    receiveContentAppendedMessage(message) {
      if (this.$refs.vMessages) {
        let msg = this.$refs.vMessages.reverse().find((item) => item.message.id == message.id);
        if (msg) {
          msg.messageContentAppend(message);
          this.calculateScroll(message);
        }
      }
    },

    receiveReplaceMessage(message) {
      if (this.$refs.vMessages) {
        let msg = this.$refs.vMessages.reverse().find((item) => item.message.id == message.id);
        if (msg) {
          msg.messageReplace(message);
          setTimeout(() => {
            this.calculateScroll(message, msg.getLastSliceStreamTime());
          }, 200);
        }
      }
    },

    receiveHistoryMsg({ next }) {
      let that = this;
      this.setData({
        queryHistoryMessageId: next,
        queryingHistory: false,
        showList: false
      });
      this.$nextTick(() => {
        that.setData({
          showList: true
        });
      });
      setTimeout(() => {
        this.scroll();
      }, 500);
    },

    checkTyping(message) {
      const { ext } = message;

      let s = {};
      try {
        s = JSON.parse(ext);
      } catch (ex) {}
      if (typeof s.input_status !== 'undefined') {
        let status = s.input_status;

        if (status == 'nothing') {
          // this.header.querySelector(".typing").style.display = "none";
        } else {
          // this.header.querySelector(".typing").style.display = "inline";
          // this.header.querySelector(".typing").innerHTML = status + "...";
        }
        return true;
      }
      return false;
    },

    scroll(count = 0) {
      const scrolltop = this.messages.length * 10000 + count * 10;
      this.setData({
        scrolltop
      });
    },

    sendMessageHandler() {
      const content = this.inputValue;

      if (content) {
        getApp().getIM().sysManage.sendRosterMessage({
          content,
          uid: this.uid
          // ext: "自定义消息字段",
        });
        setTimeout(() => {
          this.setData({
            inputValue: ''
          });
        }, 400);
      }
    },

    inputChangeHandler(evt) {
      const inputValue = (evt.detail && evt.detail.value) || '';
      this.setData({
        inputValue
      });
    },

    backClick() {
      if (getCurrentPages().length > 1) {
        wx.navigateBack();
      } else {
        wx.switchTab({
          url: '/pages/contact/index'
        });
      }
    },

    goUserProfile() {
      uni.navigateTo({
        url: '/pages/profile/userinfo/index?uid=' + this.uid
      });
    },

    queryHistory() {
      const im = getApp().getIM();
      if (!im) return;

      let that = this;
      if (this.queryingHistory) {
        return;
      }

      this.setData({
        queryingHistory: true
      });

      setTimeout(() => {
        that.setData({
          queryingHistory: false
        });
      }, 10000);

      // Query historys older than the message with id:mid, 0 means from the last message;
      const mid = this.queryHistoryMessageId;
      const amount = 20; // Batch size of one time history message query.
      im.sysManage.requireHistoryMessage(this.uid, mid, amount);
    },

    deleteConversation() {
      let that = this;
      uni.showModal({
        title: '删除会话',
        content: '确定删除本地会话',
        success: function (res) {
          if (res.confirm) {
            const also_delete_other_devices = true;
            getApp().getIM().sysManage.deleteConversation(that.uid, also_delete_other_devices);
            that.backClick();
          } else if (res.cancel) {
            // do nothing here.
          }
        }
      });
    },

    hidenToolBarHandler() {
      this.setData({
        wh: this.showToolBar ? this.wh + this.ww : this.wh,
        showToolBar: false
      });
    },

    voiceHandler() {
      this.setData({
        showvoice: !this.showvoice,
        wh: this.showToolBar ? this.wh + this.ww : this.wh,
        showToolBar: false
      });
    },

    showToolBarHandler() {
      this.setData({
        showToolBar: !this.showToolBar,
        showvoice: !this.showvoice,
        wh: this.showToolBar ? this.wh + this.ww : this.wh - this.ww
      });
    },

    selectPictureHandler() {
      const that = this;
      let func = this.isWeChat ? uni.chooseMedia : uni.chooseImage;
      func({
        count: 9, //默认9
        mediaType: ['mix'],
        sourceType: ['album'],
        sizeType: ['original', 'compressed'],
        success(res) {
          const files = res.tempFiles;
          files.forEach((element) => {
            that.fileChangeHandler(element, element.fileType ? element.fileType : 'image');
          });
        }
      });
    },

    selectTakePhotoHandler() {
      const that = this;
      let func = this.isWeChat ? uni.chooseMedia : uni.chooseImage;
      func({
        count: 1,
        mediaType: ['mix'],
        sourceType: ['camera'],
        sizeType: ['original', 'compressed'],
        camera: 'back',
        success(res) {
          const file = res.tempFiles[0];
          that.fileChangeHandler(file, file.fileType ? file.fileType : 'image');
        }
      });
    },

    selectTakeVideoHandler() {
      const that = this;
      let func = this.isWeChat ? uni.chooseMedia : uni.chooseVideo;
      func({
        count: 1,
        mediaType: ['video'],
        sourceType: ['camera'],
        camera: 'back',
        success(res) {
          if (that.isWeChat) {
            const file = res.tempFiles[0];
            that.fileChangeHandler(file, 'video');
          } else {
            that.fileChangeHandler(res, 'video');
          }
        }
      });
    },

    selectLocationHandler() {
      const that = this;
      uni.getLocation({
        type: 'wgs84',
        success(res) {
          const im = getApp().getIM();
          im.sysManage.sendRosterMessage({
            uid: that.uid,
            type: 'location',
            content: '',
            attachment: {
              lat: res.latitude,
              lon: res.longitude,
              addr: '当前位置经度:' + res.longitude + ',纬度 :' + res.latitude
            }
          });
        }
      });
    },

    selectFileHandler() {
      const that = this;
      let func = this.isWeChat ? uni.chooseMessageFile : uni.chooseFile;
      func({
        count: 1,
        extension: ['.*'],
        success(res) {
          const file = res.tempFiles[0];
          that.fileChangeHandler(file, 'file');
        }
      });
    },

    selectVideoCallHandler() {
      if (!this.isWeChat) {
        uni.navigateTo({
          url: '/pages_chat/roster/videocall/index?uid=' + this.uid
        });
      }
    },

    selectAudioCallHandler() {
      if (!this.isWeChat) {
        uni.navigateTo({
          url: '/pages_chat/roster/audiocall/index?uid=' + this.uid
        });
      }
    },

    fileChangeHandler(file, type) {
      const that = this;
      const im = getApp().getIM();
      im.sysManage
        .asyncFileUpload({
          file: file.tempFilePath ? file.tempFilePath : file.path,
          to_id: this.uid,
          fileType: type,
          toType: 'chat',
          chatType: 'roster'
        })
        .then((res) => {
          console.log('文件操作上传成功');
          that.sendFileMessage(file, type, res.url);
        })
        .catch((err) => {
          console.log('文件发送失败：' + err);
        });
    },

    sendFileMessage(file, type, url) {
      const im = getApp().getIM();
      const fileInfo = {
        dName: file.name ? file.name : 'file',
        fLen: file.size,
        url,
        width: file.width ? file.width : 0,
        height: file.height ? file.height : 0
      };
      if (type === 'video') {
        fileInfo.tUrl = url + '&image_type=3';
      }
      im.sysManage.sendRosterMessage({
        type: type,
        uid: this.uid,
        content: '',
        attachment: fileInfo
      });
    },

    startRecord() {
      if (!this.isWeChat) {
        return;
      }

      uni.authorize({
        scope: 'scope.record',
        success: function () {
          console.log('录音授权成功');
        },
        fail: function () {
          console.log('录音授权失败');
        }
      });
      var that = this;
      const recorderManager = uni.getRecorderManager();
      recorderManager.onError((res) => {
        console.log('录音错误: ', res);
      });
      recorderManager.onStop(function (res) {
        that.setData({
          recordFile: res.tempFilePath,
          duration: Math.ceil((new Date().getTime() - that.startTime) / 1000)
        });
        console.log('录音完成: ', that.recordFile);
        that.uploadVoice(that.recordFile);
      });
      const options = {
        sampleRate: 44100,
        numberOfChannels: 1,
        encodeBitRate: 192000,
        format: 'mp3'
      };
      recorderManager.start(options);
      this.setData({
        startTime: new Date().getTime(),
        recordTxt: '录音中'
      });
      const timer = setTimeout(() => {
        this.stopRecord();
      }, 30000);
      this.setData({
        timer
      });
    },

    stopRecord() {
      if (!this.isWeChat) {
        return;
      }

      if (this.timer) {
        clearTimeout(this.timer);
        this.setData({
          timer: null
        });
      }

      const recorderManager = uni.getRecorderManager();
      recorderManager.stop();
      this.setData({
        recordTxt: '按下录音'
      });
    },

    uploadVoice(path) {
      const that = this;
      const im = getApp().getIM();
      im.sysManage
        .asyncFileUpload({
          file: path,
          to_id: this.uid,
          fileType: 'audio-mp3',
          toType: 'chat',
          chatType: 'roster'
        })
        .then((res) => {
          console.log('录音上传成功');
          that.sendVoiceMessage(res.url);
        })
        .catch((err) => {
          console.log('录音发送失败：' + err);
        });
    },

    sendVoiceMessage(url) {
      const im = getApp().getIM();
      const fileInfo = {
        dName: 'file',
        url,
        duration: this.duration
      };
      im.sysManage.sendRosterMessage({
        type: 'audio',
        uid: this.uid,
        content: '',
        attachment: fileInfo
      });
    }
  }
};
</script>
<style>
@import './index.css';
</style>
