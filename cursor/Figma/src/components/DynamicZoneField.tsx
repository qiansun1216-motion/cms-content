import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  IconButton,
  Chip,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import contentStore from '../store/contentStore'
import { Component, ComponentField } from '../types'
import ComponentFieldComponent from './ComponentField'

interface DynamicZoneItem {
  __component: string
  [key: string]: any
}

interface DynamicZoneFieldProps {
  label: string
  value: DynamicZoneItem[]
  onChange: (value: DynamicZoneItem[]) => void
  availableComponents: Component[]
  error?: string
  required?: boolean
}

function DynamicZoneField({
  label,
  value = [],
  onChange,
  availableComponents,
  error,
  required,
}: DynamicZoneFieldProps): JSX.Element {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleAddComponent = (componentId: string): void => {
    const component = contentStore.getComponent(componentId)
    if (!component) return

    const newItem: DynamicZoneItem = { __component: componentId }
    // Initialize component fields with default values
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

    onChange([...value, newItem])
  }

  const handleRemoveComponent = (index: number): void => {
    const updated = value.filter((_, i) => i !== index)
    onChange(updated)
  }

  const handleMoveUp = (index: number): void => {
    if (index === 0) return
    const updated = [...value]
    ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    onChange(updated)
  }

  const handleMoveDown = (index: number): void => {
    if (index === value.length - 1) return
    const updated = [...value]
    ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    onChange(updated)
  }

  const handleComponentFieldChange = (index: number, fieldName: string, fieldValue: any): void => {
    const updated = [...value]
    updated[index] = {
      ...updated[index],
      [fieldName]: fieldValue,
    }
    onChange(updated)
  }

  const renderComponentField = (
    component: Component,
    item: DynamicZoneItem,
    itemIndex: number
  ): JSX.Element => {
    const renderField = (compField: ComponentField): JSX.Element => {
      const fieldValue = item[compField.name] || ''

      if (compField.type === 'boolean') {
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={fieldValue || false}
                onChange={(e) =>
                  handleComponentFieldChange(itemIndex, compField.name, e.target.checked)
                }
              />
            }
            label={compField.label}
          />
        )
      }

      if (compField.type === 'component' && compField.componentId) {
        const nestedComponent = contentStore.getComponent(compField.componentId)
        if (!nestedComponent) {
          return (
            <Alert severity="warning">
              Nested component not found: {compField.componentId}
            </Alert>
          )
        }

        return (
          <Box sx={{ ml: 2, mt: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              {compField.label}:
            </Typography>
            <ComponentFieldComponent
              component={nestedComponent}
              value={fieldValue || {}}
              onChange={(val) => handleComponentFieldChange(itemIndex, compField.name, val)}
              depth={1}
            />
          </Box>
        )
      }

      return (
        <TextField
          fullWidth
          label={compField.label}
          type={
            compField.type === 'number'
              ? 'number'
              : compField.type === 'email'
              ? 'email'
              : compField.type === 'url'
              ? 'url'
              : compField.type === 'date'
              ? 'date'
              : 'text'
          }
          value={fieldValue}
          onChange={(e) =>
            handleComponentFieldChange(itemIndex, compField.name, e.target.value)
          }
          multiline={compField.type === 'textarea'}
          rows={compField.type === 'textarea' ? 4 : 1}
          required={compField.required}
          InputLabelProps={compField.type === 'date' ? { shrink: true } : undefined}
        />
      )
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {component.fields.map((compField) => (
          <Box key={compField.name}>{renderField(compField)}</Box>
        ))}
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        {label}
        {required && <Typography component="span" color="error"> *</Typography>}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {value.map((item, index) => {
          const component = contentStore.getComponent(item.__component)
          if (!component) {
            return (
              <Alert key={index} severity="error">
                Component not found: {item.__component}
              </Alert>
            )
          }

          return (
            <Paper key={index} variant="outlined" sx={{ p: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    <DragHandleIcon sx={{ transform: 'rotate(-90deg)' }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === value.length - 1}
                  >
                    <DragHandleIcon sx={{ transform: 'rotate(90deg)' }} />
                  </IconButton>
                  <Chip
                    label={component.name}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary">
                    ({index + 1} of {value.length})
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveComponent(index)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
              {renderComponentField(component, item, index)}
            </Paper>
          )
        })}

        <FormControl fullWidth>
          <InputLabel>Add Component</InputLabel>
          <Select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                handleAddComponent(e.target.value)
                // Reset select value
                ;(e.target as HTMLSelectElement).value = ''
              }
            }}
          >
            <MenuItem value="">
              <em>Select a component to add</em>
            </MenuItem>
            {availableComponents.map((comp) => (
              <MenuItem key={comp.id} value={comp.id}>
                {comp.name}
              </MenuItem>
            ))}
            {availableComponents.length === 0 && (
              <MenuItem disabled>No components available</MenuItem>
            )}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  )
}

export default DynamicZoneField

