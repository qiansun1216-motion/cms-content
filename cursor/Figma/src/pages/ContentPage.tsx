import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Menu,
  MenuItem,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import PublishIcon from '@mui/icons-material/Publish'
import UnpublishedIcon from '@mui/icons-material/Unpublished'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import contentStore from '../store/contentStore'
import { ContentType, Content } from '../types'

function ContentPage(): JSX.Element | null {
  const { contentTypeId } = useParams<{ contentTypeId: string }>()
  const navigate = useNavigate()
  const [contentType, setContentType] = useState<ContentType | null>(null)
  const [contents, setContents] = useState<Content[]>([])
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [menuContentId, setMenuContentId] = useState<string | null>(null)

  useEffect(() => {
    if (contentTypeId) {
      loadData()
    }
  }, [contentTypeId])

  const loadData = (): void => {
    if (!contentTypeId) return
    const type = contentStore.getContentType(contentTypeId)
    if (!type) {
      navigate('/content-definitions')
      return
    }
    setContentType(type)
    const allContents = contentStore.getAllContents(contentTypeId)
    setContents(allContents)
  }

  const handleCreate = (): void => {
    if (!contentTypeId) return
    navigate(`/content/${contentTypeId}/new`)
  }

  const handleEdit = (contentId: string): void => {
    if (!contentTypeId) return
    navigate(`/content/${contentTypeId}/edit/${contentId}`)
  }

  const handleDelete = (contentId: string): void => {
    if (window.confirm('Are you sure you want to delete this content item?')) {
      if (contentTypeId) {
        contentStore.deleteContent(contentTypeId, contentId)
        loadData()
      }
    }
  }

  const handlePublish = (contentId: string): void => {
    if (contentTypeId) {
      contentStore.publishContent(contentTypeId, contentId)
      loadData()
      setMenuAnchor(null)
    }
  }

  const handleUnpublish = (contentId: string): void => {
    if (contentTypeId) {
      contentStore.unpublishContent(contentTypeId, contentId)
      loadData()
      setMenuAnchor(null)
    }
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, contentId: string): void => {
    setMenuAnchor(event.currentTarget)
    setMenuContentId(contentId)
  }

  const handleMenuClose = (): void => {
    setMenuAnchor(null)
    setMenuContentId(null)
  }

  if (!contentType) {
    return null
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/content-definitions')}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" component="h1">
            {contentType.name}
          </Typography>
          {contentType.description && (
            <Typography variant="body2" color="text.secondary">
              {contentType.description}
            </Typography>
          )}
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Create Content
        </Button>
      </Box>

      <Card>
        <CardContent>
          {contents.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No content created yet. Click the button above to create the first content item.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    {contentType.fields?.slice(0, 3).map((field) => (
                      <TableCell key={field.name}>{field.label}</TableCell>
                    ))}
                    <TableCell>Status</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Updated At</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contents.map((content) => (
                    <TableRow key={content.id}>
                      <TableCell>{content.id.slice(-8)}</TableCell>
                      {contentType.fields?.slice(0, 3).map((field) => (
                        <TableCell key={field.name}>
                          {field.type === 'boolean'
                            ? content[field.name]
                              ? 'Yes'
                              : 'No'
                            : String(content[field.name] || '-').slice(0, 50)}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Chip
                          label={content.status === 'published' ? 'Published' : 'Draft'}
                          color={content.status === 'published' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {content.createdAt
                          ? new Date(content.createdAt).toLocaleString('en-US')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {content.updatedAt
                          ? new Date(content.updatedAt).toLocaleString('en-US')
                          : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, content.id)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            if (menuContentId) {
              handleEdit(menuContentId)
            }
            handleMenuClose()
          }}
        >
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            const content = contents.find((c) => c.id === menuContentId)
            if (content && contentTypeId) {
              if (content.status === 'published') {
                handleUnpublish(content.id)
              } else {
                handlePublish(content.id)
              }
            }
          }}
        >
          {contents.find((c) => c.id === menuContentId)?.status === 'published' ? (
            <>
              <UnpublishedIcon sx={{ mr: 1 }} fontSize="small" />
              Unpublish
            </>
          ) : (
            <>
              <PublishIcon sx={{ mr: 1 }} fontSize="small" />
              Publish
            </>
          )}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuContentId) {
              handleDelete(menuContentId)
            }
            handleMenuClose()
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default ContentPage
