import * as React from 'react';
import Map, { Layer, Source } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import supabase from '../lib/api/supabase';

type geoJSONType = {
    json_build_object: {
        geometry: GeoJSON.Point
        id: number,
        properties: any,
        type: any
    }
}

const Bwca = () => {
    const [geojson_waterways, setGeojson_waterways] = React.useState<GeoJSON.FeatureCollection<GeoJSON.Geometry>>({
        type: 'FeatureCollection',
        features: []
    })
    const [geojson_lakes, setGeojson_lakes] = React.useState<GeoJSON.FeatureCollection<GeoJSON.Geometry>>({
        type: 'FeatureCollection',
        features: []
    })
    const [geojson_campsites, setGeojson_campsites] = React.useState<GeoJSON.FeatureCollection<GeoJSON.Geometry>>({
        type: 'FeatureCollection',
        features: []
    })
    const [geojson_portages, setGeojson_portages] = React.useState<GeoJSON.FeatureCollection<GeoJSON.Geometry>>({
        type: 'FeatureCollection',
        features: []
    })
    React.useEffect(() => {
        supabase.rpc('campsites').then(resp => {
            const data = resp?.data as unknown as geoJSONType[]
            setGeojson_campsites(
                {
                    type: 'FeatureCollection',
                    features: [
                        ...data.map(line => line.json_build_object)
                    ]
                }
            )
        })

        supabase.rpc('portages').then(resp => {
            const data = resp?.data as unknown as geoJSONType[]
            setGeojson_portages(
                {
                    type: 'FeatureCollection',
                    features: [
                        ...data.map(line => line.json_build_object)
                    ]
                }
            )
        })

        supabase.rpc('lakes').then(resp => {
            const data = resp?.data as unknown as geoJSONType[]
            setGeojson_lakes(
                {
                    type: 'FeatureCollection',
                    features: [
                        ...data.map(line => line.json_build_object)
                    ]
                }
            )
        })

        supabase.rpc('waterways').then(resp => {
            const data = resp?.data as unknown as geoJSONType[]
            setGeojson_waterways(
                {
                    type: 'FeatureCollection',
                    features: [
                        ...data.map(line => line.json_build_object)
                    ]
                }
            )
        })
    }, [])

    return (
        <Map
            mapLib={maplibregl}
            initialViewState={{
                latitude: 47.992,
                longitude: -90.818,
                zoom: 14
            }}
            style={{ aspectRatio: "16 / 9" }}
            mapStyle="https://api.maptiler.com/maps/outdoor-v2/style.json?key=xwoervoKmfA3fyUtVroU"
        >
            <Source id="my-data" type="geojson" data={geojson_campsites}>
                <Layer type="circle" paint={{
                    'circle-radius': 5,
                    'circle-color': '#007cbf'
                }} id='campsites' />
            </Source>
            <Source type="geojson" data={geojson_waterways}>
                <Layer type="line" id='waterways' />
            </Source>
            <Source type="geojson" data={geojson_lakes}>
                <Layer type="line" id='lakes' />
            </Source>
            <Source type="geojson" data={geojson_portages}>
                <Layer type="line" id='portages' />
            </Source>
        </Map>
    )
}

export default Bwca