import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import contentStore from '../store/contentStore'
import { ContentType, Field, Content } from '../types'

function ContentEditPage(): JSX.Element | null {
  const { contentTypeId, contentId } = useParams<{ contentTypeId: string; contentId: string }>()
  const navigate = useNavigate()
  const isEdit = contentId && contentId !== 'new'

  const [contentType, setContentType] = useState<ContentType | null>(null)
  const [content, setContent] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!contentTypeId) {
      navigate('/content-definitions')
      return
    }

    const type = contentStore.getContentType(contentTypeId)
    if (!type) {
      navigate('/content-definitions')
      return
    }
    setContentType(type)

    if (isEdit && contentId) {
      const existingContent = contentStore.getContent(contentTypeId, contentId)
      if (existingContent) {
        setContent({ ...existingContent })
      } else {
        navigate(`/content/${contentTypeId}`)
      }
    } else {
      // Initialize new content with default values
      const initialContent: Record<string, any> = {}
      type.fields.forEach((field) => {
        if (field.defaultValue) {
          initialContent[field.name] = field.defaultValue
        } else if (field.type === 'boolean') {
          initialContent[field.name] = false
        } else if (field.type === 'number') {
          initialContent[field.name] = ''
        } else {
          initialContent[field.name] = ''
        }
      })
      setContent(initialContent)
    }
  }, [contentTypeId, contentId, isEdit, navigate])

  const handleSave = (): void => {
    if (!contentType || !contentTypeId) return

    const newErrors: Record<string, string> = {}

    // Validate required fields
    contentType.fields.forEach((field) => {
      if (field.required) {
        const value = content[field.name]
        if (
          value === undefined ||
          value === null ||
          value === '' ||
          (Array.isArray(value) && value.length === 0)
        ) {
          newErrors[field.name] = `${field.label} is a required field`
        }
      }

      // Validate field types
      if (content[field.name] !== undefined && content[field.name] !== '') {
        if (field.type === 'email' && content[field.name]) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(content[field.name])) {
            newErrors[field.name] = 'Please enter a valid email address'
          }
        }
        if (field.type === 'url' && content[field.name]) {
          try {
            new URL(content[field.name])
          } catch {
            newErrors[field.name] = 'Please enter a valid URL'
          }
        }
        if (field.type === 'number' && content[field.name] !== '') {
          const num = Number(content[field.name])
          if (isNaN(num)) {
            newErrors[field.name] = 'Please enter a valid number'
          } else {
            if (field.validation?.min && num < Number(field.validation.min)) {
              newErrors[field.name] = `Value cannot be less than ${field.validation.min}`
            }
            if (field.validation?.max && num > Number(field.validation.max)) {
              newErrors[field.name] = `Value cannot be greater than ${field.validation.max}`
            }
          }
        }
        if (['text', 'textarea', 'email', 'url'].includes(field.type)) {
          const length = String(content[field.name]).length
          if (field.validation?.minLength && length < Number(field.validation.minLength)) {
            newErrors[field.name] = `Length cannot be less than ${field.validation.minLength} characters`
          }
          if (field.validation?.maxLength && length > Number(field.validation.maxLength)) {
            newErrors[field.name] = `Length cannot be greater than ${field.validation.maxLength} characters`
          }
        }
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})

    if (isEdit && contentId) {
      contentStore.updateContent(contentTypeId, contentId, {
        ...content,
        status: 'draft',
      })
    } else {
      contentStore.createContent(contentTypeId, content)
    }

    navigate(`/content/${contentTypeId}`)
  }

  const handleFieldChange = (fieldName: string, value: any): void => {
    setContent((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
    // Clear error for this field when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  const renderFieldInput = (field: Field): JSX.Element => {
    const value = content[field.name]
    const error = errors[field.name]

    switch (field.type) {
      case 'boolean':
        return (
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={value || false}
                  onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                />
              }
              label={field.label}
            />
            {error && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {error}
              </Alert>
            )}
          </Box>
        )
      case 'date':
        return (
          <TextField
            fullWidth
            label={field.label}
            type="date"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            InputLabelProps={{ shrink: true }}
            required={field.required}
            error={!!error}
            helperText={error}
          />
        )
      case 'textarea':
        return (
          <TextField
            fullWidth
            label={field.label}
            multiline
            rows={4}
            value={value || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
            error={!!error}
            helperText={error}
          />
        )
      case 'number':
        return (
          <TextField
            fullWidth
            label={field.label}
            type="number"
            value={value || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
            error={!!error}
            helperText={error}
          />
        )
      case 'relation':
        return (
          <TextField
            fullWidth
            label={field.label}
            value={value || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder="Enter relation ID"
            required={field.required}
            error={!!error}
            helperText={error}
          />
        )
      default:
        return (
          <TextField
            fullWidth
            label={field.label}
            type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
            value={value || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
            error={!!error}
            helperText={error}
          />
        )
    }
  }

  if (!contentType) {
    return null
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(`/content/${contentTypeId}`)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {isEdit ? 'Edit Content' : 'Create Content'}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {contentType.fields.map((field) => (
              <Box key={field.name}>{renderFieldInput(field)}</Box>
            ))}
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
          <Button
            onClick={() => navigate(`/content/${contentTypeId}`)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" startIcon={<SaveIcon />}>
            Save (Save as Draft)
          </Button>
        </CardActions>
      </Card>
    </Box>
  )
}

export default ContentEditPage

