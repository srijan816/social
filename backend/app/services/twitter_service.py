from typing import Dict, Any, Optional
import tweepy
from datetime import datetime

from app.core.config import settings


class TwitterService:
    def __init__(
        self,
        api_key: Optional[str] = None,
        api_secret: Optional[str] = None,
        access_token: Optional[str] = None,
        access_token_secret: Optional[str] = None
    ):
        """Initialize Twitter service with API credentials"""
        self.api_key = api_key or settings.TWITTER_API_KEY
        self.api_secret = api_secret or settings.TWITTER_API_SECRET
        self.access_token = access_token or settings.TWITTER_ACCESS_TOKEN
        self.access_token_secret = access_token_secret or settings.TWITTER_ACCESS_TOKEN_SECRET
        
        self.client = None
        self.api = None
        self.initialization_error = None
        
        if not all([self.api_key, self.api_secret, self.access_token, self.access_token_secret]):
            self.initialization_error = "Missing Twitter API credentials"
            print(f"⚠️  {self.initialization_error}")
            return
            
        try:
            # Initialize Twitter API v2 client for posting
            self.client = tweepy.Client(
                consumer_key=self.api_key,
                consumer_secret=self.api_secret,
                access_token=self.access_token,
                access_token_secret=self.access_token_secret,
                wait_on_rate_limit=True
            )
            
            # Initialize API v1.1 for legacy operations if needed
            auth = tweepy.OAuth1UserHandler(
                self.api_key,
                self.api_secret,
                self.access_token,
                self.access_token_secret
            )
            self.api = tweepy.API(auth, wait_on_rate_limit=True)
            
            print("✅ Twitter/X client initialized successfully")
            
        except Exception as e:
            self.initialization_error = f"Failed to initialize Twitter client: {e}"
            print(f"❌ {self.initialization_error}")
            self.client = None
            self.api = None
    
    def is_available(self) -> bool:
        """Check if Twitter service is available"""
        return self.client is not None and self.api is not None
    
    async def test_connection(self) -> Dict[str, Any]:
        """Test Twitter API connection"""
        if not self.is_available():
            return {
                "success": False,
                "error": self.initialization_error or "Twitter client not initialized"
            }
        
        try:
            # Test by getting user info
            me = self.api.verify_credentials()
            return {
                "success": True,
                "user": {
                    "screen_name": me.screen_name,
                    "name": me.name,
                    "followers_count": me.followers_count,
                    "friends_count": me.friends_count
                }
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Twitter API test failed: {str(e)}"
            }
    
    async def publish_tweet(self, content: str) -> Dict[str, Any]:
        """Publish a tweet to X/Twitter"""
        if not self.is_available():
            raise Exception(self.initialization_error or "Twitter client not initialized")
        
        try:
            # Check tweet length (X allows 280 characters)
            if len(content) > 280:
                raise Exception(f"Tweet too long: {len(content)} characters (max 280)")
            
            # Post the tweet using API v2
            response = self.client.create_tweet(text=content)
            
            if response.data:
                tweet_id = response.data['id']
                tweet_url = f"https://x.com/i/status/{tweet_id}"
                
                return {
                    "success": True,
                    "platform_post_id": tweet_id,
                    "url": tweet_url,
                    "published_at": datetime.utcnow().isoformat(),
                    "platform": "twitter"
                }
            else:
                raise Exception("Failed to create tweet - no response data")
                
        except Exception as e:
            error_msg = str(e)
            print(f"❌ Twitter publishing failed: {error_msg}")
            raise Exception(f"Failed to publish tweet: {error_msg}")
    
    async def delete_tweet(self, tweet_id: str) -> Dict[str, Any]:
        """Delete a tweet from X/Twitter"""
        if not self.is_available():
            raise Exception(self.initialization_error or "Twitter client not initialized")
        
        try:
            response = self.client.delete_tweet(tweet_id)
            
            return {
                "success": True,
                "deleted_tweet_id": tweet_id,
                "deleted_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            error_msg = str(e)
            print(f"❌ Twitter deletion failed: {error_msg}")
            raise Exception(f"Failed to delete tweet: {error_msg}")
    
    async def get_tweet_stats(self, tweet_id: str) -> Dict[str, Any]:
        """Get engagement stats for a tweet"""
        if not self.is_available():
            raise Exception(self.initialization_error or "Twitter client not initialized")
        
        try:
            # Get tweet with metrics
            tweet = self.client.get_tweet(
                tweet_id,
                tweet_fields=['public_metrics', 'created_at', 'author_id']
            )
            
            if tweet.data:
                metrics = tweet.data.public_metrics
                return {
                    "success": True,
                    "tweet_id": tweet_id,
                    "metrics": {
                        "retweet_count": metrics.get('retweet_count', 0),
                        "like_count": metrics.get('like_count', 0),
                        "reply_count": metrics.get('reply_count', 0),
                        "quote_count": metrics.get('quote_count', 0),
                        "impression_count": metrics.get('impression_count', 0)
                    },
                    "created_at": tweet.data.created_at.isoformat() if tweet.data.created_at else None
                }
            else:
                raise Exception("Tweet not found")
                
        except Exception as e:
            error_msg = str(e)
            print(f"❌ Twitter stats retrieval failed: {error_msg}")
            raise Exception(f"Failed to get tweet stats: {error_msg}")
    
    def get_rate_limit_status(self) -> Dict[str, Any]:
        """Get current rate limit status"""
        if not self.is_available():
            return {"error": "Twitter client not available"}
        
        try:
            # Get rate limit status for tweet creation
            rate_limit = self.api.get_rate_limit_status()
            tweets_limit = rate_limit['resources']['statuses']['/statuses/update']
            
            return {
                "success": True,
                "tweets": {
                    "limit": tweets_limit['limit'],
                    "remaining": tweets_limit['remaining'],
                    "reset_time": tweets_limit['reset']
                }
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to get rate limit: {str(e)}"
            }


# Singleton instance
twitter_service = TwitterService()