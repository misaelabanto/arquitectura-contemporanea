mapboxgl.accessToken =
	'pk.eyJ1IjoibWlzYWVsYWJhbnRvIiwiYSI6ImNrOXVnaTZwcDAxbW8zZXBraGUzcW5hYXgifQ.u4HP2AVZfqyHiaNJd-xKmg';
var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/streets-v11',
	center: [-77.002133, -12.12839],
	zoom: 13,
});
map.on('load', async () => {
	let places = await fetch('data.json').then(res => res.json());
	places = places.map(place => ({
		type: 'Feature',
		properties: {
			description: `
        <strong>${place.name}</strong>
        <p>
          <a target="_blank" href="${place.contentUrl}">Ver más</a>
        </p>
      `,
			icon: 'building',
		},
		geometry: {
			type: 'Point',
			coordinates: [place.longitude, place.latitude],
		},
	}));
	map.addSource('places', {
		type: 'geojson',
		data: {
			type: 'FeatureCollection',
			features: places,
		},
	});
  map.loadImage('3d-building.png', (error, image) => {
    if (error) throw error;
    map.addImage('building', image);
    map.addLayer({
      id: 'places',
      type: 'symbol',
      source: 'places',
      layout: {
        'icon-image': '{icon}',
        'icon-allow-overlap': true,
      },
    });
  });
	map.on('click', 'places', e => {
		const coordinates = e.features[0].geometry.coordinates.slice();
		const description = e.features[0].properties.description;
		while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
			coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
		}

		new mapboxgl.Popup().setLngLat(coordinates).setHTML(description).addTo(map);
	});
  map.on('mouseenter', 'places', () => {
		map.getCanvas().style.cursor = 'pointer';
	});
	map.on('mouseleave', 'places', () => {
		map.getCanvas().style.cursor = '';
	});
});
