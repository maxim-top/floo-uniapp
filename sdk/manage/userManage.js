import http from '../core/base/io/index';
import { infoStore, recentStore } from '../utils/store';

const getToken = () => infoStore.getToken();
const getUid = () => infoStore.getUid();
const getAppid = () => infoStore.getAppid();
const getConversationList = () => recentStore.getRecents();
const getDeviceSN = () => infoStore.getDeviceSN();

export default {
  getToken,
  getUid,
  getAppid,
  getConversationList,
  deleteToken: infoStore.deleteToken,

  getDeviceSN,
  asyncGetDeviceList: http.userDeviceList,
  asyncKickDevice: http.userKick,
  asyncBindDeviceToken: http.bindDeviceToken,
  asyncUnbindDeviceToken: http.unbindDeviceToken,
  asyncDeleteUser: http.userDelete,

  asyncTokenUser: http.tokenUser,
  asyncTokenId: http.tokenId,
  asyncRegister: http.userRegister,
  asyncRegisterAnonymous: http.userRegisterAnonymous,
  asyncGenerateSecretInfo: http.userGenerateSecretInfo,
  asyncSendSecretInfo: http.userSendSecretInfo,
  asyncUserBindMobile: http.userBindMobile,
  asyncUserUpdateMobile: http.userUpdateMobile,
  asyncUserSendSms: http.userSendSms,
  asyncCaptchaSms: http.captchaSms,
  aysncGenerateWXUrlLink: http.generateWXUrlLink,
  asyncUserNameCheck: http.userNameCheck,
  asyncUserMobileBind: http.userMobileBind,
  asyncUserMobileBindSign: http.userMobileBindSign,
  asyncUserMobileLogin: http.userMobileLogin,
  asyncCaptchaImagePost: http.captchaImagePost,
  asyncUpdateAuthmode: http.userAuthmode,
  asyncUpdateAvatar: http.userAvatar,
  asyncUpdateMobile: http.userMobile,
  asyncUpdateNickName: http.userNickname,
  asyncUserChangePassword: http.userChangePassword,
  asyncGetProfile: http.userProfile,
  asyncUpdateProfile: http.userProfilePost,
  asyncGetSettings: http.userSettings,
  asyncUpdateSettings: http.userSettingsPost
};
