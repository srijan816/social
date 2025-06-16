from typing import Optional, Dict, Any
import requests
from app.core.config import settings


class LinkedInService:
    def __init__(self, access_token: Optional[str] = None):
        self.access_token = access_token
        self.base_url = "https://api.linkedin.com/v2"
        self.headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
            "LinkedIn-Version": "202401",
            "X-Restli-Protocol-Version": "2.0.0"
        }
    
    async def post_to_linkedin(self, content: str, user_id: str) -> Dict[str, Any]:
        """Post content to LinkedIn"""
        
        if not self.access_token:
            raise Exception("LinkedIn access token not configured")
        
        try:
            # Prepare the post data
            post_data = {
                "author": f"urn:li:person:{user_id}",
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": {
                        "shareCommentary": {
                            "text": content
                        },
                        "shareMediaCategory": "NONE"
                    }
                },
                "visibility": {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            }
            
            response = requests.post(
                f"{self.base_url}/ugcPosts",
                headers=self.headers,
                json=post_data
            )
            
            if response.status_code == 201:
                post_id = response.headers.get('x-linkedin-id')
                return {
                    "success": True,
                    "platform_post_id": post_id,
                    "url": f"https://www.linkedin.com/feed/update/{post_id}/",
                    "content": content
                }
            else:
                return {
                    "success": False,
                    "error": f"LinkedIn API error: {response.status_code} - {response.text}",
                    "content": content
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "content": content
            }
    
    async def get_user_info(self) -> Dict[str, Any]:
        """Get LinkedIn user information"""
        
        if not self.access_token:
            raise Exception("LinkedIn access token not configured")
        
        try:
            response = requests.get(
                f"{self.base_url}/people/~:(id,firstName,lastName,profilePicture(displayImage~:playableStreams))",
                headers=self.headers
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"LinkedIn API error: {response.status_code}")
                
        except Exception as e:
            raise Exception(f"Error fetching LinkedIn user info: {e}")
    
    async def get_post_metrics(self, post_id: str) -> Dict[str, Any]:
        """Get metrics for a specific LinkedIn post"""
        
        if not self.access_token:
            raise Exception("LinkedIn access token not configured")
        
        try:
            # Note: LinkedIn API has limited analytics access
            # This is a simplified version
            response = requests.get(
                f"{self.base_url}/ugcPosts/{post_id}",
                headers=self.headers
            )
            
            if response.status_code == 200:
                # LinkedIn doesn't provide public metrics easily
                # This would require additional API calls and permissions
                return {
                    "likes": 0,
                    "shares": 0,
                    "comments": 0,
                    "impressions": 0
                }
            
            return {"likes": 0, "shares": 0, "comments": 0, "impressions": 0}
            
        except Exception as e:
            print(f"Error fetching LinkedIn metrics: {e}")
            return {"likes": 0, "shares": 0, "comments": 0, "impressions": 0}
    
    async def validate_credentials(self) -> bool:
        """Validate LinkedIn API credentials"""
        
        if not self.access_token:
            return False
        
        try:
            response = requests.get(
                f"{self.base_url}/people/~:(id)",
                headers=self.headers
            )
            return response.status_code == 200
        except:
            return False
    
    def get_character_limit(self) -> int:
        """Get character limit for LinkedIn posts"""
        return 3000  # LinkedIn has a 3000 character limit
    
    def format_content(self, content: str, hashtags: Optional[list] = None) -> str:
        """Format content for LinkedIn with hashtags"""
        
        formatted_content = content
        
        if hashtags:
            # Add hashtags at the end for LinkedIn
            hashtag_text = "\n\n" + " ".join([f"#{tag}" for tag in hashtags])
            
            # Check if it fits within character limit
            if len(formatted_content + hashtag_text) <= 3000:
                formatted_content += hashtag_text
        
        # Ensure within character limit
        if len(formatted_content) > 3000:
            formatted_content = formatted_content[:2997] + "..."
        
        return formatted_content
    
    def extract_hashtags(self, content: str) -> list:
        """Extract hashtags from content"""
        import re
        
        hashtags = re.findall(r'#(\w+)', content)
        return hashtags[:5]  # LinkedIn recommends 3-5 hashtags