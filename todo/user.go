package todo

type User struct {
	Id             int64  `db:"id"`
	Name           string `db:"name"`
	Level          int32  `db:"level"`
	Xp             int32  `db:"xp"`
	CompletedTasks int32  `db:"completed_tasks"`
}
