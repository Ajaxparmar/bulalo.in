export default function ConfirmSubmitButton({
  children,
  message,
  className = "admin-delete-button",
  form,
}: {
  children: React.ReactNode;
  message: string;
  className?: string;
  form?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      data-confirm-message={message}
      form={form}
    >
      {children}
    </button>
  );
}
