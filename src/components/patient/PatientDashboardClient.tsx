"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  HeartPulse,
  FileText,
  Pill,
  MessageSquare,
  Calendar,
  TrendingUp,
  Clock,
  ChevronRight,
  Star,
  Activity,
  Upload,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

const MOCK_RECENT_CONSULTATIONS = [
  {
    id: "1",
    date: "Feb 15, 2026",
    doctor: "Dr. Sharma",
    diagnosis: "Type 2 Diabetes - Follow-up",
    status: "completed",
  },
  {
    id: "2",
    date: "Jan 20, 2026",
    doctor: "Dr. Sharma",
    diagnosis: "Hypertension Management",
    status: "completed",
  },
  {
    id: "3",
    date: "Dec 10, 2025",
    doctor: "Dr. Patel",
    diagnosis: "Seasonal Flu",
    status: "completed",
  },
];

const MOCK_MEDICATIONS = [
  {
    name: "Metformin 500mg",
    frequency: "Twice daily",
    refillDays: 12,
    adherence: 92,
  },
  {
    name: "Amlodipine 5mg",
    frequency: "Once daily",
    refillDays: 8,
    adherence: 98,
  },
  {
    name: "Atorvastatin 10mg",
    frequency: "Once at night",
    refillDays: 21,
    adherence: 85,
  },
];

interface PatientDashboardClientProps {
  user: { id: string; name: string; email: string; role: string };
}

