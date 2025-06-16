import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Twitter,
  LinkedIn,
  Edit,
  Refresh,
  Schedule,
  Publish,
  Save,
  ContentCopy,
} from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contentAPI, scheduleAPI } from '../../services/api';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const PlatformIcon = ({ platform }) => {
  return platform === 'twitter' ? 
    <Twitter color="primary" /> : 
    <LinkedIn color="primary" />;
};

const ContentCard = ({ content, onEdit, onRegenerate, onSave, onSchedule, onPublish }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content.content);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(new Date());

  const handleSaveEdit = () => {
    onEdit(content.platform, editedContent);
    setIsEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content.content);
  };

  const handleSchedule = () => {
    onSchedule(content.platform, scheduledTime);
    setScheduleDialogOpen(false);
  };

  const characterLimit = content.platform === 'twitter' ? 280 : 3000;
  const isOverLimit = editedContent.length > characterLimit;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PlatformIcon platform={content.platform} />
          <Typography variant="h6" sx={{ ml: 1, textTransform: 'capitalize' }}>
            {content.platform === 'twitter' ? 'X (Twitter)' : 'LinkedIn'}
          </Typography>
          <Box sx={{ ml: 'auto' }}>
            <Chip
              label={`${content.character_count}/${characterLimit}`}
              color={content.character_count > characterLimit ? 'error' : 'default'}
              size="small"
            />
          </Box>
        </Box>

        {isEditing ? (
          <Box>
            <TextField
              fullWidth
              multiline
              rows={6}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              error={isOverLimit}
              helperText={isOverLimit ? `Exceeds ${characterLimit} character limit` : ''}
            />
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button onClick={handleSaveEdit} disabled={isOverLimit}>
                Save
              </Button>
              <Button onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-wrap',
              mb: 2,
              p: 2,
              backgroundColor: 'grey.50',
              borderRadius: 1,
              minHeight: 120,
            }}
          >
            {content.content}
          </Typography>
        )}

        {content.hashtags && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Suggested Hashtags:
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {content.hashtags.map((tag, index) => (
                <Chip key={index} label={`#${tag}`} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>

      <Box sx={{ p: 2, pt: 0 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <IconButton onClick={() => setIsEditing(true)} disabled={isEditing}>
            <Edit />
          </IconButton>
          <IconButton onClick={() => onRegenerate(content.platform)}>
            <Refresh />
          </IconButton>
          <IconButton onClick={handleCopy}>
            <ContentCopy />
          </IconButton>
          <Button
            startIcon={<Save />}
            onClick={() => onSave(content.platform)}
            size="small"
          >
            Save
          </Button>
          <Button
            startIcon={<Schedule />}
            onClick={() => setScheduleDialogOpen(true)}
            size="small"
          >
            Schedule
          </Button>
          <Button
            startIcon={<Publish />}
            onClick={() => onPublish(content.platform)}
            variant="outlined"
            size="small"
          >
            Publish Now
          </Button>
        </Box>
      </Box>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)}>
        <DialogTitle>Schedule Post</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Schedule Time"
              value={scheduledTime}
              onChange={setScheduledTime}
              renderInput={(params) => <TextField {...params} fullWidth sx={{ mt: 2 }} />}
              minDateTime={new Date()}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSchedule} variant="contained">Schedule</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

const ContentPreview = ({ generatedContent, researchData, onBack, onComplete }) => {
  const [content, setContent] = useState(generatedContent);
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: contentAPI.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: scheduleAPI.schedulePost,
    onSuccess: () => {
      queryClient.invalidateQueries(['scheduledPosts']);
    },
  });

  const variationsMutation = useMutation({
    mutationFn: ({ postId, count }) => contentAPI.generateVariations(postId, count),
  });

  const handleEdit = (platform, newContent) => {
    setContent(prev => 
      prev.map(item => 
        item.platform === platform 
          ? { ...item, content: newContent, character_count: newContent.length }
          : item
      )
    );
  };

  const handleRegenerate = async (platform) => {
    // This would call the API to regenerate content for specific platform
    console.log('Regenerate content for:', platform);
  };

  const handleSave = async (platform) => {
    const contentItem = content.find(item => item.platform === platform);
    if (contentItem) {
      try {
        await saveMutation.mutateAsync({
          topic: researchData?.query || 'Generated Content',
          content: contentItem.content,
          platform: platform,
          research_data: researchData,
        });
        alert('Content saved successfully!');
      } catch (error) {
        alert('Failed to save content');
      }
    }
  };

  const handleSchedule = async (platform, scheduledTime) => {
    // First save the content, then schedule it
    const contentItem = content.find(item => item.platform === platform);
    if (contentItem) {
      try {
        const savedPost = await saveMutation.mutateAsync({
          topic: researchData?.query || 'Generated Content',
          content: contentItem.content,
          platform: platform,
          research_data: researchData,
        });

        await scheduleMutation.mutateAsync({
          post_id: savedPost.data.id,
          scheduled_time: scheduledTime.toISOString(),
        });

        alert('Content scheduled successfully!');
      } catch (error) {
        alert('Failed to schedule content');
      }
    }
  };

  const handlePublish = async (platform) => {
    // This would publish immediately
    console.log('Publish now:', platform);
    alert('Publishing feature will be implemented with platform integrations');
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review & Edit Your Content
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        Content generated successfully! Review, edit, and choose your next action.
      </Alert>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {content.map((item) => (
          <Grid item xs={12} md={6} key={item.platform}>
            <ContentCard
              content={item}
              onEdit={handleEdit}
              onRegenerate={handleRegenerate}
              onSave={handleSave}
              onSchedule={handleSchedule}
              onPublish={handlePublish}
            />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack}>
          Back to Research
        </Button>
        <Button variant="contained" onClick={onComplete} size="large">
          Create More Content
        </Button>
      </Box>
    </Box>
  );
};

export default ContentPreview;