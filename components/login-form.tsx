"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth, DEMO_CREDENTIALS, UserRole } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Stethoscope, User, Shield, ClipboardList, Mail, Lock, AlertCircle } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("Patient")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.trim()) {
      setError("Email is required")
      return
    }
    if (!password.trim()) {
      setError("Password is required")
      return
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    const success = await login(email, password, role)
    setIsLoading(false)

    if (success) {
      router.push("/dashboard")
    } else {
      setError("Invalid credentials. Please try again.")
    }
  }

  const handleDemoLogin = async (demoType: "doctor" | "patient") => {
    const credentials = demoType === "doctor" ? DEMO_CREDENTIALS.doctor : DEMO_CREDENTIALS.patient
    const demoRole: UserRole = demoType === "doctor" ? "Doctor" : "Patient"

    setEmail(credentials.email)
    setPassword(credentials.password)
    setRole(demoRole)
    setError("")
    setIsLoading(true)

    const success = await login(credentials.email, credentials.password, demoRole)
    setIsLoading(false)

    if (success) {
      router.push("/dashboard")
    }
  }

  const getRoleIcon = (roleType: UserRole) => {
    switch (roleType) {
      case "Doctor":
        return <Stethoscope className="h-4 w-4" />
      case "Patient":
        return <User className="h-4 w-4" />
      case "Admin":
        return <Shield className="h-4 w-4" />
      case "Receptionist":
        return <ClipboardList className="h-4 w-4" />
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Main Login Card */}
      <Card className="shadow-xl border-0 bg-card">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Stethoscope className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-card-foreground">Welcome to ClinIQ+</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to access your healthcare dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-card-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-card-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-card-foreground">Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)} disabled={isLoading}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Doctor">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4" />
                      <span>Doctor</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Patient">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Patient</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Receptionist">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4" />
                      <span>Receptionist</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Signing in...
                </>
              ) : (
                <>
                  {getRoleIcon(role)}
                  <span className="ml-2">Sign In</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Demo Credentials Card */}
      <Card className="shadow-lg border-0 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-card-foreground">Demo Credentials</CardTitle>
          <CardDescription className="text-muted-foreground">
            Quick access for testing purposes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Doctor Demo */}
          <div className="rounded-lg border border-border bg-muted/50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope className="h-4 w-4 text-primary" />
              <span className="font-medium text-card-foreground">Doctor Demo</span>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground mb-3">
              <p>Email: {DEMO_CREDENTIALS.doctor.email}</p>
              <p>Password: {DEMO_CREDENTIALS.doctor.password}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => handleDemoLogin("doctor")}
              disabled={isLoading}
            >
              {isLoading ? <Spinner className="h-4 w-4" /> : "Login as Doctor"}
            </Button>
          </div>

          {/* Patient Demo */}
          <div className="rounded-lg border border-border bg-muted/50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-accent" />
              <span className="font-medium text-card-foreground">Patient Demo</span>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground mb-3">
              <p>Email: {DEMO_CREDENTIALS.patient.email}</p>
              <p>Password: {DEMO_CREDENTIALS.patient.password}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => handleDemoLogin("patient")}
              disabled={isLoading}
            >
              {isLoading ? <Spinner className="h-4 w-4" /> : "Login as Patient"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
