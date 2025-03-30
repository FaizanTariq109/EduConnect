"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  Clock,
  Briefcase,
  GraduationCap,
  Mail,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { TeacherType } from "@/models/teacher";
import { ReviewType } from "@/models/reviews";
import { ReviewCard } from "./review_component";

const mockReviews: ReviewType[] = [
  {
    _id: "r1",
    teacherId: "t123456",
    studentId: "s1",
    rating: 5,
    review:
      "Dr. Johnson is an exceptional teacher. She explains complex mathematical concepts in a way that's easy to understand. I've improved significantly in just a few sessions.",
  },
  {
    _id: "r2",
    teacherId: "t123456",
    studentId: "s2",
    rating: 4,
    review:
      "Very knowledgeable in statistics. Helped me prepare for my final exam and I got an A. Would definitely recommend for any math-related subjects.",
  },
  {
    _id: "r3",
    teacherId: "t123456",
    studentId: "s3",
    rating: 5,
    review:
      "Dr. Sarah is patient and thorough. She tailors her teaching style to match your learning pace. Her background in both math and computer science makes her perfect for helping with my data science coursework.",
  },
  {
    _id: "r4",
    teacherId: "t123456",
    studentId: "s4",
    rating: 4.5,
    review:
      "I was struggling with calculus until I started lessons with Dr. Johnson. She has a gift for making difficult concepts accessible. Highly recommend!",
  },
  {
    _id: "r5",
    teacherId: "t123456",
    studentId: "s5",
    rating: 5,
    review:
      "Excellent teacher! Dr. Johnson helped me prepare for my college entrance exams and I got into my first-choice school. She knows how to motivate students and build confidence.",
  },
];

export function ProfileDialog({ teacher }: { teacher: TeacherType }) {
  const [isOpen, setIsOpen] = useState(false);
  //const teacher = mockTeacher;

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
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? "text-yellow-400 fill-yellow-400"
                : i < rating
                  ? "text-yellow-400 fill-yellow-400 opacity-50"
                  : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const renderAvailabilityBadge = (type: "online" | "in-person" | "both") => {
    const colors = {
      online:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      "in-person":
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      both: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
    };

    const icons = {
      online: <MapPin className="mr-1 h-3 w-3" />,
      "in-person": <MapPin className="mr-1 h-3 w-3" />,
      both: <MapPin className="mr-1 h-3 w-3" />,
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type]}`}
      >
        {icons[type]}
        {type === "online"
          ? "Online"
          : type === "in-person"
            ? "In-person"
            : "Both"}
      </span>
    );
  };
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useRef;
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] overflow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold">
              Teacher Profile
            </DialogTitle>
          </DialogHeader>

          <div className="mt-6 flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage alt={teacher.name} />
              <AvatarFallback className="text-lg">
                {getInitials(teacher.name)}
              </AvatarFallback>
            </Avatar>

            <h2 className="text-xl font-bold">{teacher.name}</h2>

            <div className="mt-2">{renderStars(teacher.averageRating)}</div>

            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {teacher.availability.map((type) => (
                <div key={type} className="mx-1">
                  {renderAvailabilityBadge(type)}
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <Briefcase className="mr-2 h-4 w-4" />
                Experience
              </h3>
              <p className="mt-1">{teacher.yoe} years</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Hourly Rate
              </h3>
              <p className="mt-1">{teacher.hourlyRate} RS/hour</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <GraduationCap className="mr-2 h-4 w-4" />
                Qualifications
              </h3>
              <div className="mt-1 flex flex-wrap gap-2">
                {teacher.qualifications.map((qual) => (
                  <Badge key={qual} variant="outline" className="font-normal">
                    {qual}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Subjects
              </h3>
              <div className="mt-1 flex flex-wrap gap-2">
                {teacher.subjects.map((subject) => (
                  <Badge
                    key={subject}
                    variant="secondary"
                    className="font-normal"
                  >
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Bio</h3>
              <p className="mt-1 text-sm">{teacher.bio}</p>
            </div>
          </div>

          <Dialog>
            <DialogTrigger>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Student Reviews
              </h3>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reviews</DialogTitle>
              </DialogHeader>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm"
                  onClick={scrollLeft}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* This div is the horizontally scrollable container for reviews */}
                <div
                  ref={scrollContainerRef}
                  className="flex overflow-x-auto w-[300px] sm:w-[500px] gap-3 py-2 px-4 -mx-4 scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {mockReviews.map((review) => (
                    <motion.div
                      key={review._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ReviewCard review={review} />
                    </motion.div>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm"
                  onClick={scrollRight}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <div className="mt-6 flex justify-end">
            <Button
              variant="outline"
              className="mr-2"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
