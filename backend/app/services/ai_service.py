from typing import Dict, Any, Optional, List
import anthropic
import openai
from google import genai
from google.genai import types
import random
import json
import re
from enum import Enum

from app.core.config import settings


class AIProvider(str, Enum):
    CLAUDE = "claude"
    OPENAI = "openai"
    GEMINI = "gemini"
    XAI = "xai"


class UnifiedAIService:
    def __init__(self):
        self.claude_client = None
        self.openai_client = None
        self.xai_client = None
        self.gemini_client = None
        self.gemini_keys = settings.get_gemini_api_keys()
        self.current_gemini_key_index = 0
        
        # Initialize clients
        self._init_clients()
    
    def _init_clients(self):
        """Initialize all available AI clients"""
        try:
            if settings.ANTHROPIC_API_KEY:
                self.claude_client = anthropic.Anthropic(
                    api_key=settings.ANTHROPIC_API_KEY
                )
        except Exception as e:
            print(f"Failed to initialize Claude client: {e}")
            self.claude_client = None
        
        try:
            if settings.OPENAI_API_KEY:
                self.openai_client = openai.OpenAI(
                    api_key=settings.OPENAI_API_KEY
                )
        except Exception as e:
            print(f"Failed to initialize OpenAI client: {e}")
            self.openai_client = None
        
        try:
            if settings.XAI_API_KEY:
                self.xai_client = openai.OpenAI(
                    api_key=settings.XAI_API_KEY,
                    base_url="https://api.x.ai/v1"
                )
        except Exception as e:
            print(f"Failed to initialize XAI client: {e}")
            self.xai_client = None
        
        try:
            if self.gemini_keys:
                self.gemini_client = genai.Client(
                    api_key=self.gemini_keys[0]
                )
        except Exception as e:
            print(f"Failed to initialize Gemini client: {e}")
            self.gemini_client = None
    
    def _get_next_gemini_key(self) -> str:
        """Rotate through Gemini API keys for rate limiting"""
        if not self.gemini_keys:
            raise Exception("No Gemini API keys available")
        
        key = self.gemini_keys[self.current_gemini_key_index]
        self.current_gemini_key_index = (self.current_gemini_key_index + 1) % len(self.gemini_keys)
        return key
    
    async def generate_content(
        self,
        topic: str,
        platform: str,
        provider: AIProvider = AIProvider.CLAUDE,
        research_data: Optional[Dict[str, Any]] = None,
        additional_context: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Generate content using specified AI provider"""
        
        system_prompt = self._get_system_prompt(platform)
        user_message = self._build_user_message(topic, research_data, additional_context)
        
        try:
            if provider == AIProvider.CLAUDE and self.claude_client:
                raw_response = self._generate_with_claude(system_prompt, user_message)
            elif provider == AIProvider.OPENAI and self.openai_client:
                raw_response = self._generate_with_openai(system_prompt, user_message)
            elif provider == AIProvider.GEMINI and self.gemini_client:
                raw_response = await self._generate_with_gemini(system_prompt, user_message)
            elif provider == AIProvider.XAI and self.xai_client:
                raw_response = self._generate_with_xai(system_prompt, user_message)
            else:
                # Fallback to available provider
                raw_response = await self._generate_with_fallback(system_prompt, user_message)
                
            return self._parse_ai_response(raw_response, platform)
                
        except Exception as e:
            # Try fallback provider
            try:
                raw_response = await self._generate_with_fallback(system_prompt, user_message)
                return self._parse_ai_response(raw_response, platform)
            except Exception as fallback_error:
                # Return a single basic suggestion as last resort
                return [{
                    "content": f"Content about {topic} for {platform}",
                    "variation_note": "Basic fallback",
                    "character_count": len(f"Content about {topic} for {platform}")
                }]
    
    def _generate_with_claude(self, system_prompt: str, user_message: str) -> str:
        """Generate content using Claude"""
        message = self.claude_client.messages.create(
            model="claude-4-sonnet-20250514",
            max_tokens=2000,
            temperature=0.7,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}]
        )
        return message.content[0].text
    
    def _generate_with_openai(self, system_prompt: str, user_message: str) -> str:
        """Generate content using OpenAI"""
        response = self.openai_client.chat.completions.create(
            model="gpt-4o-mini",  # Using cheaper model for cost efficiency
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        return response.choices[0].message.content
    
    def _generate_with_xai(self, system_prompt: str, user_message: str) -> str:
        """Generate content using XAI (Grok)"""
        response = self.xai_client.chat.completions.create(
            model="grok-beta",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        return response.choices[0].message.content
    
    async def _generate_with_gemini(self, system_prompt: str, user_message: str) -> str:
        """Generate content using Gemini"""
        # Rotate API key for rate limiting
        current_key = self._get_next_gemini_key()
        client = genai.Client(api_key=current_key)
        
        # Combine system prompt and user message for Gemini
        combined_prompt = f"System: {system_prompt}\n\nUser: {user_message}"
        
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=combined_prompt)]
            )
        ]
        
        config = types.GenerateContentConfig(
            response_mime_type="text/plain",
            temperature=0.7,
            max_output_tokens=1000
        )
        
        response = client.models.generate_content(
            model="gemini-2.5-flash-preview-05-20",
            contents=contents,
            config=config
        )
        
        return response.text
    
    async def _generate_with_fallback(self, system_prompt: str, user_message: str) -> str:
        """Try available providers in order of preference"""
        providers = [
            (AIProvider.CLAUDE, self.claude_client),
            (AIProvider.GEMINI, self.gemini_client),
            (AIProvider.OPENAI, self.openai_client),
            (AIProvider.XAI, self.xai_client)
        ]
        
        for provider, client in providers:
            if client:
                try:
                    if provider == AIProvider.CLAUDE:
                        return self._generate_with_claude(system_prompt, user_message)
                    elif provider == AIProvider.GEMINI:
                        return await self._generate_with_gemini(system_prompt, user_message)
                    elif provider == AIProvider.OPENAI:
                        return self._generate_with_openai(system_prompt, user_message)
                    elif provider == AIProvider.XAI:
                        return self._generate_with_xai(system_prompt, user_message)
                except Exception as e:
                    continue
        
        raise Exception("No AI providers available or all failed")
    
    def _parse_ai_response(self, raw_response: str, platform: str) -> List[Dict[str, Any]]:
        """Parse AI response into structured suggestions"""
        try:
            # Try to extract JSON from the response
            json_match = re.search(r'\{.*"suggestions".*\}', raw_response, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                parsed = json.loads(json_str)
                suggestions = parsed.get("suggestions", [])
                
                # Process each suggestion
                processed_suggestions = []
                for suggestion in suggestions[:3]:  # Limit to 3
                    content = suggestion.get("content", "")
                    processed_suggestions.append({
                        "content": content,
                        "character_count": len(content),
                        "hashtags": self._extract_hashtags(content) if platform.lower() == "linkedin" else None,
                        "variation_note": suggestion.get("variation_note", "")
                    })
                
                return processed_suggestions
            
        except Exception as e:
            print(f"Failed to parse JSON response: {e}")
        
        # Fallback: treat as single content
        content = raw_response.strip()
        return [{
            "content": content,
            "character_count": len(content),
            "hashtags": self._extract_hashtags(content) if platform.lower() == "linkedin" else None,
            "variation_note": "Single response"
        }]
    
    def _extract_hashtags(self, content: str) -> List[str]:
        """Extract hashtags from content"""
        hashtags = re.findall(r'#(\w+)', content)
        return hashtags[:5]  # Limit to 5 hashtags
    
    def _get_system_prompt(self, platform: str) -> str:
        """Get platform-specific system prompt"""
        
        if platform.lower() == "twitter":
            return """You are an expert X/Twitter copywriter specializing in viral content. 

TASK: Generate exactly 3 different post variations, each with a distinct approach:

VARIATION 1: Data-driven hook
VARIATION 2: Controversial/contrarian take  
VARIATION 3: Story-driven or question-based

STRUCTURE FOR EACH:
- Hook (first 7 words must grab attention)
- Core insight/data point
- Punchline or call-to-action

STYLE:
- Short sentences. Maximum impact.
- Use numbers when possible
- Humor/satire when fitting
- Never use hashtags in main text
- Thread if needed (indicate with 1/)

EXAMPLES OF HOOKS:
- "Nobody talks about this but..."
- "Unpopular opinion:"
- "[Industry] is broken. Here's proof:"
- "I analyzed [X] data. The results..."

Keep each under 280 characters and make them punchy, data-driven, and engaging.

IMPORTANT: Respond with JSON format containing 3 suggestions:
{
  "suggestions": [
    {
      "content": "post content here",
      "variation_note": "Data-driven approach"
    },
    {
      "content": "post content here", 
      "variation_note": "Contrarian take"
    },
    {
      "content": "post content here",
      "variation_note": "Story/question approach"
    }
  ]
}"""

        elif platform.lower() == "linkedin":
            return """You are a LinkedIn thought leader specializing in professional content.

TASK: Generate exactly 3 different post variations, each with a distinct approach:

VARIATION 1: Personal story/lesson learned
VARIATION 2: Industry insight/trend analysis
VARIATION 3: Actionable tips/how-to

STRUCTURE FOR EACH:
1. Opening hook (personal story or insight)
2. Core value/lesson (3-5 key points)
3. Actionable takeaway
4. Engagement question

STYLE:
- Professional but conversational
- Use line breaks for readability
- Include 3-5 relevant hashtags at end
- Focus on value, not self-promotion
- Data-driven insights preferred

TOPICS THAT PERFORM WELL:
- Career growth lessons
- Industry trends analysis
- Leadership insights
- Productivity tips
- Success/failure stories

IMPORTANT: Respond with JSON format containing 3 suggestions:
{
  "suggestions": [
    {
      "content": "post content here including hashtags",
      "variation_note": "Personal story approach"
    },
    {
      "content": "post content here including hashtags", 
      "variation_note": "Industry insight approach"
    },
    {
      "content": "post content here including hashtags",
      "variation_note": "Actionable tips approach"
    }
  ]
}"""
        
        else:
            return "You are a social media copywriter. Create engaging content for the specified platform."
    
    def _build_user_message(
        self,
        topic: str,
        research_data: Optional[Dict[str, Any]] = None,
        additional_context: Optional[str] = None
    ) -> str:
        """Build the user message with topic and research data"""
        
        message_parts = []
        
        # Add research context if available
        if research_data:
            message_parts.append("RESEARCH CONTEXT:")
            
            # Add findings
            if "findings" in research_data:
                for finding in research_data["findings"][:3]:  # Limit to top 3
                    message_parts.append(f"- {finding}")
            
            # Add sources
            if "sources" in research_data:
                message_parts.append("\nSOURCES:")
                for source in research_data["sources"][:3]:
                    message_parts.append(f"- {source}")
            
            message_parts.append("")
        
        # Add additional context if provided
        if additional_context:
            message_parts.append(f"ADDITIONAL CONTEXT:\n{additional_context}\n")
        
        # Add the main topic
        message_parts.append(f"Generate a post about: {topic}")
        
        return "\n".join(message_parts)
    
    def get_available_providers(self) -> List[AIProvider]:
        """Get list of available AI providers"""
        providers = []
        if self.claude_client:
            providers.append(AIProvider.CLAUDE)
        if self.openai_client:
            providers.append(AIProvider.OPENAI)
        if self.gemini_client:
            providers.append(AIProvider.GEMINI)
        if self.xai_client:
            providers.append(AIProvider.XAI)
        return providers
    
    def get_provider_info(self) -> Dict[str, Dict[str, Any]]:
        """Get information about each provider"""
        return {
            "claude": {
                "name": "Claude 4 Sonnet",
                "available": bool(self.claude_client),
                "description": "Anthropic's most capable model, excellent for nuanced content",
                "cost": "Higher cost, premium quality"
            },
            "openai": {
                "name": "GPT-4o Mini", 
                "available": bool(self.openai_client),
                "description": "OpenAI's efficient model, good balance of speed and quality",
                "cost": "Low cost, good performance"
            },
            "gemini": {
                "name": "Gemini 2.5 Flash",
                "available": bool(self.gemini_client),
                "description": "Google's fast model with multiple API keys for rate limiting",
                "cost": "Free tier available, very cost effective"
            },
            "xai": {
                "name": "Grok Beta",
                "available": bool(self.xai_client),
                "description": "X's AI model with real-time data and humor capabilities",
                "cost": "Competitive pricing, good for X content"
            }
        }


# Singleton instance
ai_service = UnifiedAIService()