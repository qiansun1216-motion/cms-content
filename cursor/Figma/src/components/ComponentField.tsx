import React from 'react'
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Alert,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import contentStore from '../store/contentStore'
import { ComponentField as ComponentFieldType, Component } from '../types'

interface ComponentFieldProps {
  field?: { label: string; name: string } // Field from ContentType (optional for nested)
  component: Component
  value: Record<string, any>
  onChange: (value: Record<string, any>) => void
  error?: string
  depth?: number
}

function ComponentField({
  field,
  component,
  value = {},
  onChange,
  error,
  depth = 0,
}: ComponentFieldProps): JSX.Element {
  const handleFieldChange = (fieldName: string, fieldValue: any): void => {
    const updated = { ...value, [fieldName]: fieldValue }
    onChange(updated)
  }

  const renderFieldInput = (compField: ComponentFieldType): JSX.Element => {
    const fieldValue = value[compField.name] || ''

    if (compField.type === 'boolean') {
      return (
        <FormControlLabel
          control={
            <Checkbox
              checked={fieldValue || false}
              onChange={(e) => handleFieldChange(compField.name, e.target.checked)}
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
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2">
              {compField.label} ({nestedComponent.name})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ComponentField
              component={nestedComponent}
              value={fieldValue || {}}
              onChange={(val) => handleFieldChange(compField.name, val)}
              depth={depth + 1}
            />
          </AccordionDetails>
        </Accordion>
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
        onChange={(e) => handleFieldChange(compField.name, e.target.value)}
        multiline={compField.type === 'textarea'}
        rows={compField.type === 'textarea' ? 4 : 1}
        required={compField.required}
        InputLabelProps={compField.type === 'date' ? { shrink: true } : undefined}
      />
    )
  }

  return (
    <Box>
      {field && (
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          {field.label} ({component.name})
        </Typography>
      )}
      {!field && (
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          {component.name}
        </Typography>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {component.fields.map((compField) => (
          <Box key={compField.name}>{renderFieldInput(compField)}</Box>
        ))}
      </Box>
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  )
}

export default ComponentField

