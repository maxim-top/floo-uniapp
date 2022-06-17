<template>
  <view>
    <snav :title="stitle">
      <view class="back" @tap.stop="backClick">
        <image class="back_kmg" src="/static/pages/image/back.png"></image>
      </view>
      <view class="history_button" @click="queryHistory()">查看历史</view>
      <view class="delete_button" @click="deleteConversation()">删除会话</view>
    </snav>
    <view class="container" :style="'padding-top:' + navHeight + 'px'">
      <scroll-view class="contentcontainer" :style="'height:' + wh + 'px'" scroll-y :scroll-top="scrolltop">
        <block v-for="(message, index) in messages" :key="index">
          <message :message="message"></message>
        </block>
      </scroll-view>
      <view class="inputer">
        <image class="voice" src="/static/pages/image/voice.png" @tap="voiceHandler"></image>
        <input
          v-if="!showvoice"
          @input="inputChangeHandler"
          placeholder="type a message!"
          class="input"
          type="text"
          confirm-type="send"
          @confirm="sendMessageHandler"
          :value="inputValue"
        />
        <view v-else class="recorder" @touchstart="startRecord" @touchend="stopRecord">
          <text>{{ recordTxt }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
//index.js
//获取应用实例
import { toLong, toNumber } from '../../third/tools';
import message from './message/index';

export default {
  data() {
    return {
      messages: [],
      uid: 0,
      queryHistoryMessageId: 0,
      scrolltop: -1,
      inputValue: '',
      showing: false,
      stitle: '',
      wh: 0,
      navHeight: 0,
      showvoice: false,
      recordTxt: '按下录音',
      startTime: 0,
      duration: 0,
      timer: null,
      recordFile: ''
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
        onReceiveHistoryMsg: this.receiveHistoryMsg,
        onMessageStatusChanged: this.onMessageStatusChanged,
        onSendingMessageStatusChanged: this.onSendingMessageStatusChanged
      });
  },
  onLoad: function (options) {
    this.setData({
      navHeight: getApp().getNavHeight(),
      showing: false
    });

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
    const wh = wx.getSystemInfoSync().windowHeight - this.navHeight - 70;
    this.setData({
      wh
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
      const newMessages = data.messages || [];
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
        if (newMeta.ext && newMeta.ext.input_status) {
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
          console.log('Got: ', message);
          this.appendMessage({ messages: [message] });
          this.scroll();
        }
      }

      if (this.showing && from !== uid) {
        //do not read message sent by oneself
        im.rosterManage.readRosterMessage(this.uid, message.id);
      }
    },

    receiveHistoryMsg({ next }) {
      this.setData({ queryHistoryMessageId: next });
      this.scroll();
    },

    checkTyping(message) {
      const { ext = {} } = message;

      if (typeof ext.input_status !== 'undefined') {
        let status = ext.input_status;

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

    scroll() {
      const scrolltop = this.messages.length * 1000;
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

    queryHistory() {
      const im = getApp().getIM();
      if (!im) return;

      // Query historys older than the message with id:mid, 0 means from the last message;
      const mid = this.queryHistoryMessageId;
      const amount = 20; // Batch size of one time history message query.
      im.sysManage.requireHistoryMessage(this.uid, mid, amount);
    },

    deleteConversation() {
      const also_delete_other_devices = true;
      getApp().getIM().sysManage.deleteConversation(this.uid, also_delete_other_devices);
      this.backClick();
    },

    voiceHandler() {
      this.setData({
        showvoice: !this.showvoice
      });
    },

    startRecord() {
      wx.authorize({
        scope: 'scope.record',
        success: function () {
          console.log('录音授权成功');
        },
        fail: function () {
          console.log('录音授权失败');
        }
      });
      var that = this;
      const recorderManager = wx.getRecorderManager();
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
      if (this.timer) {
        clearTimeout(this.timer);
        this.setData({
          timer: null
        });
      }

      const recorderManager = wx.getRecorderManager();
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
