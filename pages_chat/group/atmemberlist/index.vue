<template>
  <view>
    <snav title="@群成员列表">
      <view class="back" @tap.stop="backClick">
        <image class="back_kmg" src="/static/pages/image/back.png"></image>
      </view>
      <view class="multi_check_button">
        <image
          class="back_kmg"
          :src="hasSelectMember ? '/static/pages/image/multi_check_ok.png' : '/static/pages/image/multi_check.png'"
          :style="isWeChat ? 'padding-right:' + menuButtonWidth + 'px' : ''"
          @click="multiCheck()"
        ></image>
      </view>
    </snav>
    <view class="container" :style="'padding-top:' + navHeight + 'px'">
      <view class="member_list">
        <view v-for="(item, index) in memberList" :key="item.user_id" :data-idx="index" class="item" @tap="tapMember">
          <image :src="rImage(item.avatar)" class="avatar"></image>
          <text class="uname">{{ item.display_name }}</text>
          <image src="/static/pages/image/check.png" v-if="item.flag" class="check"></image>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      gid: 0,
      content: '',
      memberList: [],
      atMemberList: [],
      navHeight: 0,
      menuButtonWidth: 0,
      isWeChat: false,
      hasSelectMember: false
    };
  },

  components: {},
  props: {},

  onLoad: function (options) {
    const { gid, content } = options;
    this.setData({
      gid,
      content,
      navHeight: getApp().getNavHeight(),
      menuButtonWidth: getApp().getMenuButtonWidth(),
      isWeChat: getApp().isWeChatEnvironment()
    });
    this.getMemberList();
  },

  methods: {
    backClick() {
      uni.navigateBack();
    },

    getMemberList() {
      const im = getApp().getIM();
      if (!im) return;

      im.groupManage
        .asyncGetGroupMembers(this.gid)
        .then((res) => {
          this.setData({
            memberList: im.groupManage.getGroupMembers(this.gid)
          });
        })
        .catch((ex) => {
          if (err.data) {
            console.log('获取群成员列表失败 : ' + err.data.code + ':' + err.data.message);
          }
          uni.showToast({ title: '获取群成员列表失败 : ' + err.message });
        });
    },

    rImage(avatar) {
      const im = getApp().getIM();
      if (!im) return;

      return im.sysManage.getImage({
        avatar
      });
    },

    tapMember(e) {
      var idx = e.currentTarget.dataset.idx;
      const list = [].concat(this.memberList);
      const obj = list[idx];
      obj.flag = !obj.flag;
      list[idx] = obj;
      this.setData({
        memberList: list
      });

      let selectMembers = this.memberList.filter((item) => {
        return item.flag === true;
      });
      this.setData({
        hasSelectMember: selectMembers.length > 0
      });
    },

    multiCheck() {
      let list = this.memberList.filter((item) => item.flag);
      if (list.length) {
        let content = this.content;
        list.forEach((item) => {
          content += '@' + item.display_name + ' ';
        });
        uni.redirectTo({
          url: '/pages_chat/group/index?gid=' + this.gid + '&content=' + content
        });
      } else {
        this.backClick();
      }
    }
  }
};
</script>

<style>
@import './index.css';
</style>
