# ============================================
# 阶段 1: 构建阶段
# ============================================
FROM golang:1.25.1-alpine AS builder

# 设置工作目录
WORKDIR /build

# 安装构建依赖
RUN apk add --no-cache git ca-certificates tzdata

# 设置 Go 模块代理（加速构建）
ENV GOPROXY=https://goproxy.cn,direct \
    GOSUMDB=sum.golang.google.cn \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64

# 复制 go.mod 和 go.sum（利用 Docker 缓存）
COPY go.mod go.sum ./
RUN go mod download

# 复制源代码
COPY . .

# 编译二进制文件
RUN go build -ldflags="-s -w" -o gfftz main.go

# ============================================
# 阶段 2: 运行阶段（最小化镜像）
# ============================================
FROM alpine:latest

# 设置工作目录
WORKDIR /app

# 安装运行时依赖
RUN apk add --no-cache ca-certificates tzdata

# 设置时区为中国时区
ENV TZ=Asia/Shanghai

# 从构建阶段复制二进制文件
COPY --from=builder /build/gfftz .

# 复制配置文件
COPY --from=builder /build/internal/config/*.yml ./internal/config/

# 创建日志目录
RUN mkdir -p /app/log

# 暴露端口（根据配置文件中的端口）
EXPOSE 6300

# 设置默认环境为生产环境
ENV GFFTZ_ENV=prod

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:6300/api/meta || exit 1

# 运行应用
CMD ["./gfftz"]
