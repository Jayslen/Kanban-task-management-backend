const dbQueries = {
    getColumns: 'SELECT column_id AS id, name FROM board_columns WHERE column_id = ?',
    getBoardName: 'SELECT name FROM boards WHERE BIN_TO_UUID(board_id) = ?',
    getBoardBasicInfo: 'SELECT BIN_TO_UUID(board_id) AS boardId, name, timestamp as createdAt FROM boards WHERE BIN_TO_UUID(board_id) = ?',
    getBoardBasicInfoByOwner: 'SELECT BIN_TO_UUID(board_id) AS boardId, name, timestamp as createdAt FROM boards WHERE BIN_TO_UUID(owner) = ?',
    getBoardWithColumns: `SELECT BIN_TO_UUID(board_id) AS boardId, b.name, timestamp AS createdAt, column_id, c.name AS columnName FROM boards AS b
    INNER JOIN BOARD_columns AS c ON C.board = B.board_ID
    WHERE BIN_TO_UUID(board_id) = ?;`,
    getColumnsWithTasks: `
  SELECT 
      c.column_id AS columnId,
      c.name AS column_name,
      BIN_TO_UUID(t.task_id) AS task_id,
      t.name AS task_name,
      t.description AS task_description,
      t.column_id AS task_column_id,
      s.subtask_id,
      s.name AS subtask_name,
      s.isComplete AS subtask_isComplete
  FROM board_columns c
  LEFT JOIN tasks t 
      ON t.column_id = c.column_id 
     AND BIN_TO_UUID(t.board_id) = ?
     LEFT JOIN subtasks s 
     ON BIN_TO_UUID(s.task) = BIN_TO_UUID(t.task_id)
  WHERE BIN_TO_UUID(c.board) = ?
  `
}

export const {
    getColumns,
    getBoardBasicInfo,
    getBoardName,
    getBoardWithColumns,
    getBoardBasicInfoByOwner,
    getColumnsWithTasks
} = dbQueries
