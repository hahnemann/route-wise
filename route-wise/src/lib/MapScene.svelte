<script lang="ts">
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import { feature } from 'topojson-client';

	type Point = {
		lat: number;
		lon: number;
		name: string;
	};

	type Props = {
		points: Point[];
		width?: number;
		height?: number;
	};

	let { points, width = 900, height = 600 } = $props();

	let svg: SVGSVGElement | null = null;
	let mapData: GeoJSON.FeatureCollection<GeoJSON.Geometry> | null = null;

	onMount(async () => {
		// Load US TopoJSON data
		const us = await d3.json(
			'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'
		) as any;

		if (!us) return;

		// Convert TopoJSON to GeoJSON
		const states = feature(us, us.objects.states);

		// Create projection and path
		const projection = d3
			.geoAlbersUsa()
			.fitSize([width, height], states as any);
		const path = d3.geoPath().projection(projection);

		if (!svg) return;

		const g = d3.select(svg);

		// Draw states
		g.selectAll('path')
			.data((states as any).features)
			.enter()
			.append('path')
			.attr('d', path as any)
			.style('fill', '#e0e0e0')
			.style('stroke', '#999')
			.style('stroke-width', '0.5px');

		// Draw points (cities)
		g.selectAll('circle')
			.data(points)
			.enter()
			.append('circle')
			.attr('cx', (d) => {
				const coords = projection([d.lon, d.lat]);
				return coords ? coords[0] : 0;
			})
			.attr('cy', (d) => {
				const coords = projection([d.lon, d.lat]);
				return coords ? coords[1] : 0;
			})
			.attr('r', 8)
			.style('fill', '#e74c3c')
			.style('stroke', '#c0392b')
			.style('stroke-width', '2px')
			.style('opacity', 0.85);

		// Add labels for points
		g.selectAll('text')
			.data(points)
			.enter()
			.append('text')
			.attr('x', (d) => {
				const coords = projection([d.lon, d.lat]);
				return coords ? coords[0] : 0;
			})
			.attr('y', (d) => {
				const coords = projection([d.lon, d.lat]);
				return coords ? coords[1] - 15 : 0;
			})
			.attr('text-anchor', 'middle')
			.style('font-size', '12px')
			.style('font-weight', 'bold')
			.style('fill', '#333')
			.style('pointer-events', 'none')
			.text((d) => d.name);
	});
</script>

<svg bind:this={svg} {width} {height} style="border: 1px solid #ccc;"></svg>

<style>
	svg {
		display: block;
		margin: 0 auto;
	}
</style>
