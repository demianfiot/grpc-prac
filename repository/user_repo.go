package repository

import (
	"fmt"
	"rpcprac/todo"
	"strings"

	"github.com/jmoiron/sqlx"
)

type UserPostgres struct {
	db *sqlx.DB
}

func NewUserPostgres(db *sqlx.DB) *UserPostgres {
	return &UserPostgres{db: db}
}

func (r *UserPostgres) CreateUser(name string) (todo.User, error) {

	query := `
	INSERT INTO users (name)
	VALUES ($1)
	RETURNING id, name, level, xp
	`

	var respUser todo.User

	err := r.db.QueryRow(
		query,
		name,
	).Scan(
		&respUser.Id,
		&respUser.Name,
		&respUser.Level,
		&respUser.Xp,
	)

	if err != nil {
		return todo.User{}, fmt.Errorf("failed to create user: %w", err)
	}

	return respUser, nil
}

func (r *UserPostgres) GetUser(id int64) (todo.User, error) {

	query := `
	SELECT u.id, u.name,
		COALESCE(cnt.completed, 0) / 5 + 1 AS level,
		u.xp,
		COALESCE(cnt.completed, 0) AS completed_tasks
	FROM users u
	LEFT JOIN (
		SELECT assigned_user_id, COUNT(*) AS completed
		FROM tasks
		WHERE completed = true
		GROUP BY assigned_user_id
	) cnt ON cnt.assigned_user_id = u.id
	WHERE u.id = $1
	`

	var respUser todo.User

	err := r.db.Get(&respUser, query, id)
	if err != nil {
		return todo.User{}, fmt.Errorf("failed to get user: %w", err)
	}

	return respUser, nil
}

func (r *UserPostgres) ListUsers() ([]todo.User, error) {

	query := `
	SELECT u.id, u.name,
		COALESCE(cnt.completed, 0) / 5 + 1 AS level,
		u.xp,
		COALESCE(cnt.completed, 0) AS completed_tasks
	FROM users u
	LEFT JOIN (
		SELECT assigned_user_id, COUNT(*) AS completed
		FROM tasks
		WHERE completed = true
		GROUP BY assigned_user_id
	) cnt ON cnt.assigned_user_id = u.id
	ORDER BY u.id ASC
	`

	var users []todo.User

	err := r.db.Select(&users, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list users: %w", err)
	}

	return users, nil
}

func (r *UserPostgres) ListUsersFiltered(search, sortBy, sortOrder string) ([]todo.User, error) {
	query := `
	SELECT u.id, u.name,
		COALESCE(cnt.completed, 0) / 5 + 1 AS level,
		u.xp,
		COALESCE(cnt.completed, 0) AS completed_tasks
	FROM users u
	LEFT JOIN (
		SELECT assigned_user_id, COUNT(*) AS completed
		FROM tasks
		WHERE completed = true
		GROUP BY assigned_user_id
	) cnt ON cnt.assigned_user_id = u.id
	WHERE 1=1`
	args := []any{}
	idx := 1

	if search != "" {
		query += fmt.Sprintf(" AND u.name ILIKE $%d", idx)
		args = append(args, "%"+search+"%")
		idx++
	}

	validSorts := map[string]bool{"id": true, "name": true, "level": true, "xp": true, "completed_tasks": true}
	if sortBy != "" && validSorts[sortBy] {
		order := "ASC"
		if strings.ToUpper(sortOrder) == "DESC" {
			order = "DESC"
		}
		query += fmt.Sprintf(" ORDER BY %s %s", sortBy, order)
	} else {
		query += " ORDER BY u.id ASC"
	}

	var users []todo.User
	err := r.db.Select(&users, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list users: %w", err)
	}
	return users, nil
}
