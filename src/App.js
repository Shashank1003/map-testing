import "mapbox-gl/dist/mapbox-gl.css";

import Map, { Layer, Source } from "react-map-gl";
import { useRef, useState } from "react";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoiYWlycHJvYmUiLCJhIjoiY2tkcmVqbDF2MDVqbzJ0b3FmeTcxcHFrZSJ9.YQR_ZeBEF43y8pV2KKvHcg";

export default function App() {
  const [viewPort, setViewPort] = useState({
    longitude: -0.795884491,
    latitude: 50.76080173,
    zoom: 15,
    minZoom: 12,
  });
  const mapRef = useRef(null);

  return (
    <Map
      {...viewPort}
      onMove={(e) => {
        setViewPort(e.viewState);
      }}
      style={{ height: `97vh`, width: `98vw` }}
      // initialViewState={viewPort}
      mapStyle="mapbox://styles/mapbox/satellite-v9"
      mapboxAccessToken={MAPBOX_TOKEN}
      ref={mapRef}
      // onLoad={mapLoad}
      // onMouseMove={handleMouseMove}
      onClick={(e) => {
        console.log(mapRef.current.getMap().queryRenderedFeatures(e.point));
      }}
      // onMouseOut={closeAllActions}
      // onStyleData={handleStyleChange}
      // onTouchStart={onClickMarkerEvent}
    >
      <Source
        id="mvt"
        type="vector"
        tiles={[
          "http://20.219.131.227:8000/tiles/{z}/{x}/{y}",
          "http://20.219.131.227:8000/tiles/{z}/{x}/{y}",
          "http://20.219.131.227:8000/tiles/{z}/{x}/{y}",
          "http://20.219.131.227:8000/tiles/{z}/{x}/{y}",
        ]}
      />

      <Layer
        id="mvt"
        source="mvt"
        source-layer="default"
        type="fill"
        paint={{
          "fill-color": "#00ffff",
          "fill-opacity": 0.5,
        }}
      />
    </Map>
  );
}
