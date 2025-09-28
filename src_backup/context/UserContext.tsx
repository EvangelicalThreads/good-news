"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

// 1️⃣ Define the context type
type UserContextType = {
  name: string;
  setName: (name: string) => void;
  avatar: string;
  setAvatar: (avatar: string) => void;
};

// 2️⃣ Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// 3️⃣ Provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("lamb"); // default

  // Optional: persist avatar & name in localStorage
  useEffect(() => {
    const storedName = localStorage.getItem("user_name");
    const storedAvatar = localStorage.getItem("user_avatar");
    if (storedName) setName(storedName);
    if (storedAvatar) setAvatar(storedAvatar);
  }, []);

  useEffect(() => {
    localStorage.setItem("user_name", name);
  }, [name]);

  useEffect(() => {
    localStorage.setItem("user_avatar", avatar);
  }, [avatar]);

  return (
    <UserContext.Provider value={{ name, setName, avatar, setAvatar }}>
      {children}
    </UserContext.Provider>
  );
};

// 4️⃣ Custom hook to consume the context
export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside a UserProvider");
  return ctx;
};
