<template>
  <!--index.wxml-->
  <view>
    <view class="time">
      <text>{{ time }}</text>
    </view>
    <view class="container">
      <view :class="cls">
        <view class="rosterInfo">
          <image class="avatar" :src="avatar"></image>
          <text class="username">{{ username }}</text>
        </view>
        <view class="contentFrame">
          <view class="c_content">
            <text v-if="type == 'text'">{{ content }}</text>
            <image class="cimage" v-if="type == 'image'" :src="attachImage"></image>
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
      attachImage: '',
      messageType: 0,
      time: '',
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
    const cls = uid == from ? 'messageFrame self' : 'messageFrame roster';
    const type = message.type;
    const toType = message.toType;
    let content = message.content || '';
    let attachImage = '';
    let username = '';
    const umaps = im.rosterManage.getAllRosterDetail();
    const fromUserObj = umaps[from] || {};
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

    let { timestamp } = message;
    timestamp = toNumber(timestamp);
    let time = moment(timestamp).calendar('', {
      sameDay: '[今天] HH:mm',
      lastDay: '[昨天] HH:mm',
      sameElse: 'YYYY-MM-DD HH:mm'
    });
    this.setData({
      cls,
      username,
      avatar,
      type,
      toType,
      content,
      attachImage: url,
      time
    });
  },
  methods: {}
};
</script>
<style>
@import './index.css';
</style>
