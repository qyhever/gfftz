package router

import (
	"fmt"
	"net/http"
	"runtime"

	"gfftz/internal/config"
	"gfftz/internal/controller"
	"gfftz/internal/middleware"
	"gfftz/internal/utils"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	isProd := config.IsProduction()
	// Gin 开启生产模式(默认是debug模式，会输出大量调试日志)
	if isProd {
		gin.SetMode(gin.ReleaseMode)
	}
	// r := gin.New()
	//r.Use(logger.GinLogger(), logger.GinRecovery(true))
	r := gin.Default()

	// 静态文件服务
	r.Static("/public", "./public")

	// 创建控制器实例
	metaController := controller.NewMetaController()
	attachController := controller.NewAttachController()
	resourceController := controller.NewResourceController()
	roleController := controller.NewRoleController()
	userController := controller.NewUserController()

	fmt.Printf("Go Version %v\n", runtime.Version())
	fmt.Printf("Go Version %v\n", utils.Colorize(runtime.Version(), utils.FgHiBlue))

	// v1 := r.Group("/api/v1")
	v1 := r.Group("/api")
	// 测试路由
	v1.GET("/meta", metaController.GetMeta)
	v1.GET("/failed", metaController.GetFailed)
	v1.GET("/serverError", metaController.GetServerError)
	v1.GET("/pic", metaController.GetPic)

	auth := v1.Group("/auth")
	{
		auth.POST("/login", controller.LoginHandler)
		auth.POST("/refreshToken", controller.RefreshTokenHandler)
	}

	v1.Use(middleware.JWTAuthMiddleware())
	attach := v1.Group("/attach")
	{
		attach.POST("/add", attachController.Add)
		attach.POST("/upload", attachController.Upload)
		attach.DELETE("/delete", attachController.Delete)
		attach.GET("/list", attachController.List)
	}

	resource := v1.Group("/resource")
	{
		resource.POST("/pagedList", resourceController.GetPagedList)
		resource.GET("/findAll", resourceController.GetAll)
		resource.GET("/:id", resourceController.GetOneByID)
		resource.POST("", resourceController.Create)
		resource.PUT("", resourceController.Update)
		resource.POST("batchDelete", resourceController.BatchDelete)
		resource.PATCH("/toggleEnabled", resourceController.ToggleEnabled)
	}

	role := v1.Group("/role")
	{
		role.POST("pagedList", roleController.GetPagedList)
		role.GET("/findAll", roleController.GetAll)
		role.GET("/:id", roleController.GetOneByID)
		role.POST("", roleController.Create)
		role.PUT("", roleController.Update)
		role.POST("/batchDelete", roleController.BatchDelete)
		role.PATCH("/toggleEnabled", roleController.ToggleEnabled)
	}

	user := v1.Group("/user")
	{
		user.POST("pagedList", userController.GetPagedList)
		user.GET("/info", userController.GetOneByJWT)
		user.GET("/:id", userController.GetOneByID)
		user.POST("", userController.Create)
		user.PUT("", userController.Update)
		user.POST("/batchDelete", userController.BatchDelete)
		user.PATCH("/toggleEnabled", userController.ToggleEnabled)
		user.POST("/updatePassword", userController.UpdatePasswordByMobile)
	}

	r.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{
			"msg": "404",
		})
	})
	return r
}
