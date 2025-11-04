import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import SettingsIcon from '@mui/icons-material/Settings'
import MenuIcon from '@mui/icons-material/Menu'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import ArticleIcon from '@mui/icons-material/Article'
import contentStore from '../store/contentStore'

const drawerWidth = 280

interface LayoutProps {
  children: React.ReactNode
}

function Layout({ children }: LayoutProps): JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [contentMenuOpen, setContentMenuOpen] = useState(false)
  const [contentMenuAnchor, setContentMenuAnchor] = useState<HTMLElement | null>(null)

  const contentTypes = contentStore.getAllContentTypes()

  const handleDrawerToggle = (): void => {
    setMobileOpen(!mobileOpen)
  }

  const handleContentMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setContentMenuAnchor(event.currentTarget)
    setContentMenuOpen(true)
  }

  const handleContentMenuClose = (): void => {
    setContentMenuAnchor(null)
    setContentMenuOpen(false)
  }

  const handleContentTypeClick = (contentTypeId: string): void => {
    navigate(`/content/${contentTypeId}`)
    handleContentMenuClose()
  }

  const drawer = (
    <Box>
      <Toolbar>
        <ContentPasteIcon sx={{ mr: 2 }} />
        <Typography variant="h6" noWrap component="div">
          CMS Manager
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={location.pathname === '/content-definitions'}
            onClick={() => navigate('/content-definitions')}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Content Definitions" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleContentMenuOpen}
            selected={location.pathname.startsWith('/content/') && !location.pathname.includes('edit')}
          >
            <ListItemIcon>
              <ArticleIcon />
            </ListItemIcon>
            <ListItemText primary="Content" />
            {contentMenuOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
      </List>
      <Menu
        anchorEl={contentMenuAnchor}
        open={contentMenuOpen}
        onClose={handleContentMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            maxHeight: 400,
            width: '300px',
            mt: 0.5,
            ml: 1,
          },
        }}
      >
        {contentTypes.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No Content Types created yet
            </Typography>
          </MenuItem>
        ) : (
          contentTypes.map((contentType) => (
            <MenuItem
              key={contentType.id}
              onClick={() => handleContentTypeClick(contentType.id)}
              selected={location.pathname === `/content/${contentType.id}`}
            >
              <ListItemText
                primary={contentType.name}
                secondary={contentType.description || 'No description'}
              />
            </MenuItem>
          ))
        )}
      </Menu>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            CMS Content Manager
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}

export default Layout

