"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { deleteGoal } from "@/app/actions/goals";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function GoalActions({ goalId, title }: { goalId: number; title: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      try {
        await deleteGoal(goalId);
        toast.success("Goal deleted.");
        setConfirming(false);
        router.replace("/journey");
      } catch {
        toast.error("Couldn't delete the goal.");
      }
    });
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Link
          href={`/goals/${goalId}`}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-stone-500 transition hover:bg-stone-50 hover:text-stone-900"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-stone-500 transition hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      <ConfirmModal
        open={confirming}
        title="Delete this goal?"
        text={`"${title}" and all its steps will be deleted. Connected projects stay, as freelance projects.`}
        loading={pending}
        onConfirm={remove}
        onClose={() => setConfirming(false)}
      />
    </>
  );
}