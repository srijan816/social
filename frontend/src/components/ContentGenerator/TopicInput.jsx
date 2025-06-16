import React from 'react';
import {
  Box,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Typography,
  Paper,
  Chip,
  Grid,
} from '@mui/material';
import { Twitter, LinkedIn, TrendingUp } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { contentAPI } from '../../services/api';

const TopicInput = ({ formData, onUpdate, onNext }) => {
  const { data: trendingTopics } = useQuery({
    queryKey: ['trendingTopics'],
    queryFn: () => contentAPI.getTrendingTopics(),
  });

  const handlePlatformChange = (platform) => {
    const newPlatforms = formData.platforms.includes(platform)
      ? formData.platforms.filter(p => p !== platform)
      : [...formData.platforms, platform];
    onUpdate({ platforms: newPlatforms });
  };

  const handleTopicSelect = (topic) => {
    onUpdate({ topic });
  };

  const canProceed = formData.topic.trim().length > 0 && formData.platforms.length > 0;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        What would you like to create content about?
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            label="Topic or Theme"
            placeholder="e.g., AI trends in 2024, productivity tips, startup advice..."
            value={formData.topic}
            onChange={(e) => onUpdate({ topic: e.target.value })}
            multiline
            rows={3}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Additional Context (Optional)"
            placeholder="Any specific angle, audience, or details you want to include..."
            value={formData.additionalContext}
            onChange={(e) => onUpdate({ additionalContext: e.target.value })}
            multiline
            rows={2}
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle1" gutterBottom>
            Select Platforms
          </Typography>
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.platforms.includes('twitter')}
                  onChange={() => handlePlatformChange('twitter')}
                  icon={<Twitter />}
                  checkedIcon={<Twitter />}
                />
              }
              label="X (Twitter) - Punchy, data-driven posts"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.platforms.includes('linkedin')}
                  onChange={() => handlePlatformChange('linkedin')}
                  icon={<LinkedIn />}
                  checkedIcon={<LinkedIn />}
                />
              }
              label="LinkedIn - Professional insights"
            />
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.includeResearch}
                onChange={(e) => onUpdate({ includeResearch: e.target.checked })}
              />
            }
            label="Include AI research (recommended)"
            sx={{ mb: 3 }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
            <Typography variant="subtitle1" gutterBottom>
              <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
              Trending Topics
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {trendingTopics?.data?.topics?.slice(0, 8).map((topic, index) => (
                <Chip
                  key={index}
                  label={topic}
                  variant="outlined"
                  clickable
                  size="small"
                  onClick={() => handleTopicSelect(topic)}
                  sx={{ justifyContent: 'flex-start' }}
                />
              )) || (
                <Typography variant="body2" color="text.secondary">
                  Loading trending topics...
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="contained"
          onClick={onNext}
          disabled={!canProceed}
          size="large"
        >
          Continue to Research
        </Button>
      </Box>
    </Box>
  );
};

export default TopicInput;