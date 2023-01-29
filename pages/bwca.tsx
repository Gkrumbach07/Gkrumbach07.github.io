import * as React from 'react';
import Map, { Layer, Source } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import supabase from '../lib/api/supabase';

type geoJSONType = {
    json_build_object: {
        geometry: GeoJSON.Geometry
        id: number,
        properties: any,
        type: any
    }
}

const layerStyle = {
    type: 'line',
    paint: {
        "line-color": "#fff",
        "line-width": 5
    }
};

export default () => {
    const [geojson, setGeojson] = React.useState<GeoJSON.FeatureCollection<GeoJSON.Geometry>>({
        type: 'FeatureCollection',
        features: []
    })
    React.useEffect(() => {
        supabase.rpc('trails').then(resp => {
            const data = resp?.data as unknown as geoJSONType[]
            console.log(resp?.data?.length, resp)
            setGeojson(
                {
                    type: 'FeatureCollection',
                    features: [
                        ...data.map(line => line.json_build_object)
                    ]
                }
            )
        })
    }, [])

    console.log(geojson)

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
            <Source id="my-data" type="geojson" data={geojson}>
                <Layer type="line" id='wd'/>
            </Source>
        </Map>
    )
}