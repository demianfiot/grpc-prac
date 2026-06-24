package service

import (
	"rpcprac/repository"
	"rpcprac/todo"
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

type Service struct {
	User
	Task
}

func NewService(repos *repository.Repository) *Service {
	return &Service{
		User: NewUserService(repos.User),
		Task: NewTaskService(repos.Task),
	}
}
