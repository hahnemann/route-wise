<script lang="ts">
    import { onMount } from "svelte";
    import * as d3 from "d3";
    import * as topojson from "topojson-client";

    type MapProps = {
        width?: number;
        height?: number;
        pythonAirports?: any[];
        airports?: any[];
        animationStep?: number;
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
        animationStep = 0,
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

    {#if animationStep > 0}
        {#key animationStep}
            {#each animationStep === 1 ? pythonAirports : airports as ap}
                {#if projection([ap.lon, ap.lat])}
                    {@const isHub =
                        ["DTW", "PHX", "LAS"].includes(ap.iata) &&
                        animationStep >= 3}
                    {@const isMCI = ap.iata === "MCI" && animationStep >= 4}
                    {@const isSEA = ap.iata === "SEA" && animationStep === 5}
                    {@const isFocus = isHub || isMCI || isSEA}
                    <circle
                        cx={projection([ap.lon, ap.lat])[0]}
                        cy={projection([ap.lon, ap.lat])[1]}
                        r={isFocus ? 8 : 3}
                        fill={isSEA
                            ? "red"
                            : isMCI
                              ? "red"
                              : isHub
                                ? ap.iata === "DTW"
                                    ? "orange"
                                    : ap.iata === "PHX"
                                      ? "deepskyblue"
                                      : "limegreen"
                                : "#666"}
                        stroke={isFocus ? "white" : "none"}
                        stroke-width={isFocus ? 2 : 0}
                        opacity={isFocus ? 1 : 0.6}
                        in:fade={{ duration: 800 }}
                    />
                {/if}
            {/each}
        {/key}
    {/if}

    {#if animationStep === 5}
        {#each airports.filter((ap) => ap.iata === "MCI") as mci}
            {@const pos = projection([mci.lon, mci.lat])}
            {#if pos}
                <g in:fade={{ duration: 800 }}>
                    <line
                        x1={pos[0] - 8}
                        y1={pos[1] - 8}
                        x2={pos[0] + 8}
                        y2={pos[1] + 8}
                        stroke="black"
                        stroke-width="3"
                    />
                    <line
                        x1={pos[0] + 8}
                        y1={pos[1] - 8}
                        x2={pos[0] - 8}
                        y2={pos[1] + 8}
                        stroke="black"
                        stroke-width="3"
                    />
                </g>
            {/if}
        {/each}
    {/if}
</svg>

<style>
    svg {
        display: block;
        margin: auto;
    }
</style>
