import { auth } from "@/app/lib/auth/server";

export const { GET, POST, PUT, PATCH, DELETE } = auth.handler();