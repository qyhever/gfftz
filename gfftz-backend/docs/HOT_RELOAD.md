# 热重载开发模式使用说明

## 问题解决

### Air 安装问题修复

原因：Air 项目从 `github.com/cosmtrek/air` 迁移到了 `github.com/air-verse/air`

解决方案：
- 更新了 Makefile 和 dev.sh 脚本，使用正确的包路径
- 添加了 GOPATH/bin 到 PATH 环境变量
- 使用国内代理 `goproxy.cn` 加速下载

## 使用方法

### 1. 启动热重载模式

```bash
# 使用 Makefile
make hot

# 使用开发脚本
./dev.sh hot
```

### 2. 开发体验

🔥 **自动检测文件变化**
- 监听 `.go`、`.yaml`、`.yml`、`.html` 等文件
- 修改文件后自动触发重新编译

🚀 **快速重启**
- 编译速度快（相比 `go run`）
- 自动重启服务，无需手动操作

📁 **智能监听**
- 排除 `tmp`、`vendor`、`testdata` 等目录
- 排除测试文件 `*_test.go`

### 3. 配置文件

Air 配置文件位于 `.air.toml`，主要配置：

```toml
[build]
  cmd = "go build -o ./tmp/main ."  # 编译命令
  bin = "./tmp/main"               # 生成的二进制文件
  include_ext = ["go", "yaml", "yml", "html"]  # 监听的文件扩展名
  exclude_dir = ["tmp", "vendor", "testdata"]  # 排除的目录
```

## 开发建议

### 日常开发流程

1. **启动热重载模式**
   ```bash
   make hot
   ```

2. **编辑代码**
   - 修改任何 Go 文件
   - 修改配置文件 (yaml)
   - 修改模板文件 (html)

3. **自动生效**
   - 保存文件后自动重新编译
   - 自动重启服务
   - 配置重新加载

### 性能对比

| 开发方式 | 启动时间 | 重启时间 | 开发体验 |
|----------|----------|----------|----------|
| `go run main.go` | ~19秒 | ~19秒 | ❌ 慢 |
| `go build + ./gfftz` | ~1.4秒 | 手动 | ⚠️ 需手动重启 |
| 热重载模式 | ~1.4秒 | ~1秒 | ✅ 自动化 |

### 最佳实践

1. **使用热重载进行日常开发**
   ```bash
   make hot  # 推荐
   ```

2. **生产部署使用编译版本**
   ```bash
   make build
   ```

3. **CI/CD 使用标准构建**
   ```bash
   go build -o app .
   ```

## 故障排除

### 问题 1：air 命令未找到

**症状**：
```
make: air: No such file or directory
```

**解决方案**：
```bash
# 检查 air 是否安装
ls -la $(go env GOPATH)/bin/air

# 手动安装
GOPROXY=https://goproxy.cn,direct go install github.com/air-verse/air@latest

# 添加到 PATH（临时）
export PATH="$(go env GOPATH)/bin:$PATH"
```

### 问题 2：端口被占用

**症状**：
```
bind: address already in use
```

**解决方案**：
```bash
# 停止相关进程
pkill -f gfftz
pkill -f "tmp/main"

# 或修改配置文件中的端口
vim internal/config/dev.yaml
```

### 问题 3：文件变化不触发重启

**检查**：
- 确认文件扩展名在监听列表中
- 检查文件是否在排除目录中
- 查看 `.air.toml` 配置

## 技术详细

### Air 工作原理

1. **文件监听**：使用 fsnotify 监听文件系统变化
2. **条件构建**：根据配置决定何时触发重新构建
3. **进程管理**：自动终止旧进程，启动新进程
4. **日志输出**：实时显示应用程序日志

### 配置优化

当前配置针对 Go Web 项目优化：
- 构建延迟：1秒（防止频繁重启）
- 监听文件类型：`.go`, `.yaml`, `.yml`, `.html`
- 排除目录：`tmp`, `vendor`, `testdata`
- 排除文件：`*_test.go`（测试文件）

这个配置确保了最佳的开发体验和性能平衡。