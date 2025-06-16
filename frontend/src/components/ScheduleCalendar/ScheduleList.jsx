import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Chip,
  Button,
  Menu,
  MenuItem,
  Alert,
  Divider,
} from '@mui/material';
import {
  Twitter,
  LinkedIn,
  MoreVert,
  Edit,
  Delete,
  Schedule,
  Publish,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleAPI } from '../../services/api';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';

const ScheduleList = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const queryClient = useQueryClient();

  const { data: scheduledPosts, isLoading } = useQuery({
    queryKey: ['scheduledPosts'],
    queryFn: () => scheduleAPI.getScheduledPosts({ limit: 50 }),
  });

  const cancelMutation = useMutation({
    mutationFn: scheduleAPI.cancelScheduledPost,
    onSuccess: () => {
      queryClient.invalidateQueries(['scheduledPosts']);
      queryClient.invalidateQueries(['calendar']);
    },
  });

  const publishMutation = useMutation({
    mutationFn: scheduleAPI.publishNow,
    onSuccess: () => {
      queryClient.invalidateQueries(['scheduledPosts']);
      queryClient.invalidateQueries(['posts']);
    },
  });

  const handleMenuClick = (event, post) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPost(null);
  };

  const handleCancelPost = async () => {
    if (selectedPost) {
      await cancelMutation.mutateAsync(selectedPost.id);
      handleMenuClose();
    }
  };

  const handlePublishNow = async () => {
    if (selectedPost?.post) {
      await publishMutation.mutateAsync(selectedPost.post.id);
      handleMenuClose();
    }
  };

  const formatScheduledTime = (dateString) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'h:mm a')}`;
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE \'at\' h:mm a');
    } else {
      return format(date, 'MMM d \'at\' h:mm a');
    }
  };

  const groupPostsByTime = (posts) => {
    const groups = {
      today: [],
      tomorrow: [],
      thisWeek: [],
      later: [],
    };

    posts.forEach(post => {
      const date = new Date(post.scheduled_time);
      
      if (isToday(date)) {
        groups.today.push(post);
      } else if (isTomorrow(date)) {
        groups.tomorrow.push(post);
      } else if (isThisWeek(date)) {
        groups.thisWeek.push(post);
      } else {
        groups.later.push(post);
      }
    });

    return groups;
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading scheduled posts...</Typography>
      </Box>
    );
  }

  const posts = scheduledPosts?.data || [];
  
  if (posts.length === 0) {
    return (
      <Alert severity="info">
        No scheduled posts found. Create some content and schedule it to see posts here.
      </Alert>
    );
  }

  const groupedPosts = groupPostsByTime(posts);

  const renderPostGroup = (title, posts) => {
    if (posts.length === 0) return null;

    return (
      <Box key={title} sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary' }}>
          {title}
        </Typography>
        <List>
          {posts.map((post, index) => (
            <ListItem
              key={post.id}
              sx={{
                border: 1,
                borderColor: 'grey.200',
                borderRadius: 1,
                mb: 1,
                backgroundColor: 'background.paper',
              }}
            >
              <ListItemIcon>
                {post.post?.platform === 'twitter' ? (
                  <Twitter color="primary" />
                ) : (
                  <LinkedIn color="primary" />
                )}
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">
                      {post.post?.topic || 'Scheduled Post'}
                    </Typography>
                    <Chip
                      label={post.post?.platform === 'twitter' ? 'X' : 'LinkedIn'}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      <Schedule sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                      {formatScheduledTime(post.scheduled_time)}
                    </Typography>
                    {post.post?.content && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mt: 1, 
                          color: 'text.secondary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {post.post.content}
                      </Typography>
                    )}
                    {post.error_message && (
                      <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        Error: {post.error_message}
                      </Typography>
                    )}
                  </Box>
                }
              />
              
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={(e) => handleMenuClick(e, post)}
                >
                  <MoreVert />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        {title !== 'Later' && <Divider sx={{ my: 2 }} />}
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Scheduled Posts ({posts.length})
      </Typography>

      {renderPostGroup('Today', groupedPosts.today)}
      {renderPostGroup('Tomorrow', groupedPosts.tomorrow)}
      {renderPostGroup('This Week', groupedPosts.thisWeek)}
      {renderPostGroup('Later', groupedPosts.later)}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => console.log('Edit post')}>
          <Edit sx={{ mr: 1 }} />
          Edit Post
        </MenuItem>
        <MenuItem onClick={handlePublishNow} disabled={publishMutation.isLoading}>
          <Publish sx={{ mr: 1 }} />
          Publish Now
        </MenuItem>
        <MenuItem 
          onClick={handleCancelPost} 
          disabled={cancelMutation.isLoading}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          Cancel Schedule
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ScheduleList;