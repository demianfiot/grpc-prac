package repository

import (
	"rpcprac/todo"

	"github.com/jmoiron/sqlx"
)

type User interface {
	CreateUser(name string) (todo.User, error)
	GetUser(id int64) (todo.User, error)
	ListUsers() ([]todo.User, error)
}

type Task interface {
	CreateTask(task todo.Task) (todo.Task, error)
	GetTask(id int64) (todo.Task, error)
	ListTasks() ([]todo.Task, error)
	AssignTask(taskID, userID int64) (todo.Task, error)
	CompleteTask(taskID int64) (todo.Task, error)
	GetTasksByUser(userID int64) ([]todo.Task, error)
}

type Repository struct {
	User
	Task
}

func NewRepository(db *sqlx.DB) *Repository {
	return &Repository{
		User: NewUserPostgres(db),
		Task: NewTaskPostgres(db),
	}
}
