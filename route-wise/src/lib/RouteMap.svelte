<script lang="ts">
    import * as d3 from "d3";
    import { onMount } from "svelte";

    // ---- Types ----
    export type Airport = {
        code: string;
        name: string;
        lat: number;
        lon: number;
    };

    // A single traveler path: list of airport codes in order
    export type TravelerPath = {
        travelerId: string;
        airports: string[];   // e.g., ["MSP", "ORD", "DCA"]
        totalCost: number;
    };

    export let airports: Airport[] = [];
    export let paths: TravelerPath[] = [];
    export let meetingAirportCode: string | null = null;
    export let homeAirportCodes: string[] = [];

    // ---- Internal state ----
    let countries: any[] = [];   // GeoJSON features for base map

    const width = 960;
    const height = 500;

    // US-focused projection (from lecture: Albers Equal-Area / AlbersUsa)
    const projection = d3
        .geoAlbersUsa()
        .scale(1200)
        .translate([width / 2, height / 2]);

    const pathGen = d3.geoPath(projection);

    // Load base GeoJSON in onMount (similar to lecture)
    onMount(async () => {
        const geo: any = await d3.json(
            "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
        );
        countries = geo.features;
    });

    // Convenience lookup
    const airportByCode = new Map<string, Airport>();
    $: {
        airportByCode.clear();
        for (const a of airports) airportByCode.set(a.code, a);
    }

    // Project an airport to SVG coordinates (or null if out of projection)
    function projectAirport(code: string) {
        const a = airportByCode.get(code);
        if (!a) return null;
        const projected = projection([a.lon, a.lat]);
        if (!projected) return null;
        return { x: projected[0], y: projected[1], airport: a };
    }

    // Derived: projected homes and meeting
    $: projectedHomes = homeAirportCodes
        .map(projectAirport)
        .filter(Boolean) as { x: number; y: number; airport: Airport }[];

    $: projectedMeeting = meetingAirportCode
        ? projectAirport(meetingAirportCode)
        : null;

    // Build SVG path data for each traveler route (LineString)
    $: pathGeoms = paths.map((p) => {
        const coords = p.airports
            .map((code) => {
                const a = airportByCode.get(code);
                if (!a) return null;
                return [a.lon, a.lat] as [number, number];
            })
            .filter(Boolean) as [number, number][];

        const geoLine: GeoJSON.LineString = {
            type: "LineString",
            coordinates: coords
        };

        return {
            travelerId: p.travelerId,
            totalCost: p.totalCost,
            d: pathGen(geoLine) // SVG path string
        };
    });
</script>

<svg {width} {height} role="img" aria-label="RouteWise optimal meeting map">
    <!-- Base map -->
    {#each countries as country}
        <path d={pathGen(country)} fill="#e3e8f0" stroke="#ffffff" stroke-width="0.5" />
    {/each}

    <!-- Traveler paths -->
    {#each pathGeoms as p, i}
        {#if p.d}
            <path
                d={p.d}
                fill="none"
                stroke="steelblue"
                stroke-width="2"
                stroke-opacity="0.8"
            />
        {/if}
    {/each}

    <!-- Home airports -->
    {#each projectedHomes as h}
        <circle
            cx={h.x}
            cy={h.y}
            r={5}
            fill="#2563eb"
            stroke="#ffffff"
            stroke-width="1"
        >
            <title>{h.airport.code} – {h.airport.name}</title>
        </circle>
    {/each}

    <!-- Meeting airport -->
    {#if projectedMeeting}
        <circle
            cx={projectedMeeting.x}
            cy={projectedMeeting.y}
            r={7}
            fill="#ea580c"
            stroke="#ffffff"
            stroke-width="2"
        >
            <title>
                Meeting: {projectedMeeting.airport.code} – {projectedMeeting.airport.name}
            </title>
        </circle>
    {/if}
</svg>

<style>
    svg {
        border-radius: 8px;
        box-shadow: 0 4px 12px rgb(15 23 42 / 0.2);
        background-color: #f8fafc;
    }
</style>
