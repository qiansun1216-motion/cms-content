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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Chip,
  Autocomplete,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import contentStore from '../store/contentStore'
import { ContentType, Field, Content } from '../types'
import ComponentField from '../components/ComponentField'
import DynamicZoneField from '../components/DynamicZoneField'

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
        } else if (field.type === 'relation') {
          // Initialize relation field
          const isMultiple =
            field.relationConfig?.relationType === 'oneToMany' ||
            field.relationConfig?.relationType === 'manyToMany'
          initialContent[field.name] = isMultiple ? [] : ''
        } else if (field.type === 'component') {
          // Initialize component - array if repeatable, object if single
          if (field.repeatable) {
            initialContent[field.name] = []
          } else {
            const component = field.componentId
              ? contentStore.getComponent(field.componentId)
              : null
            if (component) {
              const componentData: Record<string, any> = {}
              component.fields.forEach((compField) => {
                if (compField.defaultValue) {
                  componentData[compField.name] = compField.defaultValue
                } else if (compField.type === 'boolean') {
                  componentData[compField.name] = false
                } else if (compField.type === 'component' && compField.componentId) {
                  componentData[compField.name] = {}
                } else {
                  componentData[compField.name] = ''
                }
              })
              initialContent[field.name] = componentData
            } else {
              initialContent[field.name] = {}
            }
          }
        } else if (field.type === 'dynamicZone') {
          // Initialize dynamic zone as empty array
          initialContent[field.name] = []
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
        const relatedContentType = field.relationConfig
          ? contentStore.getContentType(field.relationConfig.contentTypeId)
          : null
        const relatedContents = relatedContentType
          ? contentStore.getAllContents(relatedContentType.id)
          : []
        const relationType = field.relationConfig?.relationType || 'oneToOne'
        const displayField = field.relationConfig?.displayField

        // Determine if multiple selection is allowed
        const isMultiple =
          relationType === 'oneToMany' || relationType === 'manyToMany'

        // Get display value for a content item
        const getDisplayValue = (item: Content): string => {
          if (!displayField) {
            // Fallback to first text field or ID
            const firstTextField = relatedContentType?.fields?.find((f) =>
              ['text', 'email'].includes(f.type)
            )
            if (firstTextField && item[firstTextField.name]) {
              return String(item[firstTextField.name])
            }
            return item.id.slice(-8)
          }
          return item[displayField] ? String(item[displayField]) : item.id.slice(-8)
        }

        // Mock search function
        const searchOptions = (searchText: string) => {
          if (!searchText) return relatedContents
          const lowerSearch = searchText.toLowerCase()
          return relatedContents.filter((item) => {
            const displayValue = getDisplayValue(item)
            return displayValue.toLowerCase().includes(lowerSearch)
          })
        }

        // Handle single select
        if (!isMultiple) {
          const selectedContent = relatedContents.find((c) => c.id === value)

          return (
            <Box>
              <Autocomplete
                options={relatedContents}
                value={selectedContent || null}
                onChange={(_, newValue) => {
                  handleFieldChange(field.name, newValue?.id || '')
                }}
                getOptionLabel={(option) => getDisplayValue(option)}
                isOptionEqualToValue={(option, val) => option.id === val.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={field.label}
                    required={field.required}
                    error={!!error}
                    helperText={error}
                  />
                )}
                filterOptions={(options, state) => {
                  return searchOptions(state.inputValue)
                }}
                noOptionsText="No matching items found"
                sx={{ mb: 1 }}
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<CreateNewFolderIcon />}
                onClick={() => {
                  // UI placeholder for creating new related content
                  alert(
                    `Create new ${relatedContentType?.name || 'content'}. This would open a dialog to create new content.`
                  )
                }}
              >
                Create New {relatedContentType?.name || 'Content'}
              </Button>
            </Box>
          )
        }

        // Handle multiple select
        const selectedContents = Array.isArray(value)
          ? relatedContents.filter((c) => value.includes(c.id))
          : value
          ? relatedContents.filter((c) => c.id === value)
          : []

        return (
          <Box>
            <Autocomplete
              multiple
              options={relatedContents}
              value={selectedContents}
              onChange={(_, newValue) => {
                handleFieldChange(
                  field.name,
                  newValue.map((item) => item.id)
                )
              }}
              getOptionLabel={(option) => getDisplayValue(option)}
              isOptionEqualToValue={(option, val) => option.id === val.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={field.label}
                  required={field.required}
                  error={!!error}
                  helperText={error}
                />
              )}
              filterOptions={(options, state) => {
                return searchOptions(state.inputValue)
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    label={getDisplayValue(option)}
                    onDelete={() => {
                      const updated = selectedContents.filter((_, i) => i !== index)
                      handleFieldChange(
                        field.name,
                        updated.map((item) => item.id)
                      )
                    }}
                  />
                ))
              }
              noOptionsText="No matching items found"
              sx={{ mb: 1 }}
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<CreateNewFolderIcon />}
              onClick={() => {
                // UI placeholder for creating new related content
                alert(
                  `Create new ${relatedContentType?.name || 'content'}. This would open a dialog to create new content.`
                )
              }}
            >
              Create New {relatedContentType?.name || 'Content'}
            </Button>
          </Box>
        )
      case 'component':
        const component = field.componentId
          ? contentStore.getComponent(field.componentId)
          : null

        if (!component) {
          return (
            <Alert severity="warning">
              Component not found. Please configure the component for this field.
            </Alert>
          )
        }

        // If repeatable, render as array of components
        if (field.repeatable) {
          const componentArray = Array.isArray(value) ? value : []
          
          return (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                {field.label}
                {field.required && <Typography component="span" color="error"> *</Typography>}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {componentArray.map((item: Record<string, any>, index: number) => (
                  <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Chip
                        label={`${component.name} ${index + 1}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <IconButton
                        size="small"
                        onClick={() => {
                          const updated = componentArray.filter((_: any, i: number) => i !== index)
                          handleFieldChange(field.name, updated)
                        }}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <ComponentField
                      component={component}
                      value={item || {}}
                      onChange={(val) => {
                        const updated = [...componentArray]
                        updated[index] = val
                        handleFieldChange(field.name, updated)
                      }}
                    />
                  </Paper>
                ))}
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    const newItem: Record<string, any> = {}
                    component.fields.forEach((compField) => {
                      if (compField.defaultValue) {
                        newItem[compField.name] = compField.defaultValue
                      } else if (compField.type === 'boolean') {
                        newItem[compField.name] = false
                      } else if (compField.type === 'component' && compField.componentId) {
                        newItem[compField.name] = {}
                      } else {
                        newItem[compField.name] = ''
                      }
                    })
                    const updated = [...componentArray, newItem]
                    handleFieldChange(field.name, updated)
                  }}
                  fullWidth
                >
                  Add {component.name}
                </Button>
              </Box>
              {error && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {error}
                </Alert>
              )}
            </Box>
          )
        }

        // Single component instance
        return (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <ComponentField
              field={field}
              component={component}
              value={value || {}}
              onChange={(val) => handleFieldChange(field.name, val)}
              error={error}
            />
          </Paper>
        )
      case 'dynamicZone':
        const dynamicZoneConfig = field.dynamicZoneConfig
        const availableComponents = dynamicZoneConfig?.components
          ? dynamicZoneConfig.components
              .map((id) => contentStore.getComponent(id))
              .filter(Boolean)
          : []

        return (
          <DynamicZoneField
            label={field.label}
            value={value || []}
            onChange={(val) => handleFieldChange(field.name, val)}
            availableComponents={availableComponents}
            error={error}
            required={field.required}
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

