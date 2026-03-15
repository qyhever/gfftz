package mysql

import (
	"database/sql"
	"fmt"
	"gfftz/internal/models"
	"strings"

	"github.com/jmoiron/sqlx"
)

func GetRolePaginationList(params *models.RoleGetListParam) (roles []*models.Role, total int64, err error) {
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

	whereClause := strings.Join(whereClauses, " AND ")

	// 查询总数
	countSql := fmt.Sprintf("SELECT COUNT(*) FROM role WHERE %s", whereClause)
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
		SELECT id, code, name, description, isDeleted, isEnabled, isSystemDefault, createdAt, updatedAt 
		FROM role 
		WHERE %s 
		ORDER BY %s %s 
		LIMIT ? OFFSET ?
	`, whereClause, sortField, strings.ToUpper(sortValue))

	args = append(args, params.PageSize, offset)
	err = db.Select(&roles, sqlStr, args...)
	if err != nil {
		return nil, 0, err
	}

	return roles, total, nil
}

func GetAllRoles(includeResources bool) ([]*models.Role, error) {
	var roles []*models.Role
	sqlStr := `SELECT id, code, name, description, isDeleted, isEnabled, isSystemDefault, createdAt, updatedAt FROM role WHERE isDeleted = 0`
	err := db.Select(&roles, sqlStr)
	// "get all roles failed"
	if err != nil {
		return nil, err
	}

	if includeResources {
		for _, role := range roles {
			var resources []*models.Resource
			resSql := `
				SELECT r.id, r.code, r.name, r.type, r.parentCode, r.isDeleted, r.isEnabled, r.isSystemDefault, r.createdAt, r.updatedAt
				FROM resource r
				INNER JOIN role_resource rr ON rr.resourceId = r.id
				WHERE rr.roleId = ? AND rr.isDeleted = 0 AND r.isDeleted = 0 AND r.isEnabled = 1
				ORDER BY r.createdAt ASC
			`
			if err := db.Select(&resources, resSql, role.ID); err != nil {
				return nil, err
			}
			role.Resources = resources
		}
	}

	return roles, nil
}

func GetRoleByID(id uint64) (role *models.Role, err error) {
	role = new(models.Role)
	// 查询角色基本信息
	sqlStr := `SELECT id, code, name, description, isDeleted, isEnabled, isSystemDefault, createdAt, updatedAt FROM role WHERE id = ? AND isDeleted = 0`
	err = db.Get(role, sqlStr, id)
	// "there is no role with id"
	if err == sql.ErrNoRows {
		return nil, err
	}
	// "get role failed"
	if err != nil {
		return nil, err
	}

	// 通过关联表查询该角色的资源（仅返回未删除且启用的资源，按创建时间升序）
	resources := []*models.Resource{}
	resSql := `
		SELECT r.id, r.code, r.name, r.type, r.parentCode, r.isDeleted, r.isEnabled, r.isSystemDefault, r.createdAt, r.updatedAt
		FROM resource r
		INNER JOIN role_resource rr ON rr.resourceId = r.id
		WHERE rr.roleId = ? AND rr.isDeleted = 0 AND r.isDeleted = 0 AND r.isEnabled = 1
		ORDER BY r.createdAt ASC
	`
	if err = db.Select(&resources, resSql, id); err != nil {
		return nil, err
	}
	role.Resources = resources

	return role, nil
}

func CreateRole(param *models.RoleCreateParam) (roleId uint64, err error) {
	tx, err := db.Beginx()
	if err != nil {
		return 0, err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
			return
		}
		err = tx.Commit()
	}()

	// Insert role
	result, err := tx.Exec(`
        INSERT INTO role (code, name, description, isEnabled, isSystemDefault, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
		param.Code, param.Name, param.Description, param.IsEnabled, 0)
	if err != nil {
		return 0, err
	}

	lastInsertID, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	roleId = uint64(lastInsertID)
	if err != nil {
		return 0, err
	}

	// Insert role-resource relationships
	if len(param.ResourceCodes) > 0 {
		// First get resource IDs by codes
		var resourceIds []uint64
		query := `SELECT id FROM resource WHERE code IN (?) AND isDeleted = 0`
		query, args, err := sqlx.In(query, param.ResourceCodes)
		if err != nil {
			return 0, err
		}

		if err := tx.Select(&resourceIds, query, args...); err != nil {
			return 0, err
		}

		// Insert role-resource relationships
		for _, resourceId := range resourceIds {
			_, err = tx.Exec(`
                INSERT INTO role_resource (roleId, resourceId, createdAt, updatedAt)
                VALUES (?, ?, NOW(), NOW())`,
				roleId, resourceId)
			if err != nil {
				return 0, err
			}
		}
	}

	return roleId, nil
}

func UpdateRole(param *models.RoleUpdateParam) error {
	tx, err := db.Beginx()
	if err != nil {
		return err
	}
	defer func() {
		if err != nil {
			tx.Rollback()
			return
		}
		err = tx.Commit()
	}()

	// Update role
	_, err = tx.Exec(`
        UPDATE role
        SET code = ?, name = ?, description = ?, isEnabled = ?, updatedAt = NOW()
        WHERE id = ?`,
		param.Code, param.Name, param.Description, param.IsEnabled, param.ID)
	if err != nil {
		return err
	}

	// Delete existing role-resource relationships
	_, err = tx.Exec(`DELETE FROM role_resource WHERE roleId = ?`, param.ID)
	if err != nil {
		return err
	}

	// Insert new role-resource relationships
	if len(param.ResourceCodes) > 0 {
		var resourceIds []uint64
		query := `SELECT id FROM resource WHERE code IN (?) AND isDeleted = 0`
		query, args, err := sqlx.In(query, param.ResourceCodes)
		if err != nil {
			return err
		}

		if err := tx.Select(&resourceIds, query, args...); err != nil {
			return err
		}

		for _, resourceId := range resourceIds {
			_, err = tx.Exec(`
                INSERT INTO role_resource (roleId, resourceId, createdAt, updatedAt)
                VALUES (?, ?, NOW(), NOW())`,
				param.ID, resourceId)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

// BatchDeleteRoles deletes multiple roles by their IDs.
func BatchDeleteRoles(ids []uint64) error {
	query, args, err := sqlx.In(`UPDATE role SET isDeleted = 1, updatedAt = NOW() WHERE id IN (?)`, ids)
	if err != nil {
		return err
	}
	_, err = db.Exec(query, args...)
	if err != nil {
		return err
	}
	query, args, err = sqlx.In(`DELETE FROM role_resource WHERE roleId IN (?)`, ids)
	if err != nil {
		return err
	}
	_, err = db.Exec(query, args...)
	return err
}

// ToggleRoleEnabled toggles the isEnabled status of a role.
func ToggleRoleEnabled(param models.CommonToggleEnabledParam) error {
	_, err := db.Exec(`UPDATE role SET isEnabled = ?, updatedAt = NOW() WHERE id = ?`, param.IsEnabled, param.ID)
	return err
}

func CheckRoleCodeExists(code string) (bool, error) {
	var count int
	err := db.Get(&count, "SELECT COUNT(*) FROM role WHERE code = ? AND isDeleted = 0", code)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// BatchDelete deletes a role by its ID.
func DeleteRole(id int64) error {
	_, err := db.Exec(`UPDATE role SET isDeleted = 1, updatedAt = NOW() WHERE id = ?`, id)
	if err != nil {
		return err
	}
	_, err = db.Exec(`DELETE FROM role_resource WHERE roleId = ?`, id)
	return err
}
