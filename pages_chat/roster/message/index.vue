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
        <view class="c_content_all">
          <view class="c_content">
            <view v-if="type == 'text'" @longpress="coptText">
              <view v-if="showMarkdown">
                <mp-html :content="showMarkdownContent" :tag-style="tagStyle" />
              </view>
              <view v-else>
                {{ showContent }}
              </view>
              <text class="c_content_ext" v-if="showExt">ext: {{ ext }}</text>
            </view>
            <view v-if="type == 'rtc'">
              {{ showRTCContent }}
            </view>
            <view class="file_frame" v-if="type == 'file'" @tap="touchFile">
              <image class="file" src="/static/pages/image/file.png"></image>
              <text class="file_name">{{ fileName }}</text>
            </view>
            <image class="cimage" v-if="type == 'image'" :src="attachImage" @tap="touchImage" :show-menu-by-longpress="true"></image>
            <video
              class="cimage"
              v-if="type == 'video'"
              :src="video"
              :id="id"
              :controls="showBar"
              @tap="touchVideo"
              @play="playVideo"
              @ended="endPlay"
              @fullscreenchange="fullScreenChange"
            ></video>
            <!-- <audio name="音频文件" wx:if="{{type == 'audio'}}" author="" src="{{audio}}" class="saudio" controls></audio>"   -->
            <view class="voice_frmae" v-if="type == 'audio'" @tap="splayAudio">
              <image class="voice" v-if="playing == false" src="/static/pages/image/voice/stop.png"></image>
              <image class="voice" v-if="playing == true" src="/static/pages/image/voice/start.png"></image>
              <text class="voice_duration">'{{ attach.duration }}</text>
            </view>
            <view class="location_frame" v-if="type == 'location'">
              <image class="location" src="/static/pages/image/loc.png"></image>
              <text class="location_content">{{ addr }}</text>
            </view>
          </view>
          <view class="c_content_more" v-if="type == 'text'" :style="{ 'margin-left': isWeChat ? '10rpx' : '0px' }">
            <text class="c_ext_title" v-if="isMarkdown" @tap="changeShowMarkdownFormat">{{ showMarkdownTitle }}</text>
            <text class="c_ext_title" v-if="ext" @tap="changeShowExt">{{ showExtTitle }}</text>
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
import { Marked } from '../../../third/marked.min.js';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-light.css';
import { markedHighlight } from 'marked-highlight';
var JSONBigString = require('json-bigint');

