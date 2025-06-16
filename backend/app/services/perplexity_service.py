from typing import Dict, Any, List, Optional
from openai import OpenAI
from datetime import datetime
import json

from app.core.config import settings


class PerplexityService:
    def __init__(self, api_key: Optional[str] = None):
        self.client = OpenAI(
            api_key=api_key or settings.PERPLEXITY_API_KEY,
            base_url="https://api.perplexity.ai"
        )
    
    async def research_topic(
        self,
        topic: str,
        additional_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Research a topic using Perplexity API"""
        
        # Build research query
        query = self._build_research_query(topic, additional_context)
        
        try:
            response = self.client.chat.completions.create(
                model=settings.PERPLEXITY_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": """You are a research assistant. Provide comprehensive research on the given topic with:
1. Key facts and statistics
2. Recent developments and trends
3. Expert opinions and insights
4. Relevant data points
5. Source citations

Format your response as structured information that can be used for social media content creation."""
                    },
                    {
                        "role": "user",
                        "content": query
                    }
                ],
                temperature=0.2,  # Lower temperature for more factual content
                max_tokens=2000
            )
            
            content = response.choices[0].message.content
            
            # Parse the research response
            research_data = self._parse_research_response(content, topic)
            
            return research_data
            
        except Exception as e:
            raise Exception(f"Perplexity API error: {str(e)}")
    
    def _build_research_query(
        self,
        topic: str,
        additional_context: Optional[str] = None
    ) -> str:
        """Build a comprehensive research query"""
        
        query_parts = [
            f"Research the topic: {topic}",
            "",
            "Please provide:",
            "1. Latest statistics and data points",
            "2. Recent news and developments",
            "3. Key trends and insights",
            "4. Expert opinions and quotes",
            "5. Relevant facts for social media content"
        ]
        
        if additional_context:
            query_parts.extend([
                "",
                f"Additional context: {additional_context}"
            ])
        
        return "\n".join(query_parts)
    
    def _parse_research_response(
        self,
        content: str,
        topic: str
    ) -> Dict[str, Any]:
        """Parse the research response into structured data"""
        
        # Extract key findings (simplified parsing)
        lines = content.split('\n')
        findings = []
        sources = []
        
        current_section = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Look for statistical data, facts, or insights
            if any(keyword in line.lower() for keyword in [
                'according to', 'study shows', 'research indicates',
                'data reveals', 'statistics show', 'recent survey',
                '%', 'percent', 'million', 'billion', 'increase', 'decrease'
            ]):
                findings.append(line)
            
            # Look for source indicators
            if any(keyword in line.lower() for keyword in [
                'source:', 'according to', 'study by', 'research from'
            ]):
                sources.append(line)
        
        # Limit findings and sources
        findings = findings[:5]
        sources = sources[:3]
        
        # If no specific findings found, extract key sentences
        if not findings:
            sentences = content.split('.')
            findings = [
                sentence.strip() + '.'
                for sentence in sentences
                if len(sentence.strip()) > 20 and len(sentence.strip()) < 200
            ][:5]
        
        return {
            "query": topic,
            "findings": findings,
            "sources": sources,
            "full_content": content,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def get_trending_topics(
        self,
        category: Optional[str] = None
    ) -> List[str]:
        """Get trending topics for content inspiration"""
        
        query = "What are the current trending topics"
        if category:
            query += f" in {category}"
        query += " that would be good for social media content?"
        
        try:
            response = self.client.chat.completions.create(
                model=settings.PERPLEXITY_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a trend analyst. Provide a list of current trending topics that are suitable for social media content creation."
                    },
                    {
                        "role": "user",
                        "content": query
                    }
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            content = response.choices[0].message.content
            
            # Extract topics from the response
            topics = self._extract_topics(content)
            
            return topics
            
        except Exception as e:
            raise Exception(f"Perplexity API error: {str(e)}")
    
    def _extract_topics(self, content: str) -> List[str]:
        """Extract topic list from response"""
        
        lines = content.split('\n')
        topics = []
        
        for line in lines:
            line = line.strip()
            # Look for numbered or bulleted lists
            if any(line.startswith(prefix) for prefix in ['1.', '2.', '3.', '4.', '5.', '-', '•', '*']):
                # Clean up the topic
                topic = line
                for prefix in ['1.', '2.', '3.', '4.', '5.', '-', '•', '*']:
                    topic = topic.replace(prefix, '').strip()
                
                if len(topic) > 10:  # Only meaningful topics
                    topics.append(topic)
        
        return topics[:10]  # Limit to top 10


# Singleton instance
perplexity_service = PerplexityService()