import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  TrendingUp,
  Schedule,
  Create,
  Twitter,
  LinkedIn,
  Analytics,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contentAPI, scheduleAPI } from '../services/api';

const StatCard = ({ title, value, icon, color = 'primary' }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h4" component="h2">
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}.light`,
            borderRadius: 2,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const RecentPost = ({ post }) => (
  <ListItem>
    <ListItemIcon>
      {post.platform === 'twitter' ? <Twitter /> : <LinkedIn />}
    </ListItemIcon>
    <ListItemText
      primary={post.topic}
      secondary={
        <Box>
          <Typography variant="body2" color="text.secondary">
            {post.content.substring(0, 100)}...
          </Typography>
          <Chip
            label={post.status}
            size="small"
            color={post.status === 'published' ? 'success' : 'default'}
            sx={{ mt: 1 }}
          />
        </Box>
      }
    />
  </ListItem>
);

const Dashboard = () => {
  const navigate = useNavigate();

  // Fetch recent posts
  const { data: postsData } = useQuery({
    queryKey: ['posts', { limit: 5 }],
    queryFn: () => contentAPI.getPosts({ limit: 5 }),
  });

  // Fetch scheduled posts
  const { data: scheduledData } = useQuery({
    queryKey: ['scheduledPosts', { limit: 5 }],
    queryFn: () => scheduleAPI.getScheduledPosts({ limit: 5 }),
  });

  const posts = postsData?.data || [];
  const scheduledPosts = scheduledData?.data || [];

  const stats = {
    totalPosts: posts.length,
    scheduledPosts: scheduledPosts.length,
    publishedToday: posts.filter(p => {
      const today = new Date().toDateString();
      return p.published_at && new Date(p.published_at).toDateString() === today;
    }).length,
    avgEngagement: '12.5%', // Placeholder
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Posts"
            value={stats.totalPosts}
            icon={<Analytics />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Scheduled"
            value={stats.scheduledPosts}
            icon={<Schedule />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Published Today"
            value={stats.publishedToday}
            icon={<TrendingUp />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Engagement"
            value={stats.avgEngagement}
            icon={<Analytics />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Create />}
                onClick={() => navigate('/generate')}
              >
                Generate Content
              </Button>
              <Button
                variant="outlined"
                startIcon={<Schedule />}
                onClick={() => navigate('/schedule')}
              >
                View Schedule
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Platform Status
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<Twitter />}
                label="Twitter Connected"
                color="success"
                variant="outlined"
              />
              <Chip
                icon={<LinkedIn />}
                label="LinkedIn Connected"
                color="success"
                variant="outlined"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Posts
            </Typography>
            {posts.length > 0 ? (
              <List>
                {posts.slice(0, 5).map((post) => (
                  <RecentPost key={post.id} post={post} />
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                No posts yet. Start by generating some content!
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Posts
            </Typography>
            {scheduledPosts.length > 0 ? (
              <List>
                {scheduledPosts.slice(0, 5).map((scheduled) => (
                  <ListItem key={scheduled.id}>
                    <ListItemText
                      primary={scheduled.post?.topic || 'Scheduled Post'}
                      secondary={new Date(scheduled.scheduled_time).toLocaleString()}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                No scheduled posts. Schedule some content to see them here.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;