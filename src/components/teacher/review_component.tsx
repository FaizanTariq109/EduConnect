import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReviewType } from "@/models/reviews";

export function ReviewCard({ review }: { review: ReviewType }) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("");
  };

  const renderStars = (rating = 0) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < Math.floor(rating)
                ? "text-yellow-400 fill-yellow-400"
                : i < rating
                  ? "text-yellow-400 fill-yellow-400 opacity-50"
                  : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const name: string =
    typeof review.studentId === "object" ? review.studentId.name : "";

  return (
    <Card className="max-w-[280px] border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder&width=500" alt={name} />
            <AvatarFallback className="text-xs">
              {name ? getInitials(name) : "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <p className="font-medium text-sm">{name}</p>
              <span className="text-xs text-muted-foreground"></span>
            </div>
            <div className="mt-1">{renderStars(review.rating)}</div>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground line-clamp-4">
          {review.review}
        </p>
      </CardContent>
    </Card>
  );
}
