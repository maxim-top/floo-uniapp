## 蓝莺IM SDK Uniapp 版

蓝莺IM，是由[美信拓扑](https://www.maximtop.com/)团队研发的新一代即时通讯云服务，SDK设计简单集成方便，服务采用云原生技术和多云架构，私有云也可按月付费。

本仓库是 IMSDK 的源码仓库，如果你只是开发自己的聊天App，建议使用蓝莺IM uniapp版仓库 [lanying-im-uniapp](https://github.com/maxim-top/lanying-im-uniapp)，也可以直接[在线试用](https://chat-h5.maximtop.com)。

[![Scc Count Badge](https://sloc.xyz/github/maxim-top/floo-uniapp/?category=total&avg-wage=1)](https://github.com/maxim-top/floo-uniapp/) [![Scc Count Badge](https://sloc.xyz/github/maxim-top/floo-uniapp/?category=code&avg-wage=1)](https://github.com/maxim-top/floo-uniapp/)

## 工程说明

1. 本工程为 Uniapp 工程，实际上是从[微信小程序](https://github.com/maxim-top/lanying-im-miniprogram)转换而来，感谢[zhangdaren](https://github.com/zhangdaren/miniprogram-to-uniapp)，转换过程非常顺畅；
2. 推荐使用此版本进行小程序/H5 等版本开发，感谢 [DCloud.io](https://dcloud.io) 开发这么好的框架；
3. DemoApp 是为了演示 IM SDK 调用而开发，也因此最好的开发方式为根据 DemoApp 找到功能，然后直接查看使用示例；
4. 本工程 DemoApp 不包含所有功能的演示，但是 SDK(floo) 功能完全，高级功能可以参照[PC Web 版本](https://github.com/maxim-top/lanying-im-web)，SDK 调用方式是通用的。

此工程共有四个源码目录：

1. im 存放蓝莺IM SDK，当前最新版本为 floo-2.0.0.uniapp.js
2. pages 为 UI 源码目录；
3. utils 为使用的工具类源码；
4. third 为第三方源码；

## 开发

1. 运行命令安装依赖包

> `npm install`

2. 打开 HBuilder（Uniapp IDE）进行开发

## 开发自己的应用

1. 修改美信拓扑 AppID

打开文件 App.vue, 修改变量 appid，将 "welovemaxim" 改为你的应用 AppID，此 AppID 为在[蓝莺IM 后台](https://console.maximtop.com/)创建应用后获取。

2. 如果开发小程序，还需修改对应小程序平台的 AppID

如果是微信小程序，可以打开文件 `manifest.json`，修改其中的 AppID 为你的小程序在微信后台的 appid。

## 发布

可以通过以下命令打包出 SDK 文件：

```
yarn sdk
```

如要同步更新发布到 lanying-im-uniapp，可先 clone [lanying-im-uniapp](https://github.com/maxim-top/lanying-im-uniapp) 到当前目录，运行命令

```
yarn release
```

此命令会将打包后的 SDK 文件 floo-x.x.js 和其他 UI 代码更新到 lanying-im-web 文件夹，
然后进入 lanying-im-web 文件夹提交即可。

```
cd lanying-im-uniapp && git commit -a
```

## 代码风格

代码风格选择的 ESLint + Prettier，基本规则如下：

1. 所有缩进设置为 2 ，包括 Style Sheets 中的各种 css 语言文件、html 文件、JavaScript 文件和其它类型文件。
2. HTML 文件中 script 标签和 style 标签后的首行代码不缩进。
3. 函数名和花括号的空格
   - 函数声明时，函数名后不加括号；
   - 在函数表达式中 function 后面括号前不加空格；
   - 花括号中（插值表达式/解构赋值）首尾要增加空格。

Webstorm 设置可参考[这里](https://www.wenyuanblog.com/blogs/webstorm-eslint-prettier-reformat-code.html)。

## 其他

了解更多信息可以阅读[在线文档](https://docs.maximtop.com/quick-start/floo-web-quick-start.html)，或者在本仓库提问 :)

-- --
**蓝莺IM 专业SDK，私有云按月付费**
