"use server";

import { randomUUID } from "crypto";
import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { getSession } from "../server";
import { RsvpStatus } from "@/app/generated/prisma/enums";

function parseCreateEvent(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();

  if (title.length < 3 || title.length > 120) {
    throw new Error("Title must be between 3 and 120 characters.");
  }

  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const eventDate = String(formData.get("eventDate") ?? "").trim();

  return {
    title,
    description: description.length ? description.slice(0, 2000) : null,
    location: location.length ? location.slice(0, 200) : null,
    eventDate: eventDate.length ? eventDate : null,
  };
}

const RSVP_STATUSES = ["going", "maybe", "not_going"] as const;

function isRsvpStatus(s: string): s is RsvpStatus {
  return (RSVP_STATUSES as readonly string[]).includes(s);
}

function parseRsvp(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();

  if (name.length < 2 || name.length > 120) {
    throw new Error("Name must be between 2 and 120 characters.");
  }

  const email = String(formData.get("email") ?? "").trim();

  if (email.length < 3 || email.length > 320 || !email.includes("@")) {
    throw new Error("Please enter a valid email.");
  }

  const status = String(formData.get("status") ?? "").trim();

  if (!isRsvpStatus(status)) {
    throw new Error("Invalid RSVP status.");
  }

  return { name, email, status };
}

export async function createEventAction(formData: FormData) {
  const session = await getSession();

  if (!session?.data?.user?.id) {
    throw new Error("Not authenticated");
  }

  const userId = session.data.user.id;
  const input = parseCreateEvent(formData);
  const token = randomUUID().replace(/-/g, "");

  await prisma.$transaction(async (tx) => {
    const event = await tx.event.create({
      data: {
        title: input.title,
        description: input.description,
        location: input.location,
        eventDate: input.eventDate ? new Date(input.eventDate) : null,
        ownerUserId: userId,
      },
    });

    await tx.eventInvite.create({
      data: {
        eventId: event.id,
        token,
      },
    });
  });

  redirect("/dashboard");
}

export async function submitOrUpdateRsvpAction(
  token: string,
  formData: FormData,
) {
  const input = parseRsvp(formData);

  const invite = await prisma.eventInvite.findFirst({
    where: { token },
    select: {
      id: true,
      event: {
        select: { id: true },
      },
    },
  });

  if (!invite) {
    throw new Error("Invite link is invalid.");
  }

  const eventId = invite.event.id;
  const emailNormalized = input.email.toLowerCase();

  await prisma.eventRsvp.upsert({
    where: {
      eventId_emailNormalized: {
        eventId,
        emailNormalized,
      },
    },
    create: {
      eventId,
      inviteId: invite.id,
      name: input.name,
      email: input.email,
      emailNormalized,
      status: input.status as RsvpStatus,
    },
    update: {
      name: input.name,
      status: input.status as RsvpStatus,
      respondedAt: new Date(),
    },
  });

  redirect(`/invite/${token}?submitted=1`);
}

export async function createInviteLinkAction(eventId: string): Promise<void> {
  const session = await getSession();

  if (!session?.data?.user?.id) {
    throw new Error("Not authenticated");
  }

  const token = randomBytes(32).toString("hex");

  await prisma.eventInvite.upsert({
    where: { eventId },
    update: { token },
    create: { eventId, token },
  });

  revalidatePath(`/events/${eventId}`);
}