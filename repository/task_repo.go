package repository

import (
	"fmt"
	"rpcprac/todo"
	"strings"

	"github.com/jmoiron/sqlx"
)

type TaskPostgres struct {
	db *sqlx.DB
}

func NewTaskPostgres(db *sqlx.DB) *TaskPostgres {
	return &TaskPostgres{db: db}
}

func (r *TaskPostgres) CreateTask(task todo.Task) (todo.Task, error) {

	query := `
	INSERT INTO tasks (title, difficulty, xp_reward)
	VALUES ($1, $2, $3)
	RETURNING id, title, difficulty, xp_reward, COALESCE(assigned_user_id, 0) AS assigned_user_id, completed
	`

	var resp todo.Task

	err := r.db.QueryRow(
		query,
		task.Title,
		task.Difficulty,
		task.XpReward,
	).Scan(
		&resp.Id,
		&resp.Title,
		&resp.Difficulty,
		&resp.XpReward,
		&resp.AssignedUserId,
		&resp.Completed,
	)

	if err != nil {
		return todo.Task{}, fmt.Errorf("create task: %w", err)
	}

	return resp, nil
}

func (r *TaskPostgres) GetTask(id int64) (todo.Task, error) {
	query := `
	SELECT id, title, difficulty, xp_reward, COALESCE(assigned_user_id, 0) AS assigned_user_id, completed
	FROM tasks
	WHERE id = $1
	`

	var task todo.Task

	err := r.db.Get(&task, query, id)
	if err != nil {
		return todo.Task{}, fmt.Errorf("get task: %w", err)
	}

	return task, nil
}
func (r *TaskPostgres) ListTasks() ([]todo.Task, error) {

	query := `
	SELECT id, title, difficulty, xp_reward, COALESCE(assigned_user_id, 0) AS assigned_user_id, completed
	FROM tasks
	ORDER BY id DESC
	`

	var tasks []todo.Task

	err := r.db.Select(&tasks, query)
	if err != nil {
		return nil, fmt.Errorf("list tasks: %w", err)
	}

	return tasks, nil
}

func (r *TaskPostgres) ListTasksFiltered(sortBy, sortOrder string) ([]todo.Task, error) {
	query := `SELECT id, title, difficulty, xp_reward, COALESCE(assigned_user_id, 0) AS assigned_user_id, completed FROM tasks`

	validSorts := map[string]bool{"id": true, "title": true, "difficulty": true, "xp_reward": true, "assigned_user_id": true}
	if sortBy != "" && validSorts[sortBy] {
		order := "ASC"
		if strings.ToUpper(sortOrder) == "DESC" {
			order = "DESC"
		}
		if sortBy == "difficulty" {
			query += fmt.Sprintf(" ORDER BY CASE difficulty WHEN 'easy' THEN 1 WHEN 'medium' THEN 2 WHEN 'hard' THEN 3 END %s", order)
		} else {
			query += fmt.Sprintf(" ORDER BY %s %s", sortBy, order)
		}
	} else {
		query += " ORDER BY completed ASC, id DESC"
	}

	var tasks []todo.Task
	err := r.db.Select(&tasks, query)
	if err != nil {
		return nil, fmt.Errorf("list tasks: %w", err)
	}
	return tasks, nil
}
func (r *TaskPostgres) AssignTask(taskID, userID int64) (todo.Task, error) {

	query := `
	UPDATE tasks
	SET assigned_user_id = $1
	WHERE id = $2
	RETURNING id, title, difficulty, xp_reward, COALESCE(assigned_user_id, 0) AS assigned_user_id, completed
	`

	var task todo.Task

	err := r.db.QueryRow(
		query,
		userID,
		taskID,
	).Scan(
		&task.Id,
		&task.Title,
		&task.Difficulty,
		&task.XpReward,
		&task.AssignedUserId,
		&task.Completed,
	)

	if err != nil {
		return todo.Task{}, fmt.Errorf("assign task: %w", err)
	}

	return task, nil
}
func (r *TaskPostgres) CompleteTask(taskID int64) (todo.Task, error) {

	tx, err := r.db.Beginx()
	if err != nil {
		return todo.Task{}, err
	}
	defer tx.Rollback()

	var task todo.Task
	err = tx.Get(
		&task,
		`SELECT id, xp_reward, COALESCE(assigned_user_id, 0) AS assigned_user_id
		 FROM tasks
		 WHERE id = $1 AND completed = false`,
		taskID,
	)
	if err != nil {
		return todo.Task{}, err
	}

	err = tx.Get(
		&task,
		`UPDATE tasks
		 SET completed = true
		 WHERE id = $1
		 RETURNING id, title, difficulty, xp_reward, COALESCE(assigned_user_id, 0) AS assigned_user_id, completed`,
		taskID,
	)
	if err != nil {
		return todo.Task{}, err
	}
	_, err = tx.Exec(
		`UPDATE users
		 SET xp = xp + $1
		 WHERE id = $2`,
		task.XpReward,
		task.AssignedUserId,
	)
	if err != nil {
		return todo.Task{}, err
	}

	err = tx.Commit()
	if err != nil {
		return todo.Task{}, err
	}

	return task, nil
}
func (r *TaskPostgres) GetTasksByUser(userID int64) ([]todo.Task, error) {
	query := `
	SELECT id, title, difficulty, xp_reward, COALESCE(assigned_user_id, 0) AS assigned_user_id, completed
	FROM tasks
	WHERE assigned_user_id = $1
	`

	var tasks []todo.Task

	err := r.db.Select(&tasks, query, userID)
	if err != nil {
		return nil, fmt.Errorf("get tasks by user: %w", err)
	}

	return tasks, nil
}
