export interface TeacherType {
  _id?: string;
  name: string;
  email?: string;
  password?: string;
  qualifications: string[];
  bio: string;
  yoe: number;
  subjects: string[];
  hourlyRate: number;
  averageRating?: number;
  availability: ("online" | "in-person" | "both")[];
  status: "approved" | "pending" | "rejected";
}
