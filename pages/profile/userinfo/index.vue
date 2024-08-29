<template>
  <view>
    <snav>
      <view class="back" @tap.stop="backClick">
        <image class="back_kmg" src="/static/pages/image/back.png"></image>
      </view>
    </snav>
    <view v-if="uid">
      <view class="header_view" :style="'padding-top:' + navHeight + 'px'">
        <image :src="profile.avatar" class="avatar"></image>
        <view class="nick">
          <text class="nick_text">{{ profile.nick_name || profile.username }}</text>
        </view>
        <view class="id">
          <text>ID:{{ profile.user_id }}</text>
        </view>
      </view>
      <view class="container">
        <view class="item">
          <view class="sleft">
            <text class="ltext">ID</text>
          </view>
          <view class="sright">
            <text class="rtext">{{ profile.user_id }}</text>
          </view>
        </view>
        <view class="item">
          <view class="sleft">
            <text class="ltext">用户名</text>
          </view>
          <view class="sright">
            <text class="rtext">{{ profile.username }}</text>
          </view>
        </view>
        <view class="item">
          <view class="sleft">
            <text class="ltext">昵称</text>
          </view>
          <view class="sright">
            <text class="rtext">{{ profile.nick_name }}</text>
          </view>
        </view>
        <view class="item">
          <view class="sleft">
            <text class="ltext">手机号</text>
          </view>
          <view class="sright">
            <text class="rtext">{{ profile.mobile }}</text>
          </view>
        </view>
        <view class="item">
          <view class="sleft">
            <text class="ltext">邮箱</text>
          </view>
          <view class="sright">
            <text class="rtext">{{ profile.email }}</text>
          </view>
        </view>
      </view>
    </view>
    <view v-else>
      <view class="header_view" :style="'padding-top:' + navHeight + 'px'">
        <image :src="groupInfo.avatar" class="avatar"></image>
        <view class="nick">
          <text class="nick_text">{{ groupInfo.name }}</text>
        </view>
        <view class="id">
          <text>ID:{{ groupInfo.group_id }}</text>
        </view>
      </view>
      <view class="container">
        <view class="item">
          <view class="sleft">
            <text class="ltext">ID</text>
          </view>
          <view class="sright">
            <text class="rtext">{{ groupInfo.group_id }}</text>
          </view>
        </view>
        <view class="item">
          <view class="sleft">
            <text class="ltext">owner ID</text>
          </view>
          <view class="sright">
            <text class="rtext">{{ groupInfo.owner_id }}</text>
          </view>
        </view>
        <view class="item">
          <view class="sleft">
            <text class="ltext">群名称</text>
          </view>
          <view class="sright">
            <text class="rtext">{{ groupInfo.name }}</text>
          </view>
        </view>
        <view class="item">
          <view class="sleft">
            <text class="ltext">群描述</text>
          </view>
          <view class="sright">
            <text class="rtext">{{ groupInfo.description }}</text>
          </view>
        </view>
        <view class="item">
          <view class="sleft">
            <text class="ltext">群名片</text>
          </view>
          <view class="sright" @tap="changeGroupDisplayName">
            <text class="rtext">{{ groupDisplayName || '点击设置' }}</text>
          </view>
        </view>
        <view class="item" @tap="goGroupMemberList">
          <view class="sleft">
            <text class="ltext">群成员列表</text>
          </view>
          <view class="sright">
            <image class="right" src="/static/pages/image/right.png"></image>
          </view>
        </view>
      </view>
    </view>
    <view class="buttonFrame" @tap="goChat">
      <button class="button_item">开始聊天</button>
    </view>
    <uni-popup ref="changeGroupDisplayNamePopup" :is-mask-click="false">
      <view class="popup-content">
        <text class="title">设置群名片</text>
        <view class="inputFrame">
          <input type="text" focused :value="sInputDisplayName" placeholder="请输入新的群名片" @input="groupDisplayNameHandler" />
        </view>
        <view class="button_items">
          <button class="btn_item btn_cancel" @click="cancelChangeGroupDisplayName">取消</button>
          <button class="btn_item btn_cancel" @click="confirmChangeGroupDisplayName">确定</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  data() {
    return {
      profile: {},
      groupInfo: {},
      navHeight: 0,
      uid: 0,
      gid: 0,
      sInputDisplayName: '',
      groupDisplayName: ''
    };
  },

  components: {},
  props: {},
  onLoad: function (p) {
    if (p.uid) {
      this.setData({
        uid: p.uid,
        navHeight: getApp().getNavHeight()
      });
      this.getUserInfo();
    } else {
      this.setData({
        gid: p.gid,
        navHeight: getApp().getNavHeight()
      });
      this.getGroupInfo();
    }
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

    getGroupInfo() {
      let that = this;
      const im = getApp().getIM();
      if (!im) return;

      im.groupManage
        .asyncGetInfo({
          group_id: this.gid
        })
        .then((res) => {
          res.avatar = im.sysManage.getImage({
            avatar: res.avatar,
            sdefault: '/static/pages/image/cgroup.png'
          });
          this.setData({
            groupInfo: res
          });
          const uid = im.userManage.getUid();
          im.groupManage
            .asyncGetMemberDisplayName({
              group_id: that.gid,
              user_list: [uid]
            })
            .then((res) => {
              if (!res || !res.length) {
                return;
              }
              res.forEach((item) => {
                that.setData({
                  groupDisplayName: item.display_name
                });
              });
            })
            .catch((err) => {
              console.log('');
              uni.showToast({ title: '群名片获取失败' });
            });
        })
        .catch((ex) => {
          uni.showToast({
            title: '群信息获取失败'
          });
        });
    },

    changeGroupDisplayName() {
      if (this.groupDisplayName && this.groupDisplayName.length) {
        this.setData({
          sInputDisplayName: this.groupDisplayName
        });
      }
      this.$refs.changeGroupDisplayNamePopup.open('center');
    },

    groupDisplayNameHandler(e) {
      this.setData({
        sInputDisplayName: e.detail.value
      });
    },

    cancelChangeGroupDisplayName() {
      this.$refs.changeGroupDisplayNamePopup.close();
      this.setData({
        sInputDisplayName: ''
      });
    },

    confirmChangeGroupDisplayName() {
      this.$refs.changeGroupDisplayNamePopup.close();
      const im = getApp().getIM();
      let that = this;

      if (!im) return;

      if (this.sInputDisplayName === this.groupDisplayName) {
        uni.showToast({ title: '新群名片与原群名片相同！' });
      } else {
        im.groupManage
          .asyncUpdateDisplayName({
            group_id: this.groupInfo.group_id,
            value: this.sInputDisplayName
          })
          .then(() => {
            that.setData({
              groupDisplayName: that.sInputDisplayName
            });
          })
          .catch((err) => {
            console.log(err);
            uni.showToast({ title: '设置群名片失败！' });
          });
      }
    },

    backClick() {
      wx.navigateBack();
    },

    goChat() {
      if (this.uid) {
        uni.navigateTo({
          url: '/pages_chat/roster/index?uid=' + this.uid
        });
      } else {
        uni.navigateTo({
          url: '/pages_chat/group/index?gid=' + this.gid
        });
      }
    },

    goGroupMemberList() {
      if (!this.uid) {
        uni.navigateTo({
          url: '/pages_chat/group/memberlist/index?gid=' + this.gid
        });
      }
    }
  }
};
</script>
<style>
@import './index.css';
</style>
