from typing import Optional, Dict, Any
import tweepy
from app.core.config import settings


class XService:
    def __init__(
        self,
        access_token: Optional[str] = None,
        access_token_secret: Optional[str] = None
    ):
        self.api_key = settings.TWITTER_API_KEY
        self.api_secret = settings.TWITTER_API_SECRET
        self.access_token = access_token or settings.TWITTER_ACCESS_TOKEN
        self.access_token_secret = access_token_secret or settings.TWITTER_ACCESS_TOKEN_SECRET
        
        if all([self.api_key, self.api_secret, self.access_token, self.access_token_secret]):
            self.client = tweepy.Client(
                consumer_key=self.api_key,
                consumer_secret=self.api_secret,
                access_token=self.access_token,
                access_token_secret=self.access_token_secret,
                wait_on_rate_limit=True
            )
        else:
            self.client = None
    
    async def post_tweet(self, content: str) -> Dict[str, Any]:
        """Post a tweet to X"""
        
        if not self.client:
            raise Exception("X API credentials not configured")
        
        try:
            # Ensure content is within character limit
            if len(content) > 280:
                content = content[:277] + "..."
            
            response = self.client.create_tweet(text=content)
            
            return {
                "success": True,
                "platform_post_id": str(response.data['id']),
                "url": f"https://twitter.com/i/status/{response.data['id']}",
                "content": content
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "content": content
            }
    
    async def get_post_metrics(self, post_id: str) -> Dict[str, Any]:
        """Get metrics for a specific tweet"""
        
        if not self.client:
            raise Exception("X API credentials not configured")
        
        try:
            tweet = self.client.get_tweet(
                id=post_id,
                tweet_fields=['public_metrics']
            )
            
            if tweet.data:
                metrics = tweet.data.public_metrics
                return {
                    "likes": metrics.get('like_count', 0),
                    "shares": metrics.get('retweet_count', 0),
                    "comments": metrics.get('reply_count', 0),
                    "impressions": metrics.get('impression_count', 0)
                }
            
            return {"likes": 0, "shares": 0, "comments": 0, "impressions": 0}
            
        except Exception as e:
            print(f"Error fetching X metrics: {e}")
            return {"likes": 0, "shares": 0, "comments": 0, "impressions": 0}
    
    async def validate_credentials(self) -> bool:
        """Validate X API credentials"""
        
        if not self.client:
            return False
        
        try:
            me = self.client.get_me()
            return me.data is not None
        except:
            return False
    
    def get_character_limit(self) -> int:
        """Get character limit for X posts"""
        return 280
    
    def format_content(self, content: str, hashtags: Optional[list] = None) -> str:
        """Format content for X with hashtags"""
        
        formatted_content = content
        
        if hashtags:
            # Add hashtags at the end
            hashtag_text = " " + " ".join([f"#{tag}" for tag in hashtags])
            
            # Check if it fits within character limit
            if len(formatted_content + hashtag_text) <= 280:
                formatted_content += hashtag_text
        
        # Ensure within character limit
        if len(formatted_content) > 280:
            formatted_content = formatted_content[:277] + "..."
        
        return formatted_content