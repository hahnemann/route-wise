<script lang="ts">
    import { onMount } from "svelte";
    import * as d3 from "d3";
    import * as topojson from "topojson-client";

    type MapProps = {
        width?: number;
        height?: number;
        pythonAirports?: any[];
        airports?: any[];
    };

    // Props, using Svelte 5 runes-style
    type Props = {
        width?: number;
        height?: number;
    };

    let {
        width = 900,
        height = 550,
        pythonAirports = [],
        airports = [],
    }: MapProps = $props();
    let states = $state<any[]>([]);

    const projection = d3
        .geoAlbersUsa()
        .scale(1000)
        .translate([width / 2, height / 2]);

    const pathGen = d3.geoPath(projection);

    onMount(async () => {
        const us: any = await d3.json(
            "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json",
        );
        const geojson: any = topojson.feature(us, us.objects.states);
        states = geojson.features || [];
    });
</script>

<svg {width} {height}>
    <!-- Base map -->
    {#each states as state}
        <path
            d={pathGen(state)}
            fill="#dcdcdc"
            stroke="#ffffff"
            stroke-width="1"
        />
    {/each}

    <!-- All airports as small gray dots -->
    {#each pythonAirports as ap}
        {#if projection([ap.lon, ap.lat])}
            <circle
                cx={projection([ap.lon, ap.lat])[0]}
                cy={projection([ap.lon, ap.lat])[1]}
                r={3}
                fill="#666"
                opacity="0.6"
            />
        {/if}
    {/each}
</svg>

<style>
    svg {
        display: block;
        margin: auto;
    }
</style>
