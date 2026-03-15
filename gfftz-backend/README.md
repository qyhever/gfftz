# GFFTZ 项目

## 环境配置

项目支持三种环境：`dev`（开发）、`test`（测试）、`prod`（生产）

### 配置环境变量

复制环境变量模板：
```bash
# Linux/macOS
cp .env.example .env
source .env

# Windows (PowerShell)
Copy-Item .env.example .env
# 然后手动设置环境变量或使用下面的命令
$env:GFFTZ_ENV = "dev"
```

### 环境切换

```bash
# 方式一：通过环境变量切换
export GFFTZ_ENV=dev    # 开发环境（默认）
export GFFTZ_ENV=test   # 测试环境
export GFFTZ_ENV=prod   # 生产环境

# 方式二：在脚本命令中指定
./scripts/dev.sh hot dev     # 开发环境热重载
./scripts/dev.sh hot test    # 测试环境热重载
./scripts/dev.sh build prod  # 生产环境编译
```

配置文件位置：
- `internal/config/dev.yml` - 开发环境配置
- `internal/config/test.yml` - 测试环境配置
- `internal/config/prod.yml` - 生产环境配置

## 快速开始

### 方式一：Docker 部署（推荐生产使用）🐳

```bash
# 快速启动（包含数据库）
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 或使用部署脚本
chmod +x scripts/deploy.sh
./scripts/deploy.sh prod start    # 启动生产环境
./scripts/deploy.sh prod logs     # 查看日志
```

查看完整部署文档：[docs/DEPLOY.md](docs/DEPLOY.md)

### 方式二：热重载模式（推荐开发使用）🔥

```bash
# 开发环境热重载（默认）
./scripts/dev.sh hot

# 指定环境热重载
./scripts/dev.sh hot test    # 测试环境
./scripts/dev.sh hot prod    # 生产环境
```

### 方式三：使用开发脚本

```bash
# 编译项目（使用默认 dev 环境）
./scripts/dev.sh build

# 指定环境编译
./scripts/dev.sh build prod

# 运行项目
./scripts/dev.sh run

# 开发模式（编译+运行）
./scripts/dev.sh dev test    # 使用测试环境

# 清理构建文件
./scripts/dev.sh clean
```

### 方式四：传统方式

```bash
# 设置环境变量
export GFFTZ_ENV=prod

# 编译后运行
go build -o tmp/main .
./tmp/main

# 直接运行
go run main.go
```

## 性能对比

| 启动方式 | 初始启动 | 重启时间 | 开发体验 |
|------------|------------|------------|------------|
| `go run main.go` | ~19秒 | ~19秒 | ❌ 慢 |
| `go build + ./gfftz` | ~1.4秒 | 手动 | ⚠️ 需手动重启 |
| **热重载模式** | ~1.4秒 | ~1秒 | ✅ 自动化 |

## 开发建议

1. **日常开发**: 使用 `./scripts/dev.sh hot` 热重载模式（默认 dev 环境）✨
2. **快速测试**: 使用 `./scripts/dev.sh dev`
3. **测试环境**: 使用 `./scripts/dev.sh hot test`
4. **生产部署**: 设置 `GFFTZ_ENV=prod`，使用 `go build` 编译后运行二进制文件

## 相关文档

- [docs/CONFIG.md](docs/CONFIG.md) - 详细配置说明
- [docs/HOT_RELOAD.md](docs/HOT_RELOAD.md) - 热重载使用说明和故障排除
- [docs/DEPLOY.md](docs/DEPLOY.md) - Docker 部署和 CI/CD 配置

## 部署方式

### 🐳 Docker 部署

```bash
# 本地测试
docker-compose up -d

# 生产部署（使用部署脚本）
chmod +x scripts/deploy.sh
./scripts/deploy.sh prod start
```

### 🚀 GitHub Actions 自动部署

项目已配置自动化 CI/CD 流程：

**触发条件：**
- Push 到 `main` 或 `master` 分支
- 手动触发工作流

**流程：**
1. 代码质量检查（lint & format check）
2. 构建 Docker 镜像
3. 推送到 GitHub Container Registry (ghcr.io)
4. 触发中央部署仓库

**配置 Secrets：**
在 GitHub 仓库设置中添加 `CROSS_REPO_PAT`（用于触发部署）

详细配置见：[docs/DEPLOY.md](docs/DEPLOY.md)

### 📦 使用预构建镜像

```bash
# 拉取最新镜像
docker pull ghcr.io/your-org/gfftz:latest

# 运行容器
docker run -d \
  --name gfftz-app \
  -p 6300:6300 \
  -e GFFTZ_ENV=prod \
  -e GFFTZ_DATABASE_MYSQL_ADDR=mysql-host:3306 \
  -e GFFTZ_DATABASE_MYSQL_PASSWORD=your_password \
  ghcr.io/your-org/gfftz:latest
```

## 实际项目结构

