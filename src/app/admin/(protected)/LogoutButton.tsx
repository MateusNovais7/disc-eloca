"use client";

export default function LogoutButton() {
  return (
    <button
      className="text-xs text-white/50 hover:text-white"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        window.location.href = "/admin/login";
      }}
    >
      Sair
    </button>
  );
}
