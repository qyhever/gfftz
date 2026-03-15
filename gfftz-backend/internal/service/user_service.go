package service

import (
	"fmt"
	"gfftz/internal/dao/mysql"
	"gfftz/internal/models"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

type UserService struct{}

func NewUserService() *UserService {
	return &UserService{}
}

func (s *UserService) GetList(params *models.UserGetListParam) (models.CommonPaginationList[*models.User], error) {
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

	users, total, err := mysql.GetUserPaginationList(params)
	if err != nil {
		return models.CommonPaginationList[*models.User]{}, err
	}

	return models.CommonPaginationList[*models.User]{
		List:  users,
		Total: total,
	}, nil
}

func (s *UserService) GetOneByID(id uint64) (*models.User, error) {
	if id <= 0 {
		return nil, ErrInvalidUserID
	}
	return mysql.GetUserByID(id)
}

func (s *UserService) Create(param *models.UserCreateParam) (uint64, error) {
	// Validate mobile uniqueness
	exists, err := mysql.CheckUserMobileExists(param.Mobile)
	if err != nil {
		return 0, err
	}
	if exists {
		return 0, ErrUserMobileExists
	}

	// 使用 bcrypt 对密码进行哈希处理
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(param.Password), bcrypt.DefaultCost)
	if err != nil {
		return 0, err
	}
	param.Password = string(hashedPassword)

	return mysql.CreateUser(param)
}

func (s *UserService) Update(param *models.UserUpdateParam) error {
	// Check if the role exists
	user, err := s.GetOneByID(param.ID)
	if err != nil {
		return ErrUserNotFound
	}
	if user.IsSystemDefault == 1 {
		return ErrSystemDefaultModify
	}
	return mysql.UpdateUser(param)
}

func (s *UserService) BatchDelete(ids []uint64) error {
	if len(ids) == 0 {
		return ErrNoUserIDs
	}
	for _, id := range ids {
		user, err := s.GetOneByID(id)
		if err != nil {
			continue
		}
		if user.IsSystemDefault == 1 {
			return ErrSystemDefaultModify
		}
	}
	return mysql.BatchDeleteUsers(ids)
}

func (s *UserService) ToggleEnabled(param models.CommonToggleEnabledParam) error {
	if param.ID <= 0 {
		return ErrInvalidUserID
	}

	user, err := s.GetOneByID(param.ID)
	if err != nil {
		return ErrUserNotFound
	}

	if user.IsSystemDefault == 1 {
		return ErrSystemDefaultModify
	}

	return mysql.ToggleUserEnabled(param)
}

func (s *UserService) GetUserByUsername(username string) (*models.User, error) {
	return mysql.GetUserByUsername(username)
}

func (s *UserService) GetUserByMobile(mobile string) (*models.User, error) {
	return mysql.GetUserByMobile(mobile)
}

func (s *UserService) UpdatePasswordByMobile(param models.UserPasswordUpdateParam) error {
	// 读取用户数据（用户不存在不视为系统错误）
	user, err := mysql.GetUserByMobile(strings.TrimSpace(param.Mobile))
	if err != nil {
		return err
	}
	if user == nil {
		return ErrUserNotFound
	}
	fmt.Printf("param %#v\n", param)
	fmt.Printf("user %#v\n", user)
	// 使用 bcrypt 进行密码校验
	if err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(param.Password)); err != nil {
		return ErrPasswordIncorrect
	}
	// 使用 bcrypt 对密码进行哈希处理
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(param.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	param.NewPassword = string(hashedPassword)
	return mysql.UpdatePasswordByMobile(param)
}
