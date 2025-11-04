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
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Chip,
  Menu,
  MenuItem,
  Alert,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import PublishIcon from '@mui/icons-material/Publish'
import UnpublishedIcon from '@mui/icons-material/Unpublished'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import contentStore from '../store/contentStore'

function ContentPage() {
  const { contentTypeId } = useParams()
  const navigate = useNavigate()
  const [contentType, setContentType] = useState(null)
  const [contents, setContents] = useState([])
  const [contentDialog, setContentDialog] = useState({
    open: false,
    content: null,
    isEdit: false,
  })
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [menuContentId, setMenuContentId] = useState(null)

  useEffect(() => {
    loadData()
  }, [contentTypeId])

  const loadData = () => {
    const type = contentStore.getContentType(contentTypeId)
    if (!type) {
      navigate('/')
      return
    }
    setContentType(type)
    const allContents = contentStore.getAllContents(contentTypeId)
    setContents(allContents)
  }

  const handleCreate = () => {
    const initialContent = {}
    if (contentType.fields) {
      contentType.fields.forEach((field) => {
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
    }
    setContentDialog({
      open: true,
      content: initialContent,
      isEdit: false,
    })
  }

  const handleEdit = (content) => {
    setContentDialog({
      open: true,
      content: { ...content },
      isEdit: true,
    })
  }

  const handleDelete = (contentId) => {
    if (window.confirm('确定要删除这个内容项吗？')) {
      contentStore.deleteContent(contentTypeId, contentId)
      loadData()
    }
  }

  const handleSave = () => {
    const { content, isEdit } = contentDialog
    const errors = {}

    // 验证必填字段
    if (contentType.fields) {
      contentType.fields.forEach((field) => {
        if (field.required) {
          const value = content[field.name]
          if (
            value === undefined ||
            value === null ||
            value === '' ||
            (Array.isArray(value) && value.length === 0)
          ) {
            errors[field.name] = `${field.label} 是必填字段`
          }
        }

        // 验证字段类型
        if (content[field.name] !== undefined && content[field.name] !== '') {
          if (field.type === 'email' && content[field.name]) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(content[field.name])) {
              errors[field.name] = '请输入有效的邮箱地址'
            }
          }
          if (field.type === 'url' && content[field.name]) {
            try {
              new URL(content[field.name])
            } catch {
              errors[field.name] = '请输入有效的 URL'
            }
          }
          if (field.type === 'number' && content[field.name] !== '') {
            const num = Number(content[field.name])
            if (isNaN(num)) {
              errors[field.name] = '请输入有效的数字'
            } else {
              if (field.validation?.min && num < Number(field.validation.min)) {
                errors[field.name] = `值不能小于 ${field.validation.min}`
              }
              if (field.validation?.max && num > Number(field.validation.max)) {
                errors[field.name] = `值不能大于 ${field.validation.max}`
              }
            }
          }
          if (['text', 'textarea', 'email', 'url'].includes(field.type)) {
            const length = String(content[field.name]).length
            if (field.validation?.minLength && length < Number(field.validation.minLength)) {
              errors[field.name] = `长度不能小于 ${field.validation.minLength} 个字符`
            }
            if (field.validation?.maxLength && length > Number(field.validation.maxLength)) {
              errors[field.name] = `长度不能大于 ${field.validation.maxLength} 个字符`
            }
          }
        }
      })
    }

    if (Object.keys(errors).length > 0) {
      setContentDialog({ ...contentDialog, errors })
      return
    }

    if (isEdit) {
      contentStore.updateContent(contentTypeId, content.id, {
        ...content,
        status: 'draft', // 保存后变为草稿
      })
    } else {
      contentStore.createContent(contentTypeId, content)
    }

    setContentDialog({ open: false, content: null, isEdit: false })
    loadData()
  }

  const handlePublish = (contentId) => {
    contentStore.publishContent(contentTypeId, contentId)
    loadData()
    setMenuAnchor(null)
  }

  const handleUnpublish = (contentId) => {
    contentStore.unpublishContent(contentTypeId, contentId)
    loadData()
    setMenuAnchor(null)
  }

  const handleMenuOpen = (event, contentId) => {
    setMenuAnchor(event.currentTarget)
    setMenuContentId(contentId)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
    setMenuContentId(null)
  }

  const renderFieldInput = (field, value, onChange) => {
    switch (field.type) {
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Checkbox checked={value || false} onChange={(e) => onChange(e.target.checked)} />
            }
            label={field.label}
          />
        )
      case 'date':
        return (
          <TextField
            fullWidth
            label={field.label}
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            required={field.required}
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
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          />
        )
      case 'number':
        return (
          <TextField
            fullWidth
            label={field.label}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          />
        )
      case 'relation':
        // 简化版的关系字段，实际应该支持选择其他 Content Type
        return (
          <TextField
            fullWidth
            label={field.label}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="输入关系 ID"
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
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
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
        <IconButton onClick={() => navigate('/')}>
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          创建内容
        </Button>
      </Box>

      <Card>
        <CardContent>
          {contents.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                还没有创建任何内容，点击上方按钮创建第一个内容项
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
                    <TableCell>状态</TableCell>
                    <TableCell>创建时间</TableCell>
                    <TableCell>更新时间</TableCell>
                    <TableCell align="right">操作</TableCell>
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
                              ? '是'
                              : '否'
                            : String(content[field.name] || '-').slice(0, 50)}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Chip
                          label={content.status === 'published' ? '已发布' : '草稿'}
                          color={content.status === 'published' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {content.createdAt
                          ? new Date(content.createdAt).toLocaleString('zh-CN')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {content.updatedAt
                          ? new Date(content.updatedAt).toLocaleString('zh-CN')
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

      {/* 操作菜单 */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            const content = contents.find((c) => c.id === menuContentId)
            if (content) {
              handleEdit(content)
            }
            handleMenuClose()
          }}
        >
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          编辑
        </MenuItem>
        <MenuItem
          onClick={() => {
            const content = contents.find((c) => c.id === menuContentId)
            if (content) {
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
              取消发布
            </>
          ) : (
            <>
              <PublishIcon sx={{ mr: 1 }} fontSize="small" />
              发布
            </>
          )}
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDelete(menuContentId)
            handleMenuClose()
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          删除
        </MenuItem>
      </Menu>

      {/* 内容编辑对话框 */}
      <Dialog
        open={contentDialog.open}
        onClose={() =>
          setContentDialog({ open: false, content: null, isEdit: false })
        }
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {contentDialog.isEdit ? '编辑内容' : '创建内容'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {contentDialog.content &&
              contentType.fields?.map((field) => (
                <Box key={field.name}>
                  {renderFieldInput(
                    field,
                    contentDialog.content[field.name],
                    (value) => {
                      const updatedContent = {
                        ...contentDialog.content,
                        [field.name]: value,
                      }
                      setContentDialog({
                        ...contentDialog,
                        content: updatedContent,
                      })
                    }
                  )}
                  {contentDialog.errors?.[field.name] && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {contentDialog.errors[field.name]}
                    </Alert>
                  )}
                </Box>
              ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setContentDialog({ open: false, content: null, isEdit: false })
            }
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<SaveIcon />}
          >
            保存 (保存为草稿)
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ContentPage

