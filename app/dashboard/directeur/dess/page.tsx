'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Home, ChevronRight, Search, Filter, X } from 'lucide-react';

const InteractiveMarketMap = ({ marchee, onZoneClick, onHallClick, onPlaceClick }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedHall, setSelectedHall] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState(['Marché']);
  
  // États pour recherche et filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    showZones: true,
    showHalls: true,
    showPlaces: true
  });
  const [searchResults, setSearchResults] = useState([]);
  const [highlightedItems, setHighlightedItems] = useState([]);
  
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  // Fonction de recherche
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setHighlightedItems([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = [];

    // Recherche dans les zones
    if (filters.showZones) {
      marchee.zones?.forEach(zone => {
        if (zone.nom.toLowerCase().includes(query)) {
          results.push({ type: 'zone', data: zone, label: `Zone: ${zone.nom}` });
        }
      });
    }

    // Recherche dans les halls
    if (filters.showHalls) {
      marchee.zones?.forEach(zone => {
        zone.halls?.forEach(hall => {
          if (hall.nom.toLowerCase().includes(query)) {
            results.push({ type: 'hall', data: hall, label: `Hall: ${hall.nom} (${zone.nom})`, parentZone: zone });
          }
        });
      });
      marchee.halls?.forEach(hall => {
        if (hall.nom.toLowerCase().includes(query)) {
          results.push({ type: 'hall', data: hall, label: `Hall: ${hall.nom}` });
        }
      });
    }

    // Recherche dans les places
    if (filters.showPlaces) {
      marchee.places?.forEach(place => {
        if (place.nom.toLowerCase().includes(query)) {
          results.push({ type: 'place', data: place, label: `Place: ${place.nom}` });
        }
      });
    }

    setSearchResults(results);
    setHighlightedItems(results.map(r => `${r.type}-${r.data.id}`));
  }, [searchQuery, filters, marchee]);

  // Calculer les dimensions du canvas nécessaire
  const getCanvasDimensions = () => {
    if (selectedHall) {
      return { width: 1000, height: 800 };
    } else if (selectedZone) {
      return { width: 1000, height: 800 };
    } else {
      const zonesCount = (marchee.zones?.length || 0);
      const hallsCount = (marchee.halls?.length || 0);
      const placesCount = (marchee.places?.length || 0);
      
      const cols = Math.ceil(Math.sqrt(zonesCount));
      const width = Math.max(1600, cols * 280 + 1000);
      const height = Math.max(900, Math.ceil(zonesCount / cols) * 200 + 200);
      
      return { width, height };
    }
  };

  const canvasDims = getCanvasDimensions();

  // Générer des positions pour les zones (disposition en grille améliorée)
  const generateZoneLayout = (zones) => {
    const cols = Math.ceil(Math.sqrt(zones.length));
    const spacing = 280;
    const startX = 50;
    const startY = 120;

    return zones.map((zone, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      return {
        ...zone,
        x: startX + col * spacing,
        y: startY + row * spacing,
        width: 240,
        height: 180
      };
    });
  };

  // Générer des positions pour les halls dans une zone
  const generateHallLayout = (halls, containerWidth = 450) => {
    if (!halls || halls.length === 0) return [];
    
    const cols = Math.ceil(Math.sqrt(halls.length));
    const spacing = 120;
    const startX = 30;
    const startY = 120;

    return halls.map((hall, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      return {
        ...hall,
        x: startX + col * spacing,
        y: startY + row * spacing,
        width: 100,
        height: 80
      };
    });
  };

  // Générer des positions pour les places
  const generatePlaceLayout = (places, containerWidth, containerHeight, padding = 30) => {
    if (!places || places.length === 0) return [];
    
    const cols = Math.ceil(Math.sqrt(places.length));
    const rows = Math.ceil(places.length / cols);
    const availableWidth = containerWidth - (padding * 2);
    const availableHeight = containerHeight - (padding * 2);
    const cellWidth = availableWidth / cols;
    const cellHeight = availableHeight / rows;
    const minSize = 15;
    const maxSize = 35;

    return places.map((place, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const size = Math.max(minSize, Math.min(maxSize, Math.min(cellWidth, cellHeight) * 0.7));
      
      return {
        ...place,
        x: padding + col * cellWidth + cellWidth / 2,
        y: padding + row * cellHeight + cellHeight / 2,
        size: size
      };
    });
  };

  const handleZoom = (delta) => {
    setScale(prev => Math.max(0.3, Math.min(4, prev + delta)));
  };

  const handleResetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setSelectedZone(null);
    setSelectedHall(null);
    setBreadcrumb(['Marché']);
    setSearchQuery('');
    setSearchResults([]);
    setHighlightedItems([]);
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoneClickInternal = (zone) => {
    setSelectedZone(zone);
    setSelectedHall(null);
    setBreadcrumb(['Marché', zone.nom]);
    if (onZoneClick) onZoneClick(zone);
  };

  const handleHallClickInternal = (hall) => {
    setSelectedHall(hall);
    const newBreadcrumb = selectedZone 
      ? ['Marché', selectedZone.nom, hall.nom]
      : ['Marché', hall.nom];
    setBreadcrumb(newBreadcrumb);
    if (onHallClick) onHallClick(hall);
  };

  const handleBreadcrumbClick = (index) => {
    if (index === 0) {
      handleResetView();
    } else if (index === 1 && selectedZone) {
      setSelectedHall(null);
      setBreadcrumb(['Marché', selectedZone.nom]);
    }
  };

  const handleSearchResultClick = (result) => {
    if (result.type === 'zone') {
      handleZoneClickInternal(result.data);
    } else if (result.type === 'hall') {
      if (result.parentZone) {
        setSelectedZone(result.parentZone);
      }
      handleHallClickInternal(result.data);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const isHighlighted = (type, id) => {
    return highlightedItems.includes(`${type}-${id}`);
  };

  // Vue du marché complet
  const renderMarketView = () => {
    const zones = generateZoneLayout(marchee.zones || []);
    
    // Calculer la position de départ pour les halls indépendants
    const zonesEndX = zones.length > 0 
      ? Math.max(...zones.map(z => z.x + z.width)) + 80
      : 50;
    
    const halls = (marchee.halls || []).map((hall, index) => ({
      ...hall,
      x: zonesEndX + (index % 2) * 140,
      y: 120 + Math.floor(index / 2) * 110,
      width: 120,
      height: 90
    }));

    // Calculer la position pour les places indépendantes
    const hallsEndX = halls.length > 0
      ? Math.max(...halls.map(h => h.x + h.width)) + 80
      : zonesEndX;

    const placesContainerWidth = 350;
    const placesContainerHeight = 500;
    const places = generatePlaceLayout(
      marchee.places || [], 
      placesContainerWidth, 
      placesContainerHeight
    ).map(p => ({
      ...p,
      x: p.x + hallsEndX,
      y: p.y + 120
    }));

    return (
      <>
        {/* Titre principal */}
        <text x="50" y="50" className="font-bold" fill="#1f2937" fontSize="28">
          {marchee.nom}
        </text>
        <text x="50" y="75" fill="#6b7280" fontSize="14">
          Vue d'ensemble du marché
        </text>

        {/* Zones */}
        {filters.showZones && zones.length > 0 && (
          <>
            <text x="50" y="105" className="font-semibold" fill="#92400e" fontSize="16">
              Zones ({zones.length})
            </text>
            {zones.map((zone) => {
              const highlighted = isHighlighted('zone', zone.id);
              return (
                <g key={`zone-${zone.id}`}>
                  <rect
                    x={zone.x}
                    y={zone.y}
                    width={zone.width}
                    height={zone.height}
                    fill={highlighted ? '#fde047' : hoveredItem === `zone-${zone.id}` ? '#fef08a' : '#fef3c7'}
                    stroke={highlighted ? '#ca8a04' : '#f59e0b'}
                    strokeWidth={highlighted ? '4' : '2'}
                    rx="10"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredItem(`zone-${zone.id}`)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleZoneClickInternal(zone);
                    }}
                  />
                  <text
                    x={zone.x + zone.width / 2}
                    y={zone.y + 35}
                    textAnchor="middle"
                    className="font-bold pointer-events-none"
                    fill="#78350f"
                    fontSize="16"
                  >
                    {zone.nom}
                  </text>
                  {zone.description && (
                    <text
                      x={zone.x + zone.width / 2}
                      y={zone.y + 55}
                      textAnchor="middle"
                      className="pointer-events-none"
                      fill="#92400e"
                      fontSize="11"
                    >
                      {zone.description.substring(0, 25)}
                    </text>
                  )}
                  <line
                    x1={zone.x + 20}
                    y1={zone.y + 70}
                    x2={zone.x + zone.width - 20}
                    y2={zone.y + 70}
                    stroke="#f59e0b"
                    strokeWidth="1"
                  />
                  <text
                    x={zone.x + zone.width / 2}
                    y={zone.y + 95}
                    textAnchor="middle"
                    className="pointer-events-none font-medium"
                    fill="#78350f"
                    fontSize="13"
                  >
                    🏢 {zone.halls?.length || 0} halls
                  </text>
                  <text
                    x={zone.x + zone.width / 2}
                    y={zone.y + 120}
                    textAnchor="middle"
                    className="pointer-events-none font-medium"
                    fill="#78350f"
                    fontSize="13"
                  >
                    📍 {zone.places?.length || 0} places
                  </text>
                  <text
                    x={zone.x + zone.width / 2}
                    y={zone.y + 155}
                    textAnchor="middle"
                    className="pointer-events-none text-xs"
                    fill="#a16207"
                    fontSize="10"
                  >
                    Cliquer pour explorer →
                  </text>
                </g>
              );
            })}
          </>
        )}

        {/* Halls indépendants */}
        {filters.showHalls && halls.length > 0 && (
          <>
            <text x={zonesEndX} y="105" className="font-semibold" fill="#1e40af" fontSize="16">
              Halls hors zones ({halls.length})
            </text>
            {halls.map((hall) => {
              const highlighted = isHighlighted('hall', hall.id);
              return (
                <g key={`hall-${hall.id}`}>
                  <rect
                    x={hall.x}
                    y={hall.y}
                    width={hall.width}
                    height={hall.height}
                    fill={highlighted ? '#93c5fd' : hoveredItem === `hall-${hall.id}` ? '#bfdbfe' : '#dbeafe'}
                    stroke={highlighted ? '#1d4ed8' : '#3b82f6'}
                    strokeWidth={highlighted ? '4' : '2'}
                    rx="8"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredItem(`hall-${hall.id}`)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHallClickInternal(hall);
                    }}
                  />
                  <text
                    x={hall.x + hall.width / 2}
                    y={hall.y + 35}
                    textAnchor="middle"
                    className="font-bold pointer-events-none"
                    fill="#1e3a8a"
                    fontSize="14"
                  >
                    {hall.nom}
                  </text>
                  <text
                    x={hall.x + hall.width / 2}
                    y={hall.y + 55}
                    textAnchor="middle"
                    className="pointer-events-none font-medium"
                    fill="#1e40af"
                    fontSize="12"
                  >
                    📍 {hall.places?.length || 0} places
                  </text>
                  <text
                    x={hall.x + hall.width / 2}
                    y={hall.y + 75}
                    textAnchor="middle"
                    className="pointer-events-none text-xs"
                    fill="#1e40af"
                    fontSize="9"
                  >
                    Cliquer →
                  </text>
                </g>
              );
            })}
          </>
        )}

        {/* Places indépendantes */}
        {filters.showPlaces && places.length > 0 && (
          <>
            <text x={hallsEndX} y="105" className="font-semibold" fill="#ea580c" fontSize="16">
              Places hors zones/halls ({places.length})
            </text>
            <rect
              x={hallsEndX}
              y={120}
              width={placesContainerWidth}
              height={placesContainerHeight}
              fill="#fff7ed"
              stroke="#f97316"
              strokeWidth="2"
              strokeDasharray="8,4"
              rx="10"
            />
            {places.map((place) => {
              const highlighted = isHighlighted('place', place.id);
              return (
                <g key={`place-${place.id}`}>
                  <circle
                    cx={place.x}
                    cy={place.y}
                    r={place.size / 2}
                    fill={highlighted ? '#fdba74' : hoveredItem === `place-${place.id}` ? '#fed7aa' : '#ffedd5'}
                    stroke={highlighted ? '#c2410c' : '#ea580c'}
                    strokeWidth={highlighted ? '3' : '2'}
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredItem(`place-${place.id}`)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onPlaceClick) onPlaceClick(place);
                    }}
                  />
                  <text
                    x={place.x}
                    y={place.y + 4}
                    textAnchor="middle"
                    className="pointer-events-none font-medium"
                    fill="#7c2d12"
                    fontSize="11"
                  >
                    {place.nom}
                  </text>
                </g>
              );
            })}
          </>
        )}
      </>
    );
  };

  // Vue d'une zone spécifique
  const renderZoneView = () => {
    const halls = generateHallLayout(selectedZone.halls || [], 500);
    const hallsEndY = halls.length > 0 
      ? Math.max(...halls.map(h => h.y + h.height)) + 50
      : 200;

    const placesContainerWidth = 800;
    const placesContainerHeight = 400;
    const places = generatePlaceLayout(
      selectedZone.places || [], 
      placesContainerWidth, 
      placesContainerHeight,
      40
    ).map(p => ({
      ...p,
      x: p.x + 50,
      y: p.y + hallsEndY + 80
    }));

    return (
      <>
        {/* En-tête de la zone */}
        <rect
          x="30"
          y="30"
          width="940"
          height="70"
          fill="#fef3c7"
          stroke="#f59e0b"
          strokeWidth="2"
          rx="8"
        />
        <text x="50" y="60" className="font-bold" fill="#78350f" fontSize="26">
          📍 Zone: {selectedZone.nom}
        </text>
        {selectedZone.description && (
          <text x="50" y="85" fill="#92400e" fontSize="13">
            {selectedZone.description}
          </text>
        )}

        {/* Halls dans la zone */}
        {filters.showHalls && halls.length > 0 && (
          <>
            <text x="50" y="130" className="font-semibold" fill="#1e40af" fontSize="18">
              🏢 Halls dans cette zone ({halls.length})
            </text>
            {halls.map((hall) => {
              const highlighted = isHighlighted('hall', hall.id);
              return (
                <g key={`hall-${hall.id}`}>
                  <rect
                    x={hall.x + 30}
                    y={hall.y}
                    width={hall.width}
                    height={hall.height}
                    fill={highlighted ? '#93c5fd' : hoveredItem === `hall-${hall.id}` ? '#bfdbfe' : '#dbeafe'}
                    stroke={highlighted ? '#1d4ed8' : '#3b82f6'}
                    strokeWidth={highlighted ? '4' : '2'}
                    rx="8"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredItem(`hall-${hall.id}`)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHallClickInternal(hall);
                    }}
                  />
                  <text
                    x={hall.x + 30 + hall.width / 2}
                    y={hall.y + 30}
                    textAnchor="middle"
                    className="font-bold pointer-events-none"
                    fill="#1e3a8a"
                    fontSize="13"
                  >
                    {hall.nom}
                  </text>
                  <text
                    x={hall.x + 30 + hall.width / 2}
                    y={hall.y + 50}
                    textAnchor="middle"
                    className="pointer-events-none font-medium"
                    fill="#1e40af"
                    fontSize="11"
                  >
                    📍 {hall.places?.length || 0} places
                  </text>
                  <text
                    x={hall.x + 30 + hall.width / 2}
                    y={hall.y + 68}
                    textAnchor="middle"
                    className="pointer-events-none text-xs"
                    fill="#2563eb"
                    fontSize="9"
                  >
                    Cliquer →
                  </text>
                </g>
              );
            })}
          </>
        )}

        {/* Places dans la zone */}
        {filters.showPlaces && places.length > 0 && (
          <>
            <text x="50" y={hallsEndY + 60} className="font-semibold" fill="#ea580c" fontSize="18">
              📍 Places dans cette zone ({places.length})
            </text>
            <rect
              x="50"
              y={hallsEndY + 80}
              width={placesContainerWidth}
              height={placesContainerHeight}
              fill="#fff7ed"
              stroke="#f97316"
              strokeWidth="2"
              strokeDasharray="8,4"
              rx="10"
            />
            {places.map((place) => {
              const highlighted = isHighlighted('place', place.id);
              return (
                <g key={`place-${place.id}`}>
                  <circle
                    cx={place.x}
                    cy={place.y}
                    r={place.size / 2}
                    fill={highlighted ? '#fdba74' : hoveredItem === `place-${place.id}` ? '#fed7aa' : '#ffedd5'}
                    stroke={highlighted ? '#c2410c' : '#ea580c'}
                    strokeWidth={highlighted ? '3' : '2'}
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredItem(`place-${place.id}`)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onPlaceClick) onPlaceClick(place);
                    }}
                  />
                  <text
                    x={place.x}
                    y={place.y + 4}
                    textAnchor="middle"
                    className="pointer-events-none font-medium"
                    fill="#7c2d12"
                    fontSize="11"
                  >
                    {place.nom}
                  </text>
                </g>
              );
            })}
          </>
        )}
      </>
    );
  };

  // Vue d'un hall spécifique
  const renderHallView = () => {
    const placesContainerWidth = 900;
    const placesContainerHeight = 650;
    const places = generatePlaceLayout(
      selectedHall.places || [], 
      placesContainerWidth, 
      placesContainerHeight,
      40
    );

    return (
      <>
        {/* En-tête du hall */}
        <rect
          x="30"
          y="30"
          width="940"
          height="70"
          fill="#dbeafe"
          stroke="#3b82f6"
          strokeWidth="2"
          rx="8"
        />
        <text x="50" y="60" className="font-bold" fill="#1e3a8a" fontSize="26">
          🏢 Hall: {selectedHall.nom}
        </text>
        {selectedHall.description && (
          <text x="50" y="85" fill="#1e40af" fontSize="13">
            {selectedHall.description}
          </text>
        )}

        <text x="50" y="130" className="font-semibold" fill="#ea580c" fontSize="18">
          📍 Places dans ce hall ({places.length})
        </text>

        <rect
          x="50"
          y="150"
          width={placesContainerWidth}
          height={placesContainerHeight}
          fill="#fff7ed"
          stroke="#f97316"
          strokeWidth="2"
          rx="10"
        />

        {places.map((place) => {
          const highlighted = isHighlighted('place', place.id);
          return (
            <g key={`place-${place.id}`}>
              <circle
                cx={place.x + 50}
                cy={place.y + 150}
                r={place.size / 2}
                fill={highlighted ? '#fdba74' : hoveredItem === `place-${place.id}` ? '#fed7aa' : '#ffedd5'}
                stroke={highlighted ? '#c2410c' : '#ea580c'}
                strokeWidth={highlighted ? '3' : '2'}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredItem(`place-${place.id}`)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPlaceClick) onPlaceClick(place);
                }}
              />
              <text
                x={place.x + 50}
                y={place.y + 154}
                textAnchor="middle"
                className="pointer-events-none font-medium"
                fill="#7c2d12"
                fontSize="12"
              >
                {place.nom}
              </text>
            </g>
          );
        })}
      </>
    );
  };

  return (
    <div className="relative w-full h-screen bg-gray-100">
      {/* Barre d'outils */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-2 space-y-2">
        <button
          onClick={() => handleZoom(0.2)}
          className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          title="Zoom avant"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={() => handleZoom(-0.2)}
          className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          title="Zoom arrière"
        >
          <ZoomOut size={20} />
        </button>
        <button
          onClick={handleResetView}
          className="w-10 h-10 flex items-center justify-center bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          title="Réinitialiser la vue"
        >
          <Home size={20} />
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`w-10 h-10 flex items-center justify-center ${showFilters ? 'bg-green-500' : 'bg-gray-500'} text-white rounded hover:bg-green-600 transition`}
          title="Filtres"
        >
          <Filter size={20} />
        </button>
      </div>

      {/* Panneau de filtres */}
      {showFilters && (
        <div className="absolute top-4 left-20 z-10 bg-white rounded-lg shadow-lg p-4 w-56">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Filtres</h3>
            <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showZones}
                onChange={(e) => setFilters({...filters, showZones: e.target.checked})}
                className="w-4 h-4 text-yellow-500"
              />
              <span className="text-sm">Afficher les Zones</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showHalls}
                onChange={(e) => setFilters({...filters, showHalls: e.target.checked})}
                className="w-4 h-4 text-blue-500"
              />
              <span className="text-sm">Afficher les Halls</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.showPlaces}
                onChange={(e) => setFilters({...filters, showPlaces: e.target.checked})}
                className="w-4 h-4 text-orange-500"
              />
              <span className="text-sm">Afficher les Places</span>
            </label>
          </div>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="absolute top-4 right-4 z-10 w-80">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une zone, hall ou place..."
            className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
                setHighlightedItems([]);
              }}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Résultats de recherche */}
        {searchResults.length > 0 && (
          <div className="mt-2 bg-white rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handleSearchResultClick(result)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-200 last:border-b-0 transition"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {result.type === 'zone' ? '📍' : result.type === 'hall' ? '🏢' : '⭕'}
                  </span>
                  <span className="text-sm font-medium text-gray-800">{result.label}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {searchQuery && searchResults.length === 0 && (
          <div className="mt-2 bg-white rounded-lg shadow-lg px-4 py-3">
            <p className="text-sm text-gray-500">Aucun résultat trouvé</p>
          </div>
        )}
      </div>

      {/* Fil d'Ariane */}
      <div className="absolute top-20 left-4 z-10 bg-white rounded-lg shadow-lg px-4 py-2 flex items-center space-x-2">
        {breadcrumb.map((item, index) => (
          <React.Fragment key={index}>
            <button
              onClick={() => handleBreadcrumbClick(index)}
              className={`text-sm font-medium transition ${
                index === breadcrumb.length - 1
                  ? 'text-blue-600 cursor-default'
                  : 'text-gray-600 hover:text-blue-500 cursor-pointer'
              }`}
            >
              {item}
            </button>
            {index < breadcrumb.length - 1 && (
              <ChevronRight size={16} className="text-gray-400" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Légende */}
      <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4 space-y-2">
        <div className="text-sm font-semibold mb-3 text-gray-800">Légende</div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-yellow-200 border-2 border-yellow-600 rounded"></div>
          <span className="text-xs text-gray-700">Zone</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-200 border-2 border-blue-600 rounded"></div>
          <span className="text-xs text-gray-700">Hall</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-orange-200 border-2 border-orange-600 rounded-full"></div>
          <span className="text-xs text-gray-700">Place</span>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-600 space-y-1">
            <p>🖱️ Cliquer pour explorer</p>
            <p>🔍 Zoom: Molette ou boutons</p>
            <p>✋ Déplacer: Glisser-déposer</p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 min-w-48">
        <div className="text-sm font-semibold mb-2 text-gray-800">Statistiques</div>
        <div className="space-y-1 text-xs text-gray-600">
          <p>📍 Zones: {marchee.zones?.length || 0}</p>
          <p>🏢 Halls: {(marchee.halls?.length || 0) + (marchee.zones?.reduce((acc, z) => acc + (z.halls?.length || 0), 0) || 0)}</p>
          <p>⭕ Places totales: {marchee.nbrPlace || 0}</p>
          <p className="pt-2 border-t border-gray-200 mt-2">
            Zoom: {(scale * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Carte SVG */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          width={canvasDims.width}
          height={canvasDims.height}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          <defs>
            <pattern
              id="grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            </pattern>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {selectedHall ? renderHallView() : selectedZone ? renderZoneView() : renderMarketView()}
        </svg>
      </div>

      {/* Informations de l'élément survolé */}
      {hoveredItem && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-10 bg-blue-600 text-white rounded-lg shadow-lg px-4 py-2">
          <p className="text-sm font-medium">
            👆 Cliquez pour explorer cet élément
          </p>
        </div>
      )}
    </div>
  );
};
 
// Exemple d'utilisation avec des données de démonstration
const App = () => {
  const marcheeExample = {
    id: 1,
    nom: "Marché Central d'Analakely",
    description: "Grand marché avec zones et halls",
    nbrPlace: 450,
    zones: [
      {
        id: 1,
        nom: "Zone Nord",
        description: "Alimentation",
        halls: [
          {
            id: 101,
            nom: "Hall A",
            description: "Fruits et légumes",
            places: [
              { id: 1001, nom: "P1" },
              { id: 1002, nom: "P2" },
              { id: 1003, nom: "P3" },
              { id: 1004, nom: "P4" },
              { id: 1005, nom: "P5" },
              { id: 1006, nom: "P6" }
            ]
          },
          {
            id: 102,
            nom: "Hall B",
            description: "Viandes et poissons",
            places: [
              { id: 1007, nom: "P7" },
              { id: 1008, nom: "P8" },
              { id: 1009, nom: "P9" }
            ]
          },
          {
            id: 103,
            nom: "Hall C",
            description: "Épices",
            places: [
              { id: 1010, nom: "P10" },
              { id: 1011, nom: "P11" }
            ]
          }
        ],
        places: [
          { id: 2001, nom: "Z1" },
          { id: 2002, nom: "Z2" },
          { id: 2003, nom: "Z3" },
          { id: 2004, nom: "Z4" }
        ]
      },
      {
        id: 2,
        nom: "Zone Sud",
        description: "Vêtements",
        halls: [
          {
            id: 201,
            nom: "Hall D",
            description: "Mode homme",
            places: [
              { id: 3001, nom: "P12" },
              { id: 3002, nom: "P13" },
              { id: 3003, nom: "P14" }
            ]
          },
          {
            id: 202,
            nom: "Hall E",
            description: "Mode femme",
            places: [
              { id: 3004, nom: "P15" },
              { id: 3005, nom: "P16" }
            ]
          }
        ],
        places: [
          { id: 4001, nom: "Z5" },
          { id: 4002, nom: "Z6" },
          { id: 4003, nom: "Z7" }
        ]
      },
      {
        id: 3,
        nom: "Zone Est",
        description: "Électronique",
        halls: [
          {
            id: 301,
            nom: "Hall F",
            description: "Smartphones",
            places: [
              { id: 5001, nom: "P17" },
              { id: 5002, nom: "P18" }
            ]
          }
        ],
        places: [
          { id: 6001, nom: "Z8" },
          { id: 6002, nom: "Z9" },
          { id: 6003, nom: "Z10" },
          { id: 6004, nom: "Z11" }
        ]
      },
      {
        id: 4,
        nom: "Zone Ouest",
        description: "Artisanat",
        halls: [],
        places: [
          { id: 7001, nom: "Z12" },
          { id: 7002, nom: "Z13" },
          { id: 7003, nom: "Z14" }
        ]
      }
    ],
    halls: [
      {
        id: 401,
        nom: "Hall Principal",
        description: "Services généraux",
        places: [
          { id: 8001, nom: "H1" },
          { id: 8002, nom: "H2" },
          { id: 8003, nom: "H3" },
          { id: 8004, nom: "H4" }
        ]
      },
      {
        id: 402,
        nom: "Hall Annexe",
        description: "Restauration",
        places: [
          { id: 9001, nom: "H5" },
          { id: 9002, nom: "H6" },
          { id: 9003, nom: "H7" }
        ]
      }
    ],
    places: [
      { id: 10001, nom: "M1" },
      { id: 10002, nom: "M2" },
      { id: 10003, nom: "M3" },
      { id: 10004, nom: "M4" },
      { id: 10005, nom: "M5" },
      { id: 10006, nom: "M6" },
      { id: 10007, nom: "M7" },
      { id: 10008, nom: "M8" }
    ]
  };

  return (
    <InteractiveMarketMap
      marchee={marcheeExample}
      onZoneClick={(zone) => console.log('Zone cliquée:', zone)}
      onHallClick={(hall) => console.log('Hall cliqué:', hall)}
      onPlaceClick={(place) => console.log('Place cliquée:', place)}
    />
  );
};

export default App;