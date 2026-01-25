import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Stack,
  Chip,
  CircularProgress
} from '@mui/material';
import { ref, get } from 'firebase/database';
import { database } from '../../firebase/firebase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Search, SearchIconWrapper, StyledInputBase } from '../../components/Search';
import { MagnifyingGlass } from 'phosphor-react';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const query = searchParams.get('query')?.trim() || '';
  const [searchQuery, setSearchQuery] = useState(query);

  const filterUsers = (usersList, term) => {
    const normalizedQuery = term.trim().toLowerCase();
    if (!normalizedQuery) {
      return usersList;
    }

    return usersList.filter((user) => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      return (
        fullName.toLowerCase().includes(normalizedQuery) ||
        (user.email || '').toLowerCase().includes(normalizedQuery)
      );
    });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching users from Realtime Database...');
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);
        
        if (snapshot.exists()) {
          const usersData = [];
          const data = snapshot.val();
          
          console.log('Raw data from database:', data);
          
          // Convert object to array
          Object.keys(data).forEach((uid) => {
            console.log('User document:', uid, data[uid]);
            usersData.push({ id: uid, ...data[uid] });
          });
          
          // Sort by signup time (newest first)
          usersData.sort((a, b) => {
            const timeA = a.createdAt || a.signupTime || 0;
            const timeB = b.createdAt || b.signupTime || 0;
            return timeB - timeA; // Newest first
          });
          
          console.log('Total users fetched:', usersData.length);
          setAllUsers(usersData);
          setUsers(filterUsers(usersData, searchQuery));
        } else {
          console.log('No users found in database');
          setUsers([]);
          setAllUsers([]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
        setAllUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  useEffect(() => {
    setUsers(filterUsers(allUsers, searchQuery));
  }, [allUsers, searchQuery]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
          <Typography variant="h4" gutterBottom>
            {searchQuery ? `Search results for "${searchQuery}"` : 'All Users'}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => navigate('/welcome')}>
              Back to Welcome
            </Button>
            <Button variant="contained" onClick={() => navigate('/app')}>
              Go to Chat
            </Button>
          </Stack>
        </Stack>

        <Stack sx={{ width: '100%', maxWidth: 480 }}>
          <Search>
            <SearchIconWrapper>
              <MagnifyingGlass color="#709CE6" />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search users..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              inputProps={{ 'aria-label': 'search users' }}
            />
          </Search>
        </Stack>

        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Signup Time</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{formatDate(user.createdAt || user.signupTime)}</TableCell>
                    <TableCell>
                      {user.uid === currentUser?.uid ? (
                        <Chip label="You" color="primary" size="small" />
                      ) : (
                        <Chip label="Active" color="success" size="small" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {users.length === 0 && (
          <Typography variant="body1" color="text.secondary" textAlign="center">
            No users found.
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default UsersPage;
