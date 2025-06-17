import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Twitter,
  LinkedIn,
  Send,
  ContentCopy,
} from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleAPI } from '../../services/api';

const PlatformIcon = ({ platform }) => {
  return platform === 'twitter' ? 
    <Twitter color="primary" /> : 
    <LinkedIn color="primary" />;
};

const QuickPost = () => {
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('twitter');
  const [topic, setTopic] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const queryClient = useQueryClient();

  const quickPostMutation = useMutation({
    mutationFn: scheduleAPI.quickPost,
    onSuccess: (response) => {
      queryClient.invalidateQueries(['posts']);
      setSuccessData(response.data);
      setSuccessDialog(true);
      // Reset form
      setContent('');
      setTopic('');
      setPlatform('twitter');
    },
    onError: (error) => {
      console.error('Quick post error:', error);
    },
  });

  const handlePost = async () => {
    if (!content.trim()) {
      alert('Please enter some content to post');
      return;
    }

    if (!topic.trim()) {
      alert('Please enter a topic for your post');
      return;
    }

    setIsPosting(true);
    try {
      await quickPostMutation.mutateAsync({
        topic: topic.trim(),
        content: content.trim(),
        platform: platform,
        research_data: null,
      });
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to post';
      alert(`Failed to post: ${errorMessage}`);
    } finally {
      setIsPosting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    alert('Content copied to clipboard!');
  };

  const characterLimit = platform === 'twitter' ? 280 : 3000;
  const isOverLimit = content.length > characterLimit;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Quick Post
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Create and publish content directly without research or AI generation.
      </Typography>

      <Card>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Topic"
              placeholder="What's your post about?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Platform</InputLabel>
              <Select
                value={platform}
                label="Platform"
                onChange={(e) => setPlatform(e.target.value)}
              >
                <MenuItem value="twitter">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Twitter /> X (Twitter)
                  </Box>
                </MenuItem>
                <MenuItem value="linkedin">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinkedIn /> LinkedIn
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PlatformIcon platform={platform} />
              <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
                {platform === 'twitter' ? 'X (Twitter)' : 'LinkedIn'} Post
              </Typography>
              <Chip
                label={`${content.length}/${characterLimit}`}
                color={isOverLimit ? 'error' : content.length > characterLimit * 0.8 ? 'warning' : 'default'}
                size="small"
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={8}
              label="Content"
              placeholder={`Write your ${platform === 'twitter' ? 'tweet' : 'LinkedIn post'} here...`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              error={isOverLimit}
              helperText={
                isOverLimit 
                  ? `Exceeds ${characterLimit} character limit` 
                  : `${characterLimit - content.length} characters remaining`
              }
              sx={{
                '& .MuiInputBase-root': {
                  fontFamily: 'monospace',
                },
              }}
            />
          </Box>

          {content && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Preview:
              </Typography>
              <Box
                sx={{
                  p: 2,
                  backgroundColor: 'grey.50',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.300',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                }}
              >
                {content}
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              startIcon={<ContentCopy />}
              onClick={handleCopy}
              disabled={!content.trim()}
            >
              Copy
            </Button>
            <Button
              variant="contained"
              startIcon={isPosting ? <CircularProgress size={20} /> : <Send />}
              onClick={handlePost}
              disabled={!content.trim() || !topic.trim() || isOverLimit || isPosting}
              size="large"
            >
              {isPosting ? 'Posting...' : 'Post Now'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={successDialog} onClose={() => setSuccessDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PlatformIcon platform={platform} />
            Post Published Successfully!
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            Your post has been published to {platform === 'twitter' ? 'X/Twitter' : 'LinkedIn'}!
          </Alert>
          
          {successData?.platform_data?.url && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                View your post:
              </Typography>
              <Button
                variant="outlined"
                href={successData.platform_data.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open on {platform === 'twitter' ? 'X/Twitter' : 'LinkedIn'}
              </Button>
            </Box>
          )}

          {successData?.post && (
            <Box>
              <Typography variant="body2" gutterBottom>
                Post Details:
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Post ID: {successData.post.id}
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                Platform Post ID: {successData.post.platform_post_id}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessDialog(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setSuccessDialog(false);
              // Optionally navigate to posts page or create another post
            }}
          >
            Create Another Post
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuickPost;