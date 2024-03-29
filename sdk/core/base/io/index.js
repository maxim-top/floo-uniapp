import * as http from './httpIo';
import log from '../../../utils/log';
import { infoStore } from '../../../utils/store';
import receiveMessage from '../messageReceiver';
import { formatJson } from '../../../utils/tools';
import { makeProvision, makeUnreadULTimer } from '../messageMaker';
import { bind, fire } from '../../../utils/cusEvent';
import { frameEncode, unpack } from '../../protocol/index';

let config = {}; // appid, baseUrl, autoLogin, fireplace
const maxConnectTimes = 5;
let connectTimes = 0;
let heartTimer = null;
const unreadDelayTime = 50000;
const unreadTimeoutTime = 20000;
let userStatus = 'normal'; // normal, kick , logout
let lastFrameRecvTime = 0;
const sendFailReconnectDelay = 200;

const CONNECT_TIMEOUT_MIN = 10000;
const CONNECT_TIMEOUT_STEP = 20000;
const connectTimeout = () => {
  return CONNECT_TIMEOUT_MIN + connectTimes * CONNECT_TIMEOUT_STEP;
};

const CONNECT_DELAY_MAX = 10000;
const CONNECT_DELAY_MIN = 1000;
const connectDelayTime = (reason) => {
  if (connectTimes == 1) {
    return 0;
  }
  if ('SendFail' == reason || 'UnreadTimeout' == reason) {
    return 0;
  }
  return Math.floor(Math.random() * (CONNECT_DELAY_MAX - CONNECT_DELAY_MIN)) + CONNECT_DELAY_MIN;
};

let socket = null;
let socketVersion = 0;

const startHeartbeat = () => {
  heartTimer && clearInterval(heartTimer);
  heartTimer = setInterval(() => {
    startHeartbeatTimeoutCheck();
    sendMessage(makeUnreadULTimer());
  }, unreadDelayTime);
};

const startHeartbeatTimeoutCheck = () => {
  let startTime = new Date().getTime();
  let delay = unreadTimeoutTime;
  let nowSocketVersion = socketVersion;
  setTimeout(() => {
    if (socketVersion == nowSocketVersion) {
      if (lastFrameRecvTime < startTime) {
        log.error('=============== fail to receive unread in ', delay, ' ms');
        try {
          socket.close();
        } catch (ex) {}
        setTimeout(() => {
          fire('reconnect', { reason: 'UnreadTimeout', forSocketVersion: nowSocketVersion });
        }, sendFailReconnectDelay);
      }
    }
  }, delay);
};

// event handlers
bind('refresh_fireplace', (fp) => {
  config = Object.assign(
    {
      fireplace: fp
    },
    config
  );
});

bind('loginSuccess', () => {
  connectTimes = 0;
  startHeartbeat();
});

bind('sendMessage', (message) => {
  sendMessage(message);
});

bind('userKicked', () => {
  userStatus = 'kick';
});

bind('reconnect', ({ reason, forSocketVersion }) => {
  log.warn('socket reconnect due to ', reason, ' user status: ', userStatus);
  if (userStatus === 'normal') {
    reconnectWithTimesCheck(forSocketVersion, reason);
  }
});

// funcions
const connect = function (c) {
  config = c;
  connectTimes = 0;
  userStatus = 'normal';
  socket_connect(socketVersion);
};

const socket_connect = (forSocketVersion) => {
  if (forSocketVersion != socketVersion) {
    return;
  }
  const { fireplace } = config;
  log.log('................................. will connect : ', fireplace);
  fire('flooNotice', {
    category: 'loginMessage',
    desc: 'socket connecting...'
  });

  socketVersion++;
  socket = wx.connectSocket({
    url: fireplace,
    tcpNoDelay: true,
    timeout: connectTimeout(),
    success: () => {
      log.info('================= Success connect to', fireplace);
      fire('flooNotice', { category: 'loginMessage', desc: 'socket connect success...' });
    },
    fail: (err) => {
      log.error('================= Failed to connect ', fireplace, ' error: ', err);
      fire('reconnect', { reason: 'ConnectFail', forSocketVersion: socketVersion });
    }
  });

  socket.onOpen(function () {
    log.log('=================  socket connected ');
    startProvision();
  });

  socket.onMessage((bytes) => {
    onFrame(bytes.data);
  });

  socket.onError((err) => {
    log.error('=================  socket error: ', err);
    socket.close();
  });

  socket.onClose((res) => {
    log.error('=================  socket disconnected due to ', res);
    fire('reconnect', { reason: 'closed_by_peer', forSocketVersion: socketVersion });
  });
};

const reconnectWithTimesCheck = (forSocketVersion, reason) => {
  //check if we've tried too many times on one server
  if (connectTimes >= maxConnectTimes) {
    connectTimes = 0;
    fire('fireplaceError');
  } else {
    connectTimes++;
  }
  reconnect(forSocketVersion, reason);
};

const reconnect = (forSocketVersion, reason) => {
  const delay = connectDelayTime(reason);
  log.error('================= socket will reconnect in ', delay, ' ms (', connectTimes, ')');
  setTimeout(() => {
    socket_connect(forSocketVersion);
  }, delay);
};

const startProvision = () => {
  log.log('=============== sending proversion ==========');
  fire('flooNotice', {
    category: 'loginMessage',
    desc: 'logining socket service...'
  });
  fire('sendMessage', makeProvision({ token: infoStore.getToken(), uid: infoStore.getUid() }));
};

const onFrame = (bytes) => {
  lastFrameRecvTime = new Date().getTime();
  const msg = unpack(bytes);
  log.info('RECV :' + JSON.stringify(formatJson(msg)));
  receiveMessage(msg);
};

const sendMessage = (msg) => {
  log.info('SEND :' + JSON.stringify(formatJson(msg)));
  const bytes = frameEncode(msg);
  const buffArr = new ArrayBuffer(bytes.length);
  const buffView = new Uint8Array(buffArr);
  bytes.forEach((v, i) => {
    buffView[i] = v;
  });

  socket.send({
    data: buffArr,
    fail: function (err) {
      const { errMsg } = err;

      log.error('=============== fail to send message, err: ', errMsg);
      try {
        socket.close();
      } catch (ex) {}
      let nowSocketVersion = socketVersion;
      setTimeout(() => {
        fire('reconnect', { reason: 'SendFail', forSocketVersion: nowSocketVersion });
      }, sendFailReconnectDelay);
    }
  });
};

const disConnect = () => {
  userStatus = 'logout';
  if (socket) socket.close();
};

const floo_io = Object.assign(http, {
  connect,
  sendMessage,
  disConnect
});

export default floo_io;
