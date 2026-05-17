import json
from typing import List, Dict, Any, Optional
from openai import AsyncOpenAI
from app.config import get_settings

settings = get_settings()

class LLMService:
    def __init__(self):
        api_key = settings.LLM_API_KEY
        if not api_key or api_key == "your_api_key_here":
            self.client = None
        else:
            self.client = AsyncOpenAI(
                api_key=api_key,
                base_url=settings.LLM_BASE_URL,
            )
        self.model = settings.LLM_MODEL
        self.max_tokens = settings.LLM_MAX_TOKENS
        self.temperature = settings.LLM_TEMPERATURE
    
    def _ensure_client(self):
        if self.client is None:
            raise ValueError("LLM API Key not configured. Please set LLM_API_KEY in your .env file.")

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

        system_prompt = """你是一位兼具工程师素养和科研经验的学长/学姐。你的任务是将学习文档转化为一份可下载的Word教程，帮助学弟学妹掌握最基本的编程技能和科研思路。

请严格按以下JSON格式输出，不要输出任何其他内容：
{
  "title": "教程标题（吸引人且准确，体现项目实战感）",
  "description": "教程简介（2-3句话：这份文档讲什么、适合谁学、学完后能做什么）",
  "steps": [
    {
      "order": 1,
      "title": "步骤标题（简洁有力，像项目里程碑）",
      "description": "步骤简介（1句话说明这一步要掌握什么技能）",
      "content": "详细内容（Markdown格式，800-1500字）"
    }
  ]
}

每个步骤的 content 必须包含以下三个板块，用 ## 分隔：

## 核心概念
- 用通俗语言解释这一步涉及的知识点
- 类比、图示化描述，避免纯术语堆砌

## 动手实践
- 给出可运行的代码示例（Python优先，若文档涉及其他语言则用文档语言）
- 代码必须有注释，标注每一行的作用
- 给出运行结果的预期输出
- 如果文档是纯理论，则给出复现论文/实验的伪代码或Shell命令

## 科研思路
- 这一步在真实科研/工程项目中如何应用
- 常见坑点和调试技巧
- 如果要深入，下一步该学什么（给出具体方向或论文/链接关键词）

整体要求：
1. 拆解为5-10个步骤，从入门到进阶
2. 语气温暖亲切，像学长学姐在实验室手把手带教
3. Markdown格式，代码块用 ```python 等标注
4. 每个步骤都要让"零基础"读者能跟着做出来"""

        user_prompt = f"请将以下文档转化为教程。\n\n文档名称：{document_name}\n\n文档内容：\n{truncated_content}"

        self._ensure_client()
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
        except json.JSONDecodeError as e:
            raise ValueError(f"LLM returned invalid JSON: {str(e)}")
        except Exception as e:
            raise ValueError(f"LLM generation error: {str(e)}")

    async def chat_with_document(
        self,
        document_content: str,
        question: str,
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, str]:
        """Chat about the document content. Returns {answer, reasoning}."""
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

        self._ensure_client()
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=2048,
            temperature=self.temperature,
        )
        
        msg = response.choices[0].message
        answer = msg.content or ""
        # Some models (e.g., Qwen3 with thinking mode) return reasoning_content
        reasoning = getattr(msg, "reasoning_content", None) or ""
        return {"answer": answer, "reasoning": reasoning}

llm_service = LLMService()
