// 简单的状态管理，使用 localStorage 持久化
class ContentStore {
  constructor() {
    this.contentTypes = this.loadContentTypes();
    this.contents = this.loadContents();
  }

  loadContentTypes() {
    const stored = localStorage.getItem('contentTypes');
    return stored ? JSON.parse(stored) : [];
  }

  loadContents() {
    const stored = localStorage.getItem('contents');
    return stored ? JSON.parse(stored) : {};
  }

  saveContentTypes() {
    localStorage.setItem('contentTypes', JSON.stringify(this.contentTypes));
  }

  saveContents() {
    localStorage.setItem('contents', JSON.stringify(this.contents));
  }

  // Content Type 操作
  createContentType(contentType) {
    const id = Date.now().toString();
    const newType = { ...contentType, id };
    this.contentTypes.push(newType);
    this.saveContentTypes();
    // 初始化该类型的 content 数组
    if (!this.contents[newType.id]) {
      this.contents[newType.id] = [];
    }
    this.saveContents();
    return newType;
  }

  updateContentType(id, updates) {
    const index = this.contentTypes.findIndex(ct => ct.id === id);
    if (index !== -1) {
      this.contentTypes[index] = { ...this.contentTypes[index], ...updates };
      this.saveContentTypes();
      return this.contentTypes[index];
    }
    return null;
  }

  deleteContentType(id) {
    this.contentTypes = this.contentTypes.filter(ct => ct.id !== id);
    delete this.contents[id];
    this.saveContentTypes();
    this.saveContents();
  }

  getContentType(id) {
    return this.contentTypes.find(ct => ct.id === id);
  }

  getAllContentTypes() {
    return this.contentTypes;
  }

  // Content 操作
  createContent(contentTypeId, content) {
    const id = Date.now().toString();
    const newContent = {
      ...content,
      id,
      contentTypeId,
      status: 'draft', // draft, published
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!this.contents[contentTypeId]) {
      this.contents[contentTypeId] = [];
    }
    this.contents[contentTypeId].push(newContent);
    this.saveContents();
    return newContent;
  }

  updateContent(contentTypeId, contentId, updates) {
    const contents = this.contents[contentTypeId] || [];
    const index = contents.findIndex(c => c.id === contentId);
    if (index !== -1) {
      contents[index] = {
        ...contents[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.saveContents();
      return contents[index];
    }
    return null;
  }

  deleteContent(contentTypeId, contentId) {
    if (this.contents[contentTypeId]) {
      this.contents[contentTypeId] = this.contents[contentTypeId].filter(
        c => c.id !== contentId
      );
      this.saveContents();
    }
  }

  getContent(contentTypeId, contentId) {
    const contents = this.contents[contentTypeId] || [];
    return contents.find(c => c.id === contentId);
  }

  getAllContents(contentTypeId) {
    return this.contents[contentTypeId] || [];
  }

  // Workflow 操作
  publishContent(contentTypeId, contentId) {
    return this.updateContent(contentTypeId, contentId, {
      status: 'published',
      publishedAt: new Date().toISOString(),
    });
  }

  unpublishContent(contentTypeId, contentId) {
    return this.updateContent(contentTypeId, contentId, {
      status: 'draft',
    });
  }
}

// 单例模式
const contentStore = new ContentStore();

export default contentStore;