export function PatientDashboardClient({ user }: PatientDashboardClientProps) {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Welcome back, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Your health dashboard
          </p>
        </div>
        {/* Hero Health Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            className="border-none shadow-lg overflow-hidden"
            style={{ borderRadius: "var(--radius-lg)" }}
          >
            <div className="bg-gradient-to-br from-[#4A90E2] to-[#3CC2C2] p-8">
              <div className="flex items-center justify-between text-white">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 opacity-90" />
                    <p className="text-sm font-medium opacity-90">
                      Overall Health Score
                    </p>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-bold tracking-tight">
                      78
                    </span>
                    <span className="text-2xl opacity-70">/100</span>
                  </div>
                  <p className="text-sm opacity-90">
                    Good — Keep up the great work!
                  </p>
                </div>
                <div className="text-right space-y-2">
                  <div className="flex items-center gap-1.5 justify-end bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-semibold">+5 pts</span>
                  </div>
                  <p className="text-xs opacity-75">Since last visit</p>
                  <p className="text-xs opacity-60">Updated Feb 15, 2026</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              label: "Upcoming Appointments",
              value: "2",
              icon: Calendar,
              color: "text-[#4A90E2]",
              bg: "bg-[#4A90E2]/10",
            },
            {
              label: "Active Medications",
              value: "3",
              icon: Pill,
              color: "text-[#3CC2C2]",
              bg: "bg-[#3CC2C2]/10",
            },
            {
              label: "Reports Available",
              value: "8",
              icon: FileText,
              color: "text-[#10B981]",
              bg: "bg-[#10B981]/10",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card
                className="border-[var(--border)] hover:shadow-md transition-all duration-300"
                style={{ borderRadius: "var(--radius)" }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-[var(--foreground-muted)]">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold text-[var(--foreground)]">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}
                    >
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Consultations */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card
              className="border-[var(--border)] h-full"
              style={{ borderRadius: "var(--radius)" }}
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-8 h-8 rounded-lg bg-[#4A90E2]/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[#4A90E2]" />
                  </div>
                  Recent Consultations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {MOCK_RECENT_CONSULTATIONS.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="group p-4 rounded-xl hover:bg-[var(--surface-elevated)] transition-all duration-200 cursor-pointer border border-transparent hover:border-[var(--border)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#4A90E2]/10 flex items-center justify-center shrink-0">
                        <HeartPulse className="w-5 h-5 text-[#4A90E2]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--foreground)] mb-1 line-clamp-1">
                          {c.diagnosis}
                        </p>
                        <p className="text-xs text-[var(--foreground-muted)]">
                          {c.doctor} · {c.date}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--foreground-subtle)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                  </motion.div>
                ))}
                <Link href="/patient/reports">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-sm mt-2 gap-1 rounded-xl hover:bg-[var(--surface-elevated)]"
                  >
                    View All Reports <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Medications */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card
              className="border-[var(--border)] h-full"
              style={{ borderRadius: "var(--radius)" }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-8 h-8 rounded-lg bg-[#3CC2C2]/10 flex items-center justify-center">
                      <Pill className="w-4 h-4 text-[#3CC2C2]" />
                    </div>
                    Active Medications
                  </CardTitle>
                  <Badge className="bg-[#3CC2C2]/10 text-[#3CC2C2] text-xs px-2 py-1 rounded-lg">
                    3 active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {MOCK_MEDICATIONS.map((med, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="p-4 rounded-xl bg-[var(--surface-elevated)] space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {med.name}
                        </p>
                        <p className="text-xs text-[var(--foreground-muted)]">
                          {med.frequency}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {med.refillDays <= 10 && (
                          <Badge className="bg-[#F59E0B]/10 text-[#F59E0B] text-xs px-2 py-1 rounded-lg">
                            Refill in {med.refillDays}d
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--foreground-muted)]">
                          Adherence
                        </span>
                        <span className="text-xs font-semibold text-[var(--foreground)]">
                          {med.adherence}%
                        </span>
                      </div>
                      <Progress
                        value={med.adherence}
                        className="h-2 bg-[var(--border)]"
                        indicatorClassName={
                          med.adherence >= 90 ? "bg-[#10B981]" : "bg-[#F59E0B]"
                        }
                      />
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card
              className="border-[var(--border)]"
              style={{ borderRadius: "var(--radius)" }}
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Star className="w-4 h-4 text-amber-500" />
                  </div>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Ask My Doctor",
                    icon: MessageSquare,
                    href: "/patient/chat",
                    gradient: "from-[#4A90E2] to-[#3CC2C2]",
                  },
                  {
                    label: "Book Appointment",
                    icon: Calendar,
                    href: "/patient/appointments",
                    gradient: "from-[#10B981] to-[#3CC2C2]",
                  },
                  {
                    label: "My Reports",
                    icon: FileText,
                    href: "/patient/reports",
                    gradient: "from-[#8B5CF6] to-[#4A90E2]",
                  },
                  {
                    label: "Upload Document",
                    icon: Upload,
                    href: "/patient/documents",
                    gradient: "from-[#F59E0B] to-[#EF4444]",
                  },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.label} href={action.href}>
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="group p-4 rounded-xl border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-300 cursor-pointer bg-[var(--surface)]"
                      >
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                          {action.label}
                        </span>
                      </motion.div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Reminders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card
              className="border-[var(--border)]"
              style={{ borderRadius: "var(--radius)" }}
            >
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-8 h-8 rounded-lg bg-[#4A90E2]/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-[#4A90E2]" />
                  </div>
                  Upcoming Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  {
                    text: "Take Metformin 500mg",
                    time: "8:00 AM · Today",
                    done: true,
                    priority: "low",
                  },
                  {
                    text: "Take Amlodipine 5mg",
                    time: "8:00 AM · Today",
                    done: true,
                    priority: "low",
                  },
                  {
                    text: "HbA1c blood test due",
                    time: "Feb 28, 2026",
                    done: false,
                    priority: "high",
                  },
                  {
                    text: "Follow-up with Dr. Sharma",
                    time: "Mar 5, 2026",
                    done: false,
                    priority: "medium",
                  },
                ].map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                      r.done
                        ? "opacity-60 bg-transparent"
                        : "bg-[var(--surface-elevated)] hover:bg-[var(--border)]"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        r.done
                          ? "bg-[#10B981]"
                          : r.priority === "high"
                            ? "bg-[#EF4444] animate-pulse"
                            : r.priority === "medium"
                              ? "bg-[#F59E0B]"
                              : "bg-[#4A90E2]"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          r.done
                            ? "line-through text-[var(--foreground-subtle)]"
                            : "text-[var(--foreground)] font-medium"
                        }`}
                      >
                        {r.text}
                      </p>
                      <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                        {r.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
