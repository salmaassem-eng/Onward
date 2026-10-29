import { SearchX } from "lucide-react";
import ButtonLink from "@/components/starterPage/Button";
import StatusPage from "@/components/ui/StatusPage";

export default function NotFound() {
  return (
    <StatusPage
      standalone
      icon={SearchX}
      code="404"
      title="We can't find that page"
      text="The link may be broken, or the page was moved or deleted. Let's get you back on your journey."
    >
      {/* "/" sends logged-in users to their dashboard */}
      <ButtonLink href="/" size="lg" className="w-full sm:w-auto">
        Go home
      </ButtonLink>
    </StatusPage>
  );
}