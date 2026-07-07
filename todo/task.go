package todo

type Task struct {
	Id             int64  `db:"id"`
	Title          string `db:"title"`
	Difficulty     string `db:"difficulty"`
	XpReward       int32  `db:"xp_reward"`
	AssignedUserId int64  `db:"assigned_user_id"`
	Completed      bool   `db:"completed"`
}
