package models

type User struct {
	ID              int        `json:"id" db:"id"`
	Username        string     `json:"username" db:"username"`
	Password        string     `json:"-" db:"password"`
	Mobile          string     `json:"mobile" db:"mobile"`
	Avatar          string     `json:"avatar" db:"avatar"`
	IsDeleted       int        `json:"isDeleted" db:"isDeleted"`
	IsEnabled       int        `json:"isEnabled" db:"isEnabled"`
	IsSystemDefault int        `json:"isSystemDefault" db:"isSystemDefault"`
	CreatedAt       LocalTime  `json:"createdAt" db:"createdAt"`
	UpdatedAt       LocalTime  `json:"updatedAt" db:"updatedAt"`
	Roles           []Role     `json:"roles"`
	Resources       []Resource `json:"resources"`
}

type UserWithResources struct {
	User
	Resources []Resource `json:"resources"`
}

type UserGetListParam struct {
	CurrentPage int    `json:"currentPage"`
	PageSize    int    `json:"pageSize"`
	SortField   string `json:"sortField"`
	SortValue   string `json:"sortValue"`
	Username    string `json:"username"`
	Mobile      string `json:"mobile"`
	IsEnabled   *int   `json:"isEnabled"`
}

type UserCreateParam struct {
	Username  string   `json:"username" binding:"required"`
	Password  string   `json:"password" binding:"required"`
	Mobile    string   `json:"mobile" binding:"required"`
	Avatar    string   `json:"avatar"`
	IsEnabled int      `json:"isEnabled" binding:"oneof=0 1"`
	RoleCodes []string `json:"roleCodes"`
}

type UserUpdateParam struct {
	ID        uint64   `json:"id" binding:"required"`
	Username  string   `json:"username" binding:"required"`
	Mobile    string   `json:"mobile" binding:"required"`
	Avatar    string   `json:"avatar"`
	IsEnabled int      `json:"isEnabled" binding:"oneof=0 1"`
	RoleCodes []string `json:"roleCodes"`
}

type UserPasswordUpdateParam struct {
	Mobile      string `json:"mobile" binding:"required"`
	Password    string `json:"password" binding:"required"`
	NewPassword string `json:"newPassword" binding:"required"`
}
