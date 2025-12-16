# 阿里云函数计算部署文件夹

## 文件说明

- `resume-message-json-java8.jar` - 主应用程序JAR文件（已修复主类路径问题）
- `gson-2.9.0.jar` - Gson依赖库
- `start.sh` - Linux/Unix启动脚本
- `start.bat` - Windows启动脚本

## 部署步骤

1. 将整个deploy文件夹压缩为ZIP格式
2. 上传ZIP文件到阿里云函数计算
3. 配置启动命令：
   - Linux环境：`bash start.sh`
   - Windows环境：`start.bat`
   - 或直接使用：`java -jar resume-message-json-java8.jar`

## 配置要求

- 运行时环境：Java 8 或更高版本
- 内存配置：建议512MB或更高
- 超时时间：建议30秒或更长
- 端口：9000（应用内部固定端口）

## 测试地址

部署成功后，可通过以下地址测试：
- 首页：`https://message-server-uutepmlola.cn-hangzhou.fcapp.run/`
- 健康检查：`https://message-server-uutepmlola.cn-hangzhou.fcapp.run/health`
- 留言列表：`https://message-server-uutepmlola.cn-hangzhou.fcapp.run/messages`

## 问题修复说明

原始问题：
```
Error: Could not find or load main class JsonMessageApplication
```

修复方案：
- 修改了MANIFEST.MF文件中的Main-Class配置
- 从`JsonMessageApplication`更正为`com.resume.message.JsonMessageApplication`
- 确保JAR文件包含正确的主类路径信息