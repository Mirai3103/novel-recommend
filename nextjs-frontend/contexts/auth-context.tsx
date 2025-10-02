"use client"

import { UserOut } from "@/lib/client"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AuthContextType {
  user: UserOut | null
  isLoggedIn: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children, user,isLoggedIn }: { children: ReactNode, user: UserOut | null, isLoggedIn: boolean }) {
  console.log("AuthProvider", user, isLoggedIn)
    return (
    <AuthContext.Provider value={{ user, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  )
}
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}