"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/(admin)/logout-action";

export function LogoutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        void logoutAction();
      }}
    >
      <LogOut className="h-4 w-4" />
      Cerrar sesión
    </Button>
  );
}
