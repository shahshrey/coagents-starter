"use client";

import { useCoAgent, useCoAgentStateRender, useCopilotChat } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
import { TextMessage, MessageRole } from "@copilotkit/runtime-client-gql";
import { CopilotChat } from "@copilotkit/react-ui";
import { Progress } from "./components/ui/Progress";
import ContentItems from './components/ContentItems';
import { AgentState } from "./lib/types";
const test =[
  {
      "lc": 1,
      "type": "not_implemented",
      "id": [
          "my_agent",
          "agent",
          "ContentItem"
      ],
      "repr": "ContentItem(title='Understanding SQL Indexing', summary='The article by Christopher Karg, published on Towards Data Science, delves into the concept of SQL indexing, a common term in data management and a frequent topic in technical interviews. The author aims to demystify what happens behind the scenes when an index is applied in a relational MySQL Database. The article covers the definition of an index, its implementation, and the internal workings, while also discussing scenarios where indexing might not be beneficial. Karg uses a MySQL container from Docker for demonstration purposes, providing code examples for readers to experiment with. The article is structured to cater to readers with varying levels of technical expertise, offering both high-level overviews and detailed insights.')"
  },
  {
      "lc": 1,
      "type": "not_implemented",
      "id": [
          "my_agent",
          "agent",
          "ContentItem"
      ],
      "repr": "ContentItem(title='Understanding Knowledge Graphs and Their Importance', summary='Knowledge Graphs (KGs) are structured representations of information that capture real-world entities and their relationships, forming an interconnected web that allows for a rich semantic understanding of data. They are integral to modern search engines, Retrieval-Augmented Generation systems for Large Language Models, and various query tools. KGs focus on the relationships between data points, enhancing the understanding and retrieval of information.')"
  },
  {
      "lc": 1,
      "type": "not_implemented",
      "id": [
          "my_agent",
          "agent",
          "ContentItem"
      ],
      "repr": "ContentItem(title='Bridging the Gap Between Operational and Analytical Data', summary='The article discusses the ongoing confusion and challenges in distinguishing between operational and analytical data within enterprise data architecture. The author argues that the current definitions are not helpful and proposes a solution to avoid the strict separation of these data types. Instead, the focus should be on differentiating between source data and derived data, both of which can serve operational and analytical purposes. This approach aims to create a universal data supply that effectively bridges the gap between operational and analytical data, addressing issues like brittle ETL pipelines.')"
  },
  {
      "lc": 1,
      "type": "not_implemented",
      "id": [
          "my_agent",
          "agent",
          "ContentItem"
      ],
      "repr": "ContentItem(title='Exploration of LLM Reasoning Abilities', summary=\"The article explores the reasoning abilities of large language models (LLMs) like GPT, Llama, Mistral, and Gemma, questioning whether they can truly reason or are merely pattern matchers. Despite high benchmark scores suggesting advanced problem-solving capabilities, a study by Apple titled 'GSM-Symbolic: Understanding the Limitations of Mathematical Reasoning in Large Language Models' highlights the limitations in their mathematical reasoning. The author, an LLM Engineer, emphasizes the importance of moving beyond memorized patterns to achieve real reasoning, especially for practical applications. The article discusses the study's findings and their implications for the use of LLMs in real-world scenarios.\")"
  },
  {
      "lc": 1,
      "type": "not_implemented",
      "id": [
          "my_agent",
          "agent",
          "ContentItem"
      ],
      "repr": "ContentItem(title='Watermarking as a Tool Against Misinformation and Bioterrorism', summary=\"The article discusses the increasing threat of misinformation and bioterrorism facilitated by large language models (LLMs) and generative protein design models. It highlights the potential of digital watermarking as a tool to combat these threats by detecting the presence of AI-generated content. Watermarking involves embedding a secret signal to identify ownership and ensure content integrity. The article explores Google's SynthID-Text, a watermarking scheme for text, and a similar approach for generative protein design. These methods modify probability distributions during content generation to embed a statistical signature, which can later be detected to determine the origin of the content. The effectiveness of watermarking depends on its robustness and detectability without altering content quality. The article also touches on the challenges and limitations of watermarking, such as maintaining text quality and handling low entropy design tasks in protein design.\")"
  }
]
export function Main() {
  const {
    state: agentState,
  } = useCoAgent<AgentState>({
    name: "translate_agent",
    initialState: { 
      messages: [{ content: "" }],
      content_items: test
    },
  });

  useCoAgentStateRender({
    name: "my_agent",
    render: ({ state, nodeName, status }) => {
      if (!state.logs || state.logs.length === 0) {
        return null;
      }
      return <Progress logs={state.logs} />;
    },
  });

  return (
    <div className="flex h-full w-full">
      {/* Main content area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <ContentItems items={agentState.content_items} />
      </div>
      
      {/* Right sidebar for chat */}
      <div className="w-120 border-l border-gray-200">
        <CopilotChat
          className="h-full"
          instructions={"You are assisting the user as best as you can. Answer in the best way possible given the data you have. Talk like a pirate."}
          labels={{
            title: "Your Assistant",
            initial: "Hi! 👋 How can I assist you today?",
          }}
        />
      </div>
    </div>
  );
}
