"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { Main } from "./Main";
import "@copilotkit/react-ui/styles.css";

export default function Home() {
  return (
    <main>
      <CopilotKit runtimeUrl="/api/copilotkit" agent="translate_agent">
        <Main />
      </CopilotKit>
    </main>
  );
}
