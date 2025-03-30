"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="flex flex-col items-center justify-center border-4 p-6 rounded-4xl">
        <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
        <p className="text-gray-600 mb-6 text-center">
          Have questions or feedback? Fill out the form below and we'll get back
          to you as soon as possible.
        </p>
        <form className="w-full max-w-md space-y-4 ">
          <Input type="text" placeholder="Your Name" className="w-full" />
          <Input type="email" placeholder="Your Email" className="w-full" />
          <Textarea placeholder="Your Message" className="w-full" rows={4} />
          <div className="flex justify-center">
            <Button type="submit">Send Message</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
