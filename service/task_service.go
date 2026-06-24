package service

import (
	pb "rpcprac/pb/task/proto"
	"rpcprac/repository"
	"rpcprac/todo"
)

type TaskService struct {
	pb.UnimplementedTaskServiceServer
	repo repository.Task
}

func NewTaskService(repo repository.Task) *TaskService {
	return &TaskService{repo: repo}
}
func (s *TaskService) CreateTask(task todo.Task) (todo.Task, error) {

	return s.repo.CreateTask(task)
}

func (s *TaskService) GetTask(id int64) (todo.Task, error) {

	return s.repo.GetTask(id)

}
func (s *TaskService) ListTasks() ([]todo.Task, error) {

	return s.repo.ListTasks()

}
func (s *TaskService) AssignTask(taskid, userid int64) (todo.Task, error) {

	return s.repo.AssignTask(taskid, userid)

}
func (s *TaskService) CompleteTask(id int64) (todo.Task, error) {

	return s.repo.CompleteTask(id)

}
func (s *TaskService) GetTasksByUser(userId int64) ([]todo.Task, error) {

	return s.repo.GetTasksByUser(userId)

}
