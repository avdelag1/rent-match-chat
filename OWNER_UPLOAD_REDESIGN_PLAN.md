# Owner Upload Flow Redesign - Implementation Plan

## 🎯 Project Overview

Redesign the owner-side listing upload experience to match the modern, smooth client-side swipe experience. This includes visual consistency, enhanced fields, smooth animations, and better UX.

---

## 📊 Current State Analysis

### Existing Components
- **PropertyForm.tsx** - Basic dialog-based form
- **BicycleListingForm.tsx** - Category-specific form
- **MotorcycleListingForm.tsx** - Category-specific form
- **YachtListingForm.tsx** - Category-specific form
- **ImageUpload.tsx** - Basic photo uploader

### Issues Identified
1. ❌ No animations or smooth transitions
2. ❌ Inconsistent with client-side design (gradients, shadows, etc.)
3. ❌ Missing 40+ filter fields recently added to client side
4. ❌ Basic form layout (not wizard-style)
5. ❌ No preview before publishing

---

## 🎨 Design System Reference

### Colors (from tailwind.config.ts + index.css)
```css
/* Primary Gradient */
--gradient-button: linear-gradient(135deg, hsl(12, 100%, 58%) 0%, hsl(20, 100%, 62%) 50%, hsl(25, 100%, 68%) 100%);

/* Accent Colors */
--accent-primary: 14 100% 57%;  /* Orange #f97316 */
--accent-secondary: 9 100% 64%; /* Red-orange */

/* Shadows */
--shadow-card: 0 25px 80px -15px rgba(0, 0, 0, 0.2);
--shadow-button: 0 15px 40px -8px hsla(12, 100%, 58%, 0.4);
```

### Animation Patterns (Framer Motion)
```typescript
// Page transitions
const pageTransition = {
  type: "spring",
  stiffness: 400,
  damping: 40,
  mass: 0.8
};

// Stagger children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

// Button interactions
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
```

### Typography
- **Font**: Inter (system-ui fallback)
- **Headings**: font-semibold, text-2xl
- **Body**: text-sm, text-muted-foreground
- **Labels**: text-sm font-medium

---

## 📝 Complete Field Mapping

### Property Form - NEW FIELDS
Add these 7 fields to match PropertyClientFilters:

```typescript
square_feet: number;              // Range: 0-10,000 (Slider)
year_built: number;               // Range: 1950-present (Slider)
floor_level: string;              // Select: ground, low, mid, high, penthouse
view_types: string[];            // Multi-select: Ocean, City, Garden, Mountain, Street, Pool
orientations: string[];          // Multi-select: N, S, E, W, NE, NW, SE, SW
has_elevator: boolean;           // Toggle
parking_spots: number;           // Range: 0-5 (Slider or number input)
```

### Bicycle Form - NEW FIELDS
Add these 9 fields to match BicycleClientFilters:

```typescript
condition: string;               // Select: new, like-new, excellent, good, fair
wheel_size: string;             // Select: 20", 24", 26", 27.5", 29", 700c, 650b
suspension_type: string;        // Select: rigid, hardtail, full
material: string;               // Select: aluminum, carbon, steel, titanium
gears: number;                  // Range: 1-30 (Slider)
year: number;                   // Range: 2010-present (Slider)
is_electric: boolean;           // Toggle
battery_range: number;          // Range: 0-150 miles (conditional on is_electric)
```

### Motorcycle Form - NEW FIELDS
Add these 12 fields to match MotoClientFilters:

```typescript
year: number;                   // Range: 1990-present (Slider)
mileage: number;                // Range: 0-150,000 (Slider)
transmission: string;           // Select: manual, automatic, semi-automatic, cvt
condition: string;              // Select: new, like-new, excellent, good, fair
fuel_type: string[];            // Multi-select: Gasoline, Electric, Hybrid, Diesel
cylinders: string;              // Select: single, twin, triple, four, six
cooling_system: string;         // Select: air, liquid, oil
has_abs: boolean;               // Toggle
features: string[];             // Multi-select: GPS, Heated Grips, Cruise Control, etc.
is_electric: boolean;           // Toggle
battery_capacity: number;       // Range: 0-30 kWh (conditional on is_electric)
```

### Yacht Form - NEW FIELDS
Add these 13 fields to match YachtClientFilters:

