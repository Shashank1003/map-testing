import "mapbox-gl/dist/mapbox-gl.css";

import Map, { Layer, Source } from "react-map-gl";
import { useEffect, useRef, useState } from "react";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoiYWlycHJvYmUiLCJhIjoiY2tkcmVqbDF2MDVqbzJ0b3FmeTcxcHFrZSJ9.YQR_ZeBEF43y8pV2KKvHcg";

export default function App() {
  const mapRef = useRef(null);
  const [viewPort, setViewPort] = useState({
    longitude: 73.456722,
    latitude: 28.342705,
    zoom: 16,
    minZoom: 16,
  });
  const [featureData, setFeatureData] = useState({
    type: "FeatureCollection",
    features: [],
  });
  const [isSelectingMultiple, setIsSelectingMultiple] = useState(false);
  const [startPos, setStartPos] = useState([]);
  const [endPos, setEndPos] = useState([]);
  const [tableConfig, setTableConfig] = useState([]);
  const [panelsInTable, setPanelsInTable] = useState([]);

  // useEffect(() => {
  //   console.log("FEATURE UPDATED", featureData);
  // }, [featureData]);

  useEffect(() => {
    setFeatureData({ type: "FeatureCollection", features: [] });
  }, [isSelectingMultiple]);

  useEffect(() => {
    if (startPos.length && endPos.length) {
      if (startPos[0] > endPos[0]) {
        const startPosition = startPos;
        setStartPos(endPos);
        return setEndPos(startPosition);
      }
      const tableRow = parseInt(tableConfig[1]);
      console.log(panelsInTable);
      console.log(startPos, endPos, tableConfig, tableRow);
      const filteredData = panelsInTable.filter((x) => {
        if (startPos[0] !== endPos[0]) {
          if (x.properties.panel_column === startPos[0]) {
            return x.properties.panel_row >= startPos[1];
          } else if (x.properties.panel_column === endPos[0]) {
            return x.properties.panel_row <= endPos[1];
          } else {
            return (
              x.properties.panel_column > startPos[0] &&
              x.properties.panel_column < endPos[0]
            );
          }
        } else {
          return (
            x.properties.panel_column === startPos[0] &&
            x.properties.panel_row >= startPos[1] &&
            x.properties.panel_row <= endPos[1]
          );
        }
      });
      console.log("Filtered data", filteredData);
      setFeatureData({
        type: "FeatureCollection",
        features: filteredData,
      });
      setStartPos([]);
      setEndPos([]);
      setPanelsInTable([]);
    }
  }, [startPos, endPos]);

  const handleMapClick = (event) => {
    // console.log(mapRef.current.getMap().queryRenderedFeatures(event.point));
    const feature = mapRef.current
      .getMap()
      .queryRenderedFeatures(event.point)[0];
    console.log(feature);
    if (feature) {
      const featureObj = {
        type: "Feature",
        geometry: feature.geometry,
        properties: feature.properties,
      };

      if (!isSelectingMultiple) {
        return setFeatureData({
          type: "FeatureCollection",
          features: [featureObj],
        });
      } else {
        const listOfPanels = mapRef.current
          .getMap()
          .querySourceFeatures("mvt", {
            sourceLayer: "default",
            filter: ["==", "table_id", feature.properties.table_id],
          });
        if (!startPos.length) {
          setStartPos([
            feature.properties.panel_column,
            feature.properties.panel_row,
          ]);
        } else {
          setEndPos([
            feature.properties.panel_column,
            feature.properties.panel_row,
          ]);
        }
        setTableConfig(feature.properties.table_config.split("x"));
        setPanelsInTable(listOfPanels);
      }
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          padding: "8px",
          background: "white",
          zIndex: "2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid black",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        onClick={() => setIsSelectingMultiple(!isSelectingMultiple)}
      >
        {!isSelectingMultiple ? "single selection" : "multiple selection"}
      </div>
      <Map
        {...viewPort}
        onMove={(e) => {
          setViewPort(e.viewState);
        }}
        style={{ height: `100vh`, width: `100%` }}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        mapboxAccessToken={MAPBOX_TOKEN}
        ref={mapRef}
        onClick={handleMapClick}
      >
        <Source
          id="mvt"
          type="vector"
          tiles={[
            "http://ec2-18-194-188-171.eu-central-1.compute.amazonaws.com:8000/tiles/{z}/{x}/{y}",
            "http://ec2-18-194-188-171.eu-central-1.compute.amazonaws.com:8000/tiles/{z}/{x}/{y}",
            "http://ec2-18-194-188-171.eu-central-1.compute.amazonaws.com:8000/tiles/{z}/{x}/{y}",
            "http://ec2-18-194-188-171.eu-central-1.compute.amazonaws.com:8000/tiles/{z}/{x}/{y}",
          ]}
        />

        <Layer
          id="mvt"
          source="mvt"
          source-layer="default"
          type="fill"
          paint={{
            "fill-color": "#00ffff",
            // "fill-opacity": 0.5,
            "fill-outline-color": "#000",
          }}
        />

        <Layer
          id="outline"
          source="mvt"
          source-layer="default"
          type="line"
          paint={{
            "line-color": "#000",
            // "fill-opacity": 0.5,
          }}
        />

        <Layer
          id="text"
          source="mvt"
          source-layer="default"
          type="symbol"
          layout={{
            "text-field": ["get", "panel_row"],
            "text-offset": [0, viewPort.zoom / (viewPort.zoom + 10)],
            "text-size": viewPort.zoom > 20 ? viewPort.zoom / 2 : 0,
            "text-allow-overlap": true,
          }}
        />

        <Source id="highlight" type="geojson" data={featureData} />

        <Layer
          id="highlightLayer"
          source="highlight"
          type="fill"
          paint={{
            "fill-color": "red",
            // "fill-opacity": 0.8,
            "fill-outline-color": "#000",
          }}
        />

        <Layer
          id="highlightOutline"
          source="highlight"
          type="line"
          paint={{
            "line-color": "#000",
            // "fill-opacity": 0.5,
          }}
        />

        <Layer
          id="highlightText"
          source="highlight"
          type="symbol"
          layout={{
            "text-field": ["get", "panel_row"],
            "text-offset": [0, viewPort.zoom / (viewPort.zoom + 10)],
            "text-size": viewPort.zoom > 20 ? viewPort.zoom / 2 : 0,
            "text-allow-overlap": true,
          }}
        />
      </Map>
    </div>
  );
}
