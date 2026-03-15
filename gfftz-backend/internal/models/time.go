package models

import (
	"database/sql/driver"
	"fmt"
	"time"
)

const (
	TimeFormat = "2006-01-02 15:04:05"
)

type LocalTime struct {
	time.Time
}

// MarshalJSON
// @Description: 重写 MarshaJSON 方法，在此方法中实现自定义格式的转换；程序中解析到 JSON 时，会调用这个方法
// @param t
// @return []byte
// @return error
func (t LocalTime) MarshalJSON() ([]byte, error) {
	output := fmt.Sprintf(`"%s"`, t.Format(TimeFormat))
	return []byte(output), nil
}

// Value
// @Description: 写入 mysql 时调用
// @param t
// @return driver.Value
// @return error
func (t LocalTime) Value() (driver.Value, error) {
	var zeroTime time.Time
	if t.Time.UnixNano() == zeroTime.UnixNano() {
		return nil, nil
	}
	return t.Time, nil
}

// Scan
// @Description: 查询 mysql 时调用
// @param v
// @return error
func (t *LocalTime) Scan(v interface{}) error {
	value, ok := v.(time.Time)
	if ok {
		*t = LocalTime{Time: value}
		return nil
	}
	return fmt.Errorf("can not convert %v to timestamp", v)
}
