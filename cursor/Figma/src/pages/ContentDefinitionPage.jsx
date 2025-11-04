import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
  FormHelperText,
  Checkbox,
  FormControlLabel,
  Paper,
  Divider,
  Chip,
  Alert,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import contentStore from '../store/contentStore'

const FIELD_TYPES = [
  { value: 'text', label: '文本 (Text)' },
  { value: 'number', label: '数字 (Number)' },
  { value: 'date', label: '日期 (Date)' },
  { value: 'boolean', label: '布尔值 (Boolean)' },
  { value: 'email', label: '邮箱 (Email)' },
  { value: 'url', label: 'URL' },
  { value: 'textarea', label: '多行文本 (Textarea)' },
  { value: 'relation', label: '关系 (Relation)' },
]

function ContentDefinitionPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const editId = location.state?.editId

  const [contentType, setContentType] = useState({
    name: '',
    description: '',
    fields: [],
  })

  const [fieldDialog, setFieldDialog] = useState({
    open: false,
    field: null,
    index: -1,
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (editId) {
      const existing = contentStore.getContentType(editId)
      if (existing) {
        setContentType(existing)
      }
    }
  }, [editId])

  const handleSave = () => {
    const newErrors = {}

    if (!contentType.name.trim()) {
      newErrors.name = 'Content Type 名称不能为空'
    }

    if (contentType.fields.length === 0) {
      newErrors.fields = '至少需要添加一个字段'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})

    if (editId) {
      contentStore.updateContentType(editId, contentType)
    } else {
      const newType = contentStore.createContentType(contentType)
      navigate(`/content/${newType.id}`)
    }

    navigate('/')
  }

  const handleDelete = () => {
    if (editId) {
      if (window.confirm('确定要删除这个 Content Type 吗？此操作不可恢复。')) {
        contentStore.deleteContentType(editId)
        navigate('/')
      }
    } else {
      navigate('/')
    }
  }

  const handleAddField = () => {
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
    })
  }

  const handleEditField = (index) => {
    setFieldDialog({
      open: true,
      field: { ...contentType.fields[index] },
      index,
    })
  }

  const handleDeleteField = (index) => {
    const newFields = contentType.fields.filter((_, i) => i !== index)
    setContentType({ ...contentType, fields: newFields })
  }

  const handleSaveField = () => {
    const { field, index } = fieldDialog
    const fieldErrors = {}

    if (!field.name.trim()) {
      fieldErrors.name = '字段名称不能为空'
    }

    if (!field.label.trim()) {
      fieldErrors.label = '字段标签不能为空'
    }

    // 检查字段名是否重复
    const existingIndex = contentType.fields.findIndex(
      (f, i) => f.name === field.name && i !== index
    )
    if (existingIndex !== -1) {
      fieldErrors.name = '字段名称已存在'
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
    setFieldDialog({ open: false, field: null, index: -1 })
  }

  const handleFieldChange = (field, key, value) => {
    const updatedField = { ...field }
    if (key.includes('.')) {
      const [parent, child] = key.split('.')
      updatedField[parent] = { ...updatedField[parent], [child]: value }
    } else {
      updatedField[key] = value
    }
    setFieldDialog({ ...fieldDialog, field: updatedField })
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {editId ? '编辑 Content Type' : '创建 Content Type'}
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Content Type 名称"
            value={contentType.name}
            onChange={(e) =>
              setContentType({ ...contentType, name: e.target.value })
            }
            error={!!errors.name}
            helperText={errors.name}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="描述"
            value={contentType.description}
            onChange={(e) =>
              setContentType({ ...contentType, description: e.target.value })
            }
            multiline
            rows={2}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">字段定义</Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddField}
            >
              添加字段
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
                还没有添加任何字段，点击上方按钮添加第一个字段
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
                        <Chip label={FIELD_TYPES.find(t => t.value === field.type)?.label || field.type} size="small" variant="outlined" />
                        {field.required && <Chip label="必填" size="small" color="error" />}
                        <Chip label={`名称: ${field.name}`} size="small" variant="outlined" />
                      </Box>
                      {field.defaultValue && (
                        <Typography variant="body2" color="text.secondary">
                          默认值: {field.defaultValue}
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
          <Button onClick={handleDelete} color="error" variant="outlined">
            删除
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<SaveIcon />}
          >
            保存
          </Button>
        </CardActions>
      </Card>

      {/* 字段编辑对话框 */}
      <Dialog
        open={fieldDialog.open}
        onClose={() => setFieldDialog({ open: false, field: null, index: -1 })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {fieldDialog.index === -1 ? '添加字段' : '编辑字段'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="字段名称 (Name)"
              value={fieldDialog.field?.name || ''}
              onChange={(e) =>
                handleFieldChange(fieldDialog.field, 'name', e.target.value)
              }
              error={!!fieldDialog.errors?.name}
              helperText={fieldDialog.errors?.name || '字段的唯一标识符，使用小写字母和下划线'}
              required
            />
            <TextField
              fullWidth
              label="字段标签 (Label)"
              value={fieldDialog.field?.label || ''}
              onChange={(e) =>
                handleFieldChange(fieldDialog.field, 'label', e.target.value)
              }
              error={!!fieldDialog.errors?.label}
              helperText={fieldDialog.errors?.label}
              required
            />
            <FormControl fullWidth>
              <InputLabel>字段类型</InputLabel>
              <Select
                value={fieldDialog.field?.type || 'text'}
                label="字段类型"
                onChange={(e) =>
                  handleFieldChange(fieldDialog.field, 'type', e.target.value)
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
                    handleFieldChange(
                      fieldDialog.field,
                      'required',
                      e.target.checked
                    )
                  }
                />
              }
              label="必填字段"
            />
            {fieldDialog.field?.type !== 'boolean' && (
              <TextField
                fullWidth
                label="默认值"
                value={fieldDialog.field?.defaultValue || ''}
                onChange={(e) =>
                  handleFieldChange(
                    fieldDialog.field,
                    'defaultValue',
                    e.target.value
                  )
                }
                helperText="可选：字段的默认值"
              />
            )}
            {['text', 'textarea', 'email', 'url'].includes(
              fieldDialog.field?.type
            ) && (
              <>
                <TextField
                  fullWidth
                  type="number"
                  label="最小长度"
                  value={fieldDialog.field?.validation?.minLength || ''}
                  onChange={(e) =>
                    handleFieldChange(fieldDialog.field, 'validation.minLength', e.target.value)
                  }
                />
                <TextField
                  fullWidth
                  type="number"
                  label="最大长度"
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
                  label="最小值"
                  value={fieldDialog.field?.validation?.min || ''}
                  onChange={(e) =>
                    handleFieldChange(fieldDialog.field, 'validation.min', e.target.value)
                  }
                />
                <TextField
                  fullWidth
                  type="number"
                  label="最大值"
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
            onClick={() =>
              setFieldDialog({ open: false, field: null, index: -1 })
            }
          >
            取消
          </Button>
          <Button onClick={handleSaveField} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ContentDefinitionPage

