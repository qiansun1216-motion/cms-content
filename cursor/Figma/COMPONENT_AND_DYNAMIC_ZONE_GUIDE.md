# Component and Dynamic Zone Implementation Guide

This guide explains how to use the Component and Dynamic Zone field types in the CMS system.

## 📋 Table of Contents

1. [Component Field Type](#component-field-type)
2. [Dynamic Zone Field Type](#dynamic-zone-field-type)
3. [Data Structure](#data-structure)
4. [Usage Examples](#usage-examples)

---

## 🧩 Component Field Type

### Overview

A Component is a reusable set of fields that can be used across multiple Content Types. Components support nested components, allowing you to create complex data structures.

### Creating a Component

1. **Navigate to Content Definitions**
   - Click on "Content Definitions" in the left sidebar
   - Click "Create Content Type" or edit an existing one

2. **Add a Component Field**
   - Click "Add Field"
   - Select "Component" as the field type
   - Click "Create New Component" button

3. **Component Manager Dialog**
   - Enter a Component name (e.g., "Address", "SEO", "Media")
   - Add fields to the component:
     - Click "Add Field"
     - Define field name, label, type, and properties
     - Support nested components: Select "Component (Nested)" as field type
   - Click "Save Component"

4. **Select Component**
   - After creating, the component will be automatically selected
   - You can also select existing components from the dropdown

### Component Field Features

- ✅ **Reusable**: Use the same component across multiple Content Types
- ✅ **Nested Components**: Components can contain other components
- ✅ **Accordion Display**: Nested components are displayed in expandable accordions
- ✅ **Field Overview**: See all component fields in the Content Definition page

### Component Data Structure

```typescript
{
  componentName: {
    field1: "value1",
    field2: "value2",
    nestedComponent: {
      nestedField1: "value",
      nestedField2: "value"
    }
  }
}
```

---

## 🌀 Dynamic Zone Field Type

### Overview

A Dynamic Zone is a flexible field that can contain multiple different component instances. Users can add, remove, and reorder components dynamically.

### Setting Up Dynamic Zone

1. **Create Components First**
   - Create the components you want to use in the Dynamic Zone
   - Examples: "Banner", "Gallery", "Text Block", "Video"

2. **Add Dynamic Zone Field**
   - In Content Type edit page, click "Add Field"
   - Select "Dynamic Zone" as the field type
   - In the "Available Components" dropdown:
     - Select multiple components (hold Ctrl/Cmd for multiple selection)
     - These are the component types allowed in this zone

### Dynamic Zone Features

- ✅ **Multiple Component Types**: Add different component types in the same zone
- ✅ **Drag & Drop Sorting**: Use up/down arrows to reorder components
- ✅ **Add/Remove**: Dynamically add or remove component instances
- ✅ **Component Cards**: Each component instance is displayed in a card
- ✅ **Nested Components**: Supports nested components within zone items

### Dynamic Zone Data Structure

```typescript
{
  dynamicZoneName: [
    {
      __component: "component-id-1",
      field1: "value",
      field2: "value"
    },
    {
      __component: "component-id-2",
      field1: "value",
      field2: "value"
    }
  ]
}
```

---

## 📊 Data Structure

### Type Definitions

```typescript
// Component Field in Component
interface ComponentField {
  name: string
  type: 'text' | 'number' | 'date' | 'boolean' | 'email' | 'url' | 'textarea' | 'component'
  label: string
  required: boolean
  defaultValue?: string
  validation?: FieldValidation
  componentId?: string // For nested components
}

// Component Definition
interface Component {
  id: string
  name: string
  fields: ComponentField[]
}

// Field in Content Type
interface Field {
  name: string
  type: 'component' | 'dynamicZone' | ...
  label: string
  required: boolean
  componentId?: string // For component fields
  dynamicZoneConfig?: {
    components: string[] // Component IDs allowed in zone
  }
}
```

---

## 💡 Usage Examples

### Example 1: Address Component

**Component Definition:**
- Name: "Address"
- Fields:
  - `street` (Text, Required)
  - `city` (Text, Required)
  - `state` (Text, Required)
  - `zip` (Text, Required)
  - `country` (Text, Required)

**Usage in Content Type:**
- Add field: `shippingAddress` (Component type, select "Address")
- Add field: `billingAddress` (Component type, select "Address")

**Content Data:**
```json
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA"
  },
  "billingAddress": {
    "street": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "zip": "90001",
    "country": "USA"
  }
}
```

### Example 2: Nested Component (Contact Info)

**Parent Component: "ContactInfo"**
- `phone` (Text)
- `email` (Email)
- `address` (Component, nested "Address" component)

**Content Data:**
```json
{
  "contactInfo": {
    "phone": "123-456-7890",
    "email": "contact@example.com",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "country": "USA"
    }
  }
}
```

### Example 3: Page Builder with Dynamic Zone

**Components:**
1. "HeroBanner" - `title`, `subtitle`, `image`, `buttonText`
2. "TextBlock" - `title`, `content` (textarea)
3. "Gallery" - `images` (text, multiple)

**Content Type: "Page"**
- `title` (Text)
- `content` (Dynamic Zone, allow: HeroBanner, TextBlock, Gallery)

**Content Data:**
```json
{
  "title": "Home Page",
  "content": [
    {
      "__component": "hero-banner-id",
      "title": "Welcome",
      "subtitle": "To our website",
      "image": "hero.jpg",
      "buttonText": "Get Started"
    },
    {
      "__component": "text-block-id",
      "title": "About Us",
      "content": "We are a great company..."
    },
    {
      "__component": "gallery-id",
      "images": "img1.jpg, img2.jpg, img3.jpg"
    }
  ]
}
```

---

## 🎨 UI Components

### ComponentManagerDialog

**Location:** `src/components/ComponentManagerDialog.tsx`

**Features:**
- Create new components with field definitions
- Support nested component fields
- Accordion view for nested structure
- Field management (add, edit, delete)

### ComponentField

**Location:** `src/components/ComponentField.tsx`

**Features:**
- Renders component fields in a form
- Supports nested components with Accordion
- Handles all field types (text, number, date, boolean, etc.)
- Recursive rendering for deeply nested structures

### DynamicZoneField

**Location:** `src/components/DynamicZoneField.tsx`

**Features:**
- Card-based display for each component instance
- Drag handles for reordering (up/down arrows)
- Add component dropdown
- Delete component button
- Supports nested components within zone items

---

## 🔧 Technical Details

### Component Storage

Components are stored in `localStorage` under the key `components`:
```typescript
{
  "component-id-1": {
    id: "component-id-1",
    name: "Address",
    fields: [...]
  },
  "component-id-2": {...}
}
```

### Content Storage

Content with components is stored as nested objects:
```typescript
{
  "content-id": {
    id: "content-id",
    contentTypeId: "page-id",
    componentField: {
      field1: "value",
      nestedComponent: {
        nestedField: "value"
      }
    },
    dynamicZoneField: [
      { __component: "component-id", ...fields },
      { __component: "component-id", ...fields }
    ]
  }
}
```

---

## ✅ Features Checklist

### Component Field
- [x] Create component with field definitions
- [x] Select existing component in Content Type
- [x] Create new component from field dialog
- [x] Support nested components
- [x] Accordion display for nested components
- [x] Field validation
- [x] Default values

### Dynamic Zone Field
- [x] Multi-select component types
- [x] Add component instances
- [x] Remove component instances
- [x] Reorder components (up/down)
- [x] Card-based UI
- [x] Component type indicator
- [x] Support nested components
- [x] Dynamic form generation

---

## 🚀 Getting Started

1. **Create Components**
   - Go to Content Definitions
   - Create or edit a Content Type
   - Add a Component field
   - Click "Create New Component"
   - Define your component fields

2. **Use Components**
   - Add Component fields to Content Types
   - Or create Dynamic Zones for flexible content

3. **Create Content**
   - Navigate to Content page
   - Create new content
   - Fill in component fields (they appear as expandable forms)
   - For Dynamic Zones, add components dynamically

Enjoy building flexible content structures! 🎉

