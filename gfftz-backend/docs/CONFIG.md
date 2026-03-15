# 配置系统使用说明

## 概述

本项目使用 Viper 库实现配置管理，支持 YAML 格式的配置文件和环境变量。

## 配置文件结构

配置文件位于 `internal/config/dev.yaml`，包含以下配置项：

```yaml
server:
  port: 6300

database:
  mysql:
    addr: "localhost:3306"
    user: "root"
    password: "root123"
    db_name: "gfftz"

jwt:
  secret: "foobar"
  expires_in: "4h"
```

## 配置结构体

### Config
主配置结构体，包含所有子配置：
- `Server`: 服务器配置
- `Database`: 数据库配置  
- `JWT`: JWT配置

### ServerConfig
服务器相关配置：
- `Port`: 服务器监听端口

### DatabaseConfig
数据库相关配置：
- `MySQL`: MySQL数据库配置

### MySQLConfig
MySQL数据库具体配置：
- `Addr`: 数据库地址
- `User`: 数据库用户名
- `Password`: 数据库密码
- `DBName`: 数据库名称

### JWTConfig
JWT相关配置：
- `Secret`: JWT签名密钥
- `ExpiresIn`: JWT过期时间

## 使用方法

### 1. 初始化配置

```go
import "gfftz/internal/config"

func main() {
    // 初始化配置
    if err := config.Init(); err != nil {
        log.Fatalf("配置初始化失败: %v", err)
    }
}
```

### 2. 获取配置

```go
// 获取完整配置
cfg := config.GetConfig()

// 获取服务器地址（格式: :port）
addr := config.GetServerAddr()

// 获取MySQL连接字符串
dsn := config.GetMySQLDSN()
```

### 3. 访问具体配置项

```go
cfg := config.GetConfig()

// 访问服务器端口
port := cfg.Server.Port

// 访问数据库配置
dbUser := cfg.Database.MySQL.User
dbPassword := cfg.Database.MySQL.Password

// 访问JWT配置
jwtSecret := cfg.JWT.Secret
jwtExpires := cfg.JWT.ExpiresIn
```

## 环境变量支持

配置系统支持通过环境变量覆盖配置文件中的值，环境变量前缀为 `GFFTZ_`：

```bash
# 覆盖服务器端口
export GFFTZ_SERVER_PORT=8080

# 覆盖数据库密码
export GFFTZ_DATABASE_MYSQL_PASSWORD=newpassword

# 覆盖JWT密钥
export GFFTZ_JWT_SECRET=newsecret
```

## 配置文件搜索路径

系统会按以下优先级搜索配置文件：
1. `{工作目录}/internal/config/dev.yaml`
2. `./internal/config/dev.yaml`
3. `./dev.yaml`

## 工具函数

### GetServerAddr()
返回格式化的服务器监听地址（如 `:6300`）

### GetMySQLDSN()
返回完整的MySQL连接字符串，格式：
```
user:password@tcp(addr)/dbname?charset=utf8mb4&parseTime=True&loc=Local
```

## 测试

运行配置相关测试：
```bash
go test ./internal/config -v
```

## 注意事项

1. 配置必须在应用程序启动时初始化
2. 配置文件不存在或格式错误会导致程序启动失败
3. 环境变量会覆盖配置文件中的对应值
4. 敏感信息（如数据库密码）建议通过环境变量设置