import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { AppShell } from '@/design/patterns'
import { Skeleton } from '@/design/primitives'

// Lazy load pages for code splitting
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const HomePage = lazy(() => import('@/pages/app/HomePage'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const AcademyPage = lazy(() => import('@/pages/app/AcademyPage'))
const WorldPage = lazy(() => import('@/pages/app/WorldPage'))
const CampaignPage = lazy(() => import('@/pages/app/CampaignPage'))
const ToyboxPage = lazy(() => import('@/pages/app/ToyboxPage'))
const LibraryPage = lazy(() => import('@/pages/app/LibraryPage'))
const SettingsPage = lazy(() => import('@/pages/app/SettingsPage'))

// Loading fallback component
function PageLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton variant="line" className="w-24 h-4" />
        <Skeleton variant="line" className="w-64 h-8" />
        <Skeleton variant="line" className="w-96 h-4" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton variant="card" className="h-48" />
        <Skeleton variant="card" className="h-48" />
        <Skeleton variant="card" className="h-48" />
      </div>
    </div>
  )
}

// App layout wrapper
function AppLayout() {
  return (
    <AppShell>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </AppShell>
  )
}

// Route configuration
export const router = createBrowserRouter([
  // Landing page (marketing, unauthenticated)
  {
    path: '/',
    element: (
      <Suspense fallback={<div className="min-h-screen bg-void-0" />}>
        <LandingPage />
      </Suspense>
    ),
  },

  // Dashboard (standalone layout with CommandBar, SessionNexus, CampaignHub, etc.)
  {
    path: '/dashboard',
    element: (
      <Suspense fallback={<div className="min-h-screen bg-void-0" />}>
        <Dashboard />
      </Suspense>
    ),
  },

  // App routes (authenticated)
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      // Default redirect to home
      {
        index: true,
        element: <Navigate to="/app/home" replace />,
      },

      // Home (dual-zone layout)
      {
        path: 'home',
        element: <HomePage />,
      },

      // Academy (Training)
      {
        path: 'academy',
        children: [
          { index: true, element: <AcademyPage /> },
          // Future: paths, modules, exercises, drills, transcript
        ],
      },

      // World Building
      {
        path: 'world',
        children: [
          { index: true, element: <WorldPage /> },
          // Future: atlas, factions, timeline, canon, locations
        ],
      },

      // Campaign
      {
        path: 'campaign',
        children: [
          { index: true, element: <CampaignPage /> },
          // Future: runbook, spine, threads, sessions
        ],
      },

      // Toybox
      {
        path: 'toybox',
        children: [
          { index: true, element: <ToyboxPage /> },
          // Future: library, composer, packs
        ],
      },

      // Library
      {
        path: 'library',
        children: [
          { index: true, element: <LibraryPage /> },
          // Future: templates, assets
        ],
      },

      // Settings
      {
        path: 'settings',
        children: [
          { index: true, element: <SettingsPage /> },
          // Future: profile, privacy, export, billing
        ],
      },
    ],
  },

  // 404 - Redirect to home
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

// Route manifest for command palette and navigation
export const routeManifest = {
  home: { path: '/app/home', label: 'Home', pillar: null },
  dashboard: { path: '/dashboard', label: 'Dashboard', pillar: null },
  academy: { path: '/app/academy', label: 'Academy', pillar: 'verdant' },
  world: { path: '/app/world', label: 'World Building', pillar: 'arcane' },
  campaign: { path: '/app/campaign', label: 'Campaign', pillar: 'ember' },
  toybox: { path: '/app/toybox', label: 'Toybox', pillar: 'eldritch' },
  library: { path: '/app/library', label: 'Library', pillar: null },
  settings: { path: '/app/settings', label: 'Settings', pillar: null },
} as const
