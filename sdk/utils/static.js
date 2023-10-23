/**************** frame 部分 *************
 */
const STATIC_FRAME_VSN = {
  XSYNC_V1: 0,
  XSYNC_V2: 1
};
const STATIC_FRAME_COMMAND = {
  UNREAD: 0,
  SYNC: 1,
  NOTICE: 2,
  PROVISION: 3
};
const STATIC_FRAME_COMPRESS_METHOD = {
  NONE: 0,
  ZLIB: 1
};
const STATIC_FRAME_ERROR_STATUS = {
  UNKNOWN: 0,
  OK: 1,
  FAIL: 2,
  UNKNOWN_COMMAND: 3,
  PB_PARSER_ERROR: 4,
  DECRYPT_FAILURE: 5,
  PUBLIC_KEY_CHANGED: 6,
  INVALID_TOKEN: 7,
  INVALID_PARAMETER: 8,
  UNAUTHORIZED: 9,
  USER_FROZEN: 10,
  USER_BANNED: 11,
  WORD_CENSORED: 12,
  TOO_MANY_DEVICES: 13,
  ENCRYPT_METHOD_UNSUPPORTED: 14,
  DEVICE_GUID_CONFLICT: 15,
  CHECK_SUM_FAILURE: 16,
  INVALID_LICENSE: 17,
  LICENSE_LIMIT: 18,
  APP_FROZEN: 19,
  RATE_LIMIT_EXCEEDED: 20
};
const STATIC_FRAME_OSTYPE = {
  UNKNOWN: 0,
  IOS: 1,
  ANDR: 2, // ANDROID
  WIN: 3,
  OSX: 4,
  LINUX: 5,
  WEB: 6
};
const STATIC_FRAME_ENCRYPTMETHOD = {
  ENCRYPT_NONE: 0,
  AES_CBC_128: 1,
  AES_CBC_256: 2,
  CUSTOM: 3
};
const STATIC_META_NAMESPACE = {
  UNKNOWN: 0,
  MESSAGE: 1,
  GROUP_NOTICE: 2,
  ROSTER_NOTICE: 3,
  USER_NOTICE: 4,
  INFO: 5,
  CONVERSATION: 6,
  PUSH: 7,
  RTC_SIGNAL: 8
};

/**************** messagebody 部分 *************
 */

const STATIC_MESSAGE_TYPE = {
  NORMAL: 0,
  OPER: 1,
  CHAT: 2,
  GROUPCHAT: 3
};
const STATIC_MESSAGE_OPTYPE = {
  UNKNOWN: 0,
  READ_ACK: 1,
  READ_ALL: 2,
  READ_CANCEL: 3,
  DELIVER_ACK: 4,
  RECALL: 5,
  DELETE: 6,
  PLAY_ACK: 7,
  APPEND: 8,
  REPLACE: 9
};
const STATIC_MESSAGE_CONTENT_TYPE = {
  TEXT: 0,
  IMAGE: 1,
  AUDIO: 2,
  VIDEO: 3,
  FILE: 4,
  LOCATION: 5,
  COMMAND: 6,
  FORWARD: 7,
  RTC: 8
};

const STATIC_MESSAGE_QOS = {
  AT_LEAST_ONCE: 0,
  AT_MOST_ONCE: 1,
  EXACTLY_ONCE: 2
};

/**************** groupnotice 部分 *************
 */

const STATIC_GROUPNOTICE_TYPE = {
  UNKNOWN: 0,
  PRESENCE: 1,
  ABSENCE: 2,
  CREATED: 3,
  DESTROYED: 4,
  JOINED: 5,
  LEAVED: 6,
  APPLYED: 7,
  APPLY_ACCEPTED: 8,
  APPLY_DECLINED: 9,
  INVITED: 10,
  INVITE_ACCEPTED: 11,
  INVITE_DECLINED: 12,
  KICKED: 13,
  BLOCKED: 14,
  UNBLOCKED: 15,
  OWNER_ASSIGNED: 16,
  ADMIN_GRANTED: 17,
  ADMIN_REVOKED: 18,
  MUTED: 19,
  UNMUTED: 20,
  BANNED: 21,
  UNBANNED: 22,
  INFO_UPDATED: 23,
  ANNOUNCEMENT_UPDATED: 24,
  MESSAGE_SETTING: 25,
  FILE_UPLOADED: 26,
  FILE_DELETED: 27,
  FILE_UPDATED: 28
};

/**************** info 部分 *************
 */

const STATIC_INFO_NETWORK = {
  WIRE: 0,
  WIFI: 1,
  NET_2G: 2,
  NET_3G: 3,
  NET_4G: 4,
  NET_5G: 5,
  UNKNOWN: 6
};

/**************** rosternotice 部分 *************
 */

const STATIC_ROSTERNONTICE_TYPE = {
  UNKNOWN: 0,
  ADDED: 1,
  REMOVED: 2,
  ACCEPTED: 3,
  DECLINED: 4,
  BLOCKED: 5,
  UNBLOCKED: 6,
  APPLIED: 7,
  INFO_UPDATED: 8,
  MUTED: 9,
  UNMUTED: 10
};

/**************** usernotice 部分 *************
 */
const STATIC_USERNOTICE_TYPE = {
  UNKNOWN: 0,
  PASSWORD_CHANGED: 1,
  FROZEN: 2,
  REMOVED: 3, // maybe deleted by admin
  KICK_BY_SAME_DEVICE: 4, // user login on same device and kick old connection
  KICKED_BY_OTHER_DEVICE: 5, // device was
  INFO_UPDATED: 6,
  DEVICE_LOGIN: 7,
  DEVICE_LOGOUT: 8,

  DEVICE_ADDED: 9, // a new device is added
  DEVICE_REMOVED: 10, // a device is removed
  CLUSTER_CHANGED: 11, //cluster changed need relogin
  DNS_UPDATE: 12, //update dns config
  TRAFFIC_LIMIT_EXCEEDED: 13 // user traffic limit exceeded
};

/**************** conversation 部分 *************
 */
const STATIC_CONVERSATION_TYPE = {
  UNKNOWN: 0,
  OPER: 1
};
const STATIC_CONVERSATION_OPTYPE = {
  UNKNOWN: 0,
  DELETE: 1,
  DELETE_EVERYWHERE: 2
};

/**************** rtc message 部分 *************
 */
const STATIC_RTC_SIGNAL_TYPE = {
  UNKNOWN: 0,
  VIDEO_ROOM: 1
};

/**************** MESSAGE unread related, no STATIC prefix means not from protobuf *************
 */
const STATIC_MESSAGE_STATUS = {
  UNREAD: 0,
  DELIVERED: 1,
  READ: 2
};

export {
  STATIC_FRAME_VSN,
  STATIC_FRAME_COMMAND,
  STATIC_FRAME_COMPRESS_METHOD,
  STATIC_FRAME_ERROR_STATUS,
  STATIC_FRAME_OSTYPE,
  STATIC_FRAME_ENCRYPTMETHOD,
  STATIC_META_NAMESPACE,
  STATIC_MESSAGE_OPTYPE,
  STATIC_MESSAGE_TYPE,
  STATIC_MESSAGE_CONTENT_TYPE,
  STATIC_MESSAGE_QOS,
  STATIC_GROUPNOTICE_TYPE,
  STATIC_INFO_NETWORK,
  STATIC_USERNOTICE_TYPE,
  STATIC_ROSTERNONTICE_TYPE,
  STATIC_CONVERSATION_TYPE,
  STATIC_CONVERSATION_OPTYPE,
  STATIC_RTC_SIGNAL_TYPE,
  STATIC_MESSAGE_STATUS
};
