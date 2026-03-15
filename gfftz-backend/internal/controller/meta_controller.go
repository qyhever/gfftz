package controller

import (
	"encoding/json"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

// MetaController 结构体
type MetaController struct{}

// NewMetaController 创建一个新的 MetaController 实例
// @return *MetaController
func NewMetaController() *MetaController {
	return &MetaController{}
}

// GetMeta 处理 /meta 路由
// @param c *gin.Context
func (mc *MetaController) GetMeta(c *gin.Context) {
	metaData, err := os.ReadFile("./public/meta.json")
	if err != nil {
		// 如果文件不存在，返回默认时间或错误
		c.JSON(http.StatusOK, gin.H{
			"deployTime": "unknown",
		})
		return
	}

	var metaMap map[string]interface{}
	if err := json.Unmarshal(metaData, &metaMap); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to parse meta.json",
		})
		return
	}

	c.JSON(http.StatusOK, metaMap)
}

// GetFailed 处理 /failed 路由
// @param c *gin.Context
func (mc *MetaController) GetFailed(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"code":    1001,
		"message": "请求参数错误",
		"data":    nil,
	})
}

// GetServerError 处理 /serverError 路由
// @param c *gin.Context
func (mc *MetaController) GetServerError(c *gin.Context) {
	c.JSON(http.StatusInternalServerError, gin.H{
		"code":    1005,
		"message": "服务器内部错误",
		"data":    nil,
	})
}

func (mc *MetaController) GetPic(c *gin.Context) {
	metaData, err := os.ReadFile("./public/fail.svg")
	if err != nil {
		// 如果文件不存在，返回默认时间或错误
		c.JSON(http.StatusOK, gin.H{
			"pic": "unknown",
		})
		return
	}

	time.Sleep(2 * time.Second)
	c.Data(http.StatusOK, "image/svg+xml", metaData)
}
