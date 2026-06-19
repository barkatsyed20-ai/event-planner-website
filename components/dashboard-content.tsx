import { prisma } from "@/app/lib/auth/prisma";
import Link from "next/link";
import type { RsvpStatus } from "@/app/generated/prisma/enums";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function countByStatus(rsvps: { status: RsvpStatus }[]) {
  let going = 0;
  let maybe = 0;
  let notGoing = 0;

  for (const r of rsvps) {
    if (r.status === "going") going += 1;
    else if (r.status === "maybe") maybe += 1;
    else if (r.status === "not_going") notGoing += 1;
  }

  return { going, maybe, notGoing };
}

type StatusCounts = { going: number; maybe: number; notGoing: number };

export async function DashboardContent({ userId }: { userId: string }) {
  const rows = await prisma.event.findMany({
    where: { ownerUserId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      eventDate: true,
      location: true,
    },
  });

  const eventIds = rows.map((e) => e.id);

  const grouped = eventIds.length
    ? await prisma.eventRsvp.groupBy({
        by: ["eventId", "status"],
        where: { eventId: { in: eventIds } },
        _count: { _all: true },
      })
    : [];

  const countsByEvent = new Map<string, StatusCounts>();
  for (const id of eventIds) {
    countsByEvent.set(id, { going: 0, maybe: 0, notGoing: 0 });
  }
  for (const g of grouped) {
    const counts = countsByEvent.get(g.eventId);
    if (!counts) continue;
    if (g.status === "going") counts.going = g._count._all;
    else if (g.status === "maybe") counts.maybe = g._count._all;
    else if (g.status === "not_going") counts.notGoing = g._count._all;
  }

  const events = rows.map((e) => ({
    id: e.id,
    title: e.title,
    eventDate: e.eventDate,
    location: e.location,
    counts: countsByEvent.get(e.id) ?? { going: 0, maybe: 0, notGoing: 0 },
  }));

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your Events</h1>

          <p className="text-sm text-[var(--muted-foreground)]">
            Track attendee responses and manage invite links.
          </p>
        </div>

        <Button asChild>
          <Link href="/events/new">Create Event</Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No events yet</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)]">
              Create your first event to start collecting RSVPs.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{event.title}</CardTitle>

                  <Button size="sm" asChild>
                    <Link href={`/events/${event.id}`}>Open</Link>
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge>{event.counts.going} Going</Badge>

                  <Badge variant="secondary">{event.counts.maybe} Maybe</Badge>

                  <Badge variant="outline">
                    {event.counts.notGoing} Not Going
                  </Badge>
                </div>

                <p className="text-sm text-[var(--muted-foreground)]">
                  {event.eventDate
                    ? dateFormatter.format(event.eventDate)
                    : "No date selected"}

                  {event.location ? ` • ${event.location}` : ""}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}