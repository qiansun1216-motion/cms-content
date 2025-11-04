# CMS Content Manager

A CMS content management system based on React and Material-UI, designed with reference to Strapi functionality. Supports Content Type definition and content management.

## Features

### Content Definition Page
- ✅ Create and edit Content Types
- ✅ Define field types (Text, Number, Date, Boolean, Email, URL, Textarea, Relation)
- ✅ Field property settings (Name, Label, Type, Default Value, Validation Rules)
- ✅ Field validation (Required, Length Limits, Number Range, etc.)
- ✅ Delete Content Types

### Content Page
- ✅ View all content items for a Content Type
- ✅ Create new content items
- ✅ Edit existing content items
- ✅ Delete content items
- ✅ Workflow support:
  - Automatically becomes `draft` status after saving
  - Can publish content (`draft` → `published`)
  - Can unpublish content (`published` → `draft`)

## Tech Stack

- **React 18** - UI Framework
- **Material-UI (MUI) 5** - UI Component Library
- **TypeScript** - Type Safety
- **React Router 6** - Routing
- **Vite** - Build Tool
- **localStorage** - Data Persistence

## Installation and Running

### Install Dependencies

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

The application will start at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Common components
│   └── Layout.tsx      # Layout component
├── pages/              # Page components
│   ├── ContentDefinitionPage.tsx  # Content Definition list page
│   ├── ContentTypeEditPage.tsx    # Content Type edit page
│   ├── ContentPage.tsx            # Content list page
│   └── ContentEditPage.tsx        # Content edit page
├── store/              # State management
│   └── contentStore.ts # Content data store
├── types/              # TypeScript type definitions
│   └── index.ts        # Type definitions
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Usage

### Create Content Type

1. Click the "Create Content Type" button on the Content Definitions page
2. Fill in the Content Type name and description
3. Click "Add Field" button to define fields
4. For each field, set:
   - Field Name (unique identifier)
   - Field Label (display name)
   - Field Type
   - Required (yes/no)
   - Default Value (optional)
   - Validation Rules (varies by field type)
5. Click "Save" to save the Content Type

### Manage Content

1. Click "View Content" on a Content Type card in the Content Definitions page
2. Click "Create Content" button to create a new content item
3. The form will be automatically generated based on the Content Type field definitions
4. Fill in the content and click "Save (Save as Draft)"
5. Content will be saved with `draft` status
6. Through the action menu, you can:
   - Edit content
   - Publish content (`draft` → `published`)
   - Unpublish content (`published` → `draft`)
   - Delete content

## Data Storage

Data is persisted using browser `localStorage`, including:
- Content Types definitions
- Content items

## Design Features

- Clean and modern Material Design style
- Intuitive user interface
- Complete form validation
- Responsive design
- Clear state management
- Left sidebar navigation
- Dedicated pages for content editing (no modals)

## Browser Support

Supports all modern browsers (Chrome, Firefox, Safari, Edge)
