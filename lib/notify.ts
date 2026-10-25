import { toast } from "react-toastify";


// to show errors as toast and jumo into error field
const ID = "form-errors";

export function reportErrors(errors: Record<string, string | undefined>) {
  const messages = Object.values(errors).filter((m): m is string => Boolean(m));
  if (messages.length === 0) return;

  const text =
    messages.length === 1
      ? messages[0]
      : `${messages[0]} (+${messages.length - 1} more below)`;

  if (toast.isActive(ID)) toast.update(ID, { render: text });
  else toast.error(text, { toastId: ID });

  setTimeout(() => {
    document
      .querySelector<HTMLElement>('[aria-invalid="true"], [data-form-error]')
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 50);
}