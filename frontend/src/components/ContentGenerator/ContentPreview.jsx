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

const SuggestionCard = ({ suggestion, platform, onEdit, onSave, onSchedule, onPublish, isPublishing, suggestionIndex }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(suggestion.content);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(new Date());

  const handleSaveEdit = () => {
    onEdit(platform, editedContent, suggestionIndex);
    setIsEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestion.content);
  };

  const handleSchedule = () => {
    onSchedule(platform, scheduledTime, suggestionIndex);
    setScheduleDialogOpen(false);
  };

  const characterLimit = platform === 'twitter' ? 280 : 3000;
  const isOverLimit = editedContent.length > characterLimit;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', mb: 2 }}>
      <CardContent sx={{ flexGrow: 1 }}>
        {suggestion.variation_note && (
          <Box sx={{ mb: 2 }}>
            <Chip
              label={suggestion.variation_note}
              color="secondary"
              size="small"
              variant="outlined"
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
            Suggestion {suggestionIndex + 1}
          </Typography>
          <Chip
            label={`${suggestion.character_count}/${characterLimit}`}
            color={suggestion.character_count > characterLimit ? 'error' : 'default'}
            size="small"
          />
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
            {suggestion.content}
          </Typography>
        )}

        {suggestion.hashtags && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Suggested Hashtags:
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {suggestion.hashtags.map((tag, index) => (
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
          <IconButton onClick={handleCopy}>
            <ContentCopy />
          </IconButton>
          <Button
            startIcon={<Save />}
            onClick={() => onSave(platform, suggestionIndex)}
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
            onClick={() => onPublish(platform, suggestionIndex)}
            variant="outlined"
            size="small"
            disabled={isPublishing}
          >
            {isPublishing ? 'Publishing...' : 'Publish Now'}
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

const ContentCard = ({ contentItem, onEdit, onRegenerate, onSave, onSchedule, onPublish, isPublishing }) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
        <PlatformIcon platform={contentItem.platform} />
        <Typography variant="h6" sx={{ ml: 1, textTransform: 'capitalize' }}>
          {contentItem.platform === 'twitter' ? 'X (Twitter)' : 'LinkedIn'}
        </Typography>
        <Box sx={{ ml: 'auto' }}>
          <Button
            startIcon={<Refresh />}
            onClick={() => onRegenerate(contentItem.platform)}
            size="small"
            variant="outlined"
          >
            Regenerate All
          </Button>
        </Box>
      </Box>
      
      {contentItem.suggestions.map((suggestion, index) => (
        <SuggestionCard
          key={index}
          suggestion={suggestion}
          platform={contentItem.platform}
          suggestionIndex={index}
          onEdit={onEdit}
          onSave={onSave}
          onSchedule={onSchedule}
          onPublish={onPublish}
          isPublishing={isPublishing === `${contentItem.platform}-${index}`}
        />
      ))}
    </Box>
  );
};

const ContentPreview = ({ generatedContent, researchData, onBack, onComplete }) => {
  const [content, setContent] = useState(generatedContent);
  const [publishingPlatform, setPublishingPlatform] = useState(null);
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

  const handleEdit = (platform, newContent, suggestionIndex) => {
    setContent(prev => 
      prev.map(item => 
        item.platform === platform 
          ? {
              ...item,
              suggestions: item.suggestions.map((suggestion, index) =>
                index === suggestionIndex
                  ? { ...suggestion, content: newContent, character_count: newContent.length }
                  : suggestion
              )
            }
          : item
      )
    );
  };

  const handleRegenerate = async (platform) => {
    // This would call the API to regenerate content for specific platform
    console.log('Regenerate content for:', platform);
  };

  const handleSave = async (platform, suggestionIndex) => {
    const contentItem = content.find(item => item.platform === platform);
    if (contentItem && contentItem.suggestions[suggestionIndex]) {
      try {
        await saveMutation.mutateAsync({
          topic: researchData?.query || 'Generated Content',
          content: contentItem.suggestions[suggestionIndex].content,
          platform: platform,
          research_data: researchData,
        });
        alert('Content saved successfully!');
      } catch (error) {
        alert('Failed to save content');
      }
    }
  };

  const handleSchedule = async (platform, scheduledTime, suggestionIndex) => {
    // First save the content, then schedule it
    const contentItem = content.find(item => item.platform === platform);
    if (contentItem && contentItem.suggestions[suggestionIndex]) {
      try {
        const savedPost = await saveMutation.mutateAsync({
          topic: researchData?.query || 'Generated Content',
          content: contentItem.suggestions[suggestionIndex].content,
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

  const publishMutation = useMutation({
    mutationFn: scheduleAPI.publishNow,
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
    },
  });

  const handlePublish = async (platform, suggestionIndex) => {
    const contentItem = content.find(item => item.platform === platform);
    if (contentItem && contentItem.suggestions[suggestionIndex]) {
      setPublishingPlatform(`${platform}-${suggestionIndex}`);
      try {
        // First save the content
        const savedPost = await saveMutation.mutateAsync({
          topic: researchData?.query || 'Generated Content',
          content: contentItem.suggestions[suggestionIndex].content,
          platform: platform,
          research_data: researchData,
        });

        // Then publish it immediately
        const publishResult = await publishMutation.mutateAsync(savedPost.data.id);
        
        if (publishResult.data.platform_data?.url) {
          alert(`Content published successfully to ${platform === 'twitter' ? 'X/Twitter' : 'LinkedIn'}!\n\nView at: ${publishResult.data.platform_data.url}`);
        } else {
          alert(`Content published successfully to ${platform === 'twitter' ? 'X/Twitter' : 'LinkedIn'}!`);
        }
      } catch (error) {
        const errorMessage = error.response?.data?.detail || error.message || 'Unknown error';
        alert(`Failed to publish content: ${errorMessage}`);
        console.error('Publish error:', error);
      } finally {
        setPublishingPlatform(null);
      }
    }
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
              contentItem={item}
              onEdit={handleEdit}
              onRegenerate={handleRegenerate}
              onSave={handleSave}
              onSchedule={handleSchedule}
              onPublish={handlePublish}
              isPublishing={publishingPlatform}
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