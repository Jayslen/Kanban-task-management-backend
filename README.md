## About Project

This is the backend for the challenge https://www.frontendmentor.io/challenges/kanban-task-management-web-app-wgQLt-HlbB. The project is based on build a Kaban Task Management Web APP. This repo contains the REST API buil with node, express and typescript for the project that will be use for the frontend.

- Stack and dependencies uses:
    - Typescript
    - NodeJS
    - Express
    - Zod
    - bcrypt
    - jsonwebtoken
    - mysql2

## Features

- Model-Controller structure
- Use a MySql database to store the data
- Errros structures in the endpoints to send it as a response
- CRUD of boards and tasks
- Authentication and authorization
- Well types and interfaces structures.

## Run locally

In order to install run the project you need to have install:

- NodeJS v22.12.0

```tsx
npm run create-db [PORT]
```

```tsx
npm run dev
```

```tsx
npm run build
npm run server
```

## Endpoints documentation.

### Errors catalog

The api uses consistent error objects that extend the built-in `Error` class and implement `ResponseError` and are return as a response if the an error occured with the following structure:

Error Response Format:

```json
{
  "errorName": "string",
  "message": "string",
  "code": number,
  "cause?": "string | object" // optional, appears only when there is validation context
}

```

| Error Class | `errorName` | Default Message | Status Code |
| --- | --- | --- | --- |
| `UserNotAvailable` | `UsernameTaken` | The username is already taken | `400` |
| `UserNotFound` | `UserNotFound` | No user exists with the username given | `404` |
| `WrongUserPassword` | `WrongPassword` | Password incorrect | `400` |
| `UnauthorizedUser` | `Unauthorized` | Need to be authenticated | `401` |
| `BoardNotFound` | `BoardNotFound` | The board requested was not found | `404` |
| `ValidationError` | `ValidationError` | The data sent is not well structured. Try again | `400+` (custom) |

### ValidationError Details:

When a validation error occurs, an additional field `errors` is returned:

```json
{
  "errorName": "ValidationError",
  "message": "The data sent is not well structured. Try again",
  "code": 400,
  "errors": [
    ["username", "Must be at least 4 characters"],
    ["password", "Must not exceed 50 characters"]
  ]
}
```

## Validation Schemas

