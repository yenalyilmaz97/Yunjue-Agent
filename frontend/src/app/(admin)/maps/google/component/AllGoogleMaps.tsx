import { GoogleMap, Marker, Polyline, InfoWindow, useLoadScript } from '@react-google-maps/api'
import { useRef, useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'

const containerStyle = { width: '100%', height: '400px' }

const BasicMap = () => {
  return (
    <>
      <Col>
        <Card>
          <CardHeader>
            <CardTitle as={'h5'}>Basic Example</CardTitle>
            <p className="card-subtitle">
              Give textual form controls like
              <code>&lt;input&gt;</code>s and
              <code>&lt;textarea&gt;</code>s an upgrade with custom styles, sizing, focus states, and more.
            </p>
          </CardHeader>
          <CardBody>
            <div>
              <div className="mb-3">
                <div className="gmaps" style={{ position: 'relative', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '400px' }}>
                    <GoogleMap
                      mapContainerStyle={containerStyle}
                      zoom={14}
                      center={{ lat: 21.569874, lng: 71.5893798 }}
                      options={{ fullscreenControl: false }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    </>
  )
}

const MapWithMarkers = () => {
  const [activeMarker, setActiveMarker] = useState<any>({})
  const [selectedPlace, setSelectedPlace] = useState<any>({})
  const [showingInfoWindow, setShowingInfoWindow] = useState<boolean>(false)

  const onInfoWindowClose = () => {
    setActiveMarker(null)
    setShowingInfoWindow(false)
  }

  const onBasicMarkerClick = () => {
    alert('You clicked in this marker')
  }

  const onMarkerClick = (props: unknown, marker: unknown) => {
    setActiveMarker(marker)
    setSelectedPlace(props)
    setShowingInfoWindow(true)
  }
  return (
    <>
      <Col>
        <Card>
          <CardHeader>
            <CardTitle as={'h5'}>Markers Google Map</CardTitle>
            <p className="card-subtitle">
              Give textual form controls like
              <code>&lt;input&gt;</code>s and
              <code>&lt;textarea&gt;</code>s an upgrade with custom styles, sizing, focus states, and more.
            </p>
          </CardHeader>
          <CardBody>
            <div>
              <div className="mb-3">
                <div className="gmaps" style={{ position: 'relative', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '400px' }}>
                    <GoogleMap mapContainerStyle={containerStyle} zoom={18} center={{ lat: 21.569874, lng: 71.5893798 }}>
                      <Marker position={{ lat: 21.569874, lng: 71.5893798 }} onClick={onBasicMarkerClick} />
                      <Marker position={{ lat: 21.56969, lng: 71.5893798 }} onClick={onMarkerClick as any} />
                      {showingInfoWindow && (
                        <InfoWindow position={{ lat: 21.56969, lng: 71.5893798 }} onCloseClick={onInfoWindowClose}>
                          <div>
                            <p>{selectedPlace.name}</p>
                          </div>
                        </InfoWindow>
                      )}
                    </GoogleMap>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    </>
  )
}

const StreetViewMap = () => {
  let mapRef: any = useRef()

  const activateStreetView = (position: { lat: number; lng: number }) => {
    if (mapRef) {
      const mapObj = mapRef.map.getStreetView()
      mapObj.setPov({ heading: 34, pitch: 10 })
      mapObj.setPosition(position)
      mapObj.setVisible(true)
    }
  }

  return (
    <>
      <Col>
        <Card>
          <CardHeader>
            <CardTitle as={'h5'}>Street View Panoramas Google Map</CardTitle>
            <p className="card-subtitle">
              Give textual form controls like
              <code>&lt;input&gt;</code>s and
              <code>&lt;textarea&gt;</code>s an upgrade with custom styles, sizing, focus states, and more.
            </p>
          </CardHeader>
          <CardBody>
            <div>
              <div className="gmaps" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '400px' }}>
                  <GoogleMap
                    onLoad={(map) => {
                      mapRef = map
                      const sv = map.getStreetView()
                      sv.setPov({ heading: 34, pitch: 10 })
                      sv.setPosition({ lat: 40.7295174, lng: -73.9986496 })
                      sv.setVisible(true)
                    }}
                    mapContainerStyle={containerStyle}
                    zoom={14}
                    center={{ lat: 40.7295174, lng: -73.9986496 }}
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    </>
  )
}

