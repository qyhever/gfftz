package models

type CommonPaginationList[T any] struct {
	List  []T   `json:"list"`
	Total int64 `json:"total"`
}

type CommonBatchDeleteParam struct {
	IDs []uint64 `json:"ids" binding:"required"`
}

type CommonToggleEnabledParam struct {
	ID        uint64 `json:"id" binding:"required"`
	IsEnabled int    `json:"isEnabled" binding:"oneof=0 1"`
}
