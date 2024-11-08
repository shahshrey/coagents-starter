import json
import re
from typing import Any

import requests
from bs4 import BeautifulSoup
from pydantic import BaseModel
from rich.console import Console
from rich.panel import Panel
from rich.syntax import Syntax

def fetch_url_content(url):
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Failed to retrieve page with status code {response.status_code}")
        return None
    return response.content


def parse_article_content(article_url):
    content = fetch_url_content(article_url)
    if not content:
        return None

    article_soup = BeautifulSoup(content, "html.parser")
    paragraphs = article_soup.find_all("p")
    full_content = "\n".join([p.get_text() for p in paragraphs])

    unwanted_strings = [
        "Sign up\nSign in\nSign up\nSign in\nMariya Mansurova\nFollow\nTowards Data Science\n--\nListen\nShare",
        """\n--\n--\nTowards Data Science\nData & Product Analytics Lead at Wise | ClickHouse Evangelist\nHelp\nStatus\nAbout\nCareers\nPress\nBlog\nPrivacy\nTerms\nText to speech\nTeams""",
    ]
    for unwanted in unwanted_strings:
        full_content = full_content.replace(unwanted, "")

    full_content = re.sub(r"[^\x00-\x7F]+", "", full_content)
    return full_content


def log_output(title: str, content: Any):
    console = Console()
    if isinstance(content, dict):
        content_str = json.dumps(content, indent=2)
    elif isinstance(content, BaseModel):
        content_str = json.dumps(content.dict(), indent=2)
    else:
        content_str = str(content)
    console.print(Panel(Syntax(content_str, "json", theme="monokai"), title=title))
    
