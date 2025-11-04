import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  IconButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import contentStore from '../store/contentStore'

function ContentDefinitionPage(): JSX.Element {
  const navigate = useNavigate()
  const contentTypes = contentStore.getAllContentTypes()

  const handleCreate = (): void => {
    navigate('/content-definitions/new')
  }

  const handleEdit = (contentTypeId: string): void => {
    navigate(`/content-definitions/edit/${contentTypeId}`)
  }

  const handleDelete = (contentTypeId: string): void => {
    if (
      window.confirm(
        'Are you sure you want to delete this Content Type? This action cannot be undone, and all related content will also be deleted.'
      )
    ) {
      contentStore.deleteContentType(contentTypeId)
      // Force re-render
      window.location.reload()
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Content Definitions
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Create Content Type
        </Button>
      </Box>

      {contentTypes.length === 0 ? (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ContentPasteIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Content Types created yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Click the button above to create your first Content Type
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
                Create Content Type
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {contentTypes.map((contentType) => {
            const contents = contentStore.getAllContents(contentType.id)
            const publishedCount = contents.filter((c) => c.status === 'published').length
            const draftCount = contents.filter((c) => c.status === 'draft').length

            return (
              <Grid item xs={12} sm={6} md={4} key={contentType.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {contentType.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {contentType.description || 'No description'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip
                        label={`${contentType.fields?.length || 0} fields`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`${publishedCount} Published`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                      <Chip
                        label={`${draftCount} Draft`}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    </Box>
                    {contentType.fields && contentType.fields.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                          Fields:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {contentType.fields.slice(0, 5).map((field, index) => (
                            <Chip
                              key={index}
                              label={field.label}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ))}
                          {contentType.fields.length > 5 && (
                            <Chip
                              label={`+${contentType.fields.length - 5}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(contentType.id)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(contentType.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Button size="small" onClick={() => navigate(`/content/${contentType.id}`)}>
                      View Content
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}
    </Box>
  )
}

export default ContentDefinitionPage

