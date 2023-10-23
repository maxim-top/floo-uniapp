<template>
  <view>
    <view class="header_view" :style="'padding-top:' + navHeight + 'px'">
      <view v-if="isLogin">
        <image :src="profile.avatar" class="avatar" @tap="changeAvatar"></image>
        <view class="nick">
          <text class="nick_text">{{ profile.nick_name || profile.username }}</text>
          <image class="qrcode" src="../../static/pages/image/qrcode.png" @tap="goQrcode"></image>
        </view>
        <view class="id">
          <text>ID：{{ profile.user_id }}</text>
        </view>
      </view>
      <view v-else>
        <image src="../../static/pages/image/r_b.png" class="avatar" :style="'filter: brightness(0) invert(1)'" @tap="tipLogin"></image>
        <view class="nick" @tap="tipLogin">
          <text>点击账户登录</text>
        </view>
      </view>
    </view>
    <view class="container">
      <view class="item" @tap="goProfile">
        <view class="sleft">
          <text>账号管理</text>
        </view>
        <view class="sright">
          <image class="right" src="/static/pages/image/right.png"></image>
        </view>
      </view>
      <view class="item">
        <view class="sleft">
          <text>微信绑定</text>
        </view>
        <view class="btm_right">
          <button v-if="binded" class="bindBtnClass" @tap="unbindHandler">解除绑定</button>
          <button v-if="!binded" class="bindBtnClass" @tap="getInfo">点击绑定</button>
        </view>
      </view>
      <view class="item" @tap="goQiWei">
        <view class="sleft">
          <text>专属客服</text>
        </view>
        <view class="sright">
          <image class="qwright" src="/static/pages/image/qw.png"></image>
        </view>
      </view>
      <view class="item" @tap="goAbout">
        <view class="sleft">
          <text>关于我们</text>
        </view>
        <view class="sright">
          <image class="right" src="/static/pages/image/right.png"></image>
        </view>
      </view>
    </view>
    <view>
      <uni-popup ref="popup" background-color="rgb(245,241,227)">
        <view class="popup-content">
          <view class="text-content">
            <text :style="'font-size: 34rpx; font-weight: bold;'">添加企业微信</text>
            <br />
            <text>沟通产品和技术细节，</text>
            <br />
            <text>进群交流大模型AI等话题</text>
          </view>
          <view class="qw-qrcode">
            <image class="service_bkg" src="/static/pages/image/service.png" show-menu-by-longpress="true"></image>
            <text>长按扫码添加</text>
          </view>
        </view>
      </uni-popup>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      profile: {},
      binded: false,
      navHeight: 0,
      isLogin: false,
      isWechat: false,
      wxinfo: {}
    };
  },

  components: {},
  props: {},
  onLoad: function () {
    const isLogin = getApp().isIMLogin();
    this.setData({
      navHeight: getApp().getNavHeight(),
      isLogin,
      isWechat: getApp().isWeChatEnvironment()
    });

    if (this.isLogin) {
      this.fetchAvatar();
      this.getIsBind();
      if (this.isWechat) {
        this.wxAuth();
      }
    }
  },
  onShow: function () {
    const isLogin = getApp().isIMLogin();
    this.setData({
      isLogin
    });
    if (isLogin && !this.profile.user_id) {
      this.fetchAvatar();
    }

    if (isLogin && this.isWechat && !this.wxinfo.code) {
      this.wxAuth();
    }

    if (isLogin && !this.wxinfo.getBind) {
      this.getIsBind();
    }
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
          avatar = '/static/pages/image/r_b.png';
        }

        profile.avatar = avatar; // profile.nick_name = profile.alias || profile.nick_name || profile.username;
        this.setData({
          profile
        });
      });
    },

    getIsBind() {
      let that = this;
      getApp()
        .getIM()
        .sysManage.asyncWechatIsbind()
        .then((binded) => {
          let wxinfo = that.wxinfo;
          wxinfo.getBind = true;
          this.setData({
            binded,
            wxinfo
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
          uni.showToast({
            title: '绑定成功'
          });
        })
        .catch((ex) => {
          uni.showToast({
            title: '绑定失败'
          });
        });
    },

    unbindHandler() {
      let that = this;
      uni.showModal({
        title: '解除绑定',
        content: '解除微信账号绑定',
        success: function (res) {
          if (res.confirm) {
            getApp()
              .getIM()
              .sysManage.asyncWechatUnbind()
              .then((res) => {
                that.setData({
                  binded: false
                });
                uni.showToast({
                  title: '解绑成功'
                });
                if (that.isWechat) {
                  that.wxAuth();
                }
              })
              .catch((ex) => {
                uni.showToast({
                  title: '解绑失败'
                });
              });
          } else if (res.cancel) {
            // do nothing here.
          }
        }
      });
    },

    wxAuth() {
      // 获取 用户信息的。。页面加载就触发
      uni.login({
        success: (res) => {
          if (res.code) {
            let wxinfo = this.wxinfo;
            wxinfo.code = res.code;
            this.setData({
              wxinfo
            });
          }
        }
      });
    },

    getInfo() {
      if (this.isLogin) {
        if (this.isWechat) {
          const im = getApp().getIM();
          im.sysManage
            .asyncWxlogin({
              code: this.wxinfo.code
            })
            .then((res) => {
              uni.hideLoading();

              if (res.openid) {
                //未绑定
                this.bindHandler(res.openid);
              }
            });
        } else {
          uni.showToast({
            title: 'H5网页不支持'
          });
        }
      } else {
        uni.navigateTo({
          url: '../account/loginreminder/index'
        });
      }
    },

    goProfile() {
      if (this.isLogin) {
        uni.navigateTo({
          url: './detail/index'
        });
      }
    },

    goQiWei() {
      this.$refs.popup.open('bottom');
    },

    goAbout() {
      uni.navigateTo({
        url: './about/index'
      });
    },

    goQrcode() {
      if (this.isLogin) {
        uni.navigateTo({
          url: './qrcode/index'
        });
      }
    },

    tipLogin() {
      uni.navigateTo({
        url: '../account/loginreminder/index'
      });
    }
  }
};
</script>
<style lang="scss">
@import './index.css';
</style>
