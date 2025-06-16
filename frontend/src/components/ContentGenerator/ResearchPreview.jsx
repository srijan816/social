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
  TextField,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Search,
  TrendingUp,
  Source,
  ExpandMore,
  Edit,
  Save,
  Cancel,
} from '@mui/icons-material';
import { contentAPI } from '../../services/api';

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
  const [useAIResearch, setUseAIResearch] = useState(false);
  const [customResearch, setCustomResearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedResearch, setEditedResearch] = useState('');

  useEffect(() => {
    const fetchResearch = async () => {
      if (!useAIResearch) {
        // Use custom research if provided
        if (customResearch.trim()) {
          const customData = {
            query: topic,
            findings: customResearch.split('\n').filter(line => line.trim()).slice(0, 5),
            sources: ['User provided research'],
            full_content: customResearch,
            timestamp: new Date().toISOString()
          };
          setResearchData(customData);
          onResearchComplete(customData);
        } else {
          setResearchData(null);
          onResearchComplete(null);
        }
        return;
      }

      setResearchLoading(true);
      setError(null);
      
      try {
        console.log('Researching topic:', topic);
        
        const response = await contentAPI.researchTopic({
          topic: topic,
          additional_context: additionalContext
        });
        
        console.log('Research response:', response.data);
        
        // Append AI research to existing custom research
        const combinedResearch = customResearch.trim() 
          ? `${customResearch}\n\n--- AI Research ---\n${response.data.full_content || ''}`
          : response.data.full_content || '';
        
        const combinedData = {
          ...response.data,
          full_content: combinedResearch
        };
        
        setResearchData(combinedData);
        setEditedResearch(combinedResearch);
        setCustomResearch(combinedResearch);
        onResearchComplete(combinedData);
      } catch (err) {
        console.error('Research failed:', err);
        setError(
          `Failed to fetch research data: ${err.response?.data?.detail || err.message}. You can still proceed with content generation.`
        );
      }
      
      setResearchLoading(false);
    };

    if (topic) {
      fetchResearch();
    }
  }, [topic, additionalContext, onResearchComplete, useAIResearch, customResearch]);

  const handleSaveEdit = () => {
    const updatedData = {
      ...researchData,
      full_content: editedResearch,
      findings: editedResearch.split('\n').filter(line => line.trim()).slice(0, 5)
    };
    setResearchData(updatedData);
    onResearchComplete(updatedData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedResearch(researchData?.full_content || '');
    setIsEditing(false);
  };

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
        Research for "{topic}"
      </Typography>

      {/* Custom Research Input - Always shown first */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1">
            Add Your Research Content
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setUseAIResearch(true)}
            disabled={researchLoading}
            startIcon={<Search />}
          >
            {researchLoading ? 'Loading...' : 'Fill with AI Research'}
          </Button>
        </Box>
        <TextField
          fullWidth
          multiline
          rows={8}
          label="Enter your research content"
          placeholder="Add your research findings, data, statistics, insights, or any context you want to include in the content generation..."
          value={customResearch}
          onChange={(e) => setCustomResearch(e.target.value)}
          variant="outlined"
        />
      </Box>

      {/* AI Research Results */}
      {useAIResearch && researchData && (
        <>
          {/* Key Findings */}
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

          {/* Sources */}
          <Accordion sx={{ mb: 2 }}>
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

          {/* Full Research Content */}
          <Accordion sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                  Full Research Content
                </Typography>
                {!isEditing && (
                  <Button
                    size="small"
                    startIcon={<Edit />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                  >
                    Edit
                  </Button>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {isEditing ? (
                <Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={12}
                    value={editedResearch}
                    onChange={(e) => setEditedResearch(e.target.value)}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSaveEdit}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {researchData.full_content || 'No full content available'}
                </Typography>
              )}
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