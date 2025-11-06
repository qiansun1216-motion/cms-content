export interface FieldValidation {
  minLength?: string
  maxLength?: string
  min?: string
  max?: string
}

export interface RelationConfig {
  contentTypeId: string
  relationType: 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany'
}

export interface ComponentField {
  name: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'email' | 'url' | 'textarea' | 'component'
  label: string
  required: boolean
  defaultValue?: string
  validation?: FieldValidation
  // For nested component fields
  componentId?: string
}

export interface Component {
  id: string
  name: string
  fields: ComponentField[]
}

export interface DynamicZoneConfig {
  components: string[] // Component IDs
}

export interface Field {
  name: string
  type:
    | 'text'
    | 'number'
    | 'date'
    | 'boolean'
    | 'email'
    | 'url'
    | 'textarea'
    | 'relation'
    | 'component'
    | 'dynamicZone'
  label: string
  required: boolean
  defaultValue?: string
  validation?: FieldValidation
  // Relation specific
  relationConfig?: RelationConfig
  // Component specific
  componentId?: string
  repeatable?: boolean // true = multiple instances (array), false = single instance (object)
  // Dynamic Zone specific
  dynamicZoneConfig?: DynamicZoneConfig
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

export interface ComponentsMap {
  [componentId: string]: Component
}
