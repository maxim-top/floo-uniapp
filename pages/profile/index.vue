<template>
  <view>
    <view class="header_view" :style="'padding-top:' + navHeight + 'px'">
      <image :src="profile.avatar" class="avatar" @tap="changeAvatar"></image>
      <view class="nick">
        <text>{{ profile.nick_name || profile.username }}</text>
        <image class="qrcode" src="../../static/pages/image/qrcode.jpg" @tap="goQrcode"></image>
      </view>
      <view class="id">
        <text>ID：{{ profile.user_id }}</text>
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
      <view class="item" @tap="unbindMobile">
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
      <view class="item" @tap="goAbout">
        <view class="sleft">
          <text class="ltext">关于我们</text>
        </view>
      </view>
      <view class="item nb">
        <view class="sleft">
          <text class="ltext">微信绑定</text>
        </view>
        <view class="sright">
          <text v-if="binded" class="rtext" @tap="unbindHandler">已绑定，点击解除</text>
          <button v-if="!binded" class="bindBtnClass" open-type="getUserInfo" @getuserinfo="bindGetUserInfo">点击绑定</button>
        </view>
      </view>
    </view>
    <view class="bindBtn sgray" @tap="logout">
      <text>退出</text>
    </view>
    <!-- <view class='bindBtn sblue' wx:if="{{!binded}}" bindtap='bindHandler'>
  <text>绑定微信</text>
</view> -->
  </view>
</template>

<script>
export default {
  data() {
    return {
      profile: {},
      binded: false,
      navHeight: 0,
      wxinfo: {}
    };
  },

  components: {},
  props: {},
  onLoad: function () {
    this.setData({
      navHeight: getApp().getNavHeight()
    });

    this.fetchAvatar();
    this.wxAuth();
    this.getIsBind();
  },
  methods: {
    changeAvatar() {
      const that = this;
      uni.chooseImage({
        count: 6, //默认9
        sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album'], //从相册选择
        success: function (res) {
          const file = res.tempFilePaths[0];
          console.log('Choose file: ', file);
          const im = getApp().getIM();
          if (im) {
            im.sysManage
              .asyncFileUpload({
                file,
                toType: 'rosterAvatar'
              })
              .then((res) => {
                that.updateAvatarUrl(res.url);
                console.log('更新头像完成');
              })
              .catch((err) => {
                console.error('更新头像失败:', err);
              });
          }
        }
      });
    },

    updateAvatarUrl(avatar) {
      const that = this;
      const im = getApp().getIM();
      im.userManage.asyncUpdateAvatar({ avatar }).then(() => {
        alert('头像已刷新');
        this.fetchAvatar();
      });
    },

    fetchAvatar() {
      const im = getApp().getIM();
      const token = im.userManage.getToken();
      const app_id = im.userManage.getAppid();
      im.userManage.asyncGetProfile(true).then((profile) => {
        let avatar = profile.avatar;

        if (avatar) {
          if (avatar.indexOf('http') !== 0) {
            avatar = 'https://api.maximtop.com/file/download/avatar?object_name=' + avatar;
          }

          avatar = avatar + '&image_type=2' + '&access-token=' + token + '&app_id=' + app_id;
        } else {
          avatar = '/static/image/roster.png';
        }

        profile.avatar = avatar; // profile.nick_name = profile.alias || profile.nick_name || profile.username;
        this.setData({
          profile
        });
      });
    },

    bindWechat() {
      if (this.binded) {
        this.unbindHandler();
      } else {
        if (getApp().openId) {
          this.bindHandler();
        } else {
          this.wxAuth();
        }
      }
    },

    getIsBind() {
      getApp()
        .getIM()
        .sysManage.asyncWechatIsbind()
        .then((binded) => {
          this.setData({
            binded
          });
        });
    },

    bindHandler(open_id) {
      getApp()
        .getIM()
        .sysManage.asyncWxbind({
          open_id,
          type: 1
        })
        .then((res) => {
          this.setData({
            binded: true
          });
        })
        .catch((ex) => {
          wx.showToast({
            title: '绑定失败'
          });
        });
    },

    unbindHandler() {
      getApp()
        .getIM()
        .sysManage.asyncWechatUnbind()
        .then((res) => {
          this.setData({
            binded: false
          });
          this.wxAuth();
        })
        .catch((ex) => {
          wx.showToast({
            title: '解绑失败'
          });
        });
    },

    wxAuth() {
      // 获取 用户信息的。。页面加载就触发
      wx.login({
        success: (res) => {
          if (res.code) {
            const wxinfo = this.wxinfo;
            wxinfo.code = res.code;
            this.setData({
              wxinfo
            });
          }
        }
      });
    },

    getInfo() {
      const im = getApp().getIM();
      const code = this.wxinfo.code;
      const data = this.wxinfo.data;
      const iv = this.wxinfo.iv;
      im.sysManage
        .asyncWxlogin({
          code,
          data,
          iv
        })
        .then((res) => {
          wx.hideLoading();

          if (res.openid) {
            //未绑定
            this.bindHandler(res.openid);
          }
        });
    },

    logout() {
      getApp().imLogout();
    },

    bindGetUserInfo(e) {
      // 登录的点击....
      if (e.detail.userInfo) {
        const wxinfo = this.wxinfo;
        wxinfo.data = e.detail.encryptedData;
        wxinfo.iv = e.detail.iv;
        this.setData({
          wxinfo
        });
        this.getInfo();
      } else {
        wx.showToast({
          title: '微信登录需要授权'
        });
      }
    },

    goAbout() {
      wx.navigateTo({
        url: './about/index'
      });
    },

    goQrcode() {
      wx.navigateTo({
        url: './qrcode/index'
      });
    }
  }
};
</script>
<style>
@import './index.css';
</style>
