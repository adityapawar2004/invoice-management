import React from 'react';
import { Container, Box, Paper, Button, Typography } from '@mui/material';
import FileUpload from './components/FileUpload.jsx';
import TabPanel from './components/TabPanel.jsx';
import { useSelector, useDispatch } from 'react-redux';
import { clearAllData } from './redux/tableSlice';

function App() {
  const dispatch = useDispatch();
  const { customers, products, invoices } = useSelector(state => state.table);

  const handleClearData = () => {
    dispatch(clearAllData());
  };

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography 
              variant="h4" 
              component="h1" 
              fontWeight="bold" 
              sx={{ mb: 3, textAlign: 'center' }}
            >
             Automated Data Extraction and Invoice Management
            </Typography>
            <FileUpload />
            {(customers.length > 0 || products.length > 0 || invoices.length > 0) && (
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={handleClearData}
                  size="small"
                >
                  Clear All Data
                </Button>
              </Box>
            )}
          </Paper>
          <Paper sx={{ mt: 3 }}>
            <TabPanel />
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

export default App;
