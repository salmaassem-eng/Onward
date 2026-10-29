import { SearchX } from "lucide-react";
import ButtonLink from "@/components/starterPage/Button";
import StatusPage from "@/components/ui/StatusPage";

export default function AppNotFound() {
  return (
    <StatusPage
      icon={SearchX}
      code="404"
      title="We can't find that page"
      text="The link may be broken, or what you were looking for was deleted."
    >
      <ButtonLink href="/dashboard" size="lg" className="w-full sm:w-auto">
        Back to Home
      </ButtonLink>
    </StatusPage>
  );
}