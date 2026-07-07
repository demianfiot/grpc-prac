package service

import (
	pb "rpcprac/pb/user/proto"
	"rpcprac/repository"
	"rpcprac/todo"
)

type UserService struct {
	pb.UnimplementedUserServiceServer
	repo repository.User
}

func NewUserService(repo repository.User) *UserService {
	return &UserService{
		repo: repo,
	}
}
func (s *UserService) CreateUser(name string) (todo.User, error) {
	return s.repo.CreateUser(name)
}

func (s *UserService) GetUser(id int64) (todo.User, error) {
	return s.repo.GetUser(id)

}

func (s *UserService) ListUsers() ([]todo.User, error) {

	return s.repo.ListUsers()
}

func (s *UserService) ListUsersFiltered(search, sortBy, sortOrder string) ([]todo.User, error) {
	return s.repo.ListUsersFiltered(search, sortBy, sortOrder)
}
