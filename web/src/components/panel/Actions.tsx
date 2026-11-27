"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSubmit } from "./useSubmit";

export function RevokeButton({ id }: { id: number }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const { pending, error, submit } = useSubmit<{ txHash: string }>();

  if (!confirming) {
    return (
      <button className="link-button" type="button" onClick={() => setConfirming(true)}>
        Revocar
      </button>
    );
  }

  return (
    <span className="inline-confirm">
      <button
        className="link-button danger"
        type="button"
        disabled={pending}
        onClick={async () => {
          if (await submit(`/api/pieces/${id}/revoke`, new FormData())) router.refresh();
        }}
      >
        {pending ? "Firmando…" : "Confirmar revocación"}
      </button>
      {!pending ? (
        <button className="link-button" type="button" onClick={() => setConfirming(false)}>
          Cancelar
        </button>
      ) : null}
      {error ? <span className="danger">{error}</span> : null}
    </span>
  );
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      className="btn btn-ghost"
      type="button"
      onClick={async () => {
        await fetch("/api/session", { method: "DELETE" });
        router.refresh();
      }}
    >
      Salir
    </button>
  );
}

export function PrintButton() {
  return (
    <button className="btn" type="button" onClick={() => window.print()}>
      Imprimir
    </button>
  );
}
