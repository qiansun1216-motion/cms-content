# Relation Field Type Implementation Guide

This document describes the complete implementation of the Relation field type feature, similar to Strapi's relation field.

## Overview

The Relation field type allows Content Types to establish relationships with other Content Types. It supports four relationship types:
- **oneToOne**: 1 to 1 - Single select
- **oneToMany**: 1 to N - Multiple select
- **manyToOne**: N to 1 - Single select
- **manyToMany**: N to N - Multiple select

## Features

### 1. Content-Type Builder (Field Definition)

When creating a Relation field, users can configure:

#### ✅ Select Target Content Type
- Choose which Content Type to relate to
- Automatically excludes current Content Type to prevent circular references

#### ✅ Select Display Field
- Choose which field from the related Content Type to display in the Autocomplete
- Supports: `text`, `email`, `number`, `date` field types
- Falls back to first available text field or ID if not specified

#### ✅ Select Relation Type
- Uses Material-UI `ToggleButtonGroup` for intuitive selection
- Visual preview shows whether the field will render as single or multiple select

#### ✅ Preview
- Shows a preview of how the field will render in the Content editing page
- Displays: "Single Select (Autocomplete)" or "Multiple Select (Autocomplete Multiple)"

### 2. Content Editing Page (Data Entry)

#### Single Select (oneToOne / manyToOne)

**UI Components:**
- `<Autocomplete />` (single mode)
- Remote search capability (mock implementation)
- Selected value display
- "Create New" button (UI placeholder)

**Features:**
- Search/filter related content items
- Clear visual indication of selected item
- Validation support

#### Multiple Select (oneToMany / manyToMany)

**UI Components:**
- `<Autocomplete multiple />`
- Chip-based tag display for selected items
- Delete individual selections
- Search functionality
- "Create New" button (UI placeholder)

**Features:**
- Multiple item selection
- Visual chips showing selected items
- Delete functionality via chip close button or Autocomplete
- Search/filter capabilities
- Validation support

### 3. Mock Search Implementation

The search functionality uses a client-side filter:
- Searches through all related content items
- Filters by the display field value
- Case-insensitive matching
- Real-time results as user types

For production, this can be replaced with an API call:
```typescript
const searchOptions = async (searchText: string) => {
  const response = await fetch(`/api/content/${contentTypeId}?search=${searchText}`)
  return response.json()
}
```

## Data Structure

### RelationConfig Interface

```typescript
export interface RelationConfig {
  contentTypeId: string
  relationType: 'oneToOne' | 'oneToMany' | 'manyToOne' | 'manyToMany'
  displayField?: string // Field name to use for display in Autocomplete
}
```

### Content Storage

**Single Select Fields:**
- Stores: `string` (content ID) or empty string `""`

**Multiple Select Fields:**
- Stores: `string[]` (array of content IDs) or empty array `[]`

## Usage Example

### 1. Create a Relation Field

1. Go to Content Definition page
2. Click "Add Field"
3. Select field type: **Relation**
4. Configure:
   - **Related Content Type**: Select target Content Type (e.g., "Author")
   - **Display Field**: Choose field to display (e.g., "name", "email")
   - **Relation Type**: Select relationship type (e.g., "manyToOne")
5. Save the field

### 2. Use Relation Field in Content

1. Navigate to Content page for the Content Type
2. Create or edit a content item
3. The Relation field will appear as:
   - **Single Select**: Autocomplete dropdown
   - **Multiple Select**: Autocomplete with chips
4. Start typing to search
5. Select items from the dropdown
6. For multiple select, remove items by clicking chip X button

## Technical Implementation

### Files Modified

1. **`src/types/index.ts`**
   - Added `displayField?: string` to `RelationConfig`

2. **`src/pages/ContentTypeEditPage.tsx`**
   - Added Display Field selector
   - Changed Relation Type selector to `ToggleButtonGroup`
   - Added preview section
   - Auto-selects first available field as display field

3. **`src/pages/ContentEditPage.tsx`**
   - Replaced `Select` with `Autocomplete` for relation fields
   - Implemented single/multiple selection logic
   - Added search/filter functionality
   - Added "Create New" button (UI placeholder)
   - Added chip rendering for multiple select
   - Proper initialization for relation fields

### Key Functions

#### Display Value Resolution
```typescript
const getDisplayValue = (item: Content): string => {
  if (!displayField) {
    // Fallback to first text field or ID
    const firstTextField = relatedContentType?.fields?.find((f) =>
      ['text', 'email'].includes(f.type)
    )
    if (firstTextField && item[firstTextField.name]) {
      return String(item[firstTextField.name])
    }
    return item.id.slice(-8)
  }
  return item[displayField] ? String(item[displayField]) : item.id.slice(-8)
}
```

#### Search Filter
```typescript
const searchOptions = (searchText: string) => {
  if (!searchText) return relatedContents
  const lowerSearch = searchText.toLowerCase()
  return relatedContents.filter((item) => {
    const displayValue = getDisplayValue(item)
    return displayValue.toLowerCase().includes(lowerSearch)
  })
}
```

## Future Enhancements

1. **API Integration**
   - Replace mock search with real API calls
   - Implement pagination for large datasets
   - Add debouncing for search input

2. **Create New Content Dialog**
   - Implement actual dialog for creating related content
   - Support quick creation from relation field

3. **Advanced Features**
   - Drag-and-drop reordering for multiple select
   - Batch operations
   - Relation visualization
   - Bidirectional relation support

4. **Performance**
   - Virtual scrolling for large lists
   - Lazy loading of related content
   - Caching of search results

## Testing Checklist

- [x] Create Relation field with all 4 relation types
- [x] Select display field correctly
- [x] Preview shows correct rendering type
- [x] Single select works in Content edit page
- [x] Multiple select works in Content edit page
- [x] Search functionality works
- [x] Delete selected items works
- [x] Validation works for required fields
- [x] Initialization handles empty values correctly
- [x] Fallback display value works when displayField not set

