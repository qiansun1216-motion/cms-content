import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Paper,
  Chip,
  Alert,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import contentStore from '../store/contentStore'
import { Field, ContentType } from '../types'

interface FieldDialogState {
  open: boolean
  field: Field | null
  index: number
  errors: Record<string, string>
}

interface ContentTypeForm {
  name: string
  description: string
  fields: Field[]
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'relation', label: 'Relation' },
] as const

function ContentTypeEditPage(): JSX.Element {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = id && id !== 'new'

  const [contentType, setContentType] = useState<ContentTypeForm>({
    name: '',
    description: '',
    fields: [],
  })

  const [fieldDialog, setFieldDialog] = useState<FieldDialogState>({
    open: false,
    field: null,
    index: -1,
    errors: {},
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isEdit && id) {
      const existing = contentStore.getContentType(id)
      if (existing) {
        setContentType({
          name: existing.name,
          description: existing.description || '',
          fields: existing.fields,
        })
      } else {
        navigate('/content-definitions')
      }
    }
  }, [id, isEdit, navigate])

  const handleSave = (): void => {
    const newErrors: Record<string, string> = {}

    if (!contentType.name.trim()) {
      newErrors.name = 'Content Type name cannot be empty'
    }

    if (contentType.fields.length === 0) {
      newErrors.fields = 'At least one field is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})

    if (isEdit && id) {
      contentStore.updateContentType(id, contentType)
    } else {
      contentStore.createContentType(contentType)
    }

    navigate('/content-definitions')
  }

  const handleDelete = (): void => {
    if (isEdit && id) {
      if (
        window.confirm(
          'Are you sure you want to delete this Content Type? This action cannot be undone, and all related content will also be deleted.'
        )
      ) {
        contentStore.deleteContentType(id)
        navigate('/content-definitions')
      }
    } else {
      navigate('/content-definitions')
    }
  }

  const handleAddField = (): void => {
    setFieldDialog({
      open: true,
      field: {
        name: '',
        type: 'text',
        label: '',
        required: false,
        defaultValue: '',
        validation: {
          minLength: '',
          maxLength: '',
          min: '',
          max: '',
        },
      },
      index: -1,
      errors: {},
    })
  }

  const handleEditField = (index: number): void => {
    setFieldDialog({
      open: true,
      field: { ...contentType.fields[index] },
      index,
      errors: {},
    })
  }

  const handleDeleteField = (index: number): void => {
    const newFields = contentType.fields.filter((_, i) => i !== index)
    setContentType({ ...contentType, fields: newFields })
  }

  const handleSaveField = (): void => {
    const { field, index } = fieldDialog
    if (!field) return

    const fieldErrors: Record<string, string> = {}

    if (!field.name.trim()) {
      fieldErrors.name = 'Field name cannot be empty'
    }

    if (!field.label.trim()) {
      fieldErrors.label = 'Field label cannot be empty'
    }

    // Check if field name already exists
    const existingIndex = contentType.fields.findIndex(
      (f, i) => f.name === field.name && i !== index
    )
    if (existingIndex !== -1) {
      fieldErrors.name = 'Field name already exists'
    }

    if (Object.keys(fieldErrors).length > 0) {
      setFieldDialog({ ...fieldDialog, errors: fieldErrors })
      return
    }

    const newFields = [...contentType.fields]
    if (index === -1) {
      newFields.push(field)
    } else {
      newFields[index] = field
    }

    setContentType({ ...contentType, fields: newFields })
    setFieldDialog({ open: false, field: null, index: -1, errors: {} })
  }

  const handleFieldChange = (field: Field | null, key: string, value: string | boolean): void => {
    if (!field) return

    const updatedField: Field = { ...field }
    if (key.includes('.')) {
      const [parent, child] = key.split('.')
      if (parent === 'validation') {
        updatedField.validation = {
          ...updatedField.validation,
          [child]: value,
        }
      }
    } else {
      if (key === 'name' || key === 'label' || key === 'type' || key === 'defaultValue') {
        ;(updatedField as any)[key] = value
      } else if (key === 'required') {
        updatedField.required = value as boolean
      }
    }
    setFieldDialog({ ...fieldDialog, field: updatedField })
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/content-definitions')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {isEdit ? 'Edit Content Type' : 'Create Content Type'}
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Content Type Name"
            value={contentType.name}
            onChange={(e) => setContentType({ ...contentType, name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={contentType.description}
            onChange={(e) => setContentType({ ...contentType, description: e.target.value })}
            multiline
            rows={2}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Field Definitions</Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddField}>
              Add Field
            </Button>
          </Box>

          {errors.fields && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.fields}
            </Alert>
          )}

          {contentType.fields.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No fields added yet. Click the button above to add the first field.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {contentType.fields.map((field, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                        <Chip label={field.label} size="small" />
                        <Chip
                          label={FIELD_TYPES.find((t) => t.value === field.type)?.label || field.type}
                          size="small"
                          variant="outlined"
                        />
                        {field.required && <Chip label="Required" size="small" color="error" />}
                        <Chip label={`Name: ${field.name}`} size="small" variant="outlined" />
                      </Box>
                      {field.defaultValue && (
                        <Typography variant="body2" color="text.secondary">
                          Default value: {field.defaultValue}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleEditField(index)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteField(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
          {isEdit && (
            <Button onClick={handleDelete} color="error" variant="outlined">
              Delete
            </Button>
          )}
          <Button onClick={handleSave} variant="contained" startIcon={<SaveIcon />}>
            Save
          </Button>
        </CardActions>
      </Card>

      {/* Field Edit Dialog */}
      <Dialog
        open={fieldDialog.open}
        onClose={() => setFieldDialog({ open: false, field: null, index: -1, errors: {} })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {fieldDialog.index === -1 ? 'Add Field' : 'Edit Field'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="Field Name"
              value={fieldDialog.field?.name || ''}
              onChange={(e) => handleFieldChange(fieldDialog.field, 'name', e.target.value)}
              error={!!fieldDialog.errors?.name}
              helperText={
                fieldDialog.errors?.name ||
                'Unique identifier for the field, use lowercase letters and underscores'
              }
              required
            />
            <TextField
              fullWidth
              label="Field Label"
              value={fieldDialog.field?.label || ''}
              onChange={(e) => handleFieldChange(fieldDialog.field, 'label', e.target.value)}
              error={!!fieldDialog.errors?.label}
              helperText={fieldDialog.errors?.label}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Field Type</InputLabel>
              <Select
                value={fieldDialog.field?.type || 'text'}
                label="Field Type"
                onChange={(e) =>
                  handleFieldChange(fieldDialog.field, 'type', e.target.value as string)
                }
              >
                {FIELD_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={fieldDialog.field?.required || false}
                  onChange={(e) =>
                    handleFieldChange(fieldDialog.field, 'required', e.target.checked)
                  }
                />
              }
              label="Required Field"
            />
            {fieldDialog.field?.type !== 'boolean' && (
              <TextField
                fullWidth
                label="Default Value"
                value={fieldDialog.field?.defaultValue || ''}
                onChange={(e) =>
                  handleFieldChange(fieldDialog.field, 'defaultValue', e.target.value)
                }
                helperText="Optional: Default value for the field"
              />
            )}
            {['text', 'textarea', 'email', 'url'].includes(fieldDialog.field?.type || '') && (
              <>
                <TextField
                  fullWidth
                  type="number"
                  label="Min Length"
                  value={fieldDialog.field?.validation?.minLength || ''}
                  onChange={(e) =>
                    handleFieldChange(fieldDialog.field, 'validation.minLength', e.target.value)
                  }
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Max Length"
                  value={fieldDialog.field?.validation?.maxLength || ''}
                  onChange={(e) =>
                    handleFieldChange(fieldDialog.field, 'validation.maxLength', e.target.value)
                  }
                />
              </>
            )}
            {fieldDialog.field?.type === 'number' && (
              <>
                <TextField
                  fullWidth
                  type="number"
                  label="Min Value"
                  value={fieldDialog.field?.validation?.min || ''}
                  onChange={(e) =>
                    handleFieldChange(fieldDialog.field, 'validation.min', e.target.value)
                  }
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Max Value"
                  value={fieldDialog.field?.validation?.max || ''}
                  onChange={(e) =>
                    handleFieldChange(fieldDialog.field, 'validation.max', e.target.value)
                  }
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setFieldDialog({ open: false, field: null, index: -1, errors: {} })}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveField} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ContentTypeEditPage