const PolyLineMap = () => {
  const polyline = [
    { lat: 37.789411, lng: -122.422116 },
    { lat: 37.785757, lng: -122.421333 },
    { lat: 37.789352, lng: -122.415346 },
  ]
  return (
    <>
      <Col>
        <Card>
          <CardHeader>
            <CardTitle as={'h5'}>Google Map Types</CardTitle>
            <p className="card-subtitle">
              Give textual form controls like
              <code>&lt;input&gt;</code>s and
              <code>&lt;textarea&gt;</code>s an upgrade with custom styles, sizing, focus states, and more.
            </p>
          </CardHeader>
          <CardBody>
            <div>
              <div className="gmaps" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '400px' }}>
                  <GoogleMap mapContainerStyle={containerStyle} zoom={14} center={polyline[0]}>
                    <Polyline path={polyline as any} options={{ strokeColor: '#0000FF', strokeOpacity: 0.8, strokeWeight: 2 }} />
                  </GoogleMap>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    </>
  )
}

const LightStyledMap = () => {
  const mapStyles = [
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#e9e9e9' }, { lightness: 17 }],
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#f5f5f5' }, { lightness: 20 }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.fill',
      stylers: [{ color: '#ffffff' }, { lightness: 17 }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#ffffff' }, { lightness: 29 }, { weight: 0.2 }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry',
      stylers: [{ color: '#ffffff' }, { lightness: 18 }],
    },
    {
      featureType: 'road.local',
      elementType: 'geometry',
      stylers: [{ color: '#ffffff' }, { lightness: 16 }],
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#f5f5f5' }, { lightness: 21 }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#dedede' }, { lightness: 21 }],
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{ visibility: 'on' }, { color: '#ffffff' }, { lightness: 16 }],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ saturation: 36 }, { color: '#333333' }, { lightness: 40 }],
    },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#f2f2f2' }, { lightness: 19 }],
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.fill',
      stylers: [{ color: '#fefefe' }, { lightness: 20 }],
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#fefefe' }, { lightness: 17 }, { weight: 1.2 }],
    },
  ]
  return (
    <>
      <Col>
        <Card>
          <CardHeader>
            <CardTitle as={'h5'}>Ultra Light With Labels</CardTitle>
            <p className="card-subtitle">
              Give textual form controls like
              <code>&lt;input&gt;</code>s and
              <code>&lt;textarea&gt;</code>s an upgrade with custom styles, sizing, focus states, and more.
            </p>
          </CardHeader>
          <CardBody>
            <div>
              <div className="gmaps" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '400px' }}>
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    zoom={14}
                    center={{ lat: -12.043333, lng: -77.028333 }}
                    options={{ styles: mapStyles as any }}
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    </>
  )
}

const DarkStyledMap = () => {
  const mapStyles = [
    {
      featureType: 'all',
      elementType: 'labels',
      stylers: [{ visibility: 'on' }],
    },
    {
      featureType: 'all',
      elementType: 'labels.text.fill',
      stylers: [{ saturation: 36 }, { color: '#000000' }, { lightness: 40 }],
    },
    {
      featureType: 'all',
      elementType: 'labels.text.stroke',
      stylers: [{ visibility: 'on' }, { color: '#000000' }, { lightness: 16 }],
    },
    {
      featureType: 'all',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.fill',
      stylers: [{ color: '#000000' }, { lightness: 20 }],
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#000000' }, { lightness: 17 }, { weight: 1.2 }],
    },
    {
      featureType: 'administrative.country',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#e5c163' }],
    },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#c4c4c4' }],
    },
    {
      featureType: 'administrative.neighborhood',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#e5c163' }],
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 20 }],
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 21 }, { visibility: 'on' }],
    },
    {
      featureType: 'poi.business',
      elementType: 'geometry',
      stylers: [{ visibility: 'on' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.fill',
      stylers: [{ color: '#e5c163' }, { lightness: '0' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#ffffff' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#e5c163' }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 18 }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry.fill',
      stylers: [{ color: '#575757' }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#ffffff' }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#2c2c2c' }],
    },
    {
      featureType: 'road.local',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 16 }],
    },
    {
      featureType: 'road.local',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#999999' }],
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 19 }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 17 }],
    },
  ]
  return (
    <>
      <Col>
        <Card>
          <CardHeader>
            <CardTitle as={'h5'}>Dark</CardTitle>
            <p className="card-subtitle">
              Give textual form controls like
              <code>&lt;input&gt;</code>s and
              <code>&lt;textarea&gt;</code>s an upgrade with custom styles, sizing, focus states, and more.
            </p>
          </CardHeader>
          <CardBody>
            <div>
              <div className="gmaps" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '400px' }}>
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    zoom={14}
                    center={{ lat: -12.043333, lng: -77.028333 }}
                    options={{ styles: mapStyles as any }}
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    </>
  )
}

const AllGoogleMaps = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDsucrEdmswqYrw0f6ej3bf4M4suDeRgNA',
  })

  if (!isLoaded) return null

  return (
    <>
      <Row className=" row-cols-lg-2 gx-3">
        <BasicMap />
        <MapWithMarkers />
        <StreetViewMap />
        <PolyLineMap />
        <LightStyledMap />
        <DarkStyledMap />
      </Row>
    </>
  )
}

export default AllGoogleMaps
