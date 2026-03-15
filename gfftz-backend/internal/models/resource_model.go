package models

type Resource struct {
	ID              uint64    `json:"id" db:"id"`
	Code            string    `json:"code" db:"code"`
	Name            string    `json:"name" db:"name"`
	Type            string    `json:"type" db:"type"`
	ParentCode      string    `json:"parentCode" db:"parentCode"`
	IsDeleted       int       `json:"isDeleted" db:"isDeleted"`
	IsEnabled       int       `json:"isEnabled" db:"isEnabled"`
	IsSystemDefault int       `json:"isSystemDefault" db:"isSystemDefault"`
	CreatedAt       LocalTime `json:"createdAt" db:"createdAt"`
	UpdatedAt       LocalTime `json:"updatedAt" db:"updatedAt"`
}

// ResourceNode represents a node in the resource tree.
// It contains a resource and its children.
type ResourceNode struct {
	Resource
	Children []*ResourceNode `json:"children,omitempty"`
}

// ResourceGetListParam 分页查询参数
type ResourceGetListParam struct {
	CurrentPage    int    `json:"currentPage"`    // 当前页
	PageSize       int    `json:"pageSize"`       // 每页数量
	SortField      string `json:"sortField"`      // 排序字段
	SortValue      string `json:"sortValue"`      // 排序方向
	ParentCode     string `json:"parentCode"`     // 父级代码
	Type           string `json:"type"`           // 资源类型
	IsEnabled      *int   `json:"isEnabled"`      // 是否启用（指针类型，支持nil值）
	Name           string `json:"name"`           // 资源名称
	Code           string `json:"code"`           // 资源代码
	CreatedAtStart string `json:"createdAtStart"` // 创建日期起始（格式：YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss）
	CreatedAtEnd   string `json:"createdAtEnd"`   // 创建日期结束（格式：YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss）
	UpdatedAtStart string `json:"updatedAtStart"` // 更新日期起始（格式：YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss）
	UpdatedAtEnd   string `json:"updatedAtEnd"`   // 更新日期结束（格式：YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss）
}

type ResourceCreateParam struct {
	Code       string `json:"code" binding:"required"`
	Name       string `json:"name" binding:"required"`
	Type       string `json:"type" binding:"required"`
	ParentCode string `json:"parentCode"`
	IsEnabled  int    `json:"isEnabled" binding:"oneof=0 1"`
}

type ResourceUpdateParam struct {
	ID uint64 `json:"id" binding:"required"`
	*ResourceCreateParam
}
