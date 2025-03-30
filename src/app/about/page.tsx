"use client";
import React from "react";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4">
      <div className="max-w-4xl w-full shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-4">
          About eduConnect
        </h1>
        <p className="text-gray-200 leading-relaxed mb-6">
          Welcome to{" "}
          <span className="font-semibold text-blue-600">eduConnect</span>, your
          trusted platform for connecting students with experienced tutors. Our
          mission is to make personalized learning accessible and effective for
          everyone.
        </p>
        <p className="text-gray-200 leading-relaxed mb-6">
          Whether you're a student looking to excel in your studies or a tutor
          eager to share your knowledge, eduConnect provides a seamless and
          secure environment to foster meaningful learning experiences.
        </p>
        <p className="text-gray-200 leading-relaxed">
          Join us today and be part of a growing community dedicated to
          education and growth. Together, we can make learning more impactful
          and enjoyable.
        </p>
      </div>
    </div>
  );
}
