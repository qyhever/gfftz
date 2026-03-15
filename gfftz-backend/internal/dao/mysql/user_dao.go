package mysql

import (
	"database/sql"
	"fmt"
	"gfftz/internal/models"
	"strings"

	"github.com/jmoiron/sqlx"
)

// func GenHashPassword() {
// 	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.DefaultCost)
// 	if err != nil {
// 		fmt.Printf("err %#v\n", err)
// 	} else {
// 		fmt.Printf("hashedPassword %#v\n", string(hashedPassword))
// 	}
// }

func GetUserPaginationList(params *models.UserGetListParam) (users []*models.User, total int64, err error) {
	// 计算偏移量
	offset := (params.CurrentPage - 1) * params.PageSize

	// 构建查询条件
	whereClauses := []string{"isDeleted = 0"}
	args := []interface{}{}

	if params.Username != "" {
		whereClauses = append(whereClauses, "username LIKE ?")
		args = append(args, "%"+params.Username+"%")
	}
	if params.Mobile != "" {
		whereClauses = append(whereClauses, "mobile LIKE ?")
		args = append(args, "%"+params.Mobile+"%")
	}
	if params.IsEnabled != nil {
		whereClauses = append(whereClauses, "isEnabled = ?")
		args = append(args, *params.IsEnabled)
	}

	whereClause := strings.Join(whereClauses, " AND ")

	// 查询总数
	countSql := fmt.Sprintf("SELECT COUNT(*) FROM user WHERE %s", whereClause)
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

	sqlStr := fmt.Sprintf(`
		SELECT id, username, password, mobile, avatar, isDeleted, isEnabled, isSystemDefault, createdAt, updatedAt
		FROM user 
		WHERE %s 
		ORDER BY %s %s 
		LIMIT ? OFFSET ?
	`, whereClause, sortField, strings.ToUpper(sortValue))

	args = append(args, params.PageSize, offset)
	err = db.Select(&users, sqlStr, args...)
	if err != nil {
		return nil, 0, err
	}

	for i := range users {
		// Get roles
		var roles []models.Role
		roleQuery := `SELECT r.* FROM role r JOIN user_role ur ON r.id = ur.roleId WHERE ur.userId = ?`
		if err := db.Select(&roles, roleQuery, users[i].ID); err != nil {
			return nil, 0, err
		}
		users[i].Roles = roles
	}

	return users, total, nil
}

func GetUserByID(id uint64) (*models.User, error) {
	var user models.User
	query := "SELECT id, username, password, mobile, avatar, isDeleted, isEnabled, isSystemDefault, createdAt, updatedAt FROM user WHERE id = ? AND isDeleted = 0"
	if err := db.Get(&user, query, id); err != nil {
		// "there is no user with id"
		if err == sql.ErrNoRows {
			return nil, nil
		}
		// "get user failed"
		return nil, err
	}

	// Load roles
	var roles []models.Role
	roleQuery := `SELECT r.* FROM role r JOIN user_role ur ON r.id = ur.roleId WHERE ur.userId = ?`
	if err := db.Select(&roles, roleQuery, user.ID); err != nil {
		return nil, err
	}
	user.Roles = roles

	// Load distinct resources aggregated by user's roles
	var resources []models.Resource
	resQuery := `
        SELECT DISTINCT r.id, r.code, r.name, r.type, r.parentCode, r.isDeleted, r.isEnabled, r.isSystemDefault, r.createdAt, r.updatedAt
        FROM resource r
        INNER JOIN role_resource rr ON rr.resourceId = r.id
        INNER JOIN user_role ur ON ur.roleId = rr.roleId
        WHERE ur.userId = ? AND rr.isDeleted = 0 AND r.isDeleted = 0 AND r.isEnabled = 1
        ORDER BY r.createdAt ASC`
	if err := db.Select(&resources, resQuery, user.ID); err != nil {
		return nil, err
	}
	user.Resources = resources
	return &user, nil
}

// CreateUser 创建用户并保存用户与角色的关联关系。
// 步骤：
// 1) 插入 user 记录并获取新用户ID；
// 2) 根据传入的 roleCodes 查询对应的角色ID；
// 3) 为每个角色ID插入 user_role 关联；
// 整体使用事务保证原子性。
func CreateUser(param *models.UserCreateParam) (userId uint64, err error) {
	// 启用事务，确保用户与角色关联同时成功
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

	insertUserSQL := `INSERT INTO user (username, password, mobile, avatar, isEnabled) VALUES (?, ?, ?, ?, ?)`
	result, err := tx.Exec(insertUserSQL, param.Username, param.Password, param.Mobile, param.Avatar, param.IsEnabled)
	if err != nil {
		return 0, err
	}
	lastInsertID, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	userId = uint64(lastInsertID)

	// 如果提供了角色代码，查询对应的角色ID
	if len(param.RoleCodes) > 0 {
		var roleIDs []uint64
		query := `SELECT id FROM role WHERE code IN (?) AND isDeleted = 0`
		query, args, err := sqlx.In(query, param.RoleCodes)
		if err != nil {
			return 0, err
		}

		if err := tx.Select(&roleIDs, query, args...); err != nil {
			return 0, err
		}

		// 角色ID去重，避免重复插入
		seen := make(map[uint64]struct{}, len(roleIDs))
		for _, rid := range roleIDs {
			if _, ok := seen[rid]; ok {
				continue
			}
			seen[rid] = struct{}{}

			//  插入用户-角色关联
			_, err = tx.Exec(`
                INSERT INTO user_role (userId, roleId, createdAt, updatedAt)
                VALUES (?, ?, NOW(), NOW())
            `, userId, rid)
			if err != nil {
				return 0, err
			}
		}
	}

	return userId, nil
}

// UpdateUser 更新指定用户的基本信息，并在请求提供 RoleCodes 时同步更新用户-角色关联。
// 行为说明：
// - 仅更新请求中提供的字段；
// - 当 req.RoleCodes != nil 时：先清空该用户的所有关联，再根据提供的角色代码重建关联；
// - 当 req.RoleCodes == nil 时：不变更角色关联；
// 整体使用事务保证原子性。
func UpdateUser(param *models.UserUpdateParam) error {
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

	// Update user
	_, err = tx.Exec(`
        UPDATE user
        SET username = ?, mobile = ?, avatar = ?, isEnabled = ?, updatedAt = NOW()
        WHERE id = ?`,
		param.Username, param.Mobile, param.Avatar, param.IsEnabled, param.ID)
	if err != nil {
		return err
	}

	// 2) 根据 RoleCodes 同步用户角色关联（仅当字段存在时）
	if param.RoleCodes != nil {
		// 清空现有关联
		if _, err = tx.Exec("DELETE FROM user_role WHERE userId = ?", param.ID); err != nil {
			return err
		}

		// 若提供了角色代码，重建关联
		if len(param.RoleCodes) > 0 {
			var roleIDs []uint64
			q := `SELECT id FROM role WHERE code IN (?) AND isDeleted = 0`
			q, inArgs, e := sqlx.In(q, param.RoleCodes)
			if e != nil {
				return e
			}
			if err = tx.Select(&roleIDs, q, inArgs...); err != nil {
				return err
			}
			// 去重插入
			seen := make(map[uint64]struct{}, len(roleIDs))
			for _, rid := range roleIDs {
				if _, ok := seen[rid]; ok {
					continue
				}
				seen[rid] = struct{}{}
				if _, err = tx.Exec(`INSERT INTO user_role (userId, roleId, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())`, param.ID, rid); err != nil {
					return err
				}
			}
		}
	}

	return nil
}

func BatchDeleteUsers(ids []uint64) error {
	query, args, err := sqlx.In("UPDATE user SET isDeleted = 1, updatedAt = NOW() WHERE id IN (?)", ids)
	if err != nil {
		return err
	}
	_, err = db.Exec(query, args...)
	if err != nil {
		return err
	}
	query, args, err = sqlx.In(`DELETE FROM user_role WHERE userId IN (?)`, ids)
	if err != nil {
		return err
	}
	_, err = db.Exec(query, args...)
	return err
}

// ToggleUserEnabled flips isEnabled between 1 and 0 for a user.
func ToggleUserEnabled(param models.CommonToggleEnabledParam) error {
	query := "UPDATE user SET isEnabled = CASE WHEN isEnabled = 1 THEN 0 ELSE 1 END WHERE id = ? AND isDeleted = 0"
	_, err := db.Exec(query, param.ID)
	return err
}

func GetUserByUsername(username string) (*models.User, error) {
	var user models.User
	query := "SELECT id, username, password, mobile, avatar, isDeleted, isEnabled, createdAt, updatedAt FROM user WHERE username = ?"
	err := db.Get(&user, query, username)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // User not found is not an error
		}
		return nil, err
	}
	return &user, nil
}

func GetUserByMobile(mobile string) (*models.User, error) {
	var user models.User
	query := "SELECT id, username, password, mobile, avatar, isDeleted, isEnabled, createdAt, updatedAt FROM user WHERE mobile = ?"
	err := db.Get(&user, query, mobile)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // User not found is not an error
		}
		return nil, err
	}
	return &user, nil
}

func CheckUserMobileExists(mobile string) (bool, error) {
	var count int
	err := db.Get(&count, "SELECT COUNT(*) FROM user WHERE mobile = ? AND isDeleted = 0", mobile)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func UpdatePasswordByMobile(param models.UserPasswordUpdateParam) error {
	// Update user
	_, err := db.Exec(`
        UPDATE user
        SET password = ?, updatedAt = NOW()
        WHERE mobile = ?`,
		param.NewPassword, param.Mobile)
	return err
}
