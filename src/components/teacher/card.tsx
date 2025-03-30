"use client";

import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TeacherType } from "@/models/teacher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { DatePickerDemo } from "@/components/datepicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComboboxDemo } from "@/components/combobox";
import {
  DrawerClose,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { useRef, useState } from "react";
import axios from "axios";
import { SessionType } from "@/models/sessions";
import { toast } from "sonner";
import { ProfileDialog } from "./profile_dialog";

//<SelectItem value="21:00">09:00 PM</SelectItem>
//<SelectItem value="16:00">04:00 PM</SelectItem>
//<SelectItem value="12:00">12:00 PM</SelectItem>

const subjects = [
  { label: "Math", value: "Math" },
  { label: "Chemistry", value: "Chemistry" },
  { label: "English", value: "English" },
  { label: "Urdu", value: "Urdu" },
];

let availableTimes = [
  { value: "21:00", label: "09:00 PM" },
  { value: "16:00", label: "04:00 PM" },
  { value: "12:00", label: "12:00 PM" },
];

export default function TeacherCard({
  teacher,
  stdID,
  setSessionsAction,
}: {
  teacher: TeacherType;
  stdID: string | undefined;
  setSessionsAction: React.Dispatch<React.SetStateAction<SessionType[]>>;
}) {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  const [availTimes, setAvailTimes] = useState(availableTimes);
  const [subject, setSubject] = useState<string>();
  const closeRef = useRef<HTMLButtonElement>(null);

  const handleSetDate = async (date: Date) => {
    try {
      const dateString = date?.toLocaleDateString("en-CA").split("T")[0];
      //console.log(dateString);
      const dateTimeString = `${dateString}T00:00:00.000Z`;
      const resp = await axios.get(
        `/api/sessions/date/available?date=${dateTimeString}`,
      );
      const times = resp.data.times;

      // Remove the times that are already booked
      const newTimes = availableTimes.filter(
        (time) => !times.includes(time.value),
      );
      //console.log(newTimes);
      if (newTimes.length === 0) {
        toast.error("No available times for this date");
        return;
      }
      setDate(date);
      setAvailTimes(newTimes);
    } catch (error: any) {
      console.error(error.message);
    }
  };

  // Let's try making a session
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check all fields are filled
    if (!date || !time || !subject) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      //console.log(date);
      const dateString = date?.toLocaleDateString("en-CA").split("T")[0];
      //console.log(dateString);
      const dateTimeString = `${dateString}T${time}:00.000Z`;
      //console.log(dateTimeString);
      //const dateTime = new Date(dateTimeString);
      //console.log(dateTime);
      const session: SessionType = {
        teacherId: teacher._id!,
        studentId: stdID!,
        dateTime: dateTimeString,
        // Will change
        duration: 90,
        // Will change
        status: "pending",
        // Will Change
        subject: subject,
      };
      const resp = await axios.post("/api/sessions/book", session);
      if (resp.status === 200) {
        toast.success("Session booked");
        closeRef.current?.click();
        //console.log("Session booked");
        setSessionsAction((prev) => [...prev, resp.data.session]);
      }
    } catch (error: any) {
      console.error(error.message);
    }
  };
  return (
    <Card key={teacher._id} className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src="/placeholder.svg" alt={teacher.name} />
            <AvatarFallback>
              {teacher.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold">{teacher.name}</h3>
            <div className="flex items-center text-muted-foreground text-sm">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span>
                {teacher.averageRating} • {teacher.yoe} years experience
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {teacher.bio}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {teacher.subjects.slice(0, 3).map((subject) => (
            <Badge key={subject} variant="outline">
              {subject}
            </Badge>
          ))}
          {teacher.subjects.length > 3 && (
            <Badge variant="outline">+{teacher.subjects.length - 3} more</Badge>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm font-medium">Rs. {teacher.hourlyRate}/hr</div>
          <div className="flex gap-2">
            <ProfileDialog teacher={teacher} />
            <Drawer>
              <DrawerTrigger asChild>
                <Button size="sm">Book Session</Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-sm">
                  <DrawerHeader>
                    <DrawerTitle>
                      Book a Session with {teacher.name}
                    </DrawerTitle>
                    <DrawerDescription>Choose your options</DrawerDescription>
                  </DrawerHeader>
                </div>
                <div className="mx-auto max-w-sm">
                  <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      {/* Date select  */}
                      {/* Time select  */}
                      <div className="flex flex-col sm:flex-row space-y-4">
                        <div className="space-y-2">
                          <Label> Date</Label>
                          <DatePickerDemo
                            date={date}
                            setDateAction={(value) => {
                              if (value instanceof Date) {
                                handleSetDate(value);
                              }
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label> Time</Label>
                          <Select onValueChange={setTime}>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Time" />
                            </SelectTrigger>
                            <SelectContent>
                              {availTimes.map((time) => (
                                <SelectItem key={time.value} value={time.value}>
                                  {time.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Subject select  */}
                      <div className="space-y-2">
                        <Label> Subject</Label>
                        <div className="flex justify-center">
                          <ComboboxDemo
                            frameworks={subjects}
                            value={subject}
                            setValueAction={setSubject}
                          />
                        </div>
                      </div>
                    </div>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <button ref={closeRef} className="hidden" />
                      </DrawerClose>
                      <Button size="sm" onClick={handleSubmit}>
                        Submit
                      </Button>
                      <DrawerClose>Cancel</DrawerClose>
                    </DrawerFooter>
                  </form>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
