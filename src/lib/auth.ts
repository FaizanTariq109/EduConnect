import { toast } from "sonner"

type User = {
  id: string
  name: string
  email: string
  role: "student" | "teacher" | "admin"
}

// Mock user data for demonstration
const mockUsers = [
  {
    id: "1",
    name: "Student User",
    email: "student@example.com",
    password: "password123",
    role: "student" as const,
  },
  {
    id: "2",
    name: "Teacher User",
    email: "teacher@example.com",
    password: "password123",
    role: "teacher" as const,
  },
  {
    id: "3",
    name: "Admin User",
    email: "admin@example.com",
    password: "password123",
    role: "admin" as const,
  },
]

// Mock function to simulate user login
export async function login(email: string, password: string): Promise<User | null> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const user = mockUsers.find((u) => u.email === email && u.password === password)

  if (!user) {
    toast.error("Login failed. Invalid email or password.")
    return null
  }

  // In a real app, you would set cookies or use a token-based approach
  const { password: _, ...userWithoutPassword } = user

  return userWithoutPassword
}

// Mock function to simulate user registration
export async function register(userData: any): Promise<User | null> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Check if user already exists
  if (mockUsers.some((u) => u.email === userData.email)) {
    toast.error("Registration failed. Email already in use.")
    return null
  }

  // In a real app, you would hash the password and store in a database
  const newUser = {
    id: String(mockUsers.length + 1),
    name: userData.name,
    email: userData.email,
    password: userData.password,
    role: userData.role,
  }

  // Add to mock users (in a real app, this would be a database operation)
  mockUsers.push(newUser)

  const { password: _, ...userWithoutPassword } = newUser

  return userWithoutPassword
}

// Mock function to get the current user
export async function getCurrentUser(): Promise<User | null> {
  // In a real app, you would check the session or token
  return null
}

// Mock function to logout
export async function logout(): Promise<void> {
  // In a real app, you would clear cookies or tokens
  await new Promise((resolve) => setTimeout(resolve, 500))
}

