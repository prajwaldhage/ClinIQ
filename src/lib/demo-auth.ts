import type { UserRole } from "./types";

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  department?: string;
}

export const DEMO_USERS: Array<DemoUser & { password: string }> = [
  {
    id: "44444444-4444-4444-4444-444444444444",
    email: "demo.doctor@cliniq.app",
    password: "demo123456",
    name: "Dr. Arjun Sharma",
    role: "doctor",
    department: "Internal Medicine",
  },
  {
    id: "11111111-1111-1111-1111-111111111111",
    email: "demo.patient@cliniq.app",
    password: "demo123456",
    name: "Priya Sharma",
    role: "patient",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    email: "demo.reception@cliniq.app",
    password: "demo123456",
    name: "Kavita (Receptionist)",
    role: "receptionist",
    department: "Front Desk",
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    email: "demo.admin@cliniq.app",
    password: "demo123456",
    name: "Admin User",
    role: "admin",
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    email: "demo.nurse@cliniq.app",
    password: "demo123456",
    name: "Nurse Kavita",
    role: "nurse",
    department: "General Ward",
  },
  {
    id: "77777777-7777-7777-7777-777777777777",
    email: "demo.research@cliniq.app",
    password: "demo123456",
    name: "Dr. Meera Nair",
    role: "research",
    department: "Clinical Research",
  },
];

export const SESSION_COOKIE = "cliniq_session";

export function findUser(email: string, password: string): DemoUser | null {
  const found = DEMO_USERS.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() &&
      u.password === password
  );
  if (!found) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _pw, ...user } = found;
  return user;
}

export function encodeSession(user: DemoUser): string {
  return Buffer.from(JSON.stringify(user)).toString("base64");
}

export function decodeSession(value: string): DemoUser | null {
  try {
    return JSON.parse(
      Buffer.from(value, "base64").toString("utf8")
    ) as DemoUser;
  } catch {
    return null;
  }
}