import {
  Briefcase,
  Dumbbell,
  GraduationCap,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/lib/goals";

type CategoryStyle = {
  icon: LucideIcon;
  text: string;
  iconBox: string;
  chip: string;
  bar: string;
  header: string;
};

export const categoryStyles: Record<Category, CategoryStyle> = {
  Career: {
    icon: Briefcase,
    text: "text-green-700",
    iconBox: "bg-green-50 text-green-700",
    chip: "bg-green-50 text-green-700",
    bar: "bg-green-500",
    header: "bg-green-50",
  },
  Learning: {
    icon: GraduationCap,
    text: "text-sky-700",
    iconBox: "bg-sky-50 text-sky-600",
    chip: "bg-sky-50 text-sky-700",
    bar: "bg-sky-500",
    header: "bg-sky-50",
  },
  Health: {
    icon: Dumbbell,
    text: "text-amber-700",
    iconBox: "bg-amber-50 text-amber-600",
    chip: "bg-amber-50 text-amber-700",
    bar: "bg-amber-400",
    header: "bg-amber-50",
  },
  Personal: {
    icon: Sparkles,
    text: "text-violet-700",
    iconBox: "bg-violet-50 text-violet-600",
    chip: "bg-violet-50 text-violet-700",
    bar: "bg-violet-400",
    header: "bg-violet-50",
  },
};