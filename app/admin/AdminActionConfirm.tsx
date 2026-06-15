"use client";

import { useEffect } from "react";

export default function AdminActionConfirm() {
  useEffect(() => {
    function confirmAdminAction(event: SubmitEvent) {
      const form = event.target;

      if (!(form instanceof HTMLFormElement) || !form.closest(".admin-dashboard, .admin-setup-page")) {
        return;
      }

      const submitter = event.submitter;
      const customMessage = submitter instanceof HTMLElement
        ? submitter.dataset.confirmMessage
        : undefined;

      if (customMessage && !window.confirm(customMessage)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }

    document.addEventListener("submit", confirmAdminAction, true);
    return () => document.removeEventListener("submit", confirmAdminAction, true);
  }, []);

  return null;
}
