package jwt

import (
	"errors"
	"gfftz/internal/config"
	"time"

	"github.com/dgrijalva/jwt-go"
)

// MyClaims 自定义声明结构体并内嵌jwt.StandardClaims
// jwt包自带的jwt.StandardClaims只包含了官方字段
// 我们这里需要额外记录一个UserID字段，所以要自定义结构体
// 如果想要保存更多信息，都可以添加到这个结构体中
type MyClaims struct {
	UserID uint64 `json:"user_id"`
	jwt.StandardClaims
}

// getSecret 返回用于签名/校验 JWT 的密钥。
// 延迟从配置中取值，避免在包初始化阶段访问未加载的配置导致空指针。
func getSecret() []byte {
	cfg := config.GetConfig()
	if cfg == nil || cfg.JWT.Secret == "" {
		return []byte("")
	}
	return []byte(cfg.JWT.Secret)
}

// keyFunc 提供给 jwt.Parse/ParseWithClaims 使用的密钥回调。
func keyFunc(_ *jwt.Token) (i interface{}, err error) {
	return getSecret(), nil
}

// GenToken 生成access token 和 refresh token
func GenToken(userID uint64) (aToken, rToken string, err error) {
	// 获取配置
	cfg := config.GetConfig()

	// 解析访问令牌过期时间
	accessExpireDuration, err := time.ParseDuration(cfg.JWT.AccessExpiresIn)
	if err != nil {
		// 如果解析失败，使用默认值
		accessExpireDuration = time.Hour * 8
	}
	// 解析刷新令牌过期时间
	refreshExpireDuration, err := time.ParseDuration(cfg.JWT.RefreshExpiresIn)
	if err != nil {
		// 如果解析失败，使用默认值 7d
		refreshExpireDuration = time.Hour * 24 * 7
	}

	// 创建一个我们自己的声明
	c := MyClaims{
		userID, // 自定义字段
		jwt.StandardClaims{
			ExpiresAt: time.Now().Add(accessExpireDuration).Unix(), // 过期时间
			Issuer:    "jeve",                                      // 签发人
		},
	}
	// 加密并获得完整的编码后的字符串token
	aToken, err = jwt.NewWithClaims(jwt.SigningMethodHS256, c).SignedString(getSecret())

	rc := MyClaims{
		userID,
		jwt.StandardClaims{
			ExpiresAt: time.Now().Add(refreshExpireDuration).Unix(), // 过期时间
			Issuer:    "jeve",                                       // 签发人
		},
	}
	rToken, err = jwt.NewWithClaims(jwt.SigningMethodHS256, rc).SignedString(getSecret())
	return
}

// ParseToken 解析JWT
func ParseToken(tokenString string) (claims *MyClaims, err error) {
	// 解析token
	var token *jwt.Token
	claims = new(MyClaims)
	token, err = jwt.ParseWithClaims(tokenString, claims, keyFunc)
	if err != nil {
		return
	}
	if !token.Valid { // 校验token
		err = errors.New("invalid token")
	}
	return
}
