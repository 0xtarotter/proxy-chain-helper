# 代理链助手

Chrome / Edge Manifest V3 扩展，用于查看当前网页经过 OpenClash / Mihomo 时的实际代理连接信息。

## 功能

- 识别当前标签页域名
- 查询 Mihomo 当前活动连接
- 显示命中的规则与规则集参数
- 显示完整代理链和实际节点
- 显示落地国家、国家代码与国旗
- 显示节点延迟
- 显示当前页面加载延迟
- 支持网页右下角/左下角状态浮窗
- 支持浅色、深色、跟随系统主题
- 支持玻璃质感界面
- 配置仅保存在浏览器本地

## 工作原理

扩展不会在浏览器中重新实现 OpenClash 规则匹配，而是通过用户配置的 Mihomo External Controller 查询 `/connections`、`/proxies` 和节点延迟接口。这样可以避免浏览器端与 Mihomo 的规则顺序、GeoSite、Fake-IP 和远程规则集产生偏差。

落地国家判断优先级：

1. 节点名称
2. Mihomo API 返回的节点/落地 IP + GeoIP
3. 当前站点解析 IP + GeoIP

无法可靠判断时不会默认显示美国，而是显示未知状态。

## 配置

在扩展设置页填写 Mihomo / OpenClash External Controller：

```yaml
external-controller: 0.0.0.0:9090
secret: your-secret
```

示例地址：

```text
http://192.168.160.2:9090
```

如果控制器绑定在路由器局域网地址，请确认：

- 浏览器所在设备可以访问该地址；
- OpenClash 防火墙允许访问控制器端口；
- Secret 与 Mihomo 配置一致；
- 不要将带 Secret 的控制器地址提交到 GitHub。

## 安装

1. 下载 Release 压缩包并解压；
2. 打开 Chrome 或 Edge 的扩展管理页：
   - Chrome：`chrome://extensions/`
   - Edge：`edge://extensions/`
3. 开启“开发者模式”；
4. 点击“加载已解压的扩展程序”；
5. 选择解压后的 `openclash-domain-inspector` 目录；
6. 打开设置页填写控制器地址并测试连接。

## 隐私说明

- 控制器地址和 Secret 使用 `chrome.storage.local` 保存在本地；
- 不向第三方上传控制器地址、Secret、浏览记录或连接数据；
- 只有在判断归属地时，可能请求公开 GeoIP/ DNS 服务；
- 所有 Mihomo API 请求只发送到用户自行配置的控制器地址；
- 使用前请根据自己的隐私和网络环境评估公开 GeoIP 服务是否适合。

## 版权与许可

Copyright © 2026 0xtarotter. All rights reserved.

本项目当前未授予他人复制、修改、再分发或商业使用的许可。除非获得版权所有者明确书面授权，否则不得将本项目或其衍生版本用于商业发布、重新打包或冒充官方版本。

项目中的第三方服务、Mihomo/OpenClash 项目及相关规则集分别归其各自版权所有者所有。本项目不隶属于 Mihomo 或 OpenClash 官方项目。

## 免责声明

本工具仅用于辅助查看当前连接状态，不保证规则判断、GeoIP 归属或延迟数据在所有网络环境中绝对准确。用户应自行确认代理、节点、规则集以及控制器暴露面的安全性。

## 作者

- 作者：0xtarotter
- 网站：https://tarotter.com
