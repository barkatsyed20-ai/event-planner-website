import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { createEventAction } from "@/app/lib/auth/actions/events";

export default function NewEventPage() {
  return (
    <div className="mx-auto w-full max-w-2xl py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Event</CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-6" action={createEventAction}>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="Team dinner..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Optional details about the event"
                className="min-h-28"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="Optional location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventDate">Date and time</Label>
              <Input id="eventDate" name="eventDate" type="datetime-local" />
              <p className="text-sm text-muted-foreground">
                Optional, you can set this later.
              </p>
            </div>

            <div className="flex items-center gap-3 border-t pt-6">
              <Button type="submit">Create Event</Button>

              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
