import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";
import Link from "next/link";
import ZaevoLogo from "@/components/ui/ZaevoLogo";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-[16px] bg-[var(--bg)]">
      <div className="mb-[16px] flex items-center gap-[8px]">
        <ZaevoLogo size={20} />
        <Link
          href="/home"
          className="text-[13px] font-bold tracking-[0.08em] hover:underline"
          style={{ color: "var(--red)" }}
        >
          zaevo
        </Link>
        <span style={{ color: "var(--border2)" }}>│</span>
        <span className="text-[11px]" style={{ color: "var(--text3)" }}>
          sudo pam_register
        </span>
      </div>
      <Suspense>
        <SignUp />
      </Suspense>
    </div>
  );
}
