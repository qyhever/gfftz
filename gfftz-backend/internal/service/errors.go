package service

import "errors"

var (
	// Common
	ErrInvalidParam        = errors.New("参数错误")
	ErrInvalidIsEnabled    = errors.New("启用状态必须为0或1")
	ErrSystemDefaultModify = errors.New("系统内置资源不能操作")

	// User
	ErrInvalidUserID     = errors.New("无效的用户ID")
	ErrUserMobileExists  = errors.New("手机号已存在")
	ErrUserNotFound      = errors.New("用户不存在")
	ErrNoUserIDs         = errors.New("未提供用户ID")
	ErrPasswordIncorrect = errors.New("密码错误")

	// Role
	ErrInvalidRoleID  = errors.New("无效的角色ID")
	ErrRoleCodeExists = errors.New("角色代码已存在")
	ErrRoleNotFound   = errors.New("角色不存在")
	ErrNoRoleIDs      = errors.New("未提供角色ID")

	// Resource
	ErrInvalidResourceID      = errors.New("无效的资源ID")
	ErrResourceCodeExists     = errors.New("资源代码已存在")
	ErrParentResourceNotFound = errors.New("父级资源不存在")
	ErrResourceNotFound       = errors.New("资源不存在")
	// ErrSystemDefaultResourceModify = errors.New("系统默认资源不允许修改") // Deprecated: Use ErrSystemDefaultModify
	ErrNoResourceIDs       = errors.New("未提供资源ID")
	ErrResourceCodeEmpty   = errors.New("资源代码不能为空")
	ErrResourceNameEmpty   = errors.New("资源名称不能为空")
	ErrInvalidResourceType = errors.New("资源类型必须为1(目录)或2(菜单)")
)
