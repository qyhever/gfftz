package controller

import (
	"strconv"
	"strings"

	"gfftz/internal/models"
	"gfftz/internal/service"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// RoleController 资源控制器
type RoleController struct {
	roleService *service.RoleService
}

// NewRoleController 创建资源控制器实例
func NewRoleController() *RoleController {
	return &RoleController{
		roleService: service.NewRoleService(),
	}
}

// 分页列表
func (rc *RoleController) GetPagedList(c *gin.Context) {
	var param models.RoleGetListParam
	if err := c.ShouldBindJSON(&param); err != nil {
		ResponseFailedWithMsg(c, CodeInvalidParam, "请求参数错误: "+err.Error())
		return
	}

	result, err := rc.roleService.GetList(&param)
	if err != nil {
		zap.L().Error("get role list failed", zap.Error(err))
		ResponseFailed(c, CodeServerBusy)
		return
	}

	ResponseSuccess(c, result)
}

func (rc *RoleController) GetAll(c *gin.Context) {
	includeResourcesStr := c.DefaultQuery("includeResources", "false")
	includeResources, err := strconv.ParseBool(includeResourcesStr)
	if err != nil {
		ResponseFailedWithMsg(c, CodeInvalidParam, "invalid includeResources param")
		return
	}

	roles, err := rc.roleService.GetAll(includeResources)
	if err != nil {
		zap.L().Error("get all roles failed", zap.Error(err))
		ResponseFailed(c, CodeServerBusy)
		return
	}

	ResponseSuccess(c, roles)
}

func (rc *RoleController) GetOneByID(c *gin.Context) {
	// 获取路径参数
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		ResponseFailedWithMsg(c, CodeInvalidParam, "invalid id")
		return
	}

	// 调用服务获取数据
	role, err := rc.roleService.GetOneByID(uint64(id))
	if err != nil {
		zap.L().Error("get role by id failed", zap.Error(err))
		ResponseFailed(c, CodeResourceNotExist)
		return
	}

	if role == nil {
		ResponseFailed(c, CodeResourceNotExist)
		return
	}

	ResponseSuccess(c, role)
}

func (rc *RoleController) Create(c *gin.Context) {
	var param models.RoleCreateParam
	if err := c.ShouldBindJSON(&param); err != nil {
		ResponseFailedWithMsg(c, CodeInvalidParam, err.Error())
		return
	}

	// Validate input
	if len(param.Code) == 0 || len(param.Name) == 0 {
		ResponseFailedWithMsg(c, CodeInvalidParam, "code and name are required")
		return
	}

	insertID, err := rc.roleService.Create(&param)
	if err != nil {
		zap.L().Error("create role failed", zap.Error(err))

		// 根据错误类型返回不同的状态码
		if strings.Contains(err.Error(), "already exists") {
			ResponseFailedWithMsg(c, CodeResourceExists, "code already exists")
		} else {
			ResponseFailed(c, CodeServerBusy)
		}
		return
	}

	ResponseSuccess(c, insertID)
}

func (rc *RoleController) Update(c *gin.Context) {
	var param models.RoleUpdateParam
	if err := c.ShouldBindJSON(&param); err != nil {
		ResponseFailedWithMsg(c, CodeInvalidParam, err.Error())
		return
	}

	if err := rc.roleService.Update(&param); err != nil {
		zap.L().Error("update role failed", zap.Error(err))
		if strings.Contains(err.Error(), "not found") {
			ResponseFailed(c, CodeResourceNotExist)
		} else if strings.Contains(err.Error(), "code already exists") {
			ResponseFailedWithMsg(c, CodeResourceExists, "code already exists")
		} else if strings.Contains(err.Error(), "name already exists") {
			ResponseFailedWithMsg(c, CodeResourceExists, "name already exists")
		} else {
			ResponseFailed(c, CodeServerBusy)
		}
		return
	}

	ResponseSuccess(c, nil)
}

func (rc *RoleController) BatchDelete(c *gin.Context) {
	var param models.CommonBatchDeleteParam
	if err := c.ShouldBindJSON(&param); err != nil {
		ResponseFailedWithMsg(c, CodeInvalidParam, "请求参数错误: "+err.Error())
		return
	}

	if err := rc.roleService.BatchDelete(param.IDs); err != nil {
		zap.L().Error("delete role failed", zap.Error(err))
		if strings.Contains(err.Error(), "not found") {
			ResponseFailed(c, CodeResourceNotExist)
		} else {
			ResponseFailedWithMsg(c, CodeServerBusy, err.Error())
		}
		return
	}

	ResponseSuccess(c, nil)
}

func (rc *RoleController) ToggleEnabled(c *gin.Context) {
	var param models.CommonToggleEnabledParam
	err := c.ShouldBindJSON(&param)
	if err != nil {
		ResponseFailedWithMsg(c, CodeInvalidParam, "请求参数错误: "+err.Error())
		return
	}

	if err := rc.roleService.ToggleEnabled(param); err != nil {
		zap.L().Error("toggle role enabled failed", zap.Error(err))
		if strings.Contains(err.Error(), "not found") {
			ResponseFailed(c, CodeResourceNotExist)
		} else {
			ResponseFailedWithMsg(c, CodeServerBusy, err.Error())
		}
		return
	}

	ResponseSuccess(c, nil)
}
