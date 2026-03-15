package models

type Role struct {
	ID              uint64      `json:"id" db:"id"`
	Code            string      `json:"code" db:"code"`
	Name            string      `json:"name" db:"name"`
	Description     string      `json:"description" db:"description"`
	IsDeleted       int         `json:"isDeleted" db:"isDeleted"`
	IsEnabled       int         `json:"isEnabled" db:"isEnabled"`
	IsSystemDefault int         `json:"isSystemDefault" db:"isSystemDefault"`
	CreatedAt       LocalTime   `json:"createdAt" db:"createdAt"`
	UpdatedAt       LocalTime   `json:"updatedAt" db:"updatedAt"`
	Resources       []*Resource `json:"resources" db:"-"`
}

type RoleGetListParam struct {
	CurrentPage    int    `json:"currentPage"`    // 当前页
	PageSize       int    `json:"pageSize"`       // 每页数量
	SortField      string `json:"sortField"`      // 排序字段
	SortValue      string `json:"sortValue"`      // 排序方向
	IsEnabled      *int   `json:"isEnabled"`      // 是否启用（指针类型，支持nil值）
	Name           string `json:"name"`           // 资源名称
	Code           string `json:"code"`           // 资源代码
	CreatedAtStart string `json:"createdAtStart"` // 创建日期起始（格式：YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss）
	CreatedAtEnd   string `json:"createdAtEnd"`   // 创建日期结束（格式：YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss）
	UpdatedAtStart string `json:"updatedAtStart"` // 更新日期起始（格式：YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss）
	UpdatedAtEnd   string `json:"updatedAtEnd"`   // 更新日期结束（格式：YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss）
}

type RoleCreateParam struct {
	Name          string   `json:"name" binding:"required"`
	Code          string   `json:"code" binding:"required"`
	Description   string   `json:"description"`
	IsEnabled     int      `json:"isEnabled" binding:"oneof=0 1"`
	ResourceCodes []string `json:"resourceCodes"`
}

type RoleUpdateParam struct {
	ID uint64 `json:"id" binding:"required"`
	*RoleCreateParam
}
