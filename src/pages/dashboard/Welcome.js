import React, { useState } from 'react';
import { Box, Typography, Button, Stack, Paper, Alert } from '@mui/material';
import { MagnifyingGlass } from 'phosphor-react';
import { Search, SearchIconWrapper, StyledInputBase } from '../../components/Search';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ref, get, push, serverTimestamp } from 'firebase/database';
import { database } from '../../firebase/firebase';

const WelcomePage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [debugStatus, setDebugStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const testDatabaseRead = async () => {
    try {
      setDebugStatus('Testing Realtime Database read...');
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const userCount = Object.keys(data).length;
        setDebugStatus(`Success! Found ${userCount} users in Realtime Database`);
        
        Object.keys(data).forEach((uid) => {
          console.log('User document:', uid, data[uid]);
        });
      } else {
        setDebugStatus('Success! Database exists but no users found');
      }
    } catch (error) {
      setDebugStatus(`Database read failed: ${error.message}`);
      console.error('Database read error:', error);
    }
  };

  const testDatabaseWrite = async () => {
    try {
      setDebugStatus('Testing Realtime Database write...');
      const testRef = ref(database, 'test');
      await push(testRef, {
        message: 'Test write',
        timestamp: serverTimestamp(),
        user: currentUser?.email
      });
      setDebugStatus('Database write successful!');
    } catch (error) {
      setDebugStatus(`Database write failed: ${error.message}`);
      console.error('Database write error:', error);
    }
  };

  const handleSearchSubmit = () => {
    const query = searchQuery.trim();
    navigate(query ? `/users?query=${encodeURIComponent(query)}` : '/users');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: (theme) => theme.palette.background.default,
        p: 3
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 500,
          width: '100%',
          textAlign: 'center'
        }}
      >
        <Stack spacing={3}>
          <Typography variant="h4" color="primary" gutterBottom>
            Welcome!
          </Typography>
          <Typography variant="h6" color="text.secondary">
            You are successfully logged in
          </Typography>
          
          <Box
            sx={{
              p: 2,
              backgroundColor: (theme) => theme.palette.grey[100],
              borderRadius: 1
            }}
          >
            <Typography variant="body1" color="text.primary">
              <strong>Email:</strong> {currentUser?.email}
            </Typography>
          </Box>

          <Stack spacing={1.5} sx={{ width: '100%' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Search the user directory
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <Box sx={{ flexGrow: 1, width: '100%' }}>
                <Search>
                  <SearchIconWrapper>
                    <MagnifyingGlass color="#709CE6" />
                  </SearchIconWrapper>
                  <StyledInputBase
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        handleSearchSubmit();
                      }
                    }}
                    inputProps={{ 'aria-label': 'search users' }}
                  />
                </Search>
              </Box>
              <Button variant="outlined" onClick={handleSearchSubmit} sx={{ minWidth: 140 }}>
                Search Users
              </Button>
            </Stack>
          </Stack>
          
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              onClick={() => navigate('/app')}
              sx={{ minWidth: 120 }}
            >
              Go to Chat
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => navigate('/users')}
              sx={{ minWidth: 120 }}
            >
              View All Users
            </Button>
            
            <Button
              variant="contained"
              color="error"
              onClick={handleLogout}
              sx={{ minWidth: 120 }}
            >
              Logout
            </Button>
          </Stack>

          {/* Debug Section */}
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Debug Realtime Database Connection:
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              onClick={testDatabaseRead}
              size="small"
            >
              Test Read
            </Button>
            <Button
              variant="outlined"
              onClick={testDatabaseWrite}
              size="small"
            >
              Test Write
            </Button>
          </Stack>
          {debugStatus && (
            <Alert
              severity={debugStatus.includes('failed') ? 'error' : 'success'}
              sx={{ mt: 2 }}
            >
              {debugStatus}
            </Alert>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default WelcomePage;
