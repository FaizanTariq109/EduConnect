"use client";

import type React from "react";

import { useState } from "react";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ReviewDialogProps {
  onSubmit?: (rating: number, review: string) => void;
  trigger?: React.ReactNode;
  title?: string;
}

export function ReviewDialog({
  onSubmit,
  trigger = <Button>Write a Review</Button>,
  title = "Write a Review",
}: ReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(rating, review);
    }
    setOpen(false);
    setRating(0);
    setReview("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-8 w-8 cursor-pointer transition-all ${
                  star <= (hoveredRating || rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <Textarea
            placeholder="Write your review here..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="min-h-[120px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
