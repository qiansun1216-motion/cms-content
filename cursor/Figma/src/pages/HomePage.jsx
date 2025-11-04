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
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import contentStore from '../store/contentStore'

function HomePage() {
  const navigate = useNavigate()
  const contentTypes = contentStore.getAllContentTypes()

  const handleCreateContentType = () => {
    navigate('/content-definitions')
  }

  const handleViewContent = (contentTypeId) => {
    navigate(`/content/${contentTypeId}`)
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Content Types
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateContentType}
        >
          创建 Content Type
        </Button>
      </Box>

      {contentTypes.length === 0 ? (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ContentPasteIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                还没有创建任何 Content Type
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                点击上方按钮创建您的第一个 Content Type
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateContentType}
              >
                创建 Content Type
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {contentTypes.map((contentType) => {
            const contents = contentStore.getAllContents(contentType.id)
            const publishedCount = contents.filter(c => c.status === 'published').length
            const draftCount = contents.filter(c => c.status === 'draft').length

            return (
              <Grid item xs={12} sm={6} md={4} key={contentType.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {contentType.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {contentType.description || '无描述'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={`${contentType.fields?.length || 0} 个字段`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`${publishedCount} 已发布`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                      <Chip
                        label={`${draftCount} 草稿`}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => handleViewContent(contentType.id)}
                    >
                      查看内容
                    </Button>
                    <Button
                      size="small"
                      onClick={() => navigate('/content-definitions', { state: { editId: contentType.id } })}
                    >
                      编辑定义
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

export default HomePage

