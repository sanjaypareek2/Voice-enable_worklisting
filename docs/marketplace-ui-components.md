# UI Component Map (99acres-like UX)

## Global Layout
- AppShell
  - TopNav (logo, location search, login, post listing CTA)
  - SecondaryNav (Buy/Rent/Commercial tabs adapted to Warehouse/Land)
  - Footer (links, policies, contact)

## Home Page
- HeroSearch
  - LocationAutocomplete
  - ListingTypeSelect (Warehouse / Land)
  - BudgetRange
  - CTAButton
- CategoryTiles
- FeaturedListingsCarousel
- TrendingLocations
- TrustBadges

## Search Results Page
- ResultsLayout
  - FilterSidebar
    - PriceRange
    - AreaRange
    - ListingType
    - Availability
    - Amenities
    - VerifiedToggle
  - ResultsToolbar
    - SortSelect
    - ViewToggle (List / Map)
    - SaveSearch
  - ListingGrid
    - ListingCard
      - MediaThumbnail
      - PriceTag
      - KeyHighlights
      - CTA (Call/Enquire/Save)
  - ResultsMap (Mapbox)

## Listing Details Page
- ListingHero
  - MediaCarousel
  - OverviewStats
  - PrimaryCTA (Enquire/Call)
- ListingHighlights
- ListingSpecs
  - WarehouseSpecsPanel
  - LandSpecsPanel
- LocationMap
- OwnerBrokerCard
- SimilarListings
- InquiryForm

## Post Listing Flow
- Stepper
- ListingTypeStep
- LocationStep
- SpecsStep
- MediaUploadStep
- ReviewPublishStep

## User Dashboard
- DashboardLayout
  - ListingsTable
  - LeadsInbox
  - SavedListings
  - ProfileSettings

## Admin Panel
- AdminLayout
  - ListingModerationQueue
  - UserVerificationQueue
  - FeaturedManager
  - ReportsDashboard
