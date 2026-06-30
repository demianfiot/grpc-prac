# grpc-tasks

A simple task management system built with Go, gRPC, PostgreSQL, and Docker.

This project was created as a pet project to learn and practice gRPC development in Go, including Protocol Buffers, service design, database interaction, and layered application architecture.

## gRPC Services

### UserService

```proto
service UserService {
  rpc CreateUser (CreateUserRequest) returns (CreateUserResponse);
  rpc GetUser    (GetUserRequest)    returns (GetUserResponse);
  rpc ListUsers  (ListUsersRequest)  returns (ListUsersResponse);
}
```

### TaskService

```proto
service TaskService {
  rpc CreateTask      (CreateTaskRequest)      returns (CreateTaskResponse);
  rpc GetTask         (GetTaskRequest)         returns (GetTaskResponse);
  rpc ListTasks       (ListTasksRequest)       returns (ListTasksResponse);
  rpc AssignTask      (AssignTaskRequest)      returns (AssignTaskResponse);
  rpc CompleteTask    (CompleteTaskRequest)    returns (CompleteTaskResponse);
  rpc GetTasksByUser  (GetTasksByUserRequest)  returns (GetTasksByUserResponse);
}
```

## Getting Started

### 1. Create `.env`

Create a `.env` file in the project root.

```env
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=mydb
DB_SSLMODE=disable

SERVER_PORT=50051
```

The repository contains a sample configuration file that can be used as a reference.

### 2. Start the Application

```bash
docker compose up -d
```

### 3. Run Database Migrations

```bash
goose -dir ./migrations postgres "user=postgres password=postgres dbname=mydb host=localhost port=5432 sslmode=disable" up
```


This will start:

* PostgreSQL
* gRPC Server

## Testing

### Install grpcurl

https://github.com/fullstorydev/grpcurl

## Example Workflow

### Create User

```bash
grpcurl -plaintext \
-d '{"name":"Demian"}' \
localhost:50051 user.UserService/CreateUser
```

Example response:

```json
{
  "id": "1",
  "name": "Demian",
  "level": 1,
  "xp": 0
}
```

### Create Task

```bash
grpcurl -plaintext \
-d '{"title":"Clean room","difficulty":"hard","xpReward":10}' \
localhost:50051 task.TaskService/CreateTask
```

Example response:

```json
{
  "id": "1",
  "title": "Clean room",
  "difficulty": "hard",
  "xpReward": 10,
  "assignedUserId": 0,
  "completed": false
}
```

### Assign Task to User

```bash
grpcurl -plaintext \
-d '{"taskId":1,"userId":1}' \
localhost:50051 task.TaskService/AssignTask
```

### Complete Task

```bash
grpcurl -plaintext \
-d '{"taskId":1}' \
localhost:50051 task.TaskService/CompleteTask
```

Completing a task grants XP to the assigned user.

### Check Updated User

```bash
grpcurl -plaintext \
-d '{"id":1}' \
localhost:50051 user.UserService/GetUser
```

Example response:

```json
{
  "id": "1",
  "name": "Demian",
  "level": 1,
  "xp": 10
}
```

### List Users

```bash
grpcurl -plaintext \
localhost:50051 user.UserService/ListUsers
```

### List Tasks

```bash
grpcurl -plaintext \
localhost:50051 task.TaskService/ListTasks
```

### Get Tasks Assigned to User

```bash
grpcurl -plaintext \
-d '{"userId":1}' \
localhost:50051 task.TaskService/GetTasksByUser
```
