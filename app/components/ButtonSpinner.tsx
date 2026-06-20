"use client";

import { useEffect } from "react";

const QUICK_ACTION_LOADING_MS = 450;
const DISABLED_BUTTON_CHECK_MS = 250;

function setButtonLoading(button: HTMLButtonElement, loading: boolean) {
  if (loading) {
    button.dataset.buttonLoading = "true";
    button.setAttribute("aria-busy", "true");
    return;
  }

  delete button.dataset.buttonLoading;
  button.removeAttribute("aria-busy");
}

function clearWhenReady(button: HTMLButtonElement) {
  if (!button.isConnected || !button.disabled) {
    setButtonLoading(button, false);
    return;
  }

  window.setTimeout(() => clearWhenReady(button), DISABLED_BUTTON_CHECK_MS);
}

export default function ButtonSpinner() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const button = event.target instanceof Element
        ? event.target.closest("button")
        : null;

      if (!(button instanceof HTMLButtonElement) || button.disabled || button.type === "submit") {
        return;
      }

      setButtonLoading(button, true);

      window.setTimeout(() => {
        clearWhenReady(button);
      }, QUICK_ACTION_LOADING_MS);
    }

    function handleSubmit(event: SubmitEvent) {
      const button = event.submitter;

      if (!(button instanceof HTMLButtonElement)) {
        return;
      }

      window.setTimeout(() => {
        if (!event.defaultPrevented) {
          setButtonLoading(button, true);
        }
      });
    }

    document.addEventListener("click", handleClick);
    document.addEventListener("submit", handleSubmit);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("submit", handleSubmit);
    };
  }, []);

  return null;
}
