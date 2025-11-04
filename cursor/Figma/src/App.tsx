import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Layout from './components/Layout'
import ContentDefinitionPage from './pages/ContentDefinitionPage'
import ContentTypeEditPage from './pages/ContentTypeEditPage'
import ContentPage from './pages/ContentPage'
import ContentEditPage from './pages/ContentEditPage'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

function App(): JSX.Element {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/content-definitions" replace />} />
          <Route path="/content-definitions" element={<ContentDefinitionPage />} />
          <Route path="/content-definitions/new" element={<ContentTypeEditPage />} />
          <Route path="/content-definitions/edit/:id" element={<ContentTypeEditPage />} />
          <Route path="/content/:contentTypeId" element={<ContentPage />} />
          <Route path="/content/:contentTypeId/new" element={<ContentEditPage />} />
          <Route path="/content/:contentTypeId/edit/:contentId" element={<ContentEditPage />} />
          <Route path="*" element={<Navigate to="/content-definitions" replace />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  )
}

export default App
