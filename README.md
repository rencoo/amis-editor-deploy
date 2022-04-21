# 项目说明
官方使用fis3打包amis-editor，使用起来不方便。改为react-app-rewired打包，方便部署

# 注意事项
#### 版本要求
node 12.x

#### 依赖安装
npm ci
（备注: 如果直接npm ci安装不下来的话，先删除package-lock.json，再重新npm install安装依赖，然后将新生成的package-lock.json一起提交，后面开发继续采用npm ci安装依赖，保证构建结果的一致性）

#### 开发环境调试
npm run start

#### 构建生产环境资源
npm run build:prod

# 其他
* 安装tslib依赖是解决build报错: __spreadArray is not a function

* 安装webpack-filter-warnings-plugin依赖是用来过滤无用告警: Failed to parse source map from "data" URL

* index.tsx不采用React.StrictMode，是因为会告警

* 手机模式的预览页面暂时没有fork过来

* 添加.env文件解决使用monaco-editor-webpack-plugin插件构建时，报内存相关的错误
