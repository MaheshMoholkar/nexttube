import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center">
      <Link
        href="/"
        className={buttonVariants({
          variant: "outline",
          className: "absolute top-4 left-4",
        })}
      >
        <ArrowLeft className="size-4" /> Back
      </Link>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 self-center font-medium"
        >
          <Image src="/nexttube.svg" alt="logo" className="size-9" />
          <span className="text-2xl font-bold">IGNITE+ LMS</span>
        </Link>
        <div className="flex w-full max-w-sm flex-col gap-6">{children}</div>
        <div className="text-sm text-balance text-center text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <span className="hover:text-primary underline cursor-pointer">
            Terms of service
          </span>{" "}
          and{" "}
          <span className="hover:text-primary underline cursor-pointer">
            Privacy Policy
          </span>
        </div>
      </div>
    </div>
  );
}
