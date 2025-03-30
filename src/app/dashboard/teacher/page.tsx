"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, DollarSign, Users } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { SessionType } from "@/models/sessions";
import { ProfileEdit } from "@/components/teacher/profile_edit_dialog";
import { TeacherType } from "@/models/teacher";

export default function TeacherDashboard() {
  // Get all the sessions
  // Retrieve all sessions
  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [teacher, setTeacher] = useState<TeacherType>();

  useEffect(() => {
    const fetchSessions = async () => {
      const resp = await axios.get("/api/sessions/getAll");
      const sessions: SessionType[] = resp.data.sessions;
      setSessions(sessions);
      // Filter out the pending sessions
      const resp2 = await axios.get("/api/me");
      const teacher: TeacherType = resp2.data.profile;
      setTeacher(teacher);
    };
    fetchSessions();
  }, []);

  const handleState = async (sessionID: string, state: string) => {
    const resp = await axios.post(`/api/sessions/${state}`, { sessionID });
    let newState = state;
    if (newState === "cancel") newState = "cancelled";
    else newState += "ed";
    console.log(newState);
    if (resp.status === 200) {
      const updatedSession: SessionType[] = sessions.map((session) => {
        if (session._id === sessionID) {
          return {
            ...session,
            status: newState as "accepted" | "rejected" | "cancelled",
          };
        }
        return session;
      });

      setSessions(updatedSession);
    } else {
      console.log("Failed to accept the session");
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(date);
  };

  // Format time
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      timeZone: "UTC",
    }).format(date);
  };

  return (
    <div className="mx-auto container py-10">
      <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Students
                </p>
                <h3 className="text-2xl font-bold">24</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Upcoming Sessions
                </p>
                <h3 className="text-2xl font-bold">8</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Hours Taught
                </p>
                <h3 className="text-2xl font-bold">156</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Earnings
                </p>
                <h3 className="text-2xl font-bold">Rs. 45,600</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>
                View and manage your scheduled tutoring sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => {
                  if (session.status !== "accepted") return null;
                  return (
                    <div key={session._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{session.subject}</h3>
                          <p className="text-sm text-muted-foreground">
                            Student:{" "}
                            {typeof session.studentId === "object" &&
                              session.studentId.name}
                          </p>
                          <div className="flex flex-col sm:flex-row mt-2 text-sm">
                            <div className="flex sm:mr-4">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>
                                {formatDate(new Date(session.dateTime))}
                              </span>
                            </div>
                            <div className="flex">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>
                                {formatTime(new Date(session.dateTime))}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button variant="outline" size="sm">
                            Reschedule
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleState(session._id!, "cancel")}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Requests</CardTitle>
              <CardDescription>
                Review and respond to session requests from students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => {
                  if (session.status !== "pending") return null;
                  return (
                    <div key={session._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{session.subject}</h3>
                          <p className="text-sm text-muted-foreground">
                            Student:{" "}
                            {typeof session.studentId === "object" &&
                              session.studentId.name}
                          </p>
                          <div className="flex flex-col sm:flex-row mt-2 text-sm">
                            <div className="flex sm:mr-4">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>
                                {formatDate(new Date(session.dateTime))}
                              </span>
                            </div>
                            <div className="flex">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>
                                {formatTime(new Date(session.dateTime))}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          {/* The submit button accepts the given session */}
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleState(session._id!, "accept")}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleState(session._id!, "reject")}
                          >
                            Rejected
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Overview</CardTitle>
              <CardDescription>
                Track your earnings and payment status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* This would be earnings data in a real app */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          This Month
                        </p>
                        <h3 className="text-2xl font-bold">Rs. 12,800</h3>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Last Month
                        </p>
                        <h3 className="text-2xl font-bold">Rs. 15,200</h3>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Pending Payments
                        </p>
                        <h3 className="text-2xl font-bold">Rs. 3,600</h3>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <ProfileEdit teacher={teacher} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
