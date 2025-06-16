import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Button,
  Grid,
} from '@mui/material';
import TopicInput from '../components/ContentGenerator/TopicInput';
import ResearchPreview from '../components/ContentGenerator/ResearchPreview';
import ContentPreview from '../components/ContentGenerator/ContentPreview';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contentAPI } from '../services/api';

const steps = ['Enter Topic', 'Review Research', 'Generate & Edit Content'];

const Generate = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    topic: '',
    platforms: ['twitter', 'linkedin'],
    includeResearch: true,
    additionalContext: '',
  });
  const [researchData, setResearchData] = useState(null);
  const [generatedContent, setGeneratedContent] = useState([]);
  const [loading, setLoading] = useState(false);

  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: contentAPI.generateContent,
    onSuccess: (data) => {
      setGeneratedContent(data.data);
      setActiveStep(2);
      queryClient.invalidateQueries(['posts']);
    },
  });

  const handleNext = async () => {
    if (activeStep === 0) {
      // Move to research preview
      setActiveStep(1);
    } else if (activeStep === 1) {
      // Generate content
      setLoading(true);
      try {
        await generateMutation.mutateAsync(formData);
      } catch (error) {
        console.error('Generation failed:', error);
      }
      setLoading(false);
    } else {
      // Final step - content is ready
      setActiveStep(0);
      setFormData({
        topic: '',
        platforms: ['twitter', 'linkedin'],
        includeResearch: true,
        additionalContext: '',
      });
      setResearchData(null);
      setGeneratedContent([]);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const updateFormData = (newData) => {
    setFormData({ ...formData, ...newData });
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <TopicInput
            formData={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <ResearchPreview
            topic={formData.topic}
            additionalContext={formData.additionalContext}
            onResearchComplete={setResearchData}
            onNext={handleNext}
            onBack={handleBack}
            loading={loading}
          />
        );
      case 2:
        return (
          <ContentPreview
            generatedContent={generatedContent}
            researchData={researchData}
            onBack={handleBack}
            onComplete={handleNext}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Generate Content
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 2 }}>
          {getStepContent(activeStep)}
        </Box>
      </Paper>
    </Box>
  );
};

export default Generate;