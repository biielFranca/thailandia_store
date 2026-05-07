"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect to login page with cadastro tab active
export default function CadastroPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/login?modo=cadastro"); }, [router]);
  return null;
}
