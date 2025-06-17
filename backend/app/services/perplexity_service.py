from typing import Dict, Any, List, Optional
from openai import OpenAI
from datetime import datetime
import json
import time

from app.core.config import settings


class PerplexityService:
    def __init__(self, api_key: Optional[str] = None):
        self.client = None
        self.initialization_error = None
        
        api_key_to_use = api_key or settings.PERPLEXITY_API_KEY
        if not api_key_to_use:
            self.initialization_error = "No Perplexity API key provided"
            print(f"Warning: {self.initialization_error}")
            return
            
        try:
            self.client = OpenAI(
                api_key=api_key_to_use,
                base_url="https://api.perplexity.ai"
            )
            print("✅ Perplexity client initialized successfully")
        except Exception as e:
            self.initialization_error = f"Failed to initialize Perplexity client: {e}"
            print(f"❌ {self.initialization_error}")
            self.client = None
    
    async def research_topic(
        self,
        topic: str,
        additional_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Research a topic using Perplexity API"""
        
        if not self.client:
            raise Exception(f"Perplexity client not available: {self.initialization_error}")
        
        # Build research query
        query = self._build_research_query(topic, additional_context)
        
        print(f"🔍 Starting research for '{topic}' using model: {settings.PERPLEXITY_MODEL}")
        start_time = time.time()
        
        try:
            response = self.client.chat.completions.create(
                model=settings.PERPLEXITY_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": """You are an expert researcher specializing in social media content. Focus on:

FACTS & DATA:
- Latest statistics and numbers (with dates)
- Key metrics and percentages
- Recent research findings

TRENDS & INSIGHTS:
- Current developments (last 6 months)
- Industry perspectives
- Notable changes or shifts

Keep responses concise, factual, and source-backed. Prioritize recent, actionable information over general knowledge."""
                    },
                    {
                        "role": "user",
                        "content": query
                    }
                ],
                temperature=0.1,  # Even lower temperature for more factual content
                max_tokens=1500,  # Reduced tokens for faster response
                timeout=20  # Reduced timeout for faster response
            )
            
            content = response.choices[0].message.content
            
            # Get search results if available (newer Perplexity API feature)
            search_results = None
            if hasattr(response, 'search_results'):
                search_results = response.search_results
            elif hasattr(response, 'choices') and len(response.choices) > 0:
                # Check if search_results are embedded in the response object
                choice = response.choices[0]
                if hasattr(choice, 'search_results'):
                    search_results = choice.search_results
            
            # Parse the research response
            research_data = self._parse_research_response(content, topic, search_results)
            
            # Log performance metrics
            end_time = time.time()
            duration = round(end_time - start_time, 2)
            findings_count = len(research_data.get('findings', []))
            sources_count = len(research_data.get('sources', []))
            
            print(f"✅ Research completed for '{topic}' in {duration}s - {findings_count} findings, {sources_count} sources")
            
            return research_data
            
        except Exception as e:
            error_msg = str(e)
            print(f"❌ Perplexity API error for '{topic}': {error_msg}")
            
            # Provide more specific error messages
            if "timeout" in error_msg.lower():
                raise Exception(f"Research request timed out for '{topic}'. The topic might be too complex or the service is busy.")
            elif "rate_limit" in error_msg.lower() or "429" in error_msg:
                raise Exception(f"Rate limit exceeded. Please wait a moment before trying again.")
            elif "authentication" in error_msg.lower() or "401" in error_msg:
                raise Exception(f"Perplexity API authentication failed. Please check your API key.")
            else:
                raise Exception(f"Research failed for '{topic}': {error_msg}")
    
    def _build_research_query(
        self,
        topic: str,
        additional_context: Optional[str] = None
    ) -> str:
        """Build a comprehensive research query"""
        
        query_parts = [
            f"Research: {topic}",
            "",
            "Focus on:",
            "• Recent statistics (2024-2025) with specific numbers",
            "• Latest developments and news",
            "• Key trends and market insights",
            "• Expert quotes or industry perspectives",
            "",
            "Prioritize: Current data, specific metrics, actionable insights for social media content."
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
        topic: str,
        search_results: Optional[List[Dict[str, Any]]] = None
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
                
            # Look for statistical data, facts, or insights (improved keywords)
            if any(keyword in line.lower() for keyword in [
                'according to', 'study shows', 'research indicates', 'data reveals', 
                'statistics show', 'recent survey', 'report found', 'analysis shows',
                '%', 'percent', 'million', 'billion', 'trillion', 'thousand',
                'increase', 'decrease', 'growth', 'decline', 'rose by', 'fell by',
                '2024', '2025', 'this year', 'last year', 'quarterly', 'annually'
            ]):
                if len(line) > 15 and len(line) < 300:  # Filter reasonable length
                    findings.append(line)
            
            # Look for source indicators
            if any(keyword in line.lower() for keyword in [
                'source:', 'according to', 'study by', 'research from'
            ]):
                sources.append(line)
        
        # If search_results are available, extract additional sources
        if search_results:
            for result in search_results[:3]:  # Limit to top 3 search results
                if 'title' in result:
                    sources.append(result['title'])
                elif 'url' in result:
                    sources.append(result['url'])
        
        # Limit findings and sources
        findings = findings[:5]
        sources = sources[:5]  # Increased from 3 to 5 to include search results
        
        # If no specific findings found, extract key sentences
        if not findings:
            sentences = content.split('.')
            findings = [
                sentence.strip() + '.'
                for sentence in sentences
                if len(sentence.strip()) > 20 and len(sentence.strip()) < 200
            ][:5]
        
        result = {
            "query": topic,
            "findings": findings,
            "sources": sources,
            "full_content": content,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Add search results if available
        if search_results:
            result["search_results"] = search_results
            
        return result
    
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
                temperature=0.2,
                max_tokens=800,
                timeout=15
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