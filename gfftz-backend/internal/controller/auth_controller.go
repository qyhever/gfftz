package controller

import (
	"strings"

	"gfftz/internal/models"
	jwtpkg "gfftz/internal/pkg/jwt"
	"gfftz/internal/service"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
)

// LoginHandler 处理用户登录请求。
// 绑定用户名和密码，校验有效性，成功则生成并返回 JWT 访问令牌与刷新令牌。
func LoginHandler(c *gin.Context) {
	userService := service.NewUserService()

	var param models.AuthLoginParam
	if err := c.ShouldBindJSON(&param); err != nil {
		ResponseFailedWithMsg(c, CodeInvalidParam, err.Error())
		return
	}
	// 读取用户数据（用户不存在不视为系统错误）
	user, err := userService.GetUserByMobile(strings.TrimSpace(param.Mobile))
	if err != nil {
		zap.L().Error("get user by mobile failed", zap.Error(err))
		ResponseFailed(c, CodeServerBusy)
		return
	}
	if user == nil {
		zap.L().Error("user not exist", zap.String("mobile", param.Mobile))
		ResponseFailed(c, CodeUserNotExist)
		return
	}

	// 使用 bcrypt 进行密码校验
	if err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(param.Password)); err != nil {
		zap.L().Error("password not match", zap.String("mobile", param.Mobile))
		ResponseFailed(c, CodeInvalidPassword)
		return
	}

	// 生成访问令牌与刷新令牌
	aToken, rToken, err := jwtpkg.GenToken(uint64(user.ID), param.RememberMe)
	if err != nil {
		zap.L().Error("gen token failed", zap.Error(err))
		ResponseFailed(c, CodeServerBusy)
		return
	}

	// 返回令牌
	ResponseSuccess(c, gin.H{
		"accessToken":  aToken,
		"refreshToken": rToken,
	})
}

// RefreshTokenHandler 刷新访问令牌。
// 接收 refreshToken，校验有效性及用户状态，成功则生成并返回新的令牌对。
func RefreshTokenHandler(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refreshToken" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		ResponseFailedWithMsg(c, CodeInvalidParam, err.Error())
		return
	}

	// 解析 refreshToken
	claims, err := jwtpkg.ParseToken(req.RefreshToken)
	if err != nil {
		ResponseFailed(c, CodeInvalidToken)
		return
	}
	if !claims.IsRefreshToken() {
		ResponseFailed(c, CodeInvalidToken)
		return
	}

	// 校验用户
	userService := service.NewUserService()
	user, err := userService.GetOneByID(claims.UserID)
	if err != nil {
		zap.L().Error("get user failed", zap.Error(err))
		ResponseFailed(c, CodeServerBusy)
		return
	}
	if user == nil {
		ResponseFailed(c, CodeUserNotExist)
		return
	}
	// 检查用户是否被禁用
	if user.IsEnabled == 0 {
		ResponseFailedWithMsg(c, CodeServerBusy, "账户已被禁用")
		return
	}

	// 生成新 token，并沿用 refresh token 中记录的会话策略
	newAToken, newRToken, err := jwtpkg.GenToken(uint64(user.ID), claims.RememberMe)
	if err != nil {
		zap.L().Error("gen token failed", zap.Error(err))
		ResponseFailed(c, CodeServerBusy)
		return
	}

	ResponseSuccess(c, gin.H{
		"accessToken":  newAToken,
		"refreshToken": newRToken,
	})
}
