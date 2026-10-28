"use client";

import { Trash2, type LucideIcon } from "lucide-react";
import Modal from "./Modal";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  text: string;
  confirmLabel?: string;
  loadingLabel?: string;
  tone?: "danger" | "neutral";
  icon?: LucideIcon;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

const tones = {
  danger: {
    icon: "bg-red-50 text-red-600",
    button: "bg-red-600 hover:bg-red-700",
  },
  neutral: {
    icon: "bg-green-50 text-green-700",
    button: "bg-green-600 hover:bg-green-700",
  },
};

export default function ConfirmModal({
  open,
  title,
  text,
  confirmLabel = "Delete",
  loadingLabel = "Deleting...",
  tone = "danger",
  icon: Icon = Trash2,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const t = tones[tone];

  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      labelledBy="confirm-title"
      width="max-w-sm"
    >
      <div className="p-6">
        <span className={`flex h-11 w-11 items-center justify-center rounded-full ${t.icon}`}>
          <Icon className="h-5 w-5" />
        </span>
        <h2
          id="confirm-title"
          className="font-heading mt-4 text-lg font-semibold text-stone-900"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">{text}</p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-stone-200 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-xl py-3 text-sm font-semibold text-white transition disabled:opacity-60 ${t.button}`}
          >
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}