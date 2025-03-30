"use client";

import { useState, useRef, useEffect } from "react";
import {
  motion,
  type PanInfo,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockTeacherApplications } from "@/lib/mock-data";
import { TeacherType } from "@/models/teacher";
import axios from "axios";
import { toast } from "sonner";

export default function TeacherReviewDeck() {
  const [teachers, setTeachers] = useState<TeacherType[]>(
    mockTeacherApplications,
  );
  useEffect(() => {
    try {
      const fetchTeachers = async () => {
        const tch: TeacherType[] = (await axios.get("/api/teachers/getAll"))
          .data.profiles;
        setTeachers(tch);
      };
      fetchTeachers();
    } catch (error) {}
  }, []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<
    Record<string, "accepted" | "rejected">
  >({});

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const cardOpacity = useTransform(
    x,
    [-200, -150, 0, 150, 200],
    [0, 1, 1, 1, 0],
  );

  const acceptOpacity = useTransform(x, [0, 100, 200], [0, 0.5, 1]);
  const rejectOpacity = useTransform(x, [-200, -100, 0], [1, 0.5, 0]);

  const constraintsRef = useRef(null);

  const currentTeacher: TeacherType = teachers[currentIndex];
  const isFinished = currentIndex >= teachers.length;

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (info.offset.x > 100) {
      handleAccept();
    } else if (info.offset.x < -100) {
      handleReject();
    }
  };
  const changeStatus = async (id: string, status: string) => {
    try {
      const resp = await axios.post(
        "/api/admin/teacher/status",
        { id, status },
        {
          validateStatus: (status) => status < 500,
        },
      );
      if (resp.status !== 200) {
        toast.error(resp.data.message);
        return;
      }
      toast.success("Teacher status updated successfully");
    } catch (error) {
      toast.error("Failed to update teacher status");
    }
  };
  const handleAccept = () => {
    if (isFinished) return;

    setDirection("right");
    setDecisions({
      ...decisions,
      [currentTeacher._id as string]: "accepted",
    });
    // This teacher is accepted
    changeStatus(currentTeacher._id as string, "approved");
    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      setDirection(null);
      x.set(0);
    }, 300);
  };

  const handleReject = () => {
    if (isFinished) return;
    changeStatus(currentTeacher._id as string, "rejected");
    setDirection("left");
    setDecisions({
      ...decisions,
      [currentTeacher._id as string]: "rejected",
    });

    setTimeout(() => {
      setCurrentIndex(currentIndex + 1);
      setDirection(null);
      x.set(0);
    }, 300);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);

      // Remove the decision for the previous card
      const newDecisions = { ...decisions };
      if (teachers[currentIndex - 1]) {
        delete newDecisions[teachers[currentIndex - 1]._id as string];
      }
      setDecisions(newDecisions);
    }
  };

  if (isFinished) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4">All Done!</h2>
          <p className="mb-6">You've reviewed all teacher applications.</p>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Summary:</h3>
            <p className="text-sm">
              Accepted:{" "}
              {Object.values(decisions).filter((d) => d === "accepted").length}{" "}
              teachers
            </p>
            <p className="text-sm">
              Rejected:{" "}
              {Object.values(decisions).filter((d) => d === "rejected").length}{" "}
              teachers
            </p>
          </div>

          <Button
            onClick={() => {
              setCurrentIndex(0);
              setDecisions({});
            }}
          >
            Review Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative" ref={constraintsRef}>
      {/* Accept/Reject Overlays */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-4 z-10">
        <motion.div
          className="bg-red-500/80 rounded-full p-4"
          style={{ opacity: rejectOpacity }}
        >
          <X className="h-8 w-8 text-white" />
        </motion.div>

        <motion.div
          className="bg-green-500/80 rounded-full p-4"
          style={{ opacity: acceptOpacity }}
        >
          <Check className="h-8 w-8 text-white" />
        </motion.div>
      </div>

      {/* Teacher Card */}
      <motion.div
        drag="x"
        dragConstraints={constraintsRef}
        onDragEnd={handleDragEnd}
        animate={
          direction === "left"
            ? { x: -300, opacity: 0 }
            : direction === "right"
              ? { x: 300, opacity: 0 }
              : { x: 0 }
        }
        style={{ x, rotate, opacity: cardOpacity }}
        className="cursor-grab active:cursor-grabbing"
      >
        <Card className="w-full overflow-hidden">
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap className="h-24 w-24 text-white/20" />
            </div>
          </div>

          <CardContent className="p-6 relative">
            <div className="absolute -top-16 left-6 border-4 border-white rounded-full bg-white">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src="/placeholder.svg?height=200&width=200"
                  alt={currentTeacher.name}
                />
                <AvatarFallback>
                  {currentTeacher.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-bold">{currentTeacher.name}</h2>
              <p className="text-muted-foreground">
                {/* This will have the hourly rate */}
                {currentTeacher.hourlyRate} RS
              </p>

              <div className="flex flex-wrap gap-2 mt-2">
                {currentTeacher.subjects.map((spec, i) => (
                  <Badge key={i} variant="secondary">
                    {spec}
                  </Badge>
                ))}
              </div>

              <div className="grid gap-3 mt-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {currentTeacher.qualifications.join(" ")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {currentTeacher.yoe} years experience
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{currentTeacher.email}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm italic">"{currentTeacher.bio}"</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Controls */}
      <div className="flex justify-center mt-6">
        <div className="flex gap-2">
          <Button variant="destructive" size="icon" onClick={handleReject}>
            <X className="h-5 w-5" />
          </Button>

          <Button
            variant="default"
            size="icon"
            onClick={handleAccept}
            className="bg-green-500 hover:bg-green-600"
          >
            <Check className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4 flex flex-col space-y-4 justify-center items-center">
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} of {teachers.length}
        </span>

        <div className="flex gap-1">
          {teachers.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full ${
                i < currentIndex
                  ? decisions[teachers[i]._id as string] === "accepted"
                    ? "bg-green-500"
                    : "bg-red-500"
                  : i === currentIndex
                    ? "bg-primary"
                    : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
