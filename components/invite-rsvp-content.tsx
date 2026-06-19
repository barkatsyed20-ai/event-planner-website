import { prisma } from "@/app/lib/auth/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { submitOrUpdateRsvpAction } from "@/app/lib/auth/actions/events";

export async function InviteRsvpContent({
  token,
  submitted,
}: {
  token: string;
  submitted: boolean;
}) {
  const row = await prisma.eventInvite.findUnique({
    where: { token },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          eventDate: true,
        },
      },
    },
  });

  if (!row || !row.event) {
    notFound();
  }

  const { event } = row;
  const submitRsvpForToken = submitOrUpdateRsvpAction.bind(null, token);

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{event.title}</CardTitle>
        </CardHeader>

        <CardContent>
          {submitted ? (
            <p className="mb-4 rounded-md border border-[var(--accent)]/50 bg-[var(--accent)]/15 p-3 text-sm">
              Thanks. Your RSVP has been recorded (or updated).
            </p>
          ) : null}

          <form action={submitRsvpForToken} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required placeholder="Your name" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">Attendance</Label>
              <select
                id="status"
                name="status"
                required
                defaultValue="going"
                className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3"
              >
                <option value="going">Going</option>
                <option value="maybe">Maybe</option>
                <option value="not_going">Not going</option>
              </select>
            </div>

            <Button type="submit">Submit RSVP</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
