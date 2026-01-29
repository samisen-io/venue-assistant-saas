# VenueManager Design System

This document outlines the design system for VenueManager, providing guidelines for consistent UI development.

---

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Border Radius](#border-radius)
5. [Shadows](#shadows)
6. [Z-Index Scale](#z-index-scale)
7. [Components](#components)
8. [Patterns](#patterns)
9. [Animations](#animations)
10. [Accessibility](#accessibility)

---

## Color Palette

### Brand Colors

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| **Primary** | `blue-600` | `blue-400` | Main actions, links, active states |
| **Secondary** | `slate-600` | `slate-400` | Secondary actions, subtle elements |

### Semantic Colors

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| **Success** | `green-600` | `green-400` | Positive actions, confirmations, completed states |
| **Warning** | `amber-500` | `amber-400` | Caution, attention needed, pending states |
| **Error/Destructive** | `red-500` | `red-400` | Errors, deletions, critical alerts |
| **Info** | `sky-500` | `sky-400` | Informational messages, neutral highlights |

### Usage Examples

```tsx
// Primary button
<Button>Save Changes</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// Success state
<div className="text-success bg-success-light">Payment successful</div>

// Warning alert
<Alert className="bg-warning-light text-warning-foreground">
  Budget limit approaching
</Alert>
```

### CSS Variables

All colors are defined as CSS variables in HSL format for easy theming:

```css
--primary: 221.2 83.2% 53.3%;        /* Blue 600 */
--success: 142.1 76.2% 36.3%;        /* Green 600 */
--warning: 37.7 92.1% 50.2%;         /* Amber 500 */
--destructive: 0 84.2% 60.2%;        /* Red 500 */
--info: 199.4 95.5% 53.8%;           /* Sky 500 */
```

---

## Typography

### Font Families

- **Sans**: System font stack (Inter-like)
- **Mono**: System monospace stack

### Type Scale

| Class | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-2xs` | 0.625rem (10px) | 0.875rem | Tiny labels |
| `text-xs` | 0.75rem (12px) | 1rem | Badges, captions |
| `text-sm` | 0.875rem (14px) | 1.25rem | Body small, table cells |
| `text-base` | 1rem (16px) | 1.5rem | Body text |
| `text-lg` | 1.125rem (18px) | 1.75rem | Lead text |
| `text-xl` | 1.25rem (20px) | 1.75rem | H5 |
| `text-2xl` | 1.5rem (24px) | 2rem | H4 |
| `text-3xl` | 1.875rem (30px) | 2.25rem | H3 |
| `text-4xl` | 2.25rem (36px) | 2.5rem | H2 |
| `text-5xl` | 3rem (48px) | 1 | H1, Hero |

### Heading Styles

All headings use `font-semibold` and `tracking-tight`:

```tsx
<h1 className="text-4xl font-semibold tracking-tight">Page Title</h1>
<h2 className="text-3xl font-semibold tracking-tight">Section Title</h2>
<h3 className="text-2xl font-semibold tracking-tight">Subsection</h3>
```

### Text Colors

| Class | Usage |
|-------|-------|
| `text-foreground` | Primary text |
| `text-muted-foreground` | Secondary/helper text |
| `text-primary` | Links, emphasis |
| `text-destructive` | Error messages |

---

## Spacing

### Base Scale

Our spacing follows Tailwind's default scale plus custom additions:

| Class | Value | Usage |
|-------|-------|-------|
| `p-1` / `m-1` | 0.25rem (4px) | Tiny gaps |
| `p-2` / `m-2` | 0.5rem (8px) | Small gaps |
| `p-3` / `m-3` | 0.75rem (12px) | Compact padding |
| `p-4` / `m-4` | 1rem (16px) | Default padding |
| `p-6` / `m-6` | 1.5rem (24px) | Card padding |
| `p-8` / `m-8` | 2rem (32px) | Section padding |
| `p-12` / `m-12` | 3rem (48px) | Large sections |
| `p-16` / `m-16` | 4rem (64px) | Hero sections |

### Custom Spacing

| Class | Value |
|-------|-------|
| `p-4.5` | 1.125rem (18px) |
| `p-18` | 4.5rem (72px) |
| `p-88` | 22rem (352px) |
| `p-128` | 32rem (512px) |

### Component Spacing Guidelines

- **Cards**: `p-6` internal padding
- **Buttons**: `px-4 py-2` (default), `px-8 py-3` (large)
- **Form fields**: `gap-4` between fields
- **Page sections**: `py-12 md:py-24` vertical padding
- **Grid gaps**: `gap-4` (compact), `gap-6` (default), `gap-8` (spacious)

---

## Border Radius

| Class | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 0.25rem | Small elements |
| `rounded-md` | 0.375rem | Input fields, small buttons |
| `rounded-lg` | 0.5rem | Cards, modals |
| `rounded-xl` | 0.75rem | Large cards |
| `rounded-full` | 9999px | Avatars, badges |

---

## Shadows

### Elevation Scale

| Class | Usage |
|-------|-------|
| `shadow-sm` | Subtle elevation (input focus) |
| `shadow` | Default elevation (cards) |
| `shadow-md` | Raised elements (dropdowns) |
| `shadow-lg` | Floating elements (modals) |
| `shadow-xl` | Prominent elements (popovers) |

### Glow Effects

For special emphasis:

```tsx
<div className="shadow-glow">Primary glow</div>
<div className="shadow-glow-success">Success glow</div>
<div className="shadow-glow-warning">Warning glow</div>
<div className="shadow-glow-error">Error glow</div>
```

---

## Z-Index Scale

| Variable | Value | Usage |
|----------|-------|-------|
| `--z-dropdown` | 50 | Dropdown menus |
| `--z-sticky` | 100 | Sticky headers |
| `--z-fixed` | 200 | Fixed elements |
| `--z-modal-backdrop` | 300 | Modal backdrops |
| `--z-modal` | 400 | Modal content |
| `--z-popover` | 500 | Popovers |
| `--z-tooltip` | 600 | Tooltips |

---

## Components

### Pre-built Component Classes

#### Status Badges

```tsx
<span className="status-badge-success">Completed</span>
<span className="status-badge-warning">Pending</span>
<span className="status-badge-error">Failed</span>
<span className="status-badge-info">In Progress</span>
<span className="status-badge-neutral">Draft</span>
```

#### Cards

```tsx
// Interactive card (hover effects)
<Card className="card-interactive">...</Card>

// Highlighted card (featured)
<Card className="card-highlight">...</Card>
```

#### Stat Cards

```tsx
<div className="stat-card">
  <Icon className="stat-card-icon" />
  <p className="stat-card-value">1,234</p>
  <p className="stat-card-label">Total Events</p>
</div>
```

#### Page Headers

```tsx
<div className="page-header">
  <div>
    <h1 className="page-title">Events</h1>
    <p className="page-description">Manage your venue events</p>
  </div>
  <Button>Create Event</Button>
</div>
```

#### Empty States

```tsx
<div className="empty-state">
  <CalendarIcon className="empty-state-icon" />
  <h3 className="empty-state-title">No events yet</h3>
  <p className="empty-state-description">
    Create your first event to get started
  </p>
  <Button>Create Event</Button>
</div>
```

#### Navigation Links

```tsx
<Link className="nav-link">Dashboard</Link>
<Link className="nav-link nav-link-active">Events</Link>
```

### Score/Rating Indicators

```tsx
<span className="score-high">95</span>   // Green for high scores
<span className="score-medium">70</span> // Amber for medium
<span className="score-low">40</span>    // Red for low scores
```

### Budget Status

```tsx
<span className="budget-under">Under Budget</span>
<span className="budget-on-track">On Track</span>
<span className="budget-over">Over Budget</span>
```

---

## Patterns

### Form Sections

```tsx
<div className="form-section">
  <h3 className="form-section-title">Event Details</h3>
  {/* Form fields */}
</div>
```

### Data Tables

```tsx
<Table>
  <TableHeader className="data-table-header">
    <TableRow>
      <TableHead>Name</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="data-table-row">
      <TableCell>Event Name</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Loading States

```tsx
// Spinner
<div className="loading-spinner h-8 w-8" />

// Skeleton
<div className="loading-pulse h-4 w-full" />
```

### Gradient Backgrounds

```tsx
<div className="gradient-primary">Primary gradient</div>
<div className="gradient-success">Success gradient</div>
<div className="gradient-hero">Hero section gradient</div>
```

---

## Animations

### Available Animations

| Class | Description |
|-------|-------------|
| `animate-fade-in` | Fade in |
| `animate-fade-out` | Fade out |
| `animate-slide-in-from-top` | Slide from top |
| `animate-slide-in-from-bottom` | Slide from bottom |
| `animate-slide-in-from-left` | Slide from left |
| `animate-slide-in-from-right` | Slide from right |
| `animate-scale-in` | Scale up with fade |
| `animate-scale-out` | Scale down with fade |
| `animate-spin-slow` | Slow rotation |
| `animate-pulse-soft` | Soft pulsing |
| `animate-bounce-soft` | Subtle bounce |
| `animate-shimmer` | Loading shimmer effect |

### Custom Animation Utilities

```css
.animate-fade-in    /* 200ms ease-out fade in */
.animate-slide-up   /* 200ms ease-out slide up */
.animate-slide-down /* 200ms ease-out slide down */
```

### Transition Durations

| Class | Duration |
|-------|----------|
| `duration-fast` | 150ms |
| `duration-normal` | 200ms |
| `duration-slow` | 300ms |

---

## Accessibility

### Focus States

All interactive elements should have visible focus states:

```tsx
// Default focus ring
<Button className="focus-ring">Click me</Button>

// Inset focus ring (for contained elements)
<input className="focus-ring-inset" />
```

### Color Contrast

- Text on backgrounds must meet WCAG 2.1 AA standards
- Use `text-foreground` on `bg-background`
- Use `text-muted-foreground` for secondary text
- Avoid color-only indicators; use icons or text labels

### Screen Readers

- Use semantic HTML elements
- Add `aria-label` to icon-only buttons
- Use `sr-only` class for visually hidden but accessible text

```tsx
<Button aria-label="Close dialog">
  <X className="h-4 w-4" />
  <span className="sr-only">Close</span>
</Button>
```

---

## Grid Layouts

### Auto-fill Grids

For responsive card grids:

```tsx
<div className="grid grid-cols-auto-fill-250 gap-6">
  {/* Cards automatically wrap at 250px min width */}
</div>

<div className="grid grid-cols-auto-fill-300 gap-6">
  {/* Cards automatically wrap at 300px min width */}
</div>

<div className="grid grid-cols-auto-fill-350 gap-6">
  {/* Cards automatically wrap at 350px min width */}
</div>
```

### Standard Grid Patterns

```tsx
// 2-column responsive
<div className="grid md:grid-cols-2 gap-6">

// 3-column responsive
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

// 4-column responsive
<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
```

---

## Best Practices

### Do's

- Use semantic color classes (`text-success`, `text-destructive`)
- Use component classes for consistent styling
- Maintain consistent spacing with the scale
- Use animations sparingly for meaningful interactions
- Test in both light and dark modes

### Don'ts

- Don't use arbitrary color values; stick to the palette
- Don't skip the spacing scale for custom values
- Don't create new shadows; use the elevation scale
- Don't use animations that are distracting or too frequent
- Don't forget focus states on interactive elements

---

## Quick Reference

### Common Combinations

```tsx
// Card with hover
"rounded-lg border bg-card p-6 card-interactive"

// Section container
"container mx-auto px-4 md:px-6 py-12 md:py-24"

// Form input
"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"

// Primary action area
"flex items-center justify-between gap-4 p-6 border-t"

// Centered empty state
"flex flex-col items-center justify-center py-12 text-center"
```

### Vendor Category Colors

For consistent vendor category display:

| Category | Color |
|----------|-------|
| Catering | `blue-500` |
| AV/Tech | `purple-500` |
| Florals | `pink-500` |
| Security | `slate-500` |
| Entertainment | `amber-500` |
| Parking | `green-500` |
| Other | `gray-500` |

### Event Status Colors

| Status | Badge Class |
|--------|-------------|
| Planning | `status-badge-info` |
| Confirmed | `status-badge-success` |
| In Progress | `status-badge-warning` |
| Completed | `status-badge-neutral` |
| Cancelled | `status-badge-error` |
