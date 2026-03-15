package controller

import (
	"fmt"
	"strconv"
	"strings"

	"gfftz/internal/models"
	"gfftz/internal/service"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// ResourceController 资源控制器
type ResourceController struct {
	resourceService *service.ResourceService
}

// NewResourceController 创建资源控制器实例
func NewResourceController() *ResourceController {
	return &ResourceController{
		resourceService: service.NewResourceService(),
	}
}

// GetList 获取资源列表
func (rc *ResourceController) GetPagedList(c *gin.Context) {
	var param models.ResourceGetListParam
	if err := c.ShouldBindJSON(&param); err != nil {
		ResponseFailedWithMsg(c, CodeInvalidParam, "请求参数错误: "+err.Error())
		return
	}
	// 调用服务获取数据
	result, err := rc.resourceService.GetList(&param)
	if err != nil {
		zap.L().Error("get resource list failed", zap.Error(err))
		ResponseFailed(c, CodeServerBusy)
		return
	}

	ResponseSuccess(c, result)
}

// GetAll 获取所有资源
func (rc *ResourceController) GetAll(c *gin.Context) {
	// 调用服务获取所有资源
	resources, err := rc.resourceService.GetAll()
	if err != nil {
		zap.L().Error("get all resources failed", zap.Error(err))
		ResponseFailedWithMsg(c, CodeServerBusy, "获取所有资源失败")
		return
	}

	ResponseSuccess(c, resources)
}

// GetOneByID 根据ID获取资源详情
func (rc *ResourceController) GetOneByID(c *gin.Context) {
	// 获取路径参数
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		ResponseFailedWithMsg(c, CodeInvalidParam, "无效的资源ID")
		return
	}

	// 调用服务获取数据
	resource, err := rc.resourceService.GetOneByID(uint64(id))
	if err != nil {
		zap.L().Error("get resource by id failed", zap.Error(err))
		ResponseFailed(c, CodeResourceNotExist)
		return
	}
	fmt.Printf("%#v\n", resource)

	ResponseSuccess(c, resource)
}

// Create 创建新资源
func (rc *ResourceController) Create(c *gin.Context) {
	var param models.ResourceCreateParam
	if err := c.ShouldBindJSON(&param); err != nil {
		ResponseFailedWithMsg(c, CodeInvalidParam, "请求参数错误: "+err.Error())
		return
	}

	// 调用服务创建资源（默认值在服务层设置）
	insertId, err := rc.resourceService.Create(&param)
	if err != nil {
		zap.L().Error("create resource failed", zap.Error(err))

		// 根据错误类型返回不同的状态码
		if strings.Contains(err.Error(), "already exists") {
			ResponseFailed(c, CodeResourceExists)
		} else if strings.Contains(err.Error(), "parent resource not found") {
			ResponseFailedWithMsg(c, CodeInvalidParam, "父级资源不存在")
		} else {
			ResponseFailedWithMsg(c, CodeServerBusy, "创建资源失败")
		}
		return
	}

	ResponseSuccess(c, insertId)
}

// Update 更新资源
func (rc *ResourceController) Update(c *gin.Context) {
	var param models.ResourceUpdateParam
	if err := c.ShouldBindJSON(&param); err != nil {
		ResponseFailedWithMsg(c, CodeInvalidParam, "请求参数错误: "+err.Error())
		return
	}

	// 调用服务更新资源
	err := rc.resourceService.Update(&param)
	if err != nil {
		zap.L().Error("update resource failed", zap.Error(err))

		// 根据错误类型返回不同的状态码
		if strings.Contains(err.Error(), "not found") {
			ResponseFailed(c, CodeResourceNotExist)
		} else if strings.Contains(err.Error(), "already exists") {
			ResponseFailed(c, CodeResourceExists)
		} else {
			ResponseFailedWithMsg(c, CodeServerBusy, err.Error())
		}
		return
	}

	ResponseSuccess(c, nil)
}

// BatchDelete 批量删除资源
func (rc *ResourceController) BatchDelete(c *gin.Context) {
	var param models.CommonBatchDeleteParam
	if err := c.ShouldBindJSON(&param); err != nil {
		ResponseFailedWithMsg(c, CodeInvalidParam, "请求参数错误: "+err.Error())
		return
	}

	// 调用服务批量删除资源
	err := rc.resourceService.BatchDelete(param.IDs)
	if err != nil {
		zap.L().Error("batch delete resources failed", zap.Error(err))
		ResponseFailedWithMsg(c, CodeServerBusy, err.Error())
		return
	}

	ResponseSuccess(c, nil)
}

// ToggleEnabled 切换资源启用状态
func (rc *ResourceController) ToggleEnabled(c *gin.Context) {

	var param models.CommonToggleEnabledParam
	err := c.ShouldBindJSON(&param)
	if err != nil {
		ResponseFailedWithMsg(c, CodeInvalidParam, "请求参数错误: "+err.Error())
		return
	}

	err = rc.resourceService.ToggleEnabled(param)
	if err != nil {
		zap.L().Error("toggle resource enabled failed", zap.Error(err))

		if strings.Contains(err.Error(), "not found") {
			ResponseFailed(c, CodeResourceNotExist)
		} else {
			ResponseFailedWithMsg(c, CodeServerBusy, err.Error())
		}
		return
	}

	ResponseSuccess(c, nil)
}
