package service

import (
	"gfftz/internal/dao/mysql"
	"gfftz/internal/models"
)

// RoleService 资源服务结构体
type RoleService struct{}

// NewRoleService 创建资源服务实例
func NewRoleService() *RoleService {
	return &RoleService{}
}

func (s *RoleService) GetList(params *models.RoleGetListParam) (models.CommonPaginationList[*models.Role], error) {
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

	roles, total, err := mysql.GetRolePaginationList(params)
	if err != nil {
		return models.CommonPaginationList[*models.Role]{}, err
	}

	return models.CommonPaginationList[*models.Role]{
		List:  roles,
		Total: total,
	}, nil
}

func (s *RoleService) GetAll(includeResources bool) ([]*models.Role, error) {
	return mysql.GetAllRoles(includeResources)
}

func (s *RoleService) GetOneByID(id uint64) (*models.Role, error) {
	if id <= 0 {
		return nil, ErrInvalidRoleID
	}

	return mysql.GetRoleByID(id)
}

func (s *RoleService) Create(param *models.RoleCreateParam) (uint64, error) {
	// Validate code uniqueness
	exists, err := mysql.CheckRoleCodeExists(param.Code)
	if err != nil {
		return 0, err
	}
	if exists {
		return 0, ErrRoleCodeExists
	}

	return mysql.CreateRole(param)
}

func (s *RoleService) Update(param *models.RoleUpdateParam) error {
	// Check if the role exists
	role, err := s.GetOneByID(param.ID)
	if err != nil {
		return ErrRoleNotFound
	}

	if role.IsSystemDefault == 1 {
		return ErrSystemDefaultModify
	}

	return mysql.UpdateRole(param)
}

// BatchDelete deletes multiple roles by their IDs.
func (s *RoleService) BatchDelete(ids []uint64) error {
	if len(ids) == 0 {
		return ErrNoRoleIDs
	}
	for _, id := range ids {
		role, err := s.GetOneByID(id)
		if err != nil {
			continue
		}
		if role.IsSystemDefault == 1 {
			return ErrSystemDefaultModify
		}
	}
	return mysql.BatchDeleteRoles(ids)
}

// ToggleEnabled toggles the isEnabled status of a role.
func (s *RoleService) ToggleEnabled(param models.CommonToggleEnabledParam) error {
	if param.ID <= 0 {
		return ErrInvalidRoleID
	}

	if param.IsEnabled != 0 && param.IsEnabled != 1 {
		return ErrInvalidIsEnabled
	}
	role, err := s.GetOneByID(param.ID)
	if err != nil {
		return ErrRoleNotFound
	}

	if role.IsSystemDefault == 1 {
		return ErrSystemDefaultModify
	}

	return mysql.ToggleRoleEnabled(param)
}
