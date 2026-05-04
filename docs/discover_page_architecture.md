# Discover Page Architecture & Implementation Documentation

## 1. Overview
The **Discover Page** is a core feature of the MUS platform that enables students to find, filter, and consume educational resources. It is built to handle a high volume of resources with advanced filtering, sorting, and personalized recommendations, offering a seamless, premium user experience.

The feature is heavily optimized for performance, ensuring smooth navigation, rapid filtering, and minimal re-renders.

---

## 2. Dependencies & Technologies
The Discover feature relies on the following key dependencies:
- **React (18+)**: Core UI library (`memo`, `useMemo`, `useCallback`, `useState`, `useEffect`, `useRef`).
- **Material-UI (MUI v5)**: Component library utilized for structure and styling.
  - *Note*: Imports are optimized for tree-shaking (e.g., `import Box from '@mui/material/Box'`).
- **Framer Motion**: Used for high-performance micro-animations and smooth layout transitions without impacting the React render cycle.
- **React Router DOM**: Handles routing, navigation, and URL state sync (`useLocation`, `useNavigate`).

---

## 3. Core Components Architecture

### 3.1. `DiscoverResources` (Page Container)
**Path:** `src/features/dashboard/pages/DiscoverResources.jsx`
The primary entry point that coordinates state between the sidebar, the main content, and the filtering panels.
- **Role:** Centralized state management using the `useDiscoverResourcesController` hook.
- **Performance:** Implements `useMemo` for derived states like `fallbackModules` to prevent expensive `.reduce()` operations from blocking the main thread during renders. It also ensures mobile filter drawers utilize `keepMounted` to avoid layout thrashing.

### 3.2. `DiscoveryMainContent`
**Path:** `src/features/discover/components/DiscoveryMainContent.jsx`
Responsible for displaying the list/grid of resources and the pagination controls.
- **Role:** Renders the resource grid, empty states, and loading skeletons.
- **Performance:** 
  - Sub-components (`SortTabButton`, `PromoCard`, `DiscoverySearchBar`) are wrapped in `React.memo()`.
  - Avoids passing inline anonymous functions as props to list items.
  - CSS-in-JS `sx` props are hoisted out of the render cycle into static constants to prevent memory reallocation on re-renders.

### 3.3. `DiscoverySidebar`
**Path:** `src/features/discover/components/DiscoverySidebar.jsx`
The left-hand navigation pane for quick filtering.
- **Role:** Contains filter options for Subjects, Content Types, and Formats.
- **Performance:** Leverages `useMemo` for sorting and compiling module lists. The internal `FilterRow` items manage their own `useCallback` dispatches, preserving `React.memo` purity and preventing entire list re-renders.

### 3.4. `DiscoverFiltersPanel`
**Path:** `src/features/dashboard/components/discover/DiscoverFiltersPanel.jsx`
A robust horizontal filter panel for advanced querying.
- **Role:** Handles deep filtering (Modules, Type, Format, Language, Access Tier, Rating, and Sort Order).
- **Features:** Uses `React.startTransition` via the controller to keep the UI highly responsive while complex filters are applied to large datasets.

### 3.5. `DiscoverResourceSections`
**Path:** `src/features/dashboard/components/discover/DiscoverResourceSections.jsx`
Displays curated categories such as "Recommended For You" and "Latest Published".
- **Role:** Provides a personalized discovery experience before the user explicitly searches.
- **Performance:** Uses memoized static styling and skeleton loaders for deferred rendering.

### 3.6. `DiscoveryHeader` & `DiscoverNavbar`
- **Role:** Manages global navigation, notifications, theme switching, and user profile management within the Discover context.
- **Features:** Integrates with `useNotifications` and `useThemeMode` contexts.

---

## 4. State Management & Controllers

### `useDiscoverResourcesController` Hook
The logic driving the Discover page is abstracted into a controller hook.
- **Purpose:** Decouples UI from business logic.
- **Responsibilities:**
  - Managing active filters (`selectedModule`, `selectedType`, `selectedFormat`, `minRating`, `favoritesOnly`, etc.).
  - Managing search queries (`searchQuery`).
  - Handling pagination state (`page`).
  - Interfacing with API services to fetch and rank resources.
  - Managing the "Quick Preview" details dialog state (`openDetailsDialog`, `viewingResource`).

### `useNotifications` Hook
Handles the real-time notification fetching and unread counts for the global header.

---

## 5. Performance Engineering Implementations

The Discover architecture employs strict React performance patterns to ensure UI fluidity at scale:

1. **Static Style Extraction (MUI `sx` optimization):**
   Inline `sx={{ ... }}` objects force React to re-evaluate styles on every render. All heavy styling objects are extracted as static constants outside the component definition.
   *Example:*
   ```jsx
   const OUTER_SX = { display: 'flex', flexDirection: 'column' };
   ```

2. **Tree-Shaking:**
   Root-level imports (`import { Box } from '@mui/material'`) were converted to path-level imports (`import Box from '@mui/material/Box'`). This reduces JavaScript bundle parsing overhead by eliminating unused library components.

3. **Referential Equality for Callbacks:**
   List items previously received inline callbacks (`onClick={() => onSort(value)}`), which broke `React.memo` by generating new function references per render. These components now accept raw values and utilize internal `useCallback` hooks to fire events.

4. **Deferred Rendering (keepMounted):**
   Hidden interactive elements, such as the Mobile Drawer in `DiscoverResources`, use `keepMounted: true` to persist in the DOM, preventing expensive teardown and reconstruction cycles when toggled.

5. **Expensive Computations (useMemo):**
   Operations that iterate over the entire resource list (e.g., dynamically aggregating subject counts) are strictly wrapped in `useMemo` arrays.

---

## 6. Component Workflows

### 6.1. Search & Filter Workflow
1. User types in `DiscoverySearchBar` or toggles a filter in `DiscoverFiltersPanel`.
2. The UI uses a localized state (`useState` + `useRef`) combined with a debounce (400ms) to prevent excessive API calls.
3. The debounced value is sent to `useDiscoverResourcesController`.
4. The controller triggers a state update, rendering skeleton loaders if the request is asynchronous.
5. The `DiscoveryMainContent` receives the new `resources` array and renders the updated `ResourceCard` grid.

### 6.2. Resource Preview Workflow
1. User clicks a `ResourceCard`.
2. The card calls `onOpen()` triggering `handleOpenDetails` in the controller.
3. The `ResourceDetailsDialog` mounts, fetching extended metadata if necessary.
4. From the dialog, the user can navigate to the full resource consumption view.

---

## 7. Future Maintenance & Extensibility
- **Adding new filters:** New filters should be added to the `useDiscoverResourcesController` state, passed down to `DiscoverFiltersPanel`, and included in the API request payload.
- **Theming:** All hardcoded color tokens (e.g., `rgba(255,255,255,0.06)`) in the static `sx` objects should eventually be migrated to the global MUI Theme palette to ensure absolute visual consistency.
- **MUI v6:** The current static styling pattern prepares the architecture for seamless migration to MUI v6, which features improved Pigment CSS zero-runtime styling.
