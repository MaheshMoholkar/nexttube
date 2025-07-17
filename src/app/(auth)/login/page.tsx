"use server";

import { redirect } from "next/navigation";
import LoginForm from "../../../modules/auth/ui/components/login-form";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

async function Login() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    redirect("/");
  }
  return <LoginForm />;
}

export default Login;
