from typing import Dict, Any, Optional
import anthropic
from app.core.config import settings


class ClaudeService:
    def __init__(self, api_key: Optional[str] = None):
        self.client = anthropic.Anthropic(
            api_key=api_key or settings.ANTHROPIC_API_KEY
        )
    
    async def generate_content(
        self,
        topic: str,
        platform: str,
        research_data: Optional[Dict[str, Any]] = None,
        additional_context: Optional[str] = None
    ) -> str:
        """Generate content for a specific platform"""
        
        # Get platform-specific system prompt
        system_prompt = self._get_system_prompt(platform)
        
        # Build user message
        user_message = self._build_user_message(
            topic, research_data, additional_context
        )
        
        try:
            message = self.client.messages.create(
                model=settings.CLAUDE_MODEL,
                max_tokens=1024,
                temperature=0.7,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": user_message}
                ]
            )
            
            return message.content[0].text
            
        except Exception as e:
            raise Exception(f"Claude API error: {str(e)}")
    
    def _get_system_prompt(self, platform: str) -> str:
        """Get platform-specific system prompt"""
        
        if platform.lower() == "twitter":
            return """You are an expert X/Twitter copywriter specializing in viral content. Create posts that:

STRUCTURE:
- Hook (first 7 words must grab attention)
- Core insight/data point
- Punchline or call-to-action

STYLE:
- Short sentences. Maximum impact.
- Use numbers when possible
- Controversial takes welcome
- Humor/satire when fitting
- Never use hashtags in main text
- Thread if needed (indicate with 1/)

EXAMPLES OF HOOKS:
- "Nobody talks about this but..."
- "Unpopular opinion:"
- "[Industry] is broken. Here's proof:"
- "I analyzed [X] data. The results..."

Keep it under 280 characters and make it punchy, data-driven, and engaging."""

        elif platform.lower() == "linkedin":
            return """You are a LinkedIn thought leader. Create professional content that drives engagement:

STRUCTURE:
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

Format for maximum engagement with clear paragraphs and bullet points when helpful."""
        
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
    
    async def generate_variations(
        self,
        original_content: str,
        platform: str,
        count: int = 3
    ) -> list[str]:
        """Generate variations of existing content"""
        
        system_prompt = f"""You are a social media copywriter. Create {count} different variations of the given content for {platform}.

Each variation should:
- Maintain the core message
- Use different wording and structure
- Vary the hook/opening
- Keep the same tone and platform style

Make each variation distinct while preserving the original intent."""

        user_message = f"Create {count} variations of this content:\n\n{original_content}"
        
        try:
            message = self.client.messages.create(
                model=settings.CLAUDE_MODEL,
                max_tokens=1024,
                temperature=0.8,  # Higher temperature for more variety
                system=system_prompt,
                messages=[
                    {"role": "user", "content": user_message}
                ]
            )
            
            # Split the response into variations
            content = message.content[0].text
            variations = [v.strip() for v in content.split("\n\n") if v.strip()]
            
            return variations[:count]
            
        except Exception as e:
            raise Exception(f"Claude API error: {str(e)}")


# Singleton instance
claude_service = ClaudeService()