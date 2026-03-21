"use client"

import { useAuth, UserRole } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Stethoscope, 
  User, 
  Shield, 
  ClipboardList, 
  LogOut, 
  Calendar, 
  Users, 
  FileText,
  Activity,
  Clock
} from "lucide-react"

export function DashboardContent() {
  const { user, logout } = useAuth()

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "Doctor":
        return <Stethoscope className="h-6 w-6" />
      case "Patient":
        return <User className="h-6 w-6" />
      case "Admin":
        return <Shield className="h-6 w-6" />
      case "Receptionist":
        return <ClipboardList className="h-6 w-6" />
    }
  }

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "Doctor":
        return "default"
      case "Patient":
        return "secondary"
      case "Admin":
        return "destructive"
      case "Receptionist":
        return "outline"
    }
  }

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case "Doctor":
        return "Manage appointments, view patient records, and provide consultations."
      case "Patient":
        return "Book appointments, view medical history, and access health records."
      case "Admin":
        return "Full system access including user management and system settings."
      case "Receptionist":
        return "Handle patient check-ins, manage schedules, and process registrations."
    }
  }

  const getQuickActions = (role: UserRole) => {
    switch (role) {
      case "Doctor":
        return [
          { icon: Calendar, label: "Today's Appointments", count: 8 },
          { icon: Users, label: "My Patients", count: 156 },
          { icon: FileText, label: "Pending Reports", count: 3 },
          { icon: Activity, label: "Recent Consultations", count: 12 },
        ]
      case "Patient":
        return [
          { icon: Calendar, label: "Upcoming Appointments", count: 2 },
          { icon: FileText, label: "Medical Records", count: 15 },
          { icon: Activity, label: "Health Metrics", count: 4 },
          { icon: Clock, label: "Prescription Refills", count: 1 },
        ]
      case "Admin":
        return [
          { icon: Users, label: "Total Users", count: 1250 },
          { icon: Stethoscope, label: "Active Doctors", count: 45 },
          { icon: FileText, label: "System Reports", count: 8 },
          { icon: Activity, label: "System Health", count: 99 },
        ]
      case "Receptionist":
        return [
          { icon: Calendar, label: "Today's Schedule", count: 32 },
          { icon: Users, label: "Check-ins Today", count: 18 },
          { icon: Clock, label: "Waiting Patients", count: 5 },
          { icon: FileText, label: "Pending Forms", count: 7 },
        ]
    }
  }

  if (!user) return null

  const quickActions = getQuickActions(user.role)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-card-foreground">ClinIQ+</span>
          </div>
          <Button variant="outline" onClick={logout} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <Card className="mb-8 border-0 bg-gradient-to-r from-primary/10 to-accent/10 shadow-lg">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
                  {getRoleIcon(user.role)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-card-foreground">
                    Welcome back!
                  </h1>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Badge variant={getRoleBadgeVariant(user.role)} className="w-fit text-sm px-4 py-1">
                {user.role}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Role Description */}
        <Card className="mb-8 shadow-md border-0 bg-card">
          <CardHeader>
            <CardTitle className="text-card-foreground">Your Dashboard</CardTitle>
            <CardDescription className="text-muted-foreground">{getRoleDescription(user.role)}</CardDescription>
          </CardHeader>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="shadow-md hover:shadow-lg transition-shadow cursor-pointer border-0 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <action.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-3xl font-bold text-primary">{action.count}</span>
                </div>
                <p className="mt-4 text-sm font-medium text-muted-foreground">{action.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Session Info */}
        <Card className="mt-8 shadow-md border-0 bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Session Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-card-foreground">{user.email}</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium text-card-foreground">{user.role}</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <p className="font-medium text-card-foreground">Active</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
