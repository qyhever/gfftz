package controller

import (
	"strconv"
	"strings"

	"gfftz/internal/models"
	"gfftz/internal/service"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type UserController struct {
	userService *service.UserService
}

func NewUserController() *UserController {
	return &UserController{
		userService: service.NewUserService(),
	}
}

func (uc *UserController) GetPagedList(c *gin.Context) {
	var param models.UserGetListParam
	if err := c.ShouldBindJSON(&param); err != nil {
		ResponseFailedWithMsg(c, CodeInvalidParam, "请求参数错误: "+err.Error())
		return
	}

	result, err := uc.userService.GetList(&param)
	if err != nil {
		zap.L().Error("get user list failed", zap.Error(err))
		ResponseFailed(c, CodeServerBusy)
		return
	}

	ResponseSuccess(c, result)
}

func (uc *UserController) GetOneByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		ResponseFailedWithMsg(c, CodeInvalidParam, "invalid id")
		return
	}

	user, err := uc.userService.GetOneByID(uint64(id))
	if err != nil {
		zap.L().Error("get user by id failed", zap.Error(err))
		ResponseFailed(c, CodeResourceNotExist)
		return
	}

	if user == nil {
		ResponseFailed(c, CodeResourceNotExist)
		return
	}

	ResponseSuccess(c, user)
}

func (uc *UserController) Create(c *gin.Context) {
	var param models.UserCreateParam
	if err := c.ShouldBindJSON(&param); err != nil {
		ResponseFailedWithMsg(c, CodeInvalidParam, err.Error())
		return
	}

	insertID, err := uc.userService.Create(&param)
	if err != nil {
		zap.L().Error("create user failed", zap.Error(err))
		// 根据错误类型返回不同的状态码
		if strings.Contains(err.Error(), "already exists") {
			ResponseFailedWithMsg(c, CodeResourceExists, "mobile already exists")
		} else {
			ResponseFailed(c, CodeServerBusy)
		}
		return
	}

	ResponseSuccess(c, insertID)
}

func (uc *UserController) Update(c *gin.Context) {
	var param models.UserUpdateParam
	if err := c.ShouldBindJSON(&param); err != nil {
		ResponseFailedWithMsg(c, CodeInvalidParam, err.Error())
		return
	}

	if err := uc.userService.Update(&param); err != nil {
		zap.L().Error("update user failed", zap.Error(err))
		if strings.Contains(err.Error(), "not found") {
			ResponseFailed(c, CodeResourceNotExist)
		} else if strings.Contains(err.Error(), "username already exists") {
			ResponseFailedWithMsg(c, CodeResourceExists, "username already exists")
		} else if strings.Contains(err.Error(), "mobile already exists") {
			ResponseFailedWithMsg(c, CodeResourceExists, "mobile already exists")
		} else {
			ResponseFailedWithMsg(c, CodeServerBusy, err.Error())
		}
		return
	}

	ResponseSuccess(c, nil)
}

func (uc *UserController) BatchDelete(c *gin.Context) {
	var param models.CommonBatchDeleteParam
	if err := c.ShouldBindJSON(&param); err != nil {
		ResponseFailedWithMsg(c, CodeInvalidParam, "请求参数错误: "+err.Error())
		return
	}

	if err := uc.userService.BatchDelete(param.IDs); err != nil {
		zap.L().Error("delete user failed", zap.Error(err))
		if strings.Contains(err.Error(), "not found") {
			ResponseFailed(c, CodeResourceNotExist)
		} else {
			ResponseFailedWithMsg(c, CodeServerBusy, err.Error())
		}
		return
	}

	ResponseSuccess(c, nil)
}

func (uc *UserController) ToggleEnabled(c *gin.Context) {
	var param models.CommonToggleEnabledParam
	err := c.ShouldBindJSON(&param)
	if err != nil {
		ResponseFailedWithMsg(c, CodeInvalidParam, "请求参数错误: "+err.Error())
		return
	}

	if err := uc.userService.ToggleEnabled(param); err != nil {
		zap.L().Error("toggle user enabled failed", zap.Error(err))
		if strings.Contains(err.Error(), "not found") {
			ResponseFailed(c, CodeResourceNotExist)
		} else {
			ResponseFailedWithMsg(c, CodeServerBusy, err.Error())
		}
		return
	}

	ResponseSuccess(c, nil)
}

// GetUserByJWT 根据 JWT 上下文返回当前登录用户信息。
// 从 Gin 上下文读取用户ID，查询并返回用户详情（包含角色）。
func (uc *UserController) GetOneByJWT(c *gin.Context) {
	v, ok := c.Get("userID")
	if !ok {
		ResponseFailed(c, CodeNeedLogin)
		return
	}

	var userID int
	switch id := v.(type) {
	case uint64:
		userID = int(id)
	case int:
		userID = id
	case int64:
		userID = int(id)
	case float64:
		userID = int(id)
	default:
		ResponseFailedWithMsg(c, CodeInvalidParam, "无效的用户ID类型")
		return
	}

	user, err := uc.userService.GetOneByID(uint64(userID))
	if err != nil {
		ResponseFailed(c, CodeServerBusy)
		return
	}
	if user == nil {
		ResponseFailed(c, CodeUserNotExist)
		return
	}

	ResponseSuccess(c, user)
}

func (uc *UserController) UpdatePasswordByMobile(c *gin.Context) {
	var param models.UserPasswordUpdateParam
	err := c.ShouldBindJSON(&param)
	if err != nil {
		ResponseFailedWithMsg(c, CodeInvalidParam, "请求参数错误: "+err.Error())
		return
	}

	if err := uc.userService.UpdatePasswordByMobile(param); err != nil {
		zap.L().Error("update user password failed", zap.Error(err))
		if strings.Contains(err.Error(), "not found") {
			ResponseFailed(c, CodeResourceNotExist)
		} else if strings.Contains(err.Error(), "incorrect") {
			ResponseFailedWithMsg(c, CodeServerBusy, "密码错误")
		} else {
			ResponseFailed(c, CodeServerBusy)
		}
		return
	}

	ResponseSuccess(c, nil)
}
