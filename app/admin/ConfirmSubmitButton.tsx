export default function ConfirmSubmitButton({
  children,
  message,
  className = "admin-delete-button",
}: {
  children: React.ReactNode;
  message: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      data-confirm-message={message}
    >
      {children}
    </button>
  );
}
