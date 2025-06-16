import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  IconButton,
} from '@mui/material';
import { Twitter, LinkedIn, Edit, Delete } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleAPI } from '../../services/api';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const ScheduleCalendar = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Get current month's scheduled posts
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const { data: calendarData, isLoading } = useQuery({
    queryKey: ['calendar', monthStart, monthEnd],
    queryFn: () => scheduleAPI.getCalendarView(
      monthStart.toISOString(),
      monthEnd.toISOString()
    ),
  });

  const cancelMutation = useMutation({
    mutationFn: scheduleAPI.cancelScheduledPost,
    onSuccess: () => {
      queryClient.invalidateQueries(['calendar']);
      queryClient.invalidateQueries(['scheduledPosts']);
      setDialogOpen(false);
      setSelectedEvent(null);
    },
  });

  const events = calendarData?.data?.events?.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start,
    backgroundColor: event.platform === 'twitter' ? '#1DA1F2' : '#0077B5',
    borderColor: event.platform === 'twitter' ? '#1DA1F2' : '#0077B5',
    extendedProps: {
      platform: event.platform,
      status: event.status,
      content_preview: event.content_preview,
    },
  })) || [];

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.start,
      platform: event.extendedProps.platform,
      status: event.extendedProps.status,
      content_preview: event.extendedProps.content_preview,
    });
    setDialogOpen(true);
  };

  const handleCancelPost = async () => {
    if (selectedEvent) {
      await cancelMutation.mutateAsync(selectedEvent.id);
    }
  };

  const renderEventContent = (eventInfo) => {
    const platform = eventInfo.event.extendedProps.platform;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5 }}>
        {platform === 'twitter' ? (
          <Twitter sx={{ fontSize: 14, mr: 0.5 }} />
        ) : (
          <LinkedIn sx={{ fontSize: 14, mr: 0.5 }} />
        )}
        <Typography variant="caption" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {eventInfo.event.title}
        </Typography>
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading calendar...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick}
        eventContent={renderEventContent}
        height="600px"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth',
        }}
        eventDisplay="block"
        dayMaxEvents={3}
      />

      {/* Event Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Scheduled Post Details</Typography>
            <Box>
              {selectedEvent?.platform === 'twitter' ? (
                <Twitter color="primary" />
              ) : (
                <LinkedIn color="primary" />
              )}
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedEvent && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Topic:</strong> {selectedEvent.title}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                <strong>Scheduled Time:</strong> {format(new Date(selectedEvent.start), 'PPpp')}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                <strong>Platform:</strong>
                <Chip
                  label={selectedEvent.platform === 'twitter' ? 'X (Twitter)' : 'LinkedIn'}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                <strong>Status:</strong>
                <Chip
                  label={selectedEvent.status}
                  color={selectedEvent.status === 'scheduled' ? 'primary' : 'default'}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                <strong>Content Preview:</strong>
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  backgroundColor: 'grey.100', 
                  p: 2, 
                  borderRadius: 1,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selectedEvent.content_preview}
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Close
          </Button>
          <Button startIcon={<Edit />} variant="outlined">
            Edit
          </Button>
          <Button 
            startIcon={<Delete />}
            color="error"
            onClick={handleCancelPost}
            disabled={cancelMutation.isLoading}
          >
            {cancelMutation.isLoading ? 'Canceling...' : 'Cancel Post'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScheduleCalendar;