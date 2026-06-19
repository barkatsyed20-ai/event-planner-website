import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/auth/server";
import { EventDetailContent } from "@/components/event-detail-content";

export const dynamic = "force-dynamic";

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const session = await getSession();

  if (!session.data) {
    redirect("/auth/sign-in");
  }

  return (
    <EventDetailContent userId={session.data.user.id} eventId={eventId} />
  );
}