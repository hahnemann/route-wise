<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { feature } from 'topojson-client';

 	type Point = {
		lat: number;
		lon: number;
		name?: string;
	};

	type AirportRow = {
		iata: string;
		latitude: number;
		longitude: number;
	};

	export let width: number = 900;
	export let height: number = 600;
	export let dataSource: string = '/unique_airports_with_latlon.csv';
	export let filterIatas: string[] = [];
	export let highlightIata: string | null = null;
	export let originIatas: string[] = [];
	export let routeData: any = null;

	let svg: SVGSVGElement | null = null;
	let allPoints: Point[] = [];
	let points: Point[] = [];
	let projection: d3.GeoProjection | null = null;
	let path: d3.GeoPath<any, d3.GeoPermissibleObjects> | null = null;
	let states: any = null;
	let dataLoaded = false;

	const parseAirports = (rows: AirportRow[]): Point[] => {
		return rows
			.map((row) => ({
				lat: Number(row.latitude),
				lon: Number(row.longitude),
				name: row.iata ? row.iata.trim().toUpperCase() : undefined
			}))
			.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon) && !!p.name);
	};

	const applyFilter = () => {
		const hi = highlightIata ? highlightIata.trim().toUpperCase() : '';
		const origins = new Set(
			(originIatas || [])
				.map((c) => (typeof c === 'string' ? c.trim().toUpperCase() : ''))
				.filter((c) => c.length > 0)
		);
		
		// Always include origin cities
		const pointSet = new Set<string>();
		origins.forEach((o) => pointSet.add(o));
		
		// If highlight is set, also include the highlighted airport and all intermediate cities on routes
		if (hi && routeData && Array.isArray(routeData)) {
			const currentRoute = routeData.find((r: any) => r.meeting_airport === hi);
			if (currentRoute) {
				// Dynamically extract all paths from the route object
				// Paths are stored with numeric keys like path1, path2, path3, etc.
				const pathKeys = Object.keys(currentRoute)
					.filter((key) => key.startsWith('path') && /^\d+$/.test(key.slice(4)))
					.sort((a, b) => {
						const numA = parseInt(a.slice(4), 10);
						const numB = parseInt(b.slice(4), 10);
						return numA - numB;
					});
				
				pathKeys.forEach((pathKey) => {
					const pathStr = currentRoute[pathKey];
					if (pathStr) {
						const pathCities = pathStr
							.split('->')
							.map((city: string) => city.trim().toUpperCase())
							.filter((city: string) => city.length > 0);
						pathCities.forEach((city: string) => pointSet.add(city));
					}
				});
			}
		}
		
		points = allPoints.filter((p) => p.name && pointSet.has(p.name));
	};

	const getIntermediateCities = (): Set<string> => {
		const hi = highlightIata ? highlightIata.trim().toUpperCase() : '';
		const origins = new Set(
			(originIatas || [])
				.map((c) => (typeof c === 'string' ? c.trim().toUpperCase() : ''))
				.filter((c) => c.length > 0)
		);
		
		const intermediates = new Set<string>();
		
		if (hi && routeData && Array.isArray(routeData)) {
			const currentRoute = routeData.find((r: any) => r.meeting_airport === hi);
			if (currentRoute) {
				// Dynamically extract all paths from the route object
				// Paths are stored with numeric keys like path1, path2, path3, etc.
				const pathKeys = Object.keys(currentRoute)
					.filter((key) => key.startsWith('path') && /^\d+$/.test(key.slice(4)))
					.sort((a, b) => {
						const numA = parseInt(a.slice(4), 10);
						const numB = parseInt(b.slice(4), 10);
						return numA - numB;
					});
				
				pathKeys.forEach((pathKey) => {
					const pathStr = currentRoute[pathKey];
					if (pathStr) {
						const pathCities = pathStr
							.split('->')
							.map((city: string) => city.trim().toUpperCase())
							.filter((city: string) => city.length > 0);
						
						// Intermediate cities are those that are not origins and not the destination
						pathCities.forEach((city: string) => {
							if (!origins.has(city) && city !== hi) {
								intermediates.add(city);
							}
						});
					}
				});
			}
		}
		
		return intermediates;
	};

	const render = () => {
		if (!svg || !projection || !path || !states) return;

		const g = d3.select(svg as SVGSVGElement);
		g.selectAll('*').remove();

		const active = highlightIata ? highlightIata.trim().toUpperCase() : '';

		// draw states
		g.append('g')
			.selectAll('path')
			.data((states as any).features)
			.enter()
			.append('path')
			.attr('d', path as any)
			.attr('fill', '#e0e0e0')
			.attr('stroke', '#999')
			.attr('stroke-width', 0.5);

		// draw lines from origins to destination when highlighted
		if (active) {
			const lineLayer = g.append('g').attr('class', 'route-lines');

			// Draw lines from route data if available
			if (routeData && Array.isArray(routeData)) {
				const currentRoute = routeData.find((r: any) => r.meeting_airport === active);
				if (currentRoute) {
					// Dynamically extract all paths from the route object
					// Paths are stored with numeric keys like path1, path2, path3, etc.
					const pathKeys = Object.keys(currentRoute)
						.filter((key) => key.startsWith('path') && /^\d+$/.test(key.slice(4)))
						.sort((a, b) => {
							const numA = parseInt(a.slice(4), 10);
							const numB = parseInt(b.slice(4), 10);
							return numA - numB;
						});

					pathKeys.forEach((pathKey) => {
						const pathStr = currentRoute[pathKey];
						if (pathStr) {
							// Parse path string like "MSP->DEN->LAX" into array ["MSP", "DEN", "LAX"]
							const pathCities = pathStr
								.split('->')
								.map((city: string) => city.trim().toUpperCase())
								.filter((city: string) => city.length > 0);

							// Draw lines between consecutive cities
							for (let i = 0; i < pathCities.length - 1; i++) {
								const fromCity = pathCities[i];
								const toCity = pathCities[i + 1];

								const fromPoint = allPoints.find((p) => p.name === fromCity);
								const toPoint = allPoints.find((p) => p.name === toCity);

								if (fromPoint && toPoint) {
									lineLayer
										.append('line')
										.attr('x1', () => {
											const c = projection([fromPoint.lon, fromPoint.lat]);
											return c ? c[0] : 0;
										})
										.attr('y1', () => {
											const c = projection([fromPoint.lon, fromPoint.lat]);
											return c ? c[1] : 0;
										})
										.attr('x2', () => {
											const c = projection([toPoint.lon, toPoint.lat]);
											return c ? c[0] : 0;
										})
										.attr('y2', () => {
											const c = projection([toPoint.lon, toPoint.lat]);
											return c ? c[1] : 0;
										})
										.attr('stroke', '#ff8800')
										.attr('stroke-width', 2)
										.attr('opacity', 0.6)
										.attr('stroke-dasharray', '4,2');
								}
							}
						}
					});
				}
			}
		}

		// draw city points
		const cityLayer = g.append('g');
		const intermediates = getIntermediateCities();
		const origins = new Set(
			(originIatas || [])
				.map((c) => (typeof c === 'string' ? c.trim().toUpperCase() : ''))
				.filter((c) => c.length > 0)
		);

		cityLayer
			.selectAll('circle')
			.data(points)
			.enter()
			.append('circle')
			.attr('cx', (d: Point) => {
				const c = projection([d.lon, d.lat]);
				return c ? c[0] : -1000;
			})
			.attr('cy', (d: Point) => {
				const c = projection([d.lon, d.lat]);
				return c ? c[1] : -1000;
			})
			.attr('r', (d: Point) => (d.name === active ? 9 : 6))
			.attr('fill', (d: Point) => {
				if (d.name === active) return '#ff8800'; // destination: orange
				if (intermediates.has(d.name ?? '')) return '#9333ea'; // intermediate: purple
				return '#e74c3c'; // origin: red
			})
			.attr('stroke', (d: Point) => {
				if (d.name === active) return '#c05621';
				if (intermediates.has(d.name ?? '')) return '#6b21a8';
				return '#c0392b';
			})
			.attr('stroke-width', (d: Point) => (d.name === active ? 2 : 1.5))
			.attr('opacity', (d: Point) => (d.name === active ? 1 : 0.9));

		// labels
		cityLayer
			.selectAll('text')
			.data(points)
			.enter()
			.append('text')
			.attr('x', (d: Point) => {
				const c = projection([d.lon, d.lat]);
				return c ? c[0] : -1000;
			})
			.attr('y', (d: Point) => {
				const c = projection([d.lon, d.lat]);
				return c ? c[1] - 10 : -1000;
			})
			.attr('text-anchor', 'middle')
			.attr('font-size', 12)
			.attr('font-weight', (d: Point) => (d.name === active ? 700 : 600))
			.attr('fill', (d: Point) => (d.name === active ? '#111' : '#222'))
			.text((d: Point) => d.name ?? '');
	};

	onMount(async () => {
		if (!svg) return;

		try {
			const airportData = (await d3.csv(dataSource)) as AirportRow[];
			allPoints = parseAirports(airportData);
			applyFilter();

			const us = (await d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')) as any;
			if (!us) return;

			states = feature(us, us.objects.states) as any;

			projection = d3.geoAlbersUsa().fitSize([width, height], states as any);
			path = d3.geoPath().projection(projection as any);

			dataLoaded = true;
			render();
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error('MapScene error loading map:', err);
		}
	});

	$: if (dataLoaded && svg && highlightIata !== undefined) {
		applyFilter();
		render();
	}
</script>

<svg bind:this={svg} {width} {height} viewBox={`0 0 ${width} ${height}`} style="max-width:100%;height:auto;border:1px solid #ddd"></svg>

<style>
	svg {
		display: block;
		margin: 0 auto;
	}
</style>
