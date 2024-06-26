"use client";

import React, { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import TodoItem from "@/components/TodoItem";
import styles from "@/styles/TodoList.module.css";

// firebase 관련 모듈을 불러옵니다.
import { db } from "@/firebase";
import {
  collection,
  query,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  where
} from "firebase/firestore";

// DB의 todos 컬렉션 참조를 만듭니다. 컬렉션 사용시 잘못된 컬렉션 이름 사용을 방지합니다.
const todoCollection = collection(db, "todos");

// TodoList 컴포넌트를 정의합니다.
const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  const router = useRouter();
  const { data } = useSession({
    required: true,
    onUnauthenticated() {
      router.replace("/login");
    },
  });

  useEffect(() => {
    console.log("data", data);
    getTodos();
  }, [data]);

  const getTodos = async () => {
    if (!data?.user?.name) return;
    const q = query(
      todoCollection,
      where("userName", "==", data?.user?.name),
      orderBy("date", 'asc')
    ); // 날짜 순으로 정렬

    const results = await getDocs(q);
    const newTodos = [];
    results.docs.forEach((doc) => {
      newTodos.push({ id: doc.id, ...doc.data() });
    });
    setTodos(newTodos);
  };

  const addTodo = async () => {
    if (input.trim() === "") return;
    const userName = data?.user?.name || "Unknown"; // 'Unknown'으로 기본값 설정
    const docRef = await addDoc(todoCollection, {
      userName: userName,
      text: input,
      completed: false,
      date: new Date().toISOString().slice(0, 10) // 현재 날짜 설정
    });
    setTodos([...todos, { id: docRef.id, text: input, completed: false, date: new Date().toISOString().slice(0, 10) }]);
    setInput("");
  };   

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id === id) {
          const todoDoc = doc(todoCollection, id);
          updateDoc(todoDoc, { completed: !todo.completed });
          return { ...todo, completed: !todo.completed };
        } else {
          return todo;
        }
      })
    );
  };

  const deleteTodo = async (id) => {
    const todo = todos.find(todo => todo.id === id);
    if (!todo) return; // 해당 ID의 할 일이 없는 경우 종료
    // 현재 사용자의 이름과 할 일의 사용자 이름이 일치하는지 확인
    if (todo.userName !== data?.user?.name) {
      console.log("현재 사용자의 할 일이 아닙니다.");
      return;
    }
    // 해당 할 일 삭제
    const todoDoc = doc(todoCollection, id);
    await deleteDoc(todoDoc);
    // 삭제된 할 일을 제외한 나머지 할 일들만 유지
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };  

  return (
    <div className={styles.container}>
      <h1 className="text-xl mb-4 font-bold underline underline-offset-4 decoration-wavy">
        {data?.user?.name}'s Todo List
      </h1>
      <input
        type="text"
        className="w-full p-1 mb-4 border border-gray-300 rounded"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        className="w-40 justify-self-end p-1 mb-4 bg-blue-500 text-white
                   border border-blue-500 rounded hover:bg-white hover:text-blue-500"
        onClick={addTodo}
      >
        Add Todo
      </button>
      <ul>
        {todos.map((todo) => (
          <div key={todo.id}>
            <TodoItem
              todo={todo}
              onToggle={() => toggleTodo(todo.id)}
              onDelete={() => deleteTodo(todo.id)}
            />
            <span>날짜: {todo.date}</span>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
