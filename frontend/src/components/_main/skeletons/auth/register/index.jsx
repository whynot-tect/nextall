// File: C:\Users\hanos\nextall\frontend\src\components\_main\skeletons\auth\register\index.jsx
import React from 'react';
// mui
import { Card, Container, Skeleton, Stack, Typography } from '@mui/material';
// components
import Register from './register';

export default function index() {
  return (
    <Container maxWidth="sm">
      <Card
        sx={{
          maxWidth: 560,
          m: 'auto',
          my: '80px',
          flexDirection: 'column',
          justifyContent: 'center',
          p: 3
        }}
      >
        <Stack mb={5}>
          <Typography textAlign="center" variant="h4" component="h1" gutterBottom>
            <Skeleton variant="text" />
          </Typography>
          <Typography textAlign="center" color="text.secondary">
            <Skeleton variant="text" />
          </Typography>
        </Stack>
        <Register />
      </Card>
    </Container>
  );
}
