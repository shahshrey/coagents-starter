"use client";

import { useCoAgent, useCoAgentStateRender, useCopilotChat } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
import { TextMessage, MessageRole } from "@copilotkit/runtime-client-gql";
import { CopilotChat } from "@copilotkit/react-ui";
import { Progress } from "./components/ui/Progress";
type AgentState = {
  messages: any[];
  logs: any[];
}

export function Main() {
  const {
    state: agentState,
    setState: setTranslateAgentState,
    run: runTranslateAgent,
  } = useCoAgent<AgentState>({
    name: "translate_agent",
    initialState: { 
      messages: [{ content: "" }]
    },
  });

  useCoAgentStateRender({
    name: "translate_agent",
    render: ({ state, nodeName, status }) => {
      if (!state.logs || state.logs.length === 0) {
        return null;
      }
      return <Progress logs={state.logs} />;
    },
  });


  console.log("state", agentState);

  const handleTranslate = () => {
    runTranslateAgent(() => new TextMessage({ role: MessageRole.User, content: "Reply in the best way possible given the data you have. Talk like a pirate." }));
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-7xl mx-auto">
        <div
          className="w-[500px] h-full flex-shrink-0"
          style={
            {
              "--copilot-kit-background-color": "#E0E9FD",
              "--copilot-kit-secondary-color": "#6766FC",
              "--copilot-kit-secondary-contrast-color": "#FFFFFF",
              "--copilot-kit-primary-color": "#FFFFFF",
              "--copilot-kit-contrast-color": "#000000",
            } as any
          }
        >
          <CopilotChat
            className="w-full h-[90vh]"
            instructions={"You are assisting the user as best as you can. Answer in the best way possible given the data you have. Talk like a pirate."}
            labels={{
              title: "Your Assistant",
              initial: "Hi! 👋 How can I assist you today?",
            }}
          />
        </div>
      </div>
    </div>
  );
}
