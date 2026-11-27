"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { useSubmit } from "./useSubmit";

export function RevokeButton({ id }: { id: number }) {
  const router = useRouter();
  const { t } = useI18n();
  const [confirming, setConfirming] = useState(false);
  const { pending, error, submit } = useSubmit<{ txHash: string }>();

  if (!confirming) {
    return (
      <button className="link-button danger" type="button" onClick={() => setConfirming(true)}>
        {t.panel.revoke}
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
        {pending ? t.panel.signing : t.panel.confirmRevoke}
      </button>
      {!pending ? (
        <button className="link-button" type="button" onClick={() => setConfirming(false)}>
          {t.panel.cancel}
        </button>
      ) : null}
      {error ? <span className="danger">{error}</span> : null}
    </span>
  );
}

export function LogoutButton() {
  const router = useRouter();
  const { t } = useI18n();
  return (
    <button
      className="btn btn-secondary"
      type="button"
      onClick={async () => {
        await fetch("/api/session", { method: "DELETE" });
        router.refresh();
      }}
    >
      {t.panel.logout}
    </button>
  );
}

export function PrintButton() {
  const { t } = useI18n();
  return (
    <button className="btn" type="button" onClick={() => window.print()}>
      {t.label.print}
    </button>
  );
}