```typescript
year_built: number;             // Range: 1970-present (Slider)
guest_capacity: number;         // Range: 1-50 (Slider)
cabin_count: number;            // Range: 1-15 (Slider)
condition: string;              // Select: new, like-new, excellent, good, fair
fuel_type: string[];            // Multi-select: Diesel, Gasoline, Hybrid, Electric, Sail-Only
engine_power: number;           // Range: 0-10,000 HP (Slider)
max_speed: number;              // Range: 0-80 knots (Slider)
range_nm: number;               // Range: 0-5,000 nautical miles (Slider)
hull_material: string;          // Select: fiberglass, aluminum, steel, wood, carbon
water_activities: string[];     // Multi-select: Diving, Fishing, Watersports, etc.
navigation_equipment: string[]; // Multi-select: GPS, Radar, Autopilot, etc.
has_stabilizers: boolean;       // Toggle
```

---

## 🚀 Implementation Plan

### Phase 1: Create Reusable Components (Priority: HIGH)

#### 1.1 AnimatedFormSection.tsx
```typescript
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export function AnimatedFormSection({ children, title }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      {children}
    </motion.div>
  );
}
```

#### 1.2 VisualToggleGrid.tsx
Icon-based toggles for amenities/features:
```typescript
export function VisualToggleGrid({
  options,
  selected,
  onChange,
  columns = 3
}) {
  return (
    <div className={`grid grid-cols-${columns} gap-2`}>
      {options.map((option) => (
        <motion.button
          key={option.value}
          onClick={() => onChange(option.value)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            p-4 rounded-xl border-2 transition-all
            ${selected.includes(option.value)
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-950'
              : 'border-gray-200 hover:border-orange-200'
            }
          `}
        >
          {option.icon}
          <div className="text-xs mt-2">{option.label}</div>
        </motion.button>
      ))}
    </div>
  );
}
```

#### 1.3 PhotoManager.tsx
Enhanced photo upload with Framer Motion reordering:
```typescript
import { Reorder } from 'framer-motion';

