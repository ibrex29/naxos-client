'use client';

import RoleSelector from "@/components/role-selector";
import { UserRole } from "@/types";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleRoleSelect = (role: UserRole) => {
    router.push(`/dashboard/${role}`);
  };

  return <RoleSelector onRoleSelect={handleRoleSelect} />;
}