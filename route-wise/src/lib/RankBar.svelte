<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";
    import * as d3 from "d3";

    type MeetingRoute = {
        meeting_airport: string;
        total_cost: number;
        path1?: string;
        cost1?: number;
        path2?: string;
        cost2?: number;
    };

    type Props = {
        routes: MeetingRoute[];
        width?: number;
        height?: number;
        originIatas?: string[];
    };

    let {
        routes,
        width = 700,
        height = 500,
        originIatas = [],
    }: Props = $props();
    let hovered: string | null = $state(null);
    const dispatch = createEventDispatcher<{
        hover: { iata: string | null };
    }>();

    const margin = { top: 20, right: 20, bottom: 80, left: 20 };
    const usableWidth = $derived(width - margin.left - margin.right);
    const usableHeight = $derived(height - margin.top - margin.bottom);

    const sortedRoutes = $derived(
        [...routes].sort((a, b) => a.total_cost - b.total_cost),
    );

    const xScale = $derived(
        d3
            .scaleBand()
            .domain(sortedRoutes.map((d) => d.meeting_airport))
            .range([0, usableWidth])
            .padding(0.12),
    );

    const yScale = $derived(
        d3
            .scaleLinear()
            .domain([0, d3.max(sortedRoutes, (d) => d.total_cost) || 0])
            .range([usableHeight, 0]),
    );

    const fmt = d3.format("$,.0f");
</script>

{#if sortedRoutes.length > 0}
    <svg {width} {height}>
        <g transform={`translate(${margin.left},${margin.top})`}>
            {#each sortedRoutes as route (route.meeting_airport)}
                {#if xScale}
                    <g
                        transform={`translate(${xScale(route.meeting_airport)}, 0)`}
                        in:fade={{ duration: 200 }}
                        out:fade={{ duration: 150 }}
                    >
                        <rect
                            x={0}
                            y={yScale(route.total_cost)}
                            height={usableHeight - yScale(route.total_cost)}
                            width={xScale.bandwidth()}
                            rx="4"
                            role="button"
                            tabindex="0"
                            style={`
                            fill: ${hovered === route.meeting_airport ? "#ff6b35" : "#4f46e5"};
                            opacity: ${hovered === route.meeting_airport ? "1" : "0.8"};
                            cursor: pointer;
                            transition: fill 0.2s ease, opacity 0.2s ease;
                            `}
                            onmouseover={() => {
                                hovered = route.meeting_airport;
                                // eslint-disable-next-line no-console
                                console.log("Hover state set to:", hovered);
                                dispatch("hover", {
                                    iata: route.meeting_airport,
                                });
                            }}
                            onfocus={() => {
                                hovered = route.meeting_airport;
                                dispatch("hover", {
                                    iata: route.meeting_airport,
                                });
                            }}
                            onmouseout={() => {
                                hovered = null;
                                // eslint-disable-next-line no-console
                                console.log("Hover state cleared");
                                dispatch("hover", { iata: null });
                            }}
                            onblur={() => {
                                hovered = null;
                                dispatch("hover", { iata: null });
                            }}
                        />
                        <text
                            x={xScale.bandwidth() / 2}
                            y={usableHeight + 12}
                            text-anchor="middle"
                            font-size="12"
                            fill="#111"
                        >
                            {route.meeting_airport}
                        </text>
                        <text
                            x={xScale.bandwidth() / 2}
                            y={yScale(route.total_cost) - 6}
                            text-anchor="middle"
                            dominant-baseline="middle"
                            font-size="12"
                            fill="#111"
                        >
                            {fmt(route.total_cost)}
                        </text>
                    </g>
                {/if}
            {/each}
        </g>
    </svg>
{/if}

{#if sortedRoutes.length === 0}
    <p>No routes to display.</p>
{/if}

<style>
    svg {
        display: block;
        max-width: 100%;
    }
</style>
