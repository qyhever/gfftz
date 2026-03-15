package mysql

import (
	"fmt"
	"gfftz/internal/config"

	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
)

var db *sqlx.DB

func Init() (err error) {
	// "user:password@tcp(host:port)/dbname"
	dsn := config.GetMySQLDSN()
	db, err = sqlx.Connect("mysql", dsn)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}
	fmt.Printf("✅ init mysql successfully\n")
	db.SetMaxOpenConns(100)
	db.SetMaxIdleConns(20)
	return
}

func Close() {
	_ = db.Close()
}
