import React from "react";
import styles from "@/styles/TodoList.module.css";

const TodoItem = ({ todo, onToggle, onDelete }) => {
  return (
    <li className={styles.todoItem}>
      <input type="checkbox" checked={todo.completed} onChange={onToggle} />
      <span
        className={styles.todoText}
        style={{ textDecoration: todo.completed ? "line-through" : "none" }}
      >
        {todo.text}
      </span>
      {/* 날짜 정보 렌더링 */}
      <span className={styles.todoDate}>{todo.date}</span>
      <button onClick={onDelete}>Delete</button>
    </li>
  );
};

export default TodoItem;