```
.
├── internal/config     # 配置模块
│   ├── config.go      # 配置逻辑
│   ├── config_test.go # 配置测试
│   └── dev.yaml       # 开发环境配置
├── CONFIG.md          # 配置文档
├── README.md          # 项目文档
├── main.go           # 主程序
├── dev.sh            # 开发脚本
├── Makefile          # Make 构建文件
└── .air.toml         # 热重载配置
```
```bash
project/
├── cmd/                # 程序入口（可选，用于分离编译入口）
│   └── app/            # 主程序入口
│       └── main.go     # 应用启动入口
│
├── internal/           # 内部核心代码（禁止外部直接引用）
│   ├── config/         # 配置管理
│   │   ├── config.go   # 配置加载逻辑（viper 初始化）
│   │   ├── dev.yaml    # 开发环境配置
│   │   ├── prod.yaml   # 生产环境配置
│   │   └── ...         # 其他环境配置（如 test.yaml）
│   │
│   ├── api/            # API 定义（可选，用于 OpenAPI 文档或 DTO 隔离）
│   │   └── v1/         # 版本化 API（如 v1、v2）
│   │       ├── user.api.yaml  # OpenAPI 规范（可选）
│   │       └── user.dto.go    # 请求/响应 DTO（Data Transfer Object）
│   │
│   ├── controller/     # 控制层（HTTP 请求处理）
│   │   ├── user/       # 用户模块控制器
│   │   │   ├── user_controller.go
│   │   │   └── routes.go       # 模块路由注册（可选，分散路由定义）
│   │   ├── order/      # 订单模块控制器
│   │   └── ...         # 其他业务模块
│   │
│   ├── service/        # 服务层（核心业务逻辑）
│   │   ├── user/       # 用户模块服务
│   │   │   ├── user_service.go
│   │   │   └── service_interface.go  # 接口定义（可选，用于依赖倒置）
│   │   ├── order/      # 订单模块服务
│   │   └── ...         # 其他业务模块
│   │
│   ├── dao/            # 数据访问层（数据库/缓存操作）
│   │   ├── user/       # 用户模块 DAO
│   │   │   ├── user_dao.go
│   │   │   └── user_model.go     # 数据库模型（与 DTO 隔离）
│   │   ├── redis/      # Redis 缓存操作（可选，按存储类型拆分）
│   │   └── ...         # 其他数据源（如 mysql、es）
│   │
│   ├── middleware/     # 中间件（鉴权、日志、限流等）
│   │   ├── auth.go     # JWT 鉴权中间件
│   │   ├── logger.go   # 日志中间件（Zap 或 Logrus）
│   │   ├── cors.go     # CORS 跨域中间件
│   │   └── ...         # 其他中间件（如限流、参数校验）
│   │
│   ├── utils/          # 工具库（通用功能）
│   │   ├── date.go     # 时间处理工具
│   │   ├── encrypt.go  # 加密/哈希工具（如 JWT、AES）
│   │   ├── validate.go # 参数校验工具（结合 go-playground/validator）
│   │   └── ...         # 其他工具（如分页、错误码）
│   │
│   ├── error/          # 错误处理（自定义错误类型）
│   │   ├── code.go     # 错误码定义（如 HTTP 状态码 + 业务码）
│   │   └── error.go    # 自定义错误结构体（实现 error 接口）
│   │
│   └── router/         # 路由总控（集中式路由注册）
│       └── router.go   # 所有模块路由注册入口
│
├── pkg/                # 可复用的公共组件（允许外部项目引用）
│   ├── log/            # 日志封装（如 Zap 初始化）
│   ├── db/             # 数据库封装（如 GORM 配置）
│   └── redis/          # Redis 封装（如连接池管理）
│
├── api-docs/           # API 文档（自动生成，如 Swagger）
│   └── swagger.yaml
│
├── test/               # 集成测试/端到端测试
│   ├── e2e/            # 端到端测试（模拟用户操作流程）
│   └── unit/           # 单元测试（按模块拆分，如 controller_test.go）
│
├── scripts/            # 运维脚本（部署、构建、监控）
│   ├── docker-compose.yml  # Docker 容器编排
│   ├── build.sh            # 编译脚本（跨平台）
│   └── deploy.sh           # 生产部署脚本
│
├── configs/            # 全局配置（可选，替代 internal/config）
│   └── ...             # 若项目简单，可直接放根目录
│
├── go.mod              # Go 模块依赖
├── go.sum
├── README.md           # 项目文档（功能说明、部署步骤）
└── LICENSE             # 开源协议（如 MIT、Apache）
```

## 依赖
- [gin](https://github.com/gin-gonic/gin)
- [viper](github.com/spf13/viper)
- [mysql](github.com/go-sql-driver/mysql)
- [lumberjack](github.com/natefinch/lumberjack)
- [zap](go.uber.org/zap)

## 添加依赖
```bash
go get -u github.com/gin-gonic/gin
```

安装air
```bash
go install github.com/air-verse/air
```

整理依赖
```bash
go mod tidy
```
清理未使用的依赖，整理直接依赖和间接依赖

## 解决访问 Go 官方模块仓库速度慢或无法访问的问题
在开发前需要先加载 .env.example 这些环境变量：

Linux/macOS:
```bash
source .env
```

Windows:
```bash
# 需要手动设置环境变量，或者使用：
$env:GOPROXY = "https://goproxy.cn,direct"
$env:GOSUMDB = "sum.golang.google.cn"
$env:GO111MODULE = "on"
``` 