import { Plus, Target } from "lucide-react";
import { requireUser } from "@/lib/session";
import PageHeader from "@/components/app/PageHeader";
import EmptyState from "@/components/app/EmptyState";
import GoalsBoard from "@/components/app/Goals/GoalsFilter";
import OverallProgress from "@/components/app/Goals/OverallProgress";
import Button from "@/components/starterPage/Button";
import { getUserGoals } from "@/lib/goal-queries";

export default async function GoalsPage() {
  const user = await requireUser();

const goalViews = await getUserGoals(user.id);
  const active = goalViews.filter((g) => g.progress < 100).length;
  const areas = new Set(goalViews.map((g) => g.category)).size;

  const subtitle =
    goalViews.length === 0
      ? "Everything you want to achieve, in one place."
      : `${active} active ${active === 1 ? "goal" : "goals"} across ${areas} ${
          areas === 1 ? "area" : "areas"
        }`;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title="Your Goals" subtitle={subtitle} />
        <Button href="/goals/new" size="lg">
          <Plus className="mr-2 h-4 w-4" />
          New goal
        </Button>
      </div>

      <div className="mt-8">
        {goalViews.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No goals yet"
            text="Create your first goal and break it into steps. Your progress builds from them."
            action={{ href: "/goals/new", label: "Create a goal" }}
          />
        ) : (
          <>
            <GoalsBoard goals={goalViews} />
            <OverallProgress goals={goalViews} />
          </>
        )}
      </div>
    </>
  );
}