import { SearchX } from "lucide-react";
import ButtonLink from "@/components/starterPage/Button";
import StatusPage from "@/components/ui/StatusPage";

type ItemNotFoundProps = {
  what: string; // "Goal", "Project", "Course"
  backHref: string;
  backLabel: string;
};

export default function ItemNotFound({ what, backHref, backLabel }: ItemNotFoundProps) {
  return (
    <StatusPage
      icon={SearchX}
      code="404"
      title={`${what} not found`}
      text={`This ${what.toLowerCase()} doesn't exist, or you can't open it. It may have been deleted.`}
    >
      <ButtonLink href={backHref} size="lg" className="w-full sm:w-auto">
        {backLabel}
      </ButtonLink>
    </StatusPage>
  );
}