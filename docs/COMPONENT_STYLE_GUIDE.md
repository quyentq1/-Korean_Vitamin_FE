# Component Style Guide

> Hướng dẫn sử dụng components theo design system của Korean Vitamin Platform

---

## 📋 Table of Contents
1. [Button Components](#button-components)
2. [Input Components](#input-components)
3. [Modal/Dialog Components](#modaldialog-components)
4. [Card Components](#card-components)
5. [Badge/Tag Components](#badgetag-components)
6. [Alert/Notification Components](#alertnotification-components)
7. [Loading States](#loading-states)
8. [Table Components](#table-components)
9. [File Upload Components](#file-upload-components)
10. [Page Layout Components](#page-layout-components)

---

## 🔘 Button Components

### Button Variants

#### Primary Button
```jsx
<button className="bg-primary-400 hover:bg-primary-500 text-white rounded-lg px-6 py-3 shadow-teal hover:shadow-teal-lg transition-all duration-200 font-medium">
  Submit
</button>
```
**Usage**: Main action buttons, form submissions, CTAs

#### Secondary Button
```jsx
<button className="bg-white hover:bg-primary-50 text-primary-500 border border-primary-400 rounded-lg px-6 py-3 hover:shadow-lg transition-all duration-200 font-medium">
  Cancel
</button>
```
**Usage**: Secondary actions, cancel buttons

#### Ghost Button
```jsx
<button className="bg-transparent hover:bg-primary-50 text-primary-500 rounded-lg px-6 py-3 transition-all duration-200 font-medium">
  Learn More
</button>
```
**Usage**: Less important actions, links that look like buttons

#### Danger Button
```jsx
<button className="bg-error-500 hover:bg-error-600 text-white rounded-lg px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200 font-medium">
  Delete
</button>
```
**Usage**: Destructive actions, delete, remove

#### Icon Button
```jsx
<button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
  <Icon name="edit" className="w-5 h-5 text-gray-600" />
</button>
```
**Usage**: Icon-only buttons, toolbar actions

### Button States
| State | Classes |
|-------|---------|
| Default | `bg-primary-400 text-white` |
| Hover | `hover:bg-primary-500 hover:shadow-teal-lg` |
| Active | `active:bg-primary-600 active:scale-95` |
| Disabled | `disabled:bg-primary-200 disabled:text-primary-600 disabled:cursor-not-allowed disabled:shadow-none` |
| Loading | `disabled:opacity-75` + spinner |

### Button Sizes
| Size | Padding | Font Size |
|------|---------|-----------|
| Small | `px-3 py-1.5 text-sm` | 14px |
| Medium | `px-4 py-2 text-base` | 16px |
| Large | `px-6 py-3 text-lg` | 18px |
| Extra Large | `px-8 py-4 text-xl` | 20px |

---

## 📝 Input Components

### Text Input
```jsx
<input 
  type="text"
  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all duration-200"
  placeholder="Enter your name"
/>
```

### Email Input
```jsx
<input 
  type="email"
  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all duration-200"
  placeholder="your@email.com"
/>
```

### Password Input
```jsx
<div className="relative">
  <input 
    type={showPassword ? 'text' : 'password'}
    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all duration-200 pr-12"
    placeholder="Enter password"
  />
  <button 
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
  >
    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
  </button>
</div>
```

### Select Dropdown
```jsx
<select className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all duration-200 bg-white">
  <option value="">Select an option</option>
  <option value="option1">Option 1</option>
  <option value="option2">Option 2</option>
</select>
```

### Textarea
```jsx
<textarea 
  rows="4"
  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all duration-200 resize-none"
  placeholder="Enter your message"
/>
```

### Input States
| State | Border | Background | Text |
|-------|-------|-----------|------|
| Default | `border-gray-300` | `bg-white` | `text-gray-900` |
| Focus | `border-primary-400` | `bg-white` | `text-gray-900` |
| Error | `border-error-500` | `bg-error-50` | `text-error-700` |
| Disabled | `border-gray-200` | `bg-gray-100` | `text-gray-400` |

### Input Labels
```jsx
<label className="block text-sm font-medium text-gray-700 mb-2">
  Email Address
  <span className="text-error-500">*</span>
</label>
```

### Input Error Messages
```jsx
<p className="mt-1 text-sm text-error-600">
  {error}
</p>
```

---

## 💬 Modal/Dialog Components

### Modal Structure
```jsx
<div className="fixed inset-0 z-50 flex items-center justify-center">
  {/* Backdrop */}
  <div 
    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
    onClick={onClose}
  />
  
  {/* Modal Content */}
  <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 animate-scale-up">
    {/* Header */}
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      <h2 className="text-xl font-semibold text-navy-500">Modal Title</h2>
      <button 
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <XIcon className="w-6 h-6" />
      </button>
    </div>
    
    {/* Body */}
    <div className="p-6">
      {children}
    </div>
    
    {/* Footer */}
    <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
      <button className="bg-white text-gray-700 border border-gray-300 rounded-lg px-4 py-2">
        Cancel
      </button>
      <button className="bg-primary-400 text-white rounded-lg px-4 py-2 shadow-teal">
        Confirm
      </button>
    </div>
  </div>
</div>
```

### Modal Sizes
| Size | Max Width |
|------|-----------|
| Small | `max-w-sm` (384px) |
| Medium | `max-w-md` (448px) |
| Large | `max-w-lg` (512px) |
| Extra Large | `max-w-xl` (576px) |
| Full | `max-w-5xl` (1024px) |

---

## 🃏 Card Components

### Basic Card
```jsx
<div className="bg-white rounded-xl shadow-lg p-6">
  <h3 className="text-xl font-semibold text-navy-500 mb-4">Card Title</h3>
  <p className="text-base text-gray-600">Card content goes here</p>
</div>
```

### Course Card
```jsx
<div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
  <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
  <div className="p-6">
    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-badge-beginner.bg text-badge-beginner.text mb-3">
      {course.level}
    </span>
    <h3 className="text-lg font-semibold text-navy-500 mb-2">{course.title}</h3>
    <p className="text-sm text-gray-600 mb-4">{course.description}</p>
    <div className="flex items-center justify-between">
      <span className="text-lg font-bold text-primary-600">${course.price}</span>
      <button className="bg-primary-400 text-white rounded-lg px-4 py-2 text-sm">
        Enroll
      </button>
    </div>
  </div>
</div>
```

### Stats Card
```jsx
<div className="bg-white rounded-xl shadow-lg p-6">
  <div className="flex items-center justify-between mb-4">
    <div className="p-3 bg-primary-100 rounded-lg">
      <Icon name="users" className="w-6 h-6 text-primary-600" />
    </div>
    <span className="text-sm text-gray-500">Total Students</span>
  </div>
  <p className="text-3xl font-bold text-navy-500">1,234</p>
  <p className="text-sm text-green-600">+12% from last month</p>
</div>
```

---

## 🏷 Badge/Tag Components

### Badge Variants

#### Beginner Badge
```jsx
<span className="px-3 py-1 rounded-full text-xs font-medium bg-badge-beginner.bg text-badge-beginner.text">
  Beginner
</span>
```

#### Intermediate Badge
```jsx
<span className="px-3 py-1 rounded-full text-xs font-medium bg-badge-intermediate.bg text-badge-intermediate.text">
  Intermediate
</span>
```

#### Advanced Badge
```jsx
<span className="px-3 py-1 rounded-full text-xs font-medium bg-badge-advanced.bg text-badge-advanced.text">
  Advanced
</span>
```

### Status Badges

#### Success Badge
```jsx
<span className="px-3 py-1 rounded-full text-xs font-medium bg-success-100 text-success-700">
  Completed
</span>
```

#### Pending Badge
```jsx
<span className="px-3 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-600">
  Pending
</span>
```

#### Error Badge
```jsx
<span className="px-3 py-1 rounded-full text-xs font-medium bg-error-100 text-error-700">
  Failed
</span>
```

---

## 🚨 Alert/Notification Components

### Success Alert
```jsx
<div className="bg-success-50 border border-success-200 rounded-lg p-4 flex items-start gap-3">
  <CheckCircleIcon className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
  <div>
    <h4 className="text-sm font-semibold text-success-800">Success!</h4>
    <p className="text-sm text-success-700 mt-1">Your changes have been saved.</p>
  </div>
</div>
```

### Warning Alert
```jsx
<div className="bg-warning-50 border border-warning-200 rounded-lg p-4 flex items-start gap-3">
  <ExclamationIcon className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
  <div>
    <h4 className="text-sm font-semibold text-warning-800">Warning!</h4>
    <p className="text-sm text-warning-700 mt-1">Please review before proceeding.</p>
  </div>
</div>
```

### Error Alert
```jsx
<div className="bg-error-50 border border-error-200 rounded-lg p-4 flex items-start gap-3">
  <XCircleIcon className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
  <div>
    <h4 className="text-sm font-semibold text-error-800">Error!</h4>
    <p className="text-sm text-error-700 mt-1">Something went wrong.</p>
  </div>
</div>
```

### Info Alert
```jsx
<div className="bg-info-50 border border-info-200 rounded-lg p-4 flex items-start gap-3">
  <InfoIcon className="w-5 h-5 text-info-600 flex-shrink-0 mt-0.5" />
  <div>
    <h4 className="text-sm font-semibold text-info-800">Information</h4>
    <p className="text-sm text-info-700 mt-1">New feature available.</p>
  </div>
</div>
```

---

## ⏳ Loading States

### Spinner
```jsx
<div className="flex items-center justify-center">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-l-2 border-primary-400 border-t-transparent border-r-transparent"></div>
</div>
```

### Skeleton Card
```jsx
<div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
  <div className="h-32 bg-gray-200 rounded"></div>
</div>
```

### Skeleton List Item
```jsx
<div className="flex items-center gap-4 p-4 animate-pulse">
  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
  <div className="flex-1">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
  </div>
</div>
```

---

## 📊 Table Components

### Basic Table
```jsx
<div className="overflow-x-auto">
  <table className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
    <thead className="bg-navy-500">
      <tr>
        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Name</th>
        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Email</th>
        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
        <th className="px-6 py-4 text-right text-sm font-semibold text-white">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {users.map((user) => (
        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
          <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
          <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
          <td className="px-6 py-4 text-sm">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-700">
              {user.status}
            </span>
          </td>
          <td className="px-6 py-4 text-sm text-right">
            <button className="text-primary-600 hover:text-primary-800 font-medium">
              Edit
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### Table with Pagination
```jsx
<div className="flex flex-col gap-4">
  {/* Table */}
  <table className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
    {/* Table content */}
  </table>
  
  {/* Pagination */}
  <div className="flex items-center justify-between px-6 py-4 bg-white border border-gray-200 rounded-xl">
    <span className="text-sm text-gray-600">
      Showing 1-10 of 100
    </span>
    <div className="flex items-center gap-2">
      <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
        Previous
      </button>
      <button className="px-3 py-1 bg-primary-400 text-white rounded-lg text-sm hover:bg-primary-500">
        Next
      </button>
    </div>
  </div>
</div>
```

---

## 📁 File Upload Components

### File Upload Area
```jsx
<div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 hover:bg-primary-50 transition-all cursor-pointer">
  <input type="file" className="hidden" />
  <CloudUploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
  <p className="text-base text-gray-600 mb-2">Drag and drop files here</p>
  <p className="text-sm text-gray-400">or click to browse</p>
</div>
```

### File Upload with Preview
```jsx
<div className="border border-gray-300 rounded-xl p-6">
  <div className="flex items-center gap-4 mb-4">
    <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
      <DocumentIcon className="w-8 h-8 text-gray-400" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">document.pdf</p>
      <p className="text-xs text-gray-500">2.4 MB</p>
    </div>
    <button className="text-error-500 hover:text-error-700">
      <TrashIcon className="w-5 h-5" />
    </button>
  </div>
</div>
```

---

## 📄 Page Layout Components

### Page Header
```jsx
<div className="mb-8">
  <h1 className="text-4xl font-bold text-navy-500 mb-2">Page Title</h1>
  <p className="text-lg text-gray-600">Page description goes here</p>
</div>
```

### Page Container
```jsx
<div className="min-h-screen bg-gray-50 py-12">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Page content */}
  </div>
</div>
```

### Section
```jsx
<section className="mb-12">
  <h2 className="text-2xl font-semibold text-navy-500 mb-6">Section Title</h2>
  <div className="bg-white rounded-xl shadow-lg p-6">
    {/* Section content */}
  </div>
</section>
```

---

## 🎯 Best Practices

### Spacing
- Use consistent spacing: `p-4` (16px), `p-6` (24px), `p-8` (32px)
- Section spacing: `mb-8` (32px), `mb-12` (48px)
- Component spacing: `gap-4` (16px), `gap-6` (24px)

### Typography
- Headings: `text-navy-500` with `font-semibold` or `font-bold`
- Body text: `text-gray-900` or `text-gray-600`
- Secondary text: `text-gray-500`
- Links: `text-primary-600 hover:text-primary-800`

### Colors
- Primary actions: `primary-400` (hover: `primary-500`)
- Secondary actions: `white` with `border-primary-400`
- Destructive actions: `error-500` (hover: `error-600`)
- Success states: `success-500`, `success-100`
- Warning states: `warning-500`, `warning-100`
- Error states: `error-500`, `error-100`

### Borders
- Default: `border-gray-300`
- Focus: `border-primary-400`
- Error: `border-error-500`

### Shadows
- Cards: `shadow-lg`
- Modals: `shadow-2xl`
- Buttons: `shadow-teal` (hover: `shadow-teal-lg`)

### Rounded Corners
- Inputs, Buttons: `rounded-lg` (12px)
- Cards: `rounded-xl` (16px)
- Modals: `rounded-2xl` (20px)

---

**Last Updated**: 2026-01-14
