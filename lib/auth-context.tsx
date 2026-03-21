"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"

export type UserRole = "Doctor" | "Patient" | "Admin" | "Receptionist"

interface User {
  email: string
  role: UserRole
  isAuthenticated: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: UserRole) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEMO_CREDENTIALS = {
  doctor: { email: "doctor@cliniq.com", password: "Doctor@123" },
  patient: { email: "patient@cliniq.com", password: "Patient@123" },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("cliniq_user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        if (parsedUser.isAuthenticated) {
          setUser(parsedUser)
        }
      } catch {
        localStorage.removeItem("cliniq_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Validate demo credentials or accept any valid email/password
    const isDemoDoctor =
      email === DEMO_CREDENTIALS.doctor.email && password === DEMO_CREDENTIALS.doctor.password
    const isDemoPatient =
      email === DEMO_CREDENTIALS.patient.email && password === DEMO_CREDENTIALS.patient.password

    // Accept demo credentials or any email with 6+ char password
    if (isDemoDoctor || isDemoPatient || (email.includes("@") && password.length >= 6)) {
      const newUser: User = {
        email,
        role,
        isAuthenticated: true,
      }
      localStorage.setItem("cliniq_user", JSON.stringify(newUser))
      setUser(newUser)
      return true
    }

    return false
  }

  const logout = () => {
    localStorage.removeItem("cliniq_user")
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export { DEMO_CREDENTIALS }
