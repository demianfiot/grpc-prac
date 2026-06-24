package handler

import (
	"context"

	pb "rpcprac/pb/task/proto"
	"rpcprac/service"
	"rpcprac/todo"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type TaskHandler struct {
	pb.UnimplementedTaskServiceServer
	taskService service.Task
}

func NewTaskHandler(taskService service.Task) *TaskHandler {
	return &TaskHandler{
		taskService: taskService,
	}
}
func (h *TaskHandler) CreateTask(ctx context.Context, req *pb.CreateTaskRequest) (*pb.CreateTaskResponse, error) {

	task, err := h.taskService.CreateTask(
		todo.Task{
			Title:      req.Title,
			Difficulty: req.Difficulty,
			XpReward:   req.XpReward,
		})
	if err != nil {
		return nil, status.Errorf(
			codes.Internal,
			"failed to create task: %v",
			err,
		)
	}

	return &pb.CreateTaskResponse{
		Task: toPBTask(task),
	}, nil
}

func (h *TaskHandler) GetTask(ctx context.Context, req *pb.GetTaskRequest) (*pb.GetTaskResponse, error) {

	task, err := h.taskService.GetTask(req.Id)
	if err != nil {
		return nil, status.Errorf(
			codes.NotFound,
			"task with id %d not found",
			req.Id,
		)
	}

	return &pb.GetTaskResponse{
		Task: toPBTask(task),
	}, nil
}
func (h *TaskHandler) ListTasks(ctx context.Context, _ *pb.ListTasksRequest) (*pb.ListTasksResponse, error) {

	tasks, err := h.taskService.ListTasks()
	if err != nil {
		return nil, status.Errorf(
			codes.Internal,
			"failed to list tasks: %v",
			err,
		)
	}

	pbTasks := make([]*pb.Task, 0, len(tasks))
	for _, task := range tasks {
		pbTasks = append(pbTasks, toPBTask(task))
	}

	return &pb.ListTasksResponse{
		Tasks: pbTasks,
	}, nil
}
func (h *TaskHandler) AssignTask(ctx context.Context, req *pb.AssignTaskRequest) (*pb.AssignTaskResponse, error) {

	task, err := h.taskService.AssignTask(req.TaskId, req.UserId)
	if err != nil {
		return nil, status.Errorf(
			codes.Internal,
			"failed to assign task: %v",
			err,
		)
	}

	return &pb.AssignTaskResponse{
		Task: toPBTask(task),
	}, nil
}
func (h *TaskHandler) CompleteTask(ctx context.Context, req *pb.CompleteTaskRequest) (*pb.CompleteTaskResponse, error) {

	task, err := h.taskService.CompleteTask(req.TaskId)
	if err != nil {
		return nil, status.Errorf(
			codes.Internal,
			"failed to complete task: %v",
			err,
		)
	}

	return &pb.CompleteTaskResponse{
		Task: toPBTask(task),
	}, nil
}
func toPBTask(task todo.Task) *pb.Task {
	return &pb.Task{
		Id:             task.Id,
		Title:          task.Title,
		Difficulty:     task.Difficulty,
		XpReward:       task.XpReward,
		AssignedUserId: task.AssignedUserId,
		Completed:      task.Completed,
	}
}
func (s *TaskHandler) GetTasksByUser(ctx context.Context, req *pb.GetTasksByUserRequest) (*pb.GetTasksByUserResponse, error) {
	tasks, err := s.taskService.GetTasksByUser(req.UserId)
	if err != nil {
		return nil, err
	}
	pbTasks := make([]*pb.Task, 0, len(tasks))
	for _, task := range tasks {
		pbTasks = append(pbTasks, toPBTask(task))
	}
	return &pb.GetTasksByUserResponse{
		Tasks: pbTasks,
	}, nil
}
