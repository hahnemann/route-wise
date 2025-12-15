<script lang="ts">
    import { onMount } from "svelte";
    import * as d3 from "d3";
    import * as topojson from "topojson-client";

    type MapProps = {
        width?: number;
        height?: number;
        airports?: any[];
        selectedIata1?: string | null;
        selectedIata2?: string | null;
        selectedIata3?: string | null;
        meetingAirport?: string | null;
    };

    // Props, using Svelte 5 runes-style
    type Props = {
        width?: number;
        height?: number;
    };

    let {
        width = 900,
        height = 550,
        airports = [],
        selectedIata1 = null,
        selectedIata2 = null,
        selectedIata3 = null,
        meetingAirport = null
    }: MapProps = $props();
    // let { width = 900, height = 550 }: Props = $props();
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
    <!-- <svg {width} {height} style="border: 1px solid gray;"> -->
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
    {#each airports as ap}
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

    <!-- Highlight Airport 1 -->
    {#if selectedIata1}
        {#each airports.filter((a) => a.iata === selectedIata1) as ap}
            {#if projection([ap.lon, ap.lat])}
                <circle
                    cx={projection([ap.lon, ap.lat])[0]}
                    cy={projection([ap.lon, ap.lat])[1]}
                    r={8}
                    fill="orange"
                    stroke="white"
                    stroke-width="2"
                />
            {/if}
        {/each}
    {/if}

    <!-- Highlight Airport 2 -->
    {#if selectedIata2}
        {#each airports.filter((a) => a.iata === selectedIata2) as ap}
            {#if projection([ap.lon, ap.lat])}
                <circle
                    cx={projection([ap.lon, ap.lat])[0]}
                    cy={projection([ap.lon, ap.lat])[1]}
                    r={8}
                    fill="deepskyblue"
                    stroke="white"
                    stroke-width="2"
                />
            {/if}
        {/each}
    {/if}

    <!-- Highlight Airport 3 -->
    {#if selectedIata3}
        {#each airports.filter((a) => a.iata === selectedIata3) as ap}
            {#if projection([ap.lon, ap.lat])}
                <circle
                    cx={projection([ap.lon, ap.lat])[0]}
                    cy={projection([ap.lon, ap.lat])[1]}
                    r={8}
                    fill="limegreen"
                    stroke="white"
                    stroke-width="2"
                />
            {/if}
        {/each}
    {/if}

    {#if meetingAirport}
        {#each airports.filter(a => a.iata === meetingAirport) as ap}
            {#if projection([ap.lon, ap.lat])}
                <circle
                    cx={projection([ap.lon, ap.lat])[0]}
                    cy={projection([ap.lon, ap.lat])[1]}
                    r={10}
                    fill="gold"
                    stroke="black"
                    stroke-width="2.5"
                />
            {/if}
        {/each}
    {/if}

    {#if meetingAirport}
        {#each [selectedIata1, selectedIata2, selectedIata3] as origin}
            {#if origin}
                {#each airports.filter(a => a.iata === origin) as from}
                    {#each airports.filter(a => a.iata === meetingAirport) as to}
                        {#if projection([from.lon, from.lat]) && projection([to.lon, to.lat])}
                            <path
                                d={pathGen({
                                    type: "LineString",
                                    coordinates: [
                                        [from.lon, from.lat],
                                        [to.lon, to.lat]
                                    ]
                                } as any)}
                                stroke="steelblue"
                                stroke-width="2.5"
                                fill="none"
                                opacity="0.9"
                            />
                        {/if}
                    {/each}
                {/each}
            {/if}
        {/each}
    {/if}
</svg>

<!-- <svg {width} {height}>
    {#each states as state}
        <path
            d={pathGen(state)}
            fill="#dcdcdc"
            stroke="#ffffff"
            stroke-width="1"
        />
    {/each}
</svg> -->

<style>
    svg {
        display: block;
        margin: auto;
    }
</style>
