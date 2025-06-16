import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import ScheduleCalendar from '../components/ScheduleCalendar/ScheduleCalendar';
import ScheduleList from '../components/ScheduleCalendar/ScheduleList';

const Schedule = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Content Schedule
      </Typography>

      <Paper sx={{ p: 0 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Calendar View" />
          <Tab label="List View" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && <ScheduleCalendar />}
          {tabValue === 1 && <ScheduleList />}
        </Box>
      </Paper>
    </Box>
  );
};

export default Schedule;