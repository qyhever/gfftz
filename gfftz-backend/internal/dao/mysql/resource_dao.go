package mysql

import (
	"fmt"
	"gfftz/internal/models"
	"strings"
)

func GetResourcePaginationList(params *models.ResourceGetListParam) (resources []*models.Resource, total int64, err error) {
	// 计算偏移量
	offset := (params.CurrentPage - 1) * params.PageSize

	// 构建查询条件
	whereClauses := []string{"isDeleted = 0"}
	args := []interface{}{}

	// 添加过滤条件
	if params.Name != "" {
		whereClauses = append(whereClauses, "name LIKE ?")
		args = append(args, "%"+params.Name+"%")
	}

	if params.Code != "" {
		whereClauses = append(whereClauses, "code LIKE ?")
		args = append(args, "%"+params.Code+"%")
	}

	if params.ParentCode != "" {
		whereClauses = append(whereClauses, "parentCode = ?")
		args = append(args, params.ParentCode)
	}

	if params.Type != "" {
		whereClauses = append(whereClauses, "type = ?")
		args = append(args, params.Type)
	}

	if params.IsEnabled != nil {
		whereClauses = append(whereClauses, "isEnabled = ?")
		args = append(args, *params.IsEnabled)
	}

	// 添加创建日期区间过滤
	if params.CreatedAtStart != "" {
		whereClauses = append(whereClauses, "createdAt >= ?")
		args = append(args, params.CreatedAtStart)
	}

	if params.CreatedAtEnd != "" {
		whereClauses = append(whereClauses, "createdAt <= ?")
		args = append(args, params.CreatedAtEnd)
	}

	// 添加更新日期区间过滤
	if params.UpdatedAtStart != "" {
		whereClauses = append(whereClauses, "updatedAt >= ?")
		args = append(args, params.UpdatedAtStart)
	}

	if params.UpdatedAtEnd != "" {
		whereClauses = append(whereClauses, "updatedAt <= ?")
		args = append(args, params.UpdatedAtEnd)
	}
	fmt.Printf("Go Version %v\n", params)

	whereClause := strings.Join(whereClauses, " AND ")

	// 查询总数
	countSql := fmt.Sprintf("SELECT COUNT(*) FROM resource WHERE %s", whereClause)
	err = db.Get(&total, countSql, args...)
	if err != nil {
		return nil, 0, err
	}

	// 构建排序条件
	sortField := "createdAt"
	sortValue := "desc"

	if params.SortField != "" {
		// 验证排序字段的安全性
		allowedFields := map[string]bool{
			"id": true, "code": true, "name": true, "type": true,
			"parentCode": true, "isEnabled": true, "isSystemDefault": true,
			"createdAt": true, "updatedAt": true,
		}
		if allowedFields[params.SortField] {
			sortField = params.SortField
		}
	}

	if params.SortValue != "" {
		if params.SortValue == "asc" || params.SortValue == "desc" {
			sortValue = params.SortValue
		}
	}

	// 查询数据
	sqlStr := fmt.Sprintf(`
		SELECT id, code, name, type, parentCode, isDeleted, isEnabled, isSystemDefault, createdAt, updatedAt 
		FROM resource 
		WHERE %s 
		ORDER BY %s %s 
		LIMIT ? OFFSET ?
	`, whereClause, sortField, strings.ToUpper(sortValue))

	args = append(args, params.PageSize, offset)
	err = db.Select(&resources, sqlStr, args...)
	if err != nil {
		return nil, 0, err
	}

	return resources, total, nil
}

func GetAllResources() (resources []*models.Resource, err error) {
	sqlStr := `SELECT id, code, name, type, parentCode, isDeleted, isEnabled, isSystemDefault, createdAt, updatedAt FROM resource WHERE isDeleted = 0 AND isEnabled = 1 ORDER BY type ASC, createdAt ASC`
	err = db.Select(&resources, sqlStr)
	if err != nil {
		return nil, err
	}

	return resources, nil
}

func GetResourceByID(id uint64) (resource *models.Resource, err error) {
	resource = new(models.Resource)
	sqlStr := `SELECT id, code, name, type, parentCode, isDeleted, isEnabled, isSystemDefault, createdAt, updatedAt FROM resource WHERE id = ? AND isDeleted = 0`
	err = db.Get(resource, sqlStr, id)
	if err != nil {
		return nil, err
	}
	return resource, nil
}

func CreateResource(resource *models.ResourceCreateParam) (uint64, error) {
	sqlStr := `INSERT INTO resource (code, name, type, parentCode, isEnabled, isSystemDefault) VALUES (?, ?, ?, ?, ?, ?)`
	result, err := db.Exec(sqlStr, resource.Code, resource.Name, resource.Type, resource.ParentCode, resource.IsEnabled, 0)
	if err != nil {
		return 0, err
	}

	// 获取插入的ID
	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return uint64(id), nil
}

func UpdateResource(resource *models.ResourceUpdateParam) error {
	sqlStr := `UPDATE resource SET code = ?, name = ?, type = ?, parentCode = ?, isEnabled = ? WHERE id = ? AND isDeleted = 0`
	_, err := db.Exec(sqlStr, resource.Code, resource.Name, resource.Type, resource.ParentCode, resource.IsEnabled, resource.ID)
	if err != nil {
		return err
	}

	return nil
}

// 批量软删除资源
func BatchDeleteResources(ids []uint64) error {
	if len(ids) == 0 {
		return nil
	}

	// 构建占位符
	placeholders := make([]string, len(ids))
	args := make([]interface{}, len(ids))
	for i, id := range ids {
		placeholders[i] = "?"
		args[i] = id
	}

	sqlStr := fmt.Sprintf("UPDATE resource SET isDeleted = 1 WHERE id IN (%s)", strings.Join(placeholders, ","))
	_, err := db.Exec(sqlStr, args...)
	if err != nil {
		return err
	}

	return nil
}

// ToggleResourceEnabled 切换资源启用状态
func ToggleResourceEnabled(param models.CommonToggleEnabledParam) error {
	sqlStr := `UPDATE resource SET isEnabled = ? WHERE id = ? AND isDeleted = 0`
	_, err := db.Exec(sqlStr, param.IsEnabled, param.ID)

	return err
}

// GetChildrenByParentCode 根据父级code获取子资源
func GetChildrenByParentCode(parentCode string) (resources []*models.Resource, err error) {
	sqlStr := `SELECT id, code, name, type, parentCode, isDeleted, isEnabled, isSystemDefault, createdAt, updatedAt FROM resource WHERE parentCode = ? AND isDeleted = 0 AND isEnabled = 1 ORDER BY createdAt ASC`
	err = db.Select(&resources, sqlStr, parentCode)
	if err != nil {
		return nil, err
	}

	return resources, nil
}

// GetResourcesByType 根据类型获取资源
func GetResourcesByType(resourceType string) (resources []*models.Resource, err error) {
	sqlStr := `SELECT id, code, name, type, parentCode, isDeleted, isEnabled, isSystemDefault, createdAt, updatedAt FROM resource WHERE type = ? AND isDeleted = 0 AND isEnabled = 1 ORDER BY createdAt ASC`
	err = db.Select(&resources, sqlStr, resourceType)
	if err != nil {
		return nil, err
	}

	return resources, nil
}

// CheckResourceCodeExists 检查资源代码是否已存在
func CheckResourceCodeExists(code string, excludeID uint64) (bool, error) {
	var count int
	sqlStr := `SELECT COUNT(*) FROM resource WHERE code = ? AND isDeleted = 0`
	args := []interface{}{code}

	if excludeID > 0 {
		sqlStr += " AND id != ?"
		args = append(args, excludeID)
	}

	err := db.Get(&count, sqlStr, args...)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func GetResourceByCode(code string) (resource *models.Resource, err error) {
	resource = new(models.Resource)
	sqlStr := `SELECT id, code, name, type, parentCode, isDeleted, isEnabled, isSystemDefault, createdAt, updatedAt FROM resource WHERE code = ? AND isDeleted = 0`
	err = db.Get(resource, sqlStr, code)
	if err != nil {
		return nil, err
	}
	return resource, nil
}

// 软删除资源
func DeleteResource(id uint64) error {
	sqlStr := `UPDATE resource SET isDeleted = 1 WHERE id = ?`
	_, err := db.Exec(sqlStr, id)
	if err != nil {
		return err
	}

	return nil
}
