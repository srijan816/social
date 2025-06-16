import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Check,
  Error,
  Twitter,
  LinkedIn,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platformsAPI } from '../services/api';

const Settings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [showKeys, setShowKeys] = useState({});
  const [apiKeys, setApiKeys] = useState({
    anthropic_api_key: '',
    perplexity_api_key: '',
  });
  const [credentials, setCredentials] = useState({
    twitter: { access_token: '', access_token_secret: '' },
    linkedin: { access_token: '' },
  });

  const queryClient = useQueryClient();

  const { data: platformStatus } = useQuery({
    queryKey: ['platformStatus'],
    queryFn: platformsAPI.getPlatformStatus,
  });

  const updateAPIKeysMutation = useMutation({
    mutationFn: platformsAPI.updateAPIKeys,
    onSuccess: () => {
      queryClient.invalidateQueries(['platformStatus']);
      alert('API keys updated successfully!');
    },
  });

  const updateCredentialsMutation = useMutation({
    mutationFn: platformsAPI.updateCredentials,
    onSuccess: () => {
      queryClient.invalidateQueries(['platformStatus']);
      alert('Platform credentials updated successfully!');
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: platformsAPI.testConnection,
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const toggleShowKey = (keyName) => {
    setShowKeys(prev => ({
      ...prev,
      [keyName]: !prev[keyName]
    }));
  };

  const handleAPIKeysSubmit = async (e) => {
    e.preventDefault();
    await updateAPIKeysMutation.mutateAsync(apiKeys);
  };

  const handleCredentialsSubmit = async (platform) => {
    const creds = {
      platform,
      ...credentials[platform]
    };
    await updateCredentialsMutation.mutateAsync(creds);
  };

  const handleTestConnection = async (platform) => {
    try {
      const result = await testConnectionMutation.mutateAsync(platform);
      alert(`Connection test: ${result.data.message}`);
    } catch (error) {
      alert('Connection test failed');
    }
  };

  const status = platformStatus?.data || {};

  const APIKeysTab = () => (
    <Box component="form" onSubmit={handleAPIKeysSubmit}>
      <Typography variant="h6" gutterBottom>
        AI API Keys
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Claude (Anthropic)
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Required for content generation. Get your API key from the Anthropic Console.
              </Typography>
              
              <TextField
                fullWidth
                label="Anthropic API Key"
                type={showKeys.anthropic ? 'text' : 'password'}
                value={apiKeys.anthropic_api_key}
                onChange={(e) => setApiKeys(prev => ({
                  ...prev,
                  anthropic_api_key: e.target.value
                }))}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => toggleShowKey('anthropic')}
                        edge="end"
                      >
                        {showKeys.anthropic ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              
              <Chip
                icon={status.api_keys?.anthropic ? <Check /> : <Error />}
                label={status.api_keys?.anthropic ? 'Configured' : 'Not Set'}
                color={status.api_keys?.anthropic ? 'success' : 'error'}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Perplexity
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Required for research and trending topics. Get your API key from Perplexity Settings.
              </Typography>
              
              <TextField
                fullWidth
                label="Perplexity API Key"
                type={showKeys.perplexity ? 'text' : 'password'}
                value={apiKeys.perplexity_api_key}
                onChange={(e) => setApiKeys(prev => ({
                  ...prev,
                  perplexity_api_key: e.target.value
                }))}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => toggleShowKey('perplexity')}
                        edge="end"
                      >
                        {showKeys.perplexity ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              
              <Chip
                icon={status.api_keys?.perplexity ? <Check /> : <Error />}
                label={status.api_keys?.perplexity ? 'Configured' : 'Not Set'}
                color={status.api_keys?.perplexity ? 'success' : 'error'}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          type="submit" 
          variant="contained"
          disabled={updateAPIKeysMutation.isLoading}
        >
          {updateAPIKeysMutation.isLoading ? 'Saving...' : 'Save API Keys'}
        </Button>
      </Box>
    </Box>
  );

  const PlatformsTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Social Media Platforms
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Twitter sx={{ mr: 1 }} />
                <Typography variant="h6">
                  X (Twitter)
                </Typography>
                <Box sx={{ ml: 'auto' }}>
                  <Chip
                    icon={status.twitter?.valid ? <Check /> : <Error />}
                    label={status.twitter?.valid ? 'Connected' : 'Not Connected'}
                    color={status.twitter?.valid ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </Box>
              
              <TextField
                fullWidth
                label="Access Token"
                value={credentials.twitter.access_token}
                onChange={(e) => setCredentials(prev => ({
                  ...prev,
                  twitter: { ...prev.twitter, access_token: e.target.value }
                }))}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Access Token Secret"
                value={credentials.twitter.access_token_secret}
                onChange={(e) => setCredentials(prev => ({
                  ...prev,
                  twitter: { ...prev.twitter, access_token_secret: e.target.value }
                }))}
                sx={{ mb: 2 }}
              />
            </CardContent>
            
            <CardActions>
              <Button 
                onClick={() => handleCredentialsSubmit('twitter')}
                disabled={updateCredentialsMutation.isLoading}
              >
                Save
              </Button>
              <Button 
                onClick={() => handleTestConnection('twitter')}
                disabled={testConnectionMutation.isLoading}
              >
                Test
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LinkedIn sx={{ mr: 1 }} />
                <Typography variant="h6">
                  LinkedIn
                </Typography>
                <Box sx={{ ml: 'auto' }}>
                  <Chip
                    icon={status.linkedin?.valid ? <Check /> : <Error />}
                    label={status.linkedin?.valid ? 'Connected' : 'Not Connected'}
                    color={status.linkedin?.valid ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </Box>
              
              <TextField
                fullWidth
                label="Access Token"
                value={credentials.linkedin.access_token}
                onChange={(e) => setCredentials(prev => ({
                  ...prev,
                  linkedin: { access_token: e.target.value }
                }))}
                sx={{ mb: 2 }}
              />
              
              <Alert severity="info" sx={{ mt: 1 }}>
                LinkedIn requires OAuth flow. Use the LinkedIn Developer Console to generate access tokens.
              </Alert>
            </CardContent>
            
            <CardActions>
              <Button 
                onClick={() => handleCredentialsSubmit('linkedin')}
                disabled={updateCredentialsMutation.isLoading}
              >
                Save
              </Button>
              <Button 
                onClick={() => handleTestConnection('linkedin')}
                disabled={testConnectionMutation.isLoading}
              >
                Test
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ p: 0 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="API Keys" />
          <Tab label="Platforms" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && <APIKeysTab />}
          {tabValue === 1 && <PlatformsTab />}
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings;