
# OceanPulse: Marine Migration & Shipping Conflict Detection Platform

## Overview

OceanPulse is an interactive platform that visualizes and analyzes conflicts between marine animal migrations and shipping activities. The system integrates multiple data sources to identify high-risk areas where shipping lanes intersect with critical migration corridors, enabling better route planning and marine conservation efforts.



## Key Features

- **Interactive 2D/3D Visualization**: Toggle between map and globe views to explore marine migration patterns and shipping routes
- **Real-time Conflict Detection**: Automatically identifies and highlights areas where migrations and shipping lanes intersect
- **Species Tracking**: Monitor migration patterns for endangered marine species with historical data visualization
- **Route Optimization**: Suggests alternative shipping routes to minimize wildlife impacts while maintaining efficiency
- **Risk Assessment**: Provides quantitative collision risk analysis with percentage-based ratings
- **OceanPulse Assistant**: Natural language interface for inquiries about marine species, shipping data, and conservation recommendations

## Technology Stack

### Frontend
- React.js for component-based UI architecture
- Mapbox GL and Cesium.js for advanced geospatial visualization
- TailwindCSS for responsive styling
- deck.gl for data-intensive geospatial overlays

### Backend
- Node.js/Vercel serverless functions for API endpoints
- Google Gemini API integration for natural language processing and data analysis
- Leaflet.js for the 2D map visualization 

### Data Sources
- Marine animal tracking data from research organizations
- AIS vessel traffic data from maritime authorities
- Protected marine area boundaries from conservation databases
- Oceanographic conditions from environmental monitoring stations

## Getting Started

### Prerequisites
- Node.js (v18.0 or higher)
- npm or yarn
- A Google API key with Gemini access
- Mapbox access token

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/migratewatch.git
   cd migratewatch
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your API keys:
   ```
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to http://localhost:3000

## Project Structure

```
migratewatch/
├── components/         # React components
│   ├── Map/            # Map visualization components
│   ├── Analysis/       # Data analysis and display components
│   └── UI/             # Common UI elements
├── lib/                # Utility functions and types
├── api/                # Serverless API functions
├── public/             # Static assets
└── styles/             # Global styles
```

## Key Components

### 2D Map View
The 2D map visualization uses Leaflet.js with custom layers to display migration routes, shipping lanes, and conflict zones. It supports:
- Toggleable data layers
- Risk assessment overlays
- Protected area boundaries
- Dynamic information cards

### 3D Globe View
The 3D globe visualization uses Cesium.js to create an immersive view of global migration patterns, featuring:
- Animated migration flows
- Time-based visualization
- Realistic ocean rendering
- Camera animations for focused views

### OceanPulse Assistant
Natural language interface that leverages Google Gemini to:
- Answer questions about marine species and conservation
- Analyze and explain migration patterns
- Generate route optimization recommendations
- Provide context-aware data insights

## Future Development

- Mobile app with field data collection capabilities
- Real-time alert system for vessels entering high-risk areas
- Integration with marine mammal detection systems
- Expanded species database with machine learning-enhanced prediction models
- Collaborative tools for conservation organizations

## Contributing

We welcome contributions! Please see our [contributing guidelines](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Marine conservation data provided by [Ocean Conservation Partner]
- Vessel tracking data from [Maritime Authority]
- Special thanks to the research teams tracking endangered marine species

---

*MigrateWatch: Navigating safer paths for marine life and maritime commerce.*