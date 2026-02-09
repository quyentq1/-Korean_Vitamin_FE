# Design Tokens Documentation

> Design System cho Korean Vitamin Platform
> Theo phong cách thiết kế từ Figma và backend API structure

---

## 🎨 Color Palette

### Primary Colors (Teal)
| Token | Value | Usage |
|-------|-------|-------|
| `primary-50` | #E6F9F6 | Background hover |
| `primary-100` | #CCF3ED | Light background |
| `primary-200` | #99E7DB | Subtle accent |
| `primary-300` | #66DBC9 | Accent |
| `primary-400` | #3DCBB1 | **Main brand color** |
| `primary-500` | #2BA896 | Hover state |
| `primary-600` | #228777 | Active state |
| `primary-700` | #1A6559 | Dark accent |
| `primary-800` | #11443A | Very dark |
| `primary-900` | #09221C | Deepest |

### Navy Colors
| Token | Value | Usage |
|-------|-------|-------|
| `navy-50` | #F0F1F3 | Light background |
| `navy-100` | #E1E3E7 | Subtle border |
| `navy-200` | #C3C7CF | Disabled |
| `navy-300` | #A5ABB7 | Muted text |
| `navy-400` | #878F9F | Secondary text |
| `navy-500` | #2D3E50 | **Headers, Footer** |
| `navy-600` | #243244 | Dark header |
| `navy-700` | #1B2533 | Very dark |
| `navy-800` | #121922 | Deepest |
| `navy-900` | #090C11 | Black |

### Semantic Colors

#### Success (Green)
| Token | Value | Usage |
|-------|-------|-------|
| `success-50` | #ECFDF5 | Light background |
| `success-100` | #D1FAE5 | Success bg |
| `success-500` | #10B981 | Success text/border |
| `success-700` | #047857 | Success dark |

#### Warning (Orange/Yellow)
| Token | Value | Usage |
|-------|-------|-------|
| `warning-50` | #FFFBEB | Light background |
| `warning-100` | #FEF3C7 | Warning bg |
| `warning-500` | #F59E0B | Warning text/border |
| `warning-600` | #D97706 | Warning hover |
| `warning-700` | #B45309 | Warning active |

#### Error (Red)
| Token | Value | Usage |
|-------|-------|-------|
| `error-50` | #FEF2F2 | Light background |
| `error-100` | #FEE2E2 | Error bg |
| `error-500` | #EF4444 | Error text/border |
| `error-700` | #B91C1C | Error dark |

#### Info (Blue)
| Token | Value | Usage |
|-------|-------|-------|
| `info-50` | #EFF6FF | Light background |
| `info-100` | #DBEAFE | Info bg |
| `info-500` | #3B82F6 | Info text/border |
| `info-600` | #2563EB | Info hover |
| `info-700` | #1D4ED8 | Info active |

### Badge Colors (Course Levels)
| Level | Background | Text |
|-------|-----------|------|
| Beginner | #FEF3C7 | #D97706 |
| Intermediate | #DBEAFE | #2563EB |
| Advanced | #FCE7F3 | #DB2777 |

### Accent Colors (Decorative)
| Name | Value |
|------|-------|
| Pink | #f48fb1 |
| Purple | #ce93d8 |
| Orange | #ffb74d |
| Green | #81c784 |
| Blue | #64b5f6 |
| Yellow | #ffd54f |

---

## 🔤 Typography

### Font Families
| Usage | Font Family | Fallback |
|--------|-------------|----------|
| Body | Inter | -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif |
| Headings | Poppins | Inter, sans-serif |

### Font Sizes
| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `text-xs` | 0.75rem | 12px | Labels, captions |
| `text-sm` | 0.875rem | 14px | Body small |
| `text-base` | 1rem | 16px | Body default |
| `text-lg` | 1.125rem | 18px | Subheadings |
| `text-xl` | 1.25rem | 20px | Small headings |
| `text-2xl` | 1.5rem | 24px | Section headings |
| `text-3xl` | 1.875rem | 30px | Page headings |
| `text-4xl` | 2.25rem | 36px | Hero headings |
| `text-5xl` | 3rem | 48px | Large hero |

### Font Weights
| Token | Value | Usage |
|-------|-------|-------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Emphasis |
| `font-semibold` | 600 | Headings |
| `font-bold` | 700 | Strong emphasis |

---

## 📐 Spacing System

### Scale
| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `p-0` | 0 | 0px | None |
| `p-1` | 0.25rem | 4px | Tiny |
| `p-2` | 0.5rem | 8px | Small |
| `p-3` | 0.75rem | 12px | Default |
| `p-4` | 1rem | 16px | Medium |
| `p-5` | 1.25rem | 20px | Large |
| `p-6` | 1.5rem | 24px | Extra large |
| `p-8` | 2rem | 32px | Double |
| `p-12` | 3rem | 48px | Triple |
| **`p-18`** | **4.5rem** | **72px** | **Section spacing** |
| `p-20` | 5rem | 80px | Extra section |
| **`p-88`** | **22rem** | **352px** | **Hero spacing** |
| **`p-100`** | **25rem** | **400px** | **Page padding** |
| **`p-112`** | **28rem** | **448px** | **Max content** |
| **`p-128`** | **32rem** | **512px** | **Large section** |

---

## 📦 Border Radius

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `rounded-sm` | 0.375rem | 6px | Small elements |
| `rounded` | 0.5rem | 8px | Default |
| `rounded-md` | 0.5rem | 8px | Medium |
| `rounded-lg` | 0.75rem | 12px | Cards, modals |
| `rounded-xl` | 1rem | 16px | Large cards |
| `rounded-2xl` | 1.25rem | 20px | Hero sections |
| `rounded-3xl` | 1.5rem | 24px | Special elements |

---

## 🌫 Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | 0 1px 2px 0 rgba(0, 0, 0, 0.05) | Subtle elevation |
| `shadow` | 0 4px 6px -1px rgba(0, 0, 0, 0.1) | Default elevation |
| `shadow-md` | 0 4px 6px -1px rgba(0, 0, 0, 0.1) | Medium elevation |
| `shadow-lg` | 0 10px 15px -3px rgba(0, 0, 0, 0.1) | High elevation |
| `shadow-xl` | 0 20px 25px -5px rgba(0, 0, 0, 0.1) | Very high elevation |
| `shadow-2xl` | 0 25px 50px -12px rgba(0, 0, 0, 0.25) | Modal elevation |
| `shadow-teal` | 0 4px 12px rgba(61, 203, 177, 0.3) | Primary button |
| `shadow-teal-lg` | 0 8px 16px rgba(61, 203, 177, 0.4) | Primary button hover |

---

## 🎬 Animations

| Name | Duration | Easing | Usage |
|------|----------|--------|-------|
| `animate-float` | 3s | ease-in-out | Hero elements |
| `animate-slide-up` | 0.4s | ease-out | Modal, dropdown |
| `animate-fade-in` | 0.3s | ease-out | Page transitions |
| `animate-scale-up` | 0.3s | ease-out | Card hover |
| `animate-slide-in-right` | 0.3s | ease-out | Slide panels |
| `animate-pulse-slow` | 3s | cubic-bezier(0.4, 0, 0.6, 1) | Loading |

---

## 🎯 Component States

### Button States
| State | Background | Text | Border | Shadow |
|-------|-----------|------|--------|--------|
| Primary | primary-400 | white | none | shadow-teal |
| Primary Hover | primary-500 | white | none | shadow-teal-lg |
| Primary Disabled | primary-200 | primary-600 | none | none |
| Secondary | white | primary-500 | primary-400 | shadow |
| Secondary Hover | primary-50 | primary-600 | primary-500 | shadow-lg |
| Ghost | transparent | primary-500 | none | none |
| Ghost Hover | primary-50 | primary-600 | none | none |
| Danger | error-500 | white | none | shadow-lg |
| Danger Hover | error-600 | white | none | shadow-xl |

### Input States
| State | Border | Background | Text |
|-------|-------|-----------|------|
| Default | gray-300 | white | gray-700 |
| Focus | primary-400 | white | gray-900 |
| Error | error-500 | error-50 | error-700 |
| Disabled | gray-200 | gray-100 | gray-400 |

---

## 📱 Responsive Breakpoints

| Breakpoint | Width | Devices |
|-----------|-------|---------|
| `sm` | 640px | Small phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

---

## 🔧 Usage Examples

### Primary Button
```jsx
<button className="bg-primary-400 hover:bg-primary-500 text-white rounded-lg px-6 py-3 shadow-teal hover:shadow-teal-lg transition-all duration-200">
  Submit
</button>
```

### Card Component
```jsx
<div className="bg-white rounded-xl shadow-lg p-6">
  <h3 className="text-xl font-semibold text-navy-500 mb-4">Card Title</h3>
  <p className="text-base text-gray-600">Card content</p>
</div>
```

### Input Field
```jsx
<input 
  type="text"
  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
  placeholder="Enter text..."
/>
```

### Badge
```jsx
<span className="px-3 py-1 rounded-full text-sm font-medium">
  Beginner
</span>
```

---

**Last Updated**: 2026-01-14
