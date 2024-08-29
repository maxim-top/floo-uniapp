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
        <view class="rosterContent">
          <view class="name_frame" v-if="cls == 'roster'">
            <text>{{ username }}</text>
          </view>
          <view class="c_content_all">
            <view class="c_content">
              <view v-if="type == 'text'" @longpress="copyText">
                <view v-if="showMarkdown">
                  <mp-html :content="showMarkdownContent" :tag-style="tagStyle" />
                </view>
                <view v-else>
                  {{ showContent }}
                </view>
                <text class="c_content_ext" v-if="showExt">ext: {{ ext }}</text>
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
              <!-- <audio name="音频文件" wx:if="{{type == 'image'}}" author="" src="{{audio}}" class="saudio" controls></audio> -->
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
  </view>
</template>

<script>
//index.js
//获取应用实例
import { toNumber, numToString } from '../../../third/tools';
import moment from '../../../third/moment';
import { Marked } from '../../../third/marked.min.js';
import hljs from 'highlight.js';
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
      addHlgs: false,
      markContent: '',

      showContent: '',
      appendContent: '',
      appendTimer: null,
      lastSliceStreamTime: 0,

      showMarkdownContent: '',
      showTotalContent: '',
      showAppendContent: '',
      appendMarkdownTimer: null,
      lastMarkdownSliceStreamTime: 0,

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
    const im = getApp().getIM(); //FIXME: check im undefined
    const uid = im.userManage.getUid();
    const from = message.from;
    const cls = uid == from ? 'self' : 'roster';
    const id = message.id;
    let videoContext = null;
    const type = message.type;
    const toType = message.toType;
    let content = message.content || '';
    let ext = message.ext || '';
    let addr = '';
    let fileName = '';
    const fromUserObj = im.rosterManage.getRosterInfo(from);

    let avatar = im.sysManage.getImage({
      avatar: fromUserObj.avatar,
      sdefault: '/static/pages/image/r_b.png'
    });

    let username = '';
    let members = im.groupManage.getGroupMembers(message.to);
    for (let i = 0; i < members.length; i++) {
      if (members[i].user_id === toNumber(from)) {
        username = members[i].display_name;
        break;
      }
    }
    if (username === '') {
      username = fromUserObj.nick_name || fromUserObj.username || '';
    }
    if (from == uid) {
      username = '我自己';
    }

    const attach = message.attach || {};
    let url = attach.url || '';

    if (type === 'location') {
      addr = attach.addr;
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
    const fromUid = toNumber(message.from);
    const uid = im.userManage.getUid();
    if (fromUid !== uid && message.status !== 2) {
      im.groupManage.readGroupMessage(fromUid, this.message.id);
    }

    if (this.type == 'text') {
      this.calculateContent(this.message.content);
    }

    if (this.message.ext && this.message.ext.length && this.isAIStreamFinish(this.message.ext)) {
      if (this.showMarkdown) {
        this.calculateMarkdownAppend(this.message.content, this.message.ext);
      }
      this.setData({
        appendContent: this.content
      });
      this.calculateAppend(this.content, this.message.ext);
    } else {
      this.setData({
        showMarkdownContent: this.markContent,
        showContent: this.message.content
      });
    }
  },
  methods: {
    copyText: function () {
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

    goUserProfile() {
      if (this.cls == 'roster') {
        wx.navigateTo({
          url: '/pages/profile/userinfo/index?uid=' + this.from
        });
      }
    }, ////

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

    parseMarkdownContent(content) {
      let that = this;
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
      let newContent = marked.parse(content);
      if (this.addHlgs) {
        newContent = newContent.replaceAll('<code', '<code class="hljs"');
      } else {
        newContent = newContent.replaceAll('<pre><code', '<pre><code class="hljs"');
      }
      return newContent;
    },

    calculateContent(content) {
      let isMarkdown = this.isMarkdownFormat(content);
      if (isMarkdown) {
        this.setData({
          markContent: this.parseMarkdownContent(content),
          showAppendContent: content,
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
      if (ext && ext.ai && ext.ai.stream && ext.ai.stream_interval) {
        this.appendTimer && clearInterval(this.appendTimer);
        //每一次计时周期增加一个字符展示。
        let count = 1;
        let period = (ext.ai.stream_interval * 1000) / this.appendContent.length;
        if (period < 40) {
          period = 40;
          if (showAll && period * this.showAppendContent.length > 20000) {
            count = Math.ceil(this.showAppendContent.length / 500);
          }
        }
        if (showAll) {
          this.setData({
            lastSliceStreamTime: Math.ceil((period * this.showAppendContent.length) / (1000 * count))
          });
        }
        let that = this;
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
            let append = that.appendContent.slice(0, count);
            let remain = that.appendContent.slice(count);
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
      if (ext && ext.ai && ext.ai.stream && ext.ai.stream_interval) {
        this.appendMarkdownTimer && clearInterval(this.appendMarkdownTimer);
        //每一次计时周期增加一个字符展示。
        let count = 1;
        let period = (ext.ai.stream_interval * 1000) / this.showAppendContent.length;
        if (period < 40) {
          period = 40;
          if (showAll && period * this.showAppendContent.length > 20000) {
            count = Math.ceil(this.showAppendContent.length / 500);
          }
        }
        if (showAll) {
          this.setData({
            lastMarkdownSliceStreamTime: Math.ceil((period * this.showAppendContent.length) / (1000 * count))
          });
        }
        let that = this;
        let appendMarkdownTimer = setInterval(() => {
          if (that.showAppendContent.length <= 0) {
            clearInterval(that.appendMarkdownTimer);
            that.setData({
              appendMarkdownTimer: null,
              showMarkdownContent: that.parseMarkdownContent(that.showTotalContent),
              showContent: showAll ? that.content : that.showContent,
              ext: showAll ? extension : that.ext
            });
          } else {
            let append = that.showAppendContent.slice(0, count);
            let remain = that.showAppendContent.slice(count);
            that.setData({
              showMarkdownContent: that.parseMarkdownContent(that.showTotalContent + append),
              showTotalContent: that.showTotalContent + append,
              showAppendContent: remain
            });
          }
        }, period);
        this.setData({
          appendMarkdownTimer
        });
      } else {
        this.setData({
          showMarkdownContent: this.markContent
        });
      }
    },

    getLastSliceStreamTime() {
      return Math.max(this.lastSliceStreamTime, this.lastMarkdownSliceStreamTime);
    },

    messageContentAppend(message) {
      let oldFlag = this.isMarkdown;
      this.calculateContent(message.content);
      if (false == oldFlag && true == this.isMarkdown) {
        this.setData({
          showTotalContent: this.showContent,
          showMarkdownContent: this.parseMarkdownContent(this.showContent)
        });
      }
      if (message.ext && message.ext.length && this.isAIStream(message.ext)) {
        if (this.isMarkdown) {
          this.setData({
            showAppendContent: message.content.slice(this.showTotalContent.length)
          });
          this.calculateMarkdownAppend(message.content, message.ext);
        }
        this.setData({
          appendContent: message.content.slice(this.showContent.length)
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
      let oldFlag = this.isMarkdown;
      this.calculateContent(message.content);
      if (false == oldFlag && true == this.isMarkdown) {
        this.setData({
          showTotalContent: this.showContent,
          showMarkdownContent: this.parseMarkdownContent(this.showContent)
        });
      }
      if (message.ext && message.ext.length && this.isAIStream(message.ext)) {
        if (this.isMarkdown) {
          this.setData({
            showAppendContent: message.content.slice(this.showTotalContent.length)
          });
          this.calculateMarkdownAppend(message.content, message.ext, true);
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
