import { ContentType, Content, ContentsMap, Component, ComponentsMap } from '../types'

class ContentStore {
  private contentTypes: ContentType[]
  private contents: ContentsMap
  private components: ComponentsMap

  constructor() {
    this.contentTypes = this.loadContentTypes()
    this.contents = this.loadContents()
    this.components = this.loadComponents()
  }

  private loadContentTypes(): ContentType[] {
    const stored = localStorage.getItem('contentTypes')
    return stored ? JSON.parse(stored) : []
  }

  private loadContents(): ContentsMap {
    const stored = localStorage.getItem('contents')
    return stored ? JSON.parse(stored) : {}
  }

  private loadComponents(): ComponentsMap {
    const stored = localStorage.getItem('components')
    return stored ? JSON.parse(stored) : {}
  }

  private saveContentTypes(): void {
    localStorage.setItem('contentTypes', JSON.stringify(this.contentTypes))
  }

  private saveContents(): void {
    localStorage.setItem('contents', JSON.stringify(this.contents))
  }

  private saveComponents(): void {
    localStorage.setItem('components', JSON.stringify(this.components))
  }

  // Content Type operations
  createContentType(contentType: Omit<ContentType, 'id'>): ContentType {
    const id = Date.now().toString()
    const newType: ContentType = { ...contentType, id }
    this.contentTypes.push(newType)
    this.saveContentTypes()
    // Initialize content array for this type
    if (!this.contents[newType.id]) {
      this.contents[newType.id] = []
    }
    this.saveContents()
    return newType
  }

  updateContentType(id: string, updates: Partial<ContentType>): ContentType | null {
    const index = this.contentTypes.findIndex((ct) => ct.id === id)
    if (index !== -1) {
      this.contentTypes[index] = { ...this.contentTypes[index], ...updates }
      this.saveContentTypes()
      return this.contentTypes[index]
    }
    return null
  }

  deleteContentType(id: string): void {
    this.contentTypes = this.contentTypes.filter((ct) => ct.id !== id)
    delete this.contents[id]
    this.saveContentTypes()
    this.saveContents()
  }

  getContentType(id: string): ContentType | undefined {
    return this.contentTypes.find((ct) => ct.id === id)
  }

  getAllContentTypes(): ContentType[] {
    return this.contentTypes
  }

  // Component operations
  createComponent(component: Omit<Component, 'id'>): Component {
    const id = Date.now().toString()
    const newComponent: Component = { ...component, id }
    this.components[id] = newComponent
    this.saveComponents()
    return newComponent
  }

  updateComponent(id: string, updates: Partial<Component>): Component | null {
    if (this.components[id]) {
      this.components[id] = { ...this.components[id], ...updates }
      this.saveComponents()
      return this.components[id]
    }
    return null
  }

  deleteComponent(id: string): void {
    delete this.components[id]
    this.saveComponents()
  }

  getComponent(id: string): Component | undefined {
    return this.components[id]
  }

  getAllComponents(): Component[] {
    return Object.values(this.components)
  }

  // Content operations
  createContent(contentTypeId: string, content: Record<string, any>): Content {
    const id = Date.now().toString()
    const newContent: Content = {
      ...content,
      id,
      contentTypeId,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    if (!this.contents[contentTypeId]) {
      this.contents[contentTypeId] = []
    }
    this.contents[contentTypeId].push(newContent)
    this.saveContents()
    return newContent
  }

  updateContent(
    contentTypeId: string,
    contentId: string,
    updates: Partial<Content>
  ): Content | null {
    const contents = this.contents[contentTypeId] || []
    const index = contents.findIndex((c) => c.id === contentId)
    if (index !== -1) {
      contents[index] = {
        ...contents[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      this.saveContents()
      return contents[index]
    }
    return null
  }

  deleteContent(contentTypeId: string, contentId: string): void {
    if (this.contents[contentTypeId]) {
      this.contents[contentTypeId] = this.contents[contentTypeId].filter(
        (c) => c.id !== contentId
      )
      this.saveContents()
    }
  }

  getContent(contentTypeId: string, contentId: string): Content | undefined {
    const contents = this.contents[contentTypeId] || []
    return contents.find((c) => c.id === contentId)
  }

  getAllContents(contentTypeId: string): Content[] {
    return this.contents[contentTypeId] || []
  }

  // Workflow operations
  publishContent(contentTypeId: string, contentId: string): Content | null {
    return this.updateContent(contentTypeId, contentId, {
      status: 'published',
      publishedAt: new Date().toISOString(),
    })
  }

  unpublishContent(contentTypeId: string, contentId: string): Content | null {
    return this.updateContent(contentTypeId, contentId, {
      status: 'draft',
    })
  }
}

// Singleton pattern
const contentStore = new ContentStore()

export default contentStore
