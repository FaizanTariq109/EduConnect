export type Role = "student" | "teacher" | "admin";
export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  demo: boolean;
};
export type Tutor = {
  _id: string;
  name: string;
  qualifications: string[];
  bio: string;
  yoe: number;
  subjects: string[];
  hourlyRate: number;
  averageRating: number;
  reviewCount: number;
  availability: string[];
  status: "pending" | "approved" | "rejected";
  verificationComment?: string;
};
export type SessionItem = {
  _id: string;
  teacherId: { _id: string; name: string };
  studentId: { _id: string; name: string };
  dateTime: string;
  duration: number;
  mode: string;
  subject: string;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  price: number;
  reviewed: boolean;
};
export type ReviewItem = {
  _id: string;
  studentId: { name: string };
  rating: number;
  review: string;
  createdAt: string;
};
