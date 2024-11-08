from pydantic import Field
from pydantic import BaseModel
from typing import TypedDict

class TowardsDataScienceDecision(BaseModel):
    """
    Whether the user wants to create a post from towardsdatascience
    """
    fetch_tds_articles: bool = Field(description="Whether to create a post from Towards Data Science")
    reason: str = Field(description="Reason for the decision")

class ChatDecision(BaseModel):
    """
    Whether the user wants to just chat
    """
    chat_decision: bool = Field(description="Whether to just chat")
    reason: str = Field(description="Reason for the decision")

class UserIntentClassification(BaseModel):
    """
    Use this to classify the user's intent, whether they want to just chat or get content from towards data science.
    """
    towards_data_science_decision: TowardsDataScienceDecision
    chat_decision: ChatDecision
class Log(TypedDict):
    """
    Represents a log of an action performed by the agent.
    """
    message: str
    done: bool