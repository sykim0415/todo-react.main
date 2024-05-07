// pages/admin.js

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

const AdminPage = () => {
  const [todos, setTodos] = useState([]);
  const router = useRouter();
  const { data } = useSession();

  useEffect(() => {
    // 관리자가 아닌 경우 로그인 페이지로 리다이렉트
    if (!data?.user?.isAdmin) {
      router.replace("/login");
    } else {
      // 모든 사용자의 할 일 가져오기
      getTodos();
    }
  }, [data]);

  const getTodos = async () => {
    const q = query(collection(db, "todos"));
    const results = await getDocs(q);
    const allTodos = results.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTodos(allTodos);
  };

  return (
    <div>
      <h1>Admin Page</h1>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <div>{todo.userName}'s Todo: {todo.text}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPage;
