import json
from typing import List, Dict, Any, Optional
from openai import AsyncOpenAI
from app.config import get_settings

settings = get_settings()

class LLMService:
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=settings.LLM_API_KEY or "dummy-key",
            base_url=settings.LLM_BASE_URL,
        )
        self.model = settings.LLM_MODEL
        self.max_tokens = settings.LLM_MAX_TOKENS
        self.temperature = settings.LLM_TEMPERATURE

    async def generate_tutorial(
        self,
        document_content: str,
        document_name: str
    ) -> Dict[str, Any]:
        """Generate tutorial structure from document content."""
        
        # Truncate content if too long
        max_content_length = 8000
        truncated_content = document_content[:max_content_length]
        if len(document_content) > max_content_length:
            truncated_content += "\n\n[文档内容已截断...]"

        system_prompt = """你是一位资深的教育内容设计师。你的任务是将学习文档转化为结构清晰、适合传承的教程。

请严格按以下JSON格式输出，不要输出任何其他内容：
{
  "title": "教程标题（吸引人且准确）",
  "description": "教程简介（2-3句话概括核心内容）",
  "steps": [
    {
      "order": 1,
      "title": "步骤标题（简洁有力）",
      "description": "步骤简介（1句话说明这一步学什么）",
      "content": "详细内容（Markdown格式，可包含代码块、重点标注、小标题等，字数300-800字）"
    }
  ]
}

要求：
1. 将文档内容拆解为5-10个学习步骤
2. 每个步骤必须有完整的标题、简介和详细内容
3. 详细内容使用Markdown格式，包含必要的代码高亮、重点标记
4. 语气温暖亲切，像学长学姐在亲自讲解
5. 步骤之间要有清晰的递进关系"""

        user_prompt = f"请将以下文档转化为教程。\n\n文档名称：{document_name}\n\n文档内容：\n{truncated_content}"

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                response_format={"type": "json_object"},
            )
            
            content = response.choices[0].message.content
            result = json.loads(content)
            return result
        except Exception as e:
            raise ValueError(f"LLM generation error: {str(e)}")

    async def chat_with_document(
        self,
        document_content: str,
        question: str,
        history: Optional[List[Dict[str, str]]] = None
    ) -> str:
        """Chat about the document content."""
        history = history or []
        
        max_content_length = 4000
        truncated_content = document_content[:max_content_length]
        
        system_prompt = f"""你是一位耐心的学长/学姐。你正在根据一份学习文档回答学弟学妹的问题。

文档内容：
{truncated_content}

请用温暖、亲切的语气回答问题。如果问题超出文档范围，可以基于你的知识适当补充，但要说明清楚。"""

        messages = [{"role": "system", "content": system_prompt}]
        for h in history[-6:]:
            messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
        messages.append({"role": "user", "content": question})

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=2048,
            temperature=self.temperature,
        )
        
        return response.choices[0].message.content

llm_service = LLMService()
