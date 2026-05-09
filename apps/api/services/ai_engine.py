import os
import json
import logging
from groq import Groq
from dotenv import load_dotenv
from schemas.ai_response import InsightResponse

load_dotenv()

logger = logging.getLogger(__name__)

class InsightGenerator:
    def __init__(self):
        # Pull GROQ_API_KEY from environment variables for security.
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            logger.warning("GROQ_API_KEY is not set in the environment.")
        self.client = Groq(api_key=api_key)
        self.model = "llama-3.3-70b-versatile"
        
    def generate_insight(self, persona: str, analytics_data: dict, history: list = None) -> InsightResponse:
        if history is None:
            history = []
        system_prompt = (
            "You are a diabetes intelligence assistant.\n"
            "Be concise, empathetic, and professional.\n"
            "Strictly cite specific data points from the context.\n"
            "Safety First: If the user asks for medical dosage advice or insulin instructions, "
            "politely redirect them to their healthcare provider. Do not provide medical advice.\n"
            "The output must be strictly JSON matching the following schema:\n"
            "{\n"
            '  "title": "str",\n'
            '  "summary": "str",\n'
            '  "evidence_points": ["str"],\n'
            '  "recommendation": "str",\n'
            '  "disclaimer": "str"\n'
            "}\n"
        )
        
        user_prompt = (
            f"Persona: {persona}\n"
            f"Data Context: {json.dumps(analytics_data, default=str)}\n"
            "Generate the JSON insight based on the data context."
        )
        
        logger.info("Sending prompt to Groq AI engine.")
        # Masking actual data in logging to protect PII, logging keys only
        logger.debug(f"Data keys provided for context: {list(analytics_data.keys())}")
        
        messages = [{"role": "system", "content": system_prompt}]
        for msg in history:
            messages.append({"role": msg.role, "content": msg.content})
        messages.append({"role": "user", "content": user_prompt})
        
        try:
            chat_completion = self.client.chat.completions.create(
                messages=messages,
                model=self.model,
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            response_content = chat_completion.choices[0].message.content
            logger.info("Received response from Groq AI engine.")
            logger.debug(f"Raw AI response: {response_content}")
            
            # Parse JSON and validate against InsightResponse schema
            data_dict = json.loads(response_content)
            return InsightResponse(**data_dict)
            
        except Exception as e:
            logger.error(f"Error generating insight from Groq API: {e}")
            # Return a safe fallback response in case of timeout or connection errors
            return InsightResponse(
                title="Insight Generation Unavailable",
                summary="We are currently unable to generate insights from your data.",
                evidence_points=["Service connectivity issue or API timeout."],
                recommendation="Please try again later or consult your healthcare provider for immediate concerns.",
                disclaimer="This is an automated fallback message. Please consult a doctor for medical advice."
            )