The API uses [**Zod**](https://github.com/colinhacks/zod) for request validation.

Below are the schemas and their validation rules.

## User Schema

### `userSchema`

```tsx
{
  username: string (4–30 chars, trimmed)
  password: string (8–50 chars, trimmed)
}

```

- **Validation**:
    - `username`: must be 4–30 characters
    - `password`: must be 8–50 characters

🔎 **Used in**: User registration and login.

---

## Board Schemas

### `boardSchema`

```tsx
{
  name: string (6–60 chars)
  columns: string[] (each 4–25 chars)
}

```

- **Validation**:
    - `name`: 6–60 characters
    - `columns`: array of strings, each 4–25 characters

🔎 **Used in**: Board creation.

---

### `updateColumnsBoardSchema`

```tsx
{
  name: string (6–60 chars)
  columns: {
    edit?: [
      {
        id: number (required),
        remove?: boolean,
        payload?: string (4–25 chars)
      }
    ],
    add?: string[] (each 4–25 chars)
  }
}

```

- **Validation**:
    - `edit`: optional list of columns to update
        - `id`: required numeric column ID
        - `remove`: optional boolean (to delete column)
        - `payload`: optional string (new column name)
    - `add`: optional list of new columns

🔎 **Used in**: Updating a board’s columns.

---

## Task Schemas

### `taskBoardSchema`

```tsx
{
  name: string (6–40 chars),
  description?: string (8–150 chars),
  subtasks: string[] (each 6–40 chars),
  status: number
}

```

- **Validation**:
    - `name`: required, 6–40 characters
    - `description`: optional, 8–150 characters
    - `subtasks`: array of strings (6–40 chars)
    - `status`: required number (maps to a column ID)

🔎 **Used in**: Creating tasks.

---

### `updateBoardTaskSchema`

```tsx
{
  name?: string (6–40 chars),
  description?: string (8–150 chars),
  subtasks?: [
    { id?: number, name?: string (6–40 chars) }
  ],
  status?: number
}

```

- **Validation**:
    - `name`: optional, 6–40 characters
    - `description`: optional, 8–150 characters
    - `subtasks`: optional list of objects
        - `id`: optional subtask ID
        - `name`: optional new name (6–40 chars)
    - `status`: optional number (new column ID)

🔎 **Used in**: Updating tasks.

## Authentication Routes

### **POST** `/auth/register`

Registers a new user.

### Request Body

```json
{
  "username": "john_doe",
  "password": "securePassword123"
}

```

### ✅ Success Response

- **Code:** `201 Created`

No body returned.

### ❌ Error Responses

- `400 Bad Request` – Invalid input (username or password doesn’t meet requirements).
- `409 Conflict` – Username already exists.
- `500 Internal Server Error`

### **POST** `/auth/login`

Logs in an existing user.

### Request Body

```json
{
  "username": "john_doe",
  "password": "securePassword123"
}

```

### ✅ Success Response

- **Code:** `200 OK`
- **Set-Cookie Headers:**
    - `access_token=<JWT>`
    - `refresh_token=<JWT>`

No body returned.

### ❌ Error Responses

- `400 Bad Request` – Invalid input.
- `401 Unauthorized` – Wrong username or password.
- `500 Internal Server Error`

## Board Routes (Protected with JWT)

### **POST** `/boards/`

Create a new board.

### Request Body

```json
{
  "name": "Project Roadmap",
  "columns": ["To Do", "In Progress", "Done"]
}

```

### ✅ Success Response

- **Code:** `201 Created`

```json
{
  "board_id": "uuid",
  "name": "Project Roadmap",
  "columns": [
    { "id": 1, "name": "To Do" },
    { "id": 2, "name": "In Progress" },
    { "id": 3, "name": "Done" }
  ]
}

```

### ❌ Error Responses

- `400 Bad Request` – Validation failed.
- `403 Forbidden` – User not authenticated.
- `500 Internal Server Error`

### **PATCH** `/boards/:boardId`

Update a board’s name and/or columns.

### Request Body

```json
{
  "name": "Updated Project",
  "columns": {
    "edit": [
      { "id": 1, "payload": "Backlog" },
      { "id": 2, "remove": true }
    ],
    "add": ["QA Review"]
  }
}

```

### ✅ Success Response

- **Code:** `200 OK`

```json
{
  "board": "Updated Project",
  "columns": [
    { "id": 1, "name": "Backlog" },
    { "id": 3, "name": "QA Review" }
  ]
}

```

### ❌ Error Responses

- `400 Bad Request` – Validation error.
- `404 Not Found` – Board not found.
- `500 Internal Server Error`

### **DELETE** `/boards/:boardId`

Delete a board.

### ✅ Success Response

- **Code:** `200 OK`

No body returned.

### ❌ Error Responses

- `404 Not Found` – Board not found.
- `500 Internal Server Error`

### **POST** `/boards/:boardId/task`

Create a task in a board.

### Request Body

```json
{
  "name": "Implement login",
  "description": "Set up JWT authentication",
  "subtasks": ["Design DB schema", "Write controller", "Test endpoints"],
  "status": 1
}

```

### ✅ Success Response

- **Code:** `201 Created`

```json
{
  "id": "uuid",
  "name": "Implement login",
  "description": "Set up JWT authentication",
  "status": "To Do",
  "subtasks": [
    { "id": 10, "name": "Design DB schema", "isComplete": false },
    { "id": 11, "name": "Write controller", "isComplete": false },
    { "id": 12, "name": "Test endpoints", "isComplete": false }
  ]
}

```

### ❌ Error Responses

- `400 Bad Request` – Validation failed.
- `404 Not Found` – Board not found.
- `500 Internal Server Error`

### **PATCH** `/boards/:boardId/task/:taskId`

Update a task.

### Request Body

```json
{
  "name": "Implement login + refresh",
  "description": "JWT auth with refresh tokens",
  "status": 2,
  "subtasks": [
    { "id": 10, "name": "Design DB schema v2" },
    { "id": 11 },
    { "name": "Write integration tests" }
  ]
}

```

- `id + no name` → delete subtask
- `id + name` → update subtask
- `no id + name` → add subtask

### ✅ Success Response

- **Code:** `200 OK`

No body returned.

### ❌ Error Responses

- `400 Bad Request` – Validation failed.
- `404 Not Found` – Task not found.
- `500 Internal Server Error`

---

### **DELETE** `/boards/:boardId/task/:taskId`

Delete a task.

### ✅ Success Response

- **Code:** `200 OK`

No body returned.

### ❌ Error Responses

- `404 Not Found` – Task not found.
- `500 Internal Server Error`

---

### **GET** `/boards/`

Get all boards for the logged-in user.

### ✅ Success Response

- **Code:** `200 OK`

```json
[
  { "id": "uuid1", "name": "Project Roadmap" },
  { "id": "uuid2", "name": "Marketing Plan" }
]

```

### ❌ Error Responses

- `403 Forbidden` – User not authenticated.
- `500 Internal Server Error`

---

### **GET** `/boards/:boardId`

Get a board with columns, tasks, and subtasks.

### ✅ Success Response

- **Code:** `200 OK`

```json
{
  "id": "uuid",
  "name": "Project Roadmap",
  "columns": [
    {
      "id": 1,
      "name": "To Do",
      "tasks": [
        {
          "id": "taskUuid",
          "name": "Implement login",
          "description": "Set up JWT authentication",
          "subtasks": [
            { "id": 10, "name": "Design DB schema", "isComplete": false }
          ]
        }
      ]
    }
  ]
}

```

### ❌ Error Responses

- `404 Not Found` – Board not found.
- `500 Internal Server Error`
