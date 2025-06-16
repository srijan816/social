import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Skeleton,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Search,
  TrendingUp,
  Source,
  ExpandMore,
} from '@mui/icons-material';

const ResearchPreview = ({ 
  topic, 
  additionalContext, 
  onResearchComplete, 
  onNext, 
  onBack, 
  loading 
}) => {
  const [researchData, setResearchData] = useState(null);
  const [researchLoading, setResearchLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResearch = async () => {
      setResearchLoading(true);
      setError(null);
      
      try {
        // Simulate research API call
        // In real implementation, this would call the Perplexity API
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockResearchData = {
          query: topic,
          findings: [
            `Recent studies show significant growth in ${topic} market by 45% in 2024`,
            `Industry experts predict ${topic} will reshape business operations`,
            `Leading companies are investing heavily in ${topic} technologies`,
            `Consumer adoption of ${topic} increased by 60% year-over-year`,
            `Research indicates ${topic} can improve efficiency by up to 30%`
          ],
          sources: [
            "TechCrunch - Industry Analysis 2024",
            "Harvard Business Review - Digital Transformation",
            "McKinsey Global Institute - Technology Report"
          ],
          timestamp: new Date().toISOString()
        };
        
        setResearchData(mockResearchData);
        onResearchComplete(mockResearchData);
      } catch (err) {
        setError('Failed to fetch research data. You can still proceed with content generation.');
      }
      
      setResearchLoading(false);
    };

    if (topic) {
      fetchResearch();
    }
  }, [topic, additionalContext, onResearchComplete]);

  if (researchLoading) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          <Search sx={{ mr: 1, verticalAlign: 'middle' }} />
          Researching: "{topic}"
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          AI is gathering the latest insights and data about your topic...
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={40} sx={{ mb: 1 }} />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={onBack}>
            Back
          </Button>
          <Button disabled>
            Researching...
          </Button>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Research Status
        </Typography>
        
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={onBack}>
            Back
          </Button>
          <Button 
            variant="contained" 
            onClick={onNext}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Proceed Without Research'}
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
        Research Insights for "{topic}"
      </Typography>

      {researchData && (
        <>
          <Accordion defaultExpanded sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1">
                Key Findings ({researchData.findings.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {researchData.findings.map((finding, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <TrendingUp color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={finding} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1">
                <Source sx={{ mr: 1, verticalAlign: 'middle' }} />
                Sources ({researchData.sources.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {researchData.sources.map((source, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Source />
                    </ListItemIcon>
                    <ListItemText primary={source} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          <Alert severity="success" sx={{ mb: 3 }}>
            Research complete! This data will be used to create compelling, fact-based content.
          </Alert>
        </>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack}>
          Back
        </Button>
        <Button 
          variant="contained" 
          onClick={onNext}
          disabled={loading}
          size="large"
        >
          {loading ? 'Generating Content...' : 'Generate Content'}
        </Button>
      </Box>
    </Box>
  );
};

export default ResearchPreview;