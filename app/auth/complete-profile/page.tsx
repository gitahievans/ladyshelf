import type { ReactElement } from "react";
import { Suspense } from "react";

import CompleteProfileForm from "@/components/auth/CompleteProfileForm";

export default function CompleteProfilePage(): ReactElement {
  return (
    <Suspense fallback={null}>
      <CompleteProfileForm />
    </Suspense>
  );
}
