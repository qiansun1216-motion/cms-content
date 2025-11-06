import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Paper,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import contentStore from '../store/contentStore'
import { Component, ComponentField } from '../types'

interface ComponentManagerDialogProps {
  open: boolean
  onClose: () => void
  onComponentCreated?: (component: Component) => void
}

interface ComponentFieldDialogState {
  open: boolean
  field: ComponentField | null
  index: number
  errors: Record<string, string>
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'component', label: 'Component (Nested)' },
] as const

function ComponentManagerDialog({
  open,
  onClose,
  onComponentCreated,
}: ComponentManagerDialogProps): JSX.Element {
  const [component, setComponent] = useState<Omit<Component, 'id'>>({
    name: '',
    fields: [],
  })
  const [fieldDialog, setFieldDialog] = useState<ComponentFieldDialogState>({
    open: false,
    field: null,
    index: -1,
    errors: {},
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setComponent({ name: '', fields: [] })
      setErrors({})
      setFieldDialog({ open: false, field: null, index: -1, errors: {} })
    }
  }, [open])

  const handleSave = (): void => {
    const newErrors: Record<string, string> = {}

    if (!component.name.trim()) {
      newErrors.name = 'Component name cannot be empty'
    }

    if (component.fields.length === 0) {
      newErrors.fields = 'At least one field is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    const newComponent = contentStore.createComponent(component)
    if (onComponentCreated) {
      onComponentCreated(newComponent)
    }
    onClose()
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
      field: { ...component.fields[index] },
      index,
      errors: {},
    })
  }

  const handleDeleteField = (index: number): void => {
    const newFields = component.fields.filter((_, i) => i !== index)
    setComponent({ ...component, fields: newFields })
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
    const existingIndex = component.fields.findIndex(
      (f, i) => f.name === field.name && i !== index
    )
    if (existingIndex !== -1) {
      fieldErrors.name = 'Field name already exists'
    }

    // Validate nested component field
    if (field.type === 'component' && !field.componentId) {
      fieldErrors.componentId = 'Please select a component'
    }

    if (Object.keys(fieldErrors).length > 0) {
      setFieldDialog({ ...fieldDialog, errors: fieldErrors })
      return
    }

    const newFields = [...component.fields]
    if (index === -1) {
      newFields.push(field)
    } else {
      newFields[index] = field
    }

    setComponent({ ...component, fields: newFields })
    setFieldDialog({ open: false, field: null, index: -1, errors: {} })
  }

  const handleFieldChange = (
    field: ComponentField | null,
    key: string,
    value: string | boolean
  ): void => {
    if (!field) return

    const updatedField: ComponentField = { ...field }
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
        // Clear componentId when type changes
        if (key === 'type' && value !== 'component') {
          delete updatedField.componentId
        }
      } else if (key === 'required') {
        updatedField.required = value as boolean
      } else if (key === 'componentId') {
        updatedField.componentId = value as string
      }
    }
    setFieldDialog({ ...fieldDialog, field: updatedField })
  }

  const renderFieldForm = (field: ComponentField, depth: number = 0): JSX.Element => {
    const nestedComponent =
      field.type === 'component' && field.componentId
        ? contentStore.getComponent(field.componentId)
        : null

    return (
      <Box key={field.name} sx={{ ml: depth * 2 }}>
        <Paper variant="outlined" sx={{ p: 1.5, mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                <Chip label={field.label} size="small" />
                <Chip
                  label={FIELD_TYPES.find((t) => t.value === field.type)?.label || field.type}
                  size="small"
                  variant="outlined"
                />
                {field.required && <Chip label="Required" size="small" color="error" />}
                {field.type === 'component' && nestedComponent && (
                  <Chip
                    label={`Nested: ${nestedComponent.name}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
              <Typography variant="caption" color="text.secondary">
                Name: {field.name}
              </Typography>
            </Box>
          </Box>
        </Paper>
        {field.type === 'component' && nestedComponent && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">
                Nested Component: {nestedComponent.name}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {nestedComponent.fields.map((nestedField) =>
                  renderFieldForm(nestedField, depth + 1)
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}
      </Box>
    )
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Create New Component</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              fullWidth
              label="Component Name"
              value={component.name}
              onChange={(e) => setComponent({ ...component, name: e.target.value })}
              error={!!errors.name}
              helperText={errors.name}
              required
            />

            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6">Component Fields</Typography>
                <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddField}>
                  Add Field
                </Button>
              </Box>

              {errors.fields && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.fields}
                </Alert>
              )}

              {component.fields.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No fields added yet. Click the button above to add the first field.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {component.fields.map((field, index) => (
                    <Box key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        {renderFieldForm(field)}
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
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" startIcon={<SaveIcon />}>
            Save Component
          </Button>
        </DialogActions>
      </Dialog>

      {/* Field Edit Dialog */}
      <Dialog
        open={fieldDialog.open}
        onClose={() => setFieldDialog({ open: false, field: null, index: -1, errors: {} })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {fieldDialog.index === -1 ? 'Add Component Field' : 'Edit Component Field'}
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
                onChange={(e) => handleFieldChange(fieldDialog.field, 'type', e.target.value as string)}
              >
                {FIELD_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {fieldDialog.field?.type === 'component' && (
              <FormControl fullWidth>
                <InputLabel>Nested Component</InputLabel>
                <Select
                  value={fieldDialog.field?.componentId || ''}
                  label="Nested Component"
                  onChange={(e) => handleFieldChange(fieldDialog.field, 'componentId', e.target.value)}
                >
                  {contentStore.getAllComponents().map((comp) => (
                    <MenuItem key={comp.id} value={comp.id}>
                      {comp.name}
                    </MenuItem>
                  ))}
                  {contentStore.getAllComponents().length === 0 && (
                    <MenuItem disabled>No components available</MenuItem>
                  )}
                </Select>
              </FormControl>
            )}
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
    </>
  )
}

export default ComponentManagerDialog

