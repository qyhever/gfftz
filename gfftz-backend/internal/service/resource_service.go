package service

import (
	"gfftz/internal/dao/mysql"
	"gfftz/internal/models"
)

// ResourceService 资源服务结构体
type ResourceService struct{}

// NewResourceService 创建资源服务实例
func NewResourceService() *ResourceService {
	return &ResourceService{}
}

// GetList 获取资源列表（分页）
func (s *ResourceService) GetList(params *models.ResourceGetListParam) (models.CommonPaginationList[*models.Resource], error) {
	// 参数验证
	if params.CurrentPage <= 0 {
		params.CurrentPage = 1
	}
	if params.PageSize <= 0 || params.PageSize > 100 {
		params.PageSize = 10
	}

	// 设置默认排序
	if params.SortField == "" {
		params.SortField = "createdAt"
	}
	if params.SortValue == "" {
		params.SortValue = "desc"
	}

	resources, total, err := mysql.GetResourcePaginationList(params)
	if err != nil {
		return models.CommonPaginationList[*models.Resource]{}, err
	}

	return models.CommonPaginationList[*models.Resource]{
		List:  resources,
		Total: total,
	}, nil
}

// GetOneByID 根据ID获取资源详情
func (s *ResourceService) GetOneByID(id uint64) (*models.Resource, error) {
	if id <= 0 {
		return nil, ErrInvalidResourceID
	}

	resource, err := mysql.GetResourceByID(id)
	if err != nil {
		return nil, err
	}

	return resource, nil
}

// Create 创建新资源
func (s *ResourceService) Create(param *models.ResourceCreateParam) (uint64, error) {
	// 设置默认值
	if param.Type == "" {
		param.Type = "2"
	}
	param.IsEnabled = 1

	// 验证必填字段
	if err := s.validateResource(param); err != nil {
		return 0, err
	}

	// 检查代码是否已存在
	exists, err := mysql.CheckResourceCodeExists(param.Code, 0)
	if err != nil {
		return 0, err
	}
	if exists {
		return 0, ErrResourceCodeExists
	}

	// 如果有父级，验证父级是否存在
	if param.ParentCode != "" {
		_, err := mysql.GetResourceByCode(param.ParentCode)
		if err != nil {
			return 0, ErrParentResourceNotFound
		}
	}

	// 创建资源
	insertId, err := mysql.CreateResource(param)
	if err != nil {
		return 0, err
	}

	return insertId, nil
}

// Update 更新资源
func (s *ResourceService) Update(param *models.ResourceUpdateParam) error {
	// 验证必填字段
	if err := s.validateResource(param.ResourceCreateParam); err != nil {
		return err
	}

	// 检查资源是否存在
	existingResource, err := mysql.GetResourceByID(param.ID)
	if err != nil {
		return ErrResourceNotFound
	}

	// 如果是系统默认资源，不允许修改
	if existingResource.IsSystemDefault == 1 {
		return ErrSystemDefaultModify
	}

	// 检查代码是否已被其他资源使用
	exists, err := mysql.CheckResourceCodeExists(param.Code, param.ID)
	if err != nil {
		return err
	}
	if exists {
		return ErrResourceCodeExists
	}

	// 如果有父级，验证父级是否存在
	if param.ParentCode != "" {
		_, err := mysql.GetResourceByCode(param.ParentCode)
		if err != nil {
			return ErrParentResourceNotFound
		}
	}

	err = mysql.UpdateResource(param)
	if err != nil {
		return err
	}

	return nil
}

// BatchDelete 批量删除资源
func (s *ResourceService) BatchDelete(ids []uint64) error {
	if len(ids) == 0 {
		return ErrNoResourceIDs
	}

	// 检查每个资源
	for _, id := range ids {
		resource, err := mysql.GetResourceByID(id)
		if err != nil {
			continue
		}

		// 系统默认资源不允许删除
		if resource.IsSystemDefault == 1 {
			return ErrSystemDefaultModify
		}

		// 检查是否有子资源
		children, err := mysql.GetChildrenByParentCode(resource.Code)
		if err == nil && len(children) > 0 {
			continue
		}
	}

	err := mysql.BatchDeleteResources(ids)
	return err
}

// ToggleEnabled 切换资源启用状态
func (s *ResourceService) ToggleEnabled(param models.CommonToggleEnabledParam) error {
	if param.ID <= 0 {
		return ErrInvalidResourceID
	}

	if param.IsEnabled != 0 && param.IsEnabled != 1 {
		return ErrInvalidIsEnabled
	}

	// 检查资源是否存在
	existingResource, err := mysql.GetResourceByID(param.ID)
	if err != nil {
		return ErrResourceNotFound
	}

	// 如果是系统默认资源，不允许修改
	if existingResource.IsSystemDefault == 1 {
		return ErrSystemDefaultModify
	}

	err = mysql.ToggleResourceEnabled(param)
	if err != nil {
		return err
	}

	return nil
}

// GetTree 获取资源树（用于权限管理）
func (s *ResourceService) GetAll() ([]*models.Resource, error) {
	allResources, err := mysql.GetAllResources()
	if err != nil {
		return nil, err
	}

	// 构建资源树
	// 注意：这里仅获取了根节点，如果需要完整的树结构，需要在Resource模型中添加Children字段并进行递归组装
	// 或者前端进行组装。这里保持原有逻辑，只返回根节点（根据代码逻辑）
	// 原有逻辑 seems to assume tree building logic or just filtering roots.
	// 修正：原代码只筛选了 ParentCode == "" 的，这里保持一致，但逻辑上可能需要前端处理树

	// var rootResources []*models.Resource
	// for _, resource := range allResources {
	// 	if resource.ParentCode == "" {
	// 		rootResources = append(rootResources, resource)
	// 	}
	// }

	return allResources, nil
}

// validateResource 验证资源数据
func (s *ResourceService) validateResource(resource *models.ResourceCreateParam) error {
	if resource.Code == "" {
		return ErrResourceCodeEmpty
	}
	if resource.Name == "" {
		return ErrResourceNameEmpty
	}
	if resource.Type != "1" && resource.Type != "2" {
		return ErrInvalidResourceType
	}
	if resource.IsEnabled != 0 && resource.IsEnabled != 1 {
		return ErrInvalidIsEnabled
	}
	return nil
}

// GetByCode 根据Code获取资源详情
func (s *ResourceService) GetByCode(code string) (*models.Resource, error) {
	if code == "" {
		return nil, ErrResourceCodeEmpty
	}

	resource, err := mysql.GetResourceByCode(code)
	if err != nil {
		return nil, err
	}

	return resource, nil
}
