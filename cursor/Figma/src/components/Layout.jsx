import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import SettingsIcon from '@mui/icons-material/Settings'

function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <ContentPasteIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CMS Content Manager
          </Typography>
          <Button
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 1 }}
            variant={location.pathname === '/' ? 'outlined' : 'text'}
          >
            首页
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate('/content-definitions')}
            startIcon={<SettingsIcon />}
            variant={
              location.pathname === '/content-definitions' ? 'outlined' : 'text'
            }
          >
            Content Definitions
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {children}
      </Container>
    </Box>
  )
}

export default Layout

