"""
This is the main entry point for the AI.
It defines the workflow graph and the entry point for the agent.
"""

from langchain_core.messages import SystemMessage, AIMessage
from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import MessagesState
from copilotkit.langchain import copilotkit_customize_config
from typing import Annotated, List
from langchain_core.messages import AnyMessage
from pydantic import Field
from langgraph.graph.message import add_messages
from typing import Dict, Any, Optional
from .models import model
from .utils import fetch_url_content, parse_article_content
from bs4 import BeautifulSoup
from .schema import Log, UserIntentClassification
from copilotkit.langchain import copilotkit_emit_state
from pydantic import BaseModel
from langchain.tools import tool
from langchain_core.messages import ToolMessage
import json


class ContentItem(BaseModel):
    title: str
    summary: str


class AgentState(MessagesState):
    """Contains the state of the agent."""

    messages: Annotated[List[AnyMessage], add_messages] = Field(default_factory=list)
    next_action: Annotated[Optional[str], Field(default=None)]
    logs: List[Log]
    content_items: List[ContentItem] = Field(default_factory=list)


def determine_next_action(state: AgentState) -> str:
    """Determine the next action based on the state."""
    return state["next_action"] or END


async def user_intent_classification(state: AgentState) -> Dict[str, Any]:
    system_message = """
    Classify the user's intent based on their messages, determining if they want to just chat or get content from towards data science.
    Extract any relevant information from the user's messages to help with classification.
    """
    user_intent: UserIntentClassification = await model.with_structured_output(
        UserIntentClassification, strict=True
    ).ainvoke(
        [
            SystemMessage(content=system_message),
            *state["messages"],
        ]
    )
    return user_intent


# Add new utility function
async def setup_state_and_config(
    state: AgentState, config: RunnableConfig, message: str
) -> RunnableConfig:
    """Common setup for state logs and config customization"""
    state["logs"] = state.get("logs", [])
    state["logs"].append(
        {
            "message": message,
            "done": False,
        }
    )
    await copilotkit_emit_state(config, state)
    return copilotkit_customize_config(
        config, emit_messages=True, emit_intermediate_state=[{"state_key": "messages"}]
    )


async def content_router(state: AgentState, config: RunnableConfig) -> Dict[str, Any]:
    if not state["messages"]:
        return {
            "messages": [
                AIMessage(
                    content="Hello, Do you want to chat or get content from towards data science?"
                )
            ],
            "next_action": END,
        }

    config = await setup_state_and_config(state, config, "Determining next action")
    user_intent = await user_intent_classification(state)

    if user_intent.towards_data_science_decision.fetch_tds_articles:
        state["logs"].append(
            {
                "message": "User wants to fetch articles from towards data science",
                "done": True,
            }
        )
        await copilotkit_emit_state(config, state)
        return {"next_action": "fetch_tds_articles"}

    elif user_intent.chat_decision.chat_decision:
        state["logs"][-1]["done"] = True
        await copilotkit_emit_state(config, state)
        return {"next_action": "chat_node"}


@tool
def FetchArticle(url: str) -> str:
    """Fetch article content from a given URL."""
    return fetch_url_content(url)

@tool
def SummarizeArticle(title: str, content: str) -> ContentItem:
    """Summarize an article's content."""

async def fetch_tds_articles(state: AgentState, config: RunnableConfig) -> Dict[str, Any]:
    config = await setup_state_and_config(
        state, config, "Fetching latest articles from towards data science"
    )

    # Customize config to emit tool calls
    config = copilotkit_customize_config(
        config,
        emit_intermediate_state=[{
            "state_key": "content_items",
            "tool": "FetchArticle",
            "tool_argument": "url",
        }, {
            "state_key": "content_items",
            "tool": "SummarizeArticle",
            "tool_argument": "content",
        }],
    )

    page_content: Optional[str] = fetch_url_content(
        "https://towardsdatascience.com/latest"
    )
    if not page_content:
        return {
            "content_items": [],
            "messages": [AIMessage(content="Could not fetch articles")]
        }

    content_items: List[ContentItem] = []
    soup: BeautifulSoup = BeautifulSoup(page_content, "html.parser")
    
    for article in soup.find_all("div", class_="postArticle", limit=5):
        link_tag = article.find("a", {"data-action": "open-post"})
        if not link_tag:
            continue

        title = link_tag.get_text().strip()
        url = link_tag["href"]
        
        # Emit tool call for fetching article - Updated format
        state["messages"].append(AIMessage(
            content="",
            tool_calls=[{
                "id": f"fetch_{url}",
                "type": "tool_call",
                "name": "FetchArticle",
                "args": {"url": url}
            }]
        ))
        
        full_content: Optional[str] = parse_article_content(url)
        if full_content:
            state["messages"].append(ToolMessage(
                tool_call_id=f"fetch_{url}",
                content=f"Fetched article content from {url}"
            ))
            
            # Emit tool call for summarization - Updated format
            state["messages"].append(AIMessage(
                content="",
                tool_calls=[{
                    "id": f"summarize_{url}",
                    "type": "tool_call",
                    "name": "SummarizeArticle",
                    "args": {
                        "title": title,
                        "content": full_content
                    }
                }]
            ))
            
            summary = await model.with_structured_output(
                ContentItem, strict=True
            ).ainvoke(
                [
                    SystemMessage(
                        content=f"""Summarize the following article:
                        Title: {title}
                        Article: {full_content}
                        """
                    )
                ]
            )
            
            state["messages"].append(ToolMessage(
                tool_call_id=f"summarize_{url}",
                content=f"Generated summary for {title}"
            ))
            
            content_items.append(summary)
            await copilotkit_emit_state(config, state)

    state["logs"][-1]["done"] = True
    state["content_items"] = content_items
    await copilotkit_emit_state(config, state)
    if content_items:
        summaries_text = "\n\nHere are the latest articles:\n\n" + "\n\n---\n\n".join(
            f"Title: {item.title}\n\n{item.summary}" for item in content_items
        )
        return {
            "content_items": content_items,
            "messages": [AIMessage(content=summaries_text)]
        }
    return {
        "content_items": [],
        "messages": [AIMessage(content="No articles found")]
    }


async def chat_node(state: AgentState, config: RunnableConfig):
    config = await setup_state_and_config(state, config, "Chatting with user")

    response = await model.ainvoke([
            SystemMessage(
                content="""
                You are a helpful assistant that can answer questions and provide information.
                Review the following messages and provide a helpful response.
                """
            ),
            *state["messages"],
        ],
        config,
    )
    state["logs"][-1]["done"] = True
    await copilotkit_emit_state(config, state)
    return {"messages": [response.content]}


router_paths = {
    "fetch_tds_articles": "fetch_tds_articles",
    "chat_node": "chat_node",
}

workflow = StateGraph(AgentState)
workflow.add_node("content_router", content_router)
workflow.add_node("chat_node", chat_node)
workflow.add_node("fetch_tds_articles", fetch_tds_articles)
workflow.set_entry_point("content_router")
workflow.add_conditional_edges("content_router", determine_next_action, router_paths)
workflow.add_edge("fetch_tds_articles", END)
workflow.add_edge("chat_node", END)

memory = MemorySaver()
graph = workflow.compile(checkpointer=memory)
