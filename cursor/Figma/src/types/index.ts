export interface FieldValidation {
  minLength?: string
  maxLength?: string
  min?: string
  max?: string
}

export interface Field {
  name: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'email' | 'url' | 'textarea' | 'relation'
  label: string
  required: boolean
  defaultValue?: string
  validation?: FieldValidation
}

export interface ContentType {
  id: string
  name: string
  description?: string
  fields: Field[]
}

export interface Content {
  id: string
  contentTypeId: string
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
  publishedAt?: string
  [key: string]: any
}

export interface ContentsMap {
  [contentTypeId: string]: Content[]
}

