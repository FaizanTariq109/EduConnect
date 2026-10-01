export interface StudentType {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  subjects: string[];
  educationLevel: "school" | "undergraduate" | "postgraduate";
  institution: string;
}
