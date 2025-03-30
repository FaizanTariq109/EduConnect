import TeacherReviewDeck from "@/components/admin/teacher-review-deck";
import { AdminHeader } from "@/components/admin/admin-header";

export default function TeacherReviewPage() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-8">
            Review Teacher Applications
          </h1>
          <TeacherReviewDeck />
        </div>
      </main>
    </div>
  );
}