export function PhotoManager({ images, onChange, maxImages = 10 }) {
  return (
    <div className="space-y-4">
      <Reorder.Group axis="x" values={images} onReorder={onChange}>
        {images.map((image, index) => (
          <Reorder.Item key={image} value={image}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative rounded-2xl overflow-hidden"
            >
              <img src={image} alt={`Photo ${index + 1}`} />
              {index === 0 && (
                <Badge className="absolute top-2 left-2">
                  Cover Photo
                </Badge>
              )}
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}
```

#### 1.4 FormProgressBar.tsx
```typescript
export function FormProgressBar({ currentStep, totalSteps }) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-button"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}
```

### Phase 2: Enhance PropertyForm (Priority: HIGH)

Key changes to PropertyForm.tsx:

1. **Add all 7 new fields** (see field mapping above)
2. **Wrap in motion.div** for page transitions
3. **Use AnimatedFormSection** for each group
4. **Replace Dialog with full-screen modal** (better mobile UX)
5. **Add preview step** showing the listing as a swipe card

Example structure:
```typescript
<Dialog open={isOpen} onOpenChange={handleClose}>
  <DialogContent className="max-w-4xl max-h-[90vh]">
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
    >
      <AnimatedFormSection title="Property Details">
        {/* Existing fields + new fields */}

        {/* NEW: Square Feet */}
        <div>
          <Label>Square Feet: {squareFeet}</Label>
          <Slider
            value={[squareFeet]}
            onValueChange={(v) => setSquareFeet(v[0])}
            min={0}
            max={10000}
            step={100}
          />
        </div>

        {/* NEW: Year Built */}
        <div>
          <Label>Year Built: {yearBuilt}</Label>
          <Slider
            value={[yearBuilt]}
            onValueChange={(v) => setYearBuilt(v[0])}
            min={1950}
            max={new Date().getFullYear()}
            step={1}
          />
        </div>

        {/* NEW: Floor Level */}
        <Select value={floorLevel} onValueChange={setFloorLevel}>
          <SelectTrigger>
            <SelectValue placeholder="Select floor level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ground">Ground Floor</SelectItem>
            <SelectItem value="low">Low (1-3)</SelectItem>
            <SelectItem value="mid">Mid (4-7)</SelectItem>
            <SelectItem value="high">High (8+)</SelectItem>
            <SelectItem value="penthouse">Penthouse</SelectItem>
          </SelectContent>
        </Select>

        {/* NEW: View Types */}
        <VisualToggleGrid
          options={VIEW_TYPE_OPTIONS}
          selected={viewTypes}
          onChange={handleViewTypeToggle}
        />

        {/* ... remaining new fields ... */}
      </AnimatedFormSection>
    </motion.div>
  </DialogContent>
</Dialog>
```

### Phase 3: Enhance Other Forms (Priority: MEDIUM)

Apply the same pattern to:
- BicycleListingForm.tsx
- MotorcycleListingForm.tsx
- YachtListingForm.tsx

### Phase 4: Add Animations & Polish (Priority: LOW)

1. Button micro-interactions (whileHover, whileTap)
2. Loading states with spinners
3. Success animations on save
4. Error shake animations
5. Toast notifications with icons

---

## 🎯 Success Metrics

### Before
- ❌ 15-20 fields per form
- ❌ No animations
- ❌ Misaligned with client filters
- ❌ Basic visual design

### After
- ✅ 25-35 fields per form (full filter parity)
- ✅ Smooth Framer Motion animations
- ✅ Perfect alignment with client filters
- ✅ Modern gradient-based design
- ✅ Mobile-optimized wizard flow
- ✅ Live preview before publishing

---

## 📚 Key Files Reference

### Design System
- `/src/tailwind.config.ts` - Theme configuration
- `/src/index.css` - Global styles, animations, gradients
- `/src/components/ui/button.tsx` - Button variants
- `/src/components/ui/badge.tsx` - Badge styles

### Client-Side Filters (Reference for fields)
- `/src/components/filters/PropertyClientFilters.tsx`
- `/src/components/filters/BicycleClientFilters.tsx`
- `/src/components/filters/MotoClientFilters.tsx`
- `/src/components/filters/YachtClientFilters.tsx`

### Forms to Enhance
- `/src/components/PropertyForm.tsx`
- `/src/components/BicycleListingForm.tsx`
- `/src/components/MotorcycleListingForm.tsx`
- `/src/components/YachtListingForm.tsx`

### Client-Side Cards (Reference for animations)
- `/src/components/EnhancedPropertyCard.tsx`
- `/src/components/ClientProfileCard.tsx`
- `/src/components/EnhancedSwipeCard.tsx`

---

## 🔧 Technical Notes

### Database Schema
All new fields need to be added to the `listings` table. Check existing schema:
```sql
-- Check what columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'listings';
```

May need migration to add new columns.

### TypeScript
Update type definitions in:
- `/src/integrations/supabase/types.ts`

### Performance
- Use `React.memo()` for heavy form sections
- Lazy load image previews
- Debounce auto-save
- Use `transform-gpu` for animations

---

## 📅 Estimated Timeline

- Phase 1 (Reusable Components): 2 hours
- Phase 2 (PropertyForm): 3 hours
- Phase 3 (Other Forms): 4 hours
- Phase 4 (Polish): 2 hours
- **Total: 11 hours**

---

## ✅ Checklist

### Reusable Components
- [ ] AnimatedFormSection.tsx
- [ ] VisualToggleGrid.tsx
- [ ] PhotoManager.tsx
- [ ] FormProgressBar.tsx
- [ ] FormNavigation.tsx

### PropertyForm Enhancements
- [ ] Add square_feet field (slider)
- [ ] Add year_built field (slider)
- [ ] Add floor_level field (select)
- [ ] Add view_types field (multi-select)
- [ ] Add orientations field (multi-select)
- [ ] Add has_elevator field (toggle)
- [ ] Add parking_spots field (slider)
- [ ] Add Framer Motion animations
- [ ] Add preview step

### BicycleForm Enhancements
- [ ] Add condition field
- [ ] Add wheel_size field
- [ ] Add suspension_type field
- [ ] Add material field
- [ ] Add gears field
- [ ] Add year field
- [ ] Add is_electric toggle
- [ ] Add battery_range field (conditional)
- [ ] Add animations

### MotorcycleForm Enhancements
- [ ] Add year field
- [ ] Add mileage field
- [ ] Add transmission field
- [ ] Add condition field
- [ ] Add fuel_type multi-select
- [ ] Add cylinders field
- [ ] Add cooling_system field
- [ ] Add has_abs toggle
- [ ] Add features multi-select
- [ ] Add is_electric toggle
- [ ] Add battery_capacity field (conditional)
- [ ] Add animations

### YachtForm Enhancements
- [ ] Add year_built field
- [ ] Add guest_capacity field
- [ ] Add cabin_count field
- [ ] Add condition field
- [ ] Add fuel_type multi-select
- [ ] Add engine_power field
- [ ] Add max_speed field
- [ ] Add range_nm field
- [ ] Add hull_material field
- [ ] Add water_activities multi-select
- [ ] Add navigation_equipment multi-select
- [ ] Add has_stabilizers toggle
- [ ] Add animations

### Testing & Deployment
- [ ] Test all forms on desktop
- [ ] Test all forms on mobile
- [ ] Test image upload/reordering
- [ ] Test validation
- [ ] Test database save
- [ ] Performance audit
- [ ] Commit and push changes
- [ ] Create pull request

---

**Generated by Claude Code**
**Last Updated:** 2025-10-27