export default {
  data() {
    return {
      cls: '',
      username: '',
      avatar: '',
      audio: '',
      contentType: 0,
      content: '',
      ext: '',
      addr: '',
      fileName: '',
      file: '',
      attachImage: '',
      videoCover: '',
      video: '',
      videoContext: null,
      playingVideo: false,
      fullScreen: false,
      fullScreenPadding: false,
      showBar: false,
      id: '',
      messageType: 0,
      time: '',
      playing: false,
      from: '',
      attach: '',
      type: '',
      toType: '',
      isWeChat: false,

      showExt: false,
      showExtTitle: ' 显示扩展 ',
      showMarkdownTitle: ' 显示原文 ',
      isMarkdown: false,
      showMarkdown: false,
      hasMarked: false,
      marked: null,
      addHlgs: false,
      markContent: '',

      showRTCContent: '',
      showContent: '',
      appendContent: '',
      appendTimer: null,

      showMarkdownContent: '',
      appendMarkdownContent: '',
      appendMarkdownTimer: null,

      tagStyle: {
        h1: 'line-height: normal; margin-block-start: 0.67em; margin-block-end: 0.67em;',
        h2: 'line-height: normal; margin-block-start: 0.83em; margin-block-end: 0.83em;',
        h3: 'line-height: normal; margin-block-start: 1em; margin-block-end: 1em;',
        h4: 'line-height: normal; margin-block-start: 1.33em; margin-block-end: 1.33em;',
        h5: 'line-height: normal; margin-block-start: 1.67em; margin-block-end: 1.67em;',
        h6: 'line-height: normal; margin-block-start: 2.33em; margin-block-end: 2.33em;',
        table: 'border: 1px solid gray; display: block; overflow-x: auto; border-collapse: collapse;',
        th: 'border: 1px solid gray; padding-left: 5px; padding-right: 5px; min-width: 50px;',
        td: 'border: 1px solid gray; padding-left: 5px; padding-right: 5px; min-width: 50px;'
      }
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
    const im = getApp().getIM(); // FIXME: check im undefined
    const uid = im.userManage.getUid();
    const from = message.from;
    const cls = uid == from ? 'self' : 'roster';
    const id = message.id;
    let videoContext = null;
    const type = message.type;
    const toType = message.toType;
    let content = message.content || '';
    let showRTCContent = '';
    let ext = message.ext || '';
    let addr = '';
    let fileName = '';
    let username = '';
    const fromUserObj = im.rosterManage.getRosterInfo(from);

    if (from == 0) {
      // system message
      fromUserObj.username = '系统通知';
      fromUserObj.avatar = '/static/pages/image/tab/setting.png';
    }

    let avatar = im.sysManage.getImage({
      avatar: fromUserObj.avatar,
      sdefault: '/static/pages/image/r_b.png'
    });
    username = fromUserObj.nick_name || fromUserObj.username || '';

    if (from == uid) {
      username = '我';
    }

    const attach = message.attach || {};
    let url = attach.url || '';

    if (type === 'location') {
      addr = attach.addr;
    }

    if (type === 'rtc') {
      showRTCContent = message.content;
    }

    if (url && type === 'file') {
      fileName = attach.dName || 'file';
      url = im.sysManage.getChatFile({ url });
    }

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
      videoContext = uni.createVideoContext(id, this);
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
      showRTCContent,
      ext,
      addr,
      file: url,
      fileName,
      attachImage: url,
      videoCover,
      video: url,
      videoContext,
      id,
      time,
      from,
      isWeChat: getApp().isWeChatEnvironment()
    });
  },

  mounted: function () {
    const im = getApp().getIM();
    const message = this.message;

    // Message displayed as read
    const uid = im.userManage.getUid();
    const fromUid = toNumber(this.message.from);
    if (fromUid !== uid && message.status !== 2) {
      //do not read message sent by oneself
      im.rosterManage.readRosterMessage(fromUid, message.id);
    }

    if (this.type == 'text') {
      this.calculateContent(this.message.content);
    }

    if (this.message.ext && this.message.ext.length && this.isAIStreamFinish(this.message.ext)) {
      if (this.showMarkdown) {
        this.setData({
          appendMarkdownContent: this.markContent
        });
        this.calculateMarkdownAppend(this.markContent, this.message.ext, true);
      }
      this.setData({
        appendContent: this.content
      });
      this.calculateAppend(this.content, this.message.ext, true);
    } else {
      this.setData({
        showMarkdownContent: this.markContent,
        showContent: this.message.content
      });
    }
  },
  methods: {
    coptText: function () {
      uni.setClipboardData({
        data: this.content,
        success() {
          uni.showToast({
            title: '已复制到剪切板',
            position: 'top'
          });
        }
      });
    },

    splayAudio: function () {
      const innerAudioContext = wx.createInnerAudioContext(); // innerAudioContext.autoplay = true

      innerAudioContext.obeyMuteSwitch = false;
      innerAudioContext.loop = false;
      innerAudioContext.src = this.audio;
      console.log('Play audio: ', this.audio);
      this.setData({
        playing: true
      });
      innerAudioContext.onPlay(() => {
        setTimeout(() => {
          innerAudioContext.stop();
        }, (this.attach.duration + 3) * 1000);
      });
      innerAudioContext.onError((res) => {
        console.error("Can't play audio due to ", res);
        console.error('Play audio error: ', this.audio);
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

    touchFile() {
      let url = this.file;
      const im = getApp().getIM();
      im.sysManage
        .downloadChatFile({ url })
        .then((res) => {
          uni.openDocument({
            filePath: res,
            showMenu: true,
            success: function () {
              console.log('文件打开成功！');
            },
            fail: function (res) {
              let title = '文件打开失败！';
              if (res.errno == 1300301) {
                title = '文件格式不支持，打开失败！';
              }
              uni.showToast({
                title
              });
            }
          });
        })
        .catch((err) => {
          console.log('文件下载失败：' + err);
        });
    },

    touchImage() {
      const message = this.message;
      const im = getApp().getIM();
      const attach = message.attach || {};
      let url = attach.url || '';
      url = im.sysManage.getImage({
        avatar: url,
        thumbnail: false
      });
      uni.previewImage({
        current: url,
        urls: [url]
      });
    },

    touchVideo() {
      if (this.fullScreenPadding === false) {
        if (this.fullScreen === false) {
          this.videoContext.requestFullScreen();
          this.videoContext.play();
        } else {
          if (this.playingVideo) {
          } else {
            this.videoContext.play();
          }
        }
      }
    },

    playVideo() {
      this.setData({
        playingVideo: true
      });
    },

    endPlay() {
      this.setData({
        playingVideo: false
      });
    },

    fullScreenChange(event) {
      this.setData({
        fullScreenPadding: true
      });
      if (event.detail.fullScreen) {
        this.setData({
          fullScreen: true,
          showBar: true
        });
      } else {
        this.videoContext.stop();
        this.setData({
          fullScreen: false,
          showBar: false,
          playingVideo: false,
          type: 'video_padding'
        });
        setTimeout(() => {
          this.setData({
            type: 'video'
          });
        }, 50);
      }
      setTimeout(() => {
        this.setData({
          fullScreenPadding: false
        });
      }, 100);
    },

    messageStatus() {
      const im = getApp().getIM();

      const fromUid = toNumber(this.message.from);
      const toUid = toNumber(this.message.to);
      const uid = im.userManage.getUid();
      const cid = fromUid === uid ? toUid : fromUid;

      // status will be unread / delivered / read
      return im.sysManage.getMessageStatus(cid, this.message.id);
    },

    goUserProfile() {
      if (this.cls == 'roster') {
        wx.navigateTo({
          url: '/pages/profile/userinfo/index?uid=' + this.from
        });
      }
    },

    /* eslint-disable no-useless-escape */
    isMarkdownFormat(str) {
      const regex = /^\s*(\#+|\*|\-|\d+\.)\s+.+|\!\[.*\]\(.*\)|\`{3}[\w\W]*?\`{3}/gm;
      if (!regex.test(str)) {
        const hasTitle = /^\s*\#+\s+.+$/gm.test(str);
        const hasLink = /\[.*\]\(.*\)/gm.test(str);
        const hasItalic = /(\*|_).*?(\*|_)/gm.test(str);
        const hasImage = /\!\[.*\]\(.*\)/gm.test(str);
        const hasbold = /(\*\*|__)(.*?)(\*\*|__)/gm.test(str);
        const hasStrikethrough = /~~.*?~~/gm.test(str);
        const hasBlockquote = /^\s*>+.*/gm.test(str);
        const hasInlineCodeBlock = /`.*?`/gm.test(str);
        const hasPartingLine = /^(\*\*\*|---|___)$/gm.test(str);
        const hasUnorderedList = /^(\s*[-+*]\s+.+\n?)+/gm.test(str);
        const hasOrderedList = /^(\s*\d+\.\s+.+\n?)+/gm.test(str);
        return (
          hasLink || hasTitle || hasItalic || hasImage || hasbold || hasStrikethrough || hasBlockquote || hasInlineCodeBlock || hasPartingLine || hasUnorderedList || hasOrderedList
        );
      } else {
        return true;
      }
    },

    hasCodeBlock(str) {
      return /`.*?`/gm.test(str);
    },

    changeShowMarkdownFormat() {
      this.setData({
        showMarkdown: !this.showMarkdown,
        showMarkdownTitle: this.showMarkdown ? ' 解析格式 ' : ' 显示原文 '
      });
    },

    changeShowExt() {
      this.setData({
        showExt: !this.showExt,
        showExtTitle: this.showExt ? ' 扩展信息 ' : ' 隐藏扩展 '
      });
    },

    calculateContent(content) {
      let that = this;
      let isMarkdown = this.isMarkdownFormat(content);
      if (isMarkdown) {
        let marked = null;
        let hasCode = this.hasCodeBlock(content);
        if (hasCode) {
          marked = new Marked(
            markedHighlight({
              langPrefix: 'hljs language-',
              highlight(code, lang) {
                let language = hljs.getLanguage(lang) ? lang : 'plaintext';
                if (language === 'plaintext') {
                  that.setData({
                    addHlgs: true
                  });
                  return hljs.highlightAuto(code).value;
                }
                return hljs.highlight(code, { language }).value;
              }
            })
          );
        } else {
          marked = new Marked();
        }
        if (this.hasMarked) {
          let newContent = marked.parse(content);
          if (this.addHlgs) {
            newContent = newContent.replaceAll('<code', '<code class="hljs"');
          } else {
            newContent = newContent.replaceAll('<pre><code', '<pre><code class="hljs"');
          }
          this.setData({
            appendMarkdownContent: newContent.slice(this.markContent.length),
            markContent: newContent
          });
        } else {
          let markContent = marked.parse(content);
          if (this.addHlgs) {
            markContent = markContent.replaceAll('<code', '<code class="hljs"');
          } else {
            markContent = markContent.replaceAll('<pre><code', '<pre><code class="hljs"');
          }
          this.setData({
            markContent,
            hasMarked: true
          });
        }
        this.setData({
          showMarkdown: true
        });
      }
      this.setData({
        isMarkdown: isMarkdown,
        content: content
      });
    },

    isAIStream(extension) {
      let ext = JSONBigString.parse(extension);
      if (ext && ext.ai && ext.ai.stream) {
        return true;
      } else {
        return false;
      }
    },

    isAIStreamFinish(extension) {
      let ext = JSONBigString.parse(extension);
      if (ext && ext.ai && ext.ai.stream && !ext.ai.finish) {
        return true;
      } else {
        return false;
      }
    },

    calculateAppend(content, extension, showAll = false) {
      let ext = JSONBigString.parse(extension);
      let that = this;
      if (ext && ext.ai && ext.ai.stream && ext.ai.stream_interval) {
        this.appendTimer && clearInterval(this.appendTimer);
        //每一次计时周期增加两个字符展示。
        let period = (ext.ai.stream_interval * 1000) / (this.appendContent.length / 2);
        let appendTimer = setInterval(() => {
          if (that.appendContent.length <= 0) {
            clearInterval(that.appendTimer);
            that.setData({
              appendTimer: null,
              showContent: content,
              showMarkdownContent: showAll ? that.markContent : that.showMarkdownContent,
              ext: showAll ? extension : that.ext
            });
          } else {
            let append = that.appendContent.slice(0, 2);
            let remain = that.appendContent.slice(2);
            that.setData({
              showContent: that.showContent + append,
              appendContent: remain
            });
          }
        }, period);
        this.setData({
          appendTimer
        });
      } else {
        this.setData({
          showContent: content
        });
      }
    },

    calculateMarkdownAppend(markContent, extension, showAll = false) {
      let ext = JSONBigString.parse(extension);
      let that = this;
      if (ext && ext.ai && ext.ai.stream && ext.ai.stream_interval) {
        this.appendMarkdownTimer && clearInterval(this.appendMarkdownTimer);
        //每一次计时周期增加两个字符展示。
        let period = (ext.ai.stream_interval * 1000) / (this.appendMarkdownContent.length / 2);
        let appendMarkdownTimer = setInterval(() => {
          if (that.appendMarkdownContent.length <= 0) {
            clearInterval(that.appendMarkdownTimer);
            that.setData({
              appendMarkdownTimer: null,
              showMarkdownContent: markContent,
              showContent: showAll ? that.content : that.showContent,
              ext: showAll ? extension : that.ext
            });
          } else {
            let append = that.appendMarkdownContent.slice(0, 2);
            let remain = that.appendMarkdownContent.slice(2);
            that.setData({
              showMarkdownContent: that.showMarkdownContent + append,
              appendMarkdownContent: remain
            });
          }
        }, period);
        this.setData({
          appendMarkdownTimer
        });
      } else {
        this.setData({
          showMarkdownContent: markContent
        });
      }
    },

    messageContentAppend(message) {
      this.calculateContent(message.content);
      if (message.ext && message.ext.length && this.isAIStream(message.ext)) {
        if (this.isMarkdown) {
          this.calculateMarkdownAppend(this.markContent, message.ext);
        }
        this.setData({
          appendContent: this.appendContent + message.appendedContent
        });
        this.calculateAppend(message.content, message.ext);
      } else {
        this.setData({
          showMarkdownContent: this.isMarkdown ? this.markContent : this.showMarkdownContent,
          showContent: this.content
        });
      }
    },

    messageReplace(message) {
      this.calculateContent(message.content);
      if (message.ext && message.ext.length && this.isAIStream(message.ext)) {
        if (this.isMarkdown) {
          this.calculateMarkdownAppend(this.markContent, message.ext, true);
        }
        this.setData({
          appendContent: message.content.slice(this.showContent.length)
        });
        this.calculateAppend(message.content, message.ext, true);
      } else {
        this.setData({
          showMarkdownContent: this.isMarkdown ? this.markContent : this.showMarkdownContent,
          showContent: this.content
        });
      }
    }
  }
};
</script>
<style>
@import './index.css';
</style>
