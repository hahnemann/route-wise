<script lang="ts">
    import type { CPP_RouteWise } from "../types";
    type Props = {
        routes: CPP_RouteWise[];
    };
    let { routes }: Props = $props();

    import { Scrolly } from "$lib";
    import * as d3 from "d3";
    import { get } from "svelte/store";

    let myProgress = $state(0);
    // reactive variable for tracking the progress of the scrollytelling
</script>

<h2>From Data Chaos to Strategic Decisions</h2>
<!-- <p>
    First, we demonstrate how to use the Scrolly element to update the genre
    distribution based on year, which is estimated based on the scrolly y
    position of the left text panel
</p> -->

<Scrolly bind:progress={myProgress}>
    <div class="card-stack">
        <div class="card">
            <h3>Scene 1: The Problem</h3>
            <p>
                The federal government's travel system involves a vast number of
                potential destinations and millions in spending, but the sheer
                volume of options is difficult to evaluate because agencies
                <a
                    href="https://www.gao.gov/assets/gao-16-657.pdf#page=2.23"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    lack common metrics
                </a>
                and consistent reporting practices for travel costs.
            </p>
            <p class="progress-indicator">Progress: {myProgress.toFixed(1)}%</p>
        </div>

        <div class="card">
            <h3>Scene 2: Thousands of Travel Choices</h3>
            <p>
                The government's City Pair Program (CPP) currently offers over
                11,000 different routes. As we scroll, the visualization begins
                to filter this
                <a
                    href="https://www.gsa.gov/travel/plan-a-trip/transportation-airfare-rates-pov-rates-etc/airfare-rates-city-pair-program"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    massive number of destinations
                </a>
                to isolate the most affordable options for a potential meeting spot.
                <!-- As we scroll down to this card, the visualization should update
                (e.g., when myProgress > 30). We will filter the data to only
                show routes where the average fare is below a certain threshold. -->
            </p>
            <p class="progress-indicator">Progress: {myProgress.toFixed(1)}%</p>
        </div>

        <div class="card">
            <h3>Scene 3: Choosing the Meeting Spot</h3>
            <p></p>
            <p>
                Travel decisions are universally constrained by two critical
                factors: cost and time. These two dictate the specific
                performance metrics—like average fare and total journey
                time—that we must visualize to identify the single, optimal
                route for a group of people to meet.
                <!-- When this final card is in view (e.g., myProgress > 70), the
                visualization focuses on the remaining destinations, simulating
                the decision process for the two travelers to find a common,
                affordable meeting spot. -->
            </p>
            <p class="progress-indicator">Progress: {myProgress.toFixed(1)}%</p>
        </div>

        <div class="card">
            <h3>Scene 4: The Solution</h3>
            <p>
                When we consider cost and time as weights on the connections
                (edges) between cities (nodes) as a graph, this problem becomes
                a classic shortest path challenge. We can use
                <a
                    href="https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Dijkstra's algorithm
                </a>
                to mathematically solve this network problem and find the most efficient
                route.
            </p>
            <p class="progress-indicator">Progress: {myProgress.toFixed(1)}%</p>
        </div>

        <div class="card">
            <h3>Scene 5: What is Optimal?</h3>
            <p>
                An optimal solution is not just the cheapest or fastest route,
                but the one that provides the best balance between those two
                conflicting metrics, often determined by a weighted combination
                of cost and time based on the traveler's priorities. For now we
                are only considering cost.
            </p>
            <p class="progress-indicator">Progress: {myProgress.toFixed(1)}%</p>
        </div>

        <div class="card">
            <h3>Scene 6: Solving with Python</h3>
            <p>
                To provide a definitive answer to the travel problem, we will
                integrate a back-end solver This final step involves connecting
                the Svelte visualization to Python code designed to execute the
                Dijkstra algorithm and identify the single, optimal route,
                fulfilling the goal of making the data usable.
            </p>
            <p class="progress-indicator">Progress: {myProgress.toFixed(1)}%</p>
        </div>

        <div class="card">
            <h3>Scene 7: The Optimal Meeting Place</h3>
            <p>
                The final step visualizes the optimal meeting destination on a
                map, showing the best balance of cost. Factors like time and
                pollution will be considered as we work out a final story. This
                conclusive display mirrors complex
                <a
                    href="https://vega.github.io/vega/tutorials/airports/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    airport network analysis
                </a>, though details on total travel time and cost metrics are
                still being finalized for display.
            </p>
            <p class="progress-indicator">Progress: {myProgress.toFixed(1)}%</p>
        </div>
    </div>

    <div slot="viz" class="viz-panel">
        <div class="viz-content">
            <p>Visualization updates based on progress...</p>
            <p>Current Progress: **{myProgress.toFixed(1)}%**</p>

            {#if myProgress < 14.29}
                <p>Showing **Scene 1** logic (The Problem).</p>
            {:else if myProgress < 28.57}
                <p>Showing **Scene 2** logic (Thousands of Travel Choices).</p>
            {:else if myProgress < 42.86}
                <p>Showing **Scene 3** logic (Choosing the Meeting Spot).</p>
            {:else if myProgress < 57.14}
                <p>Showing **Scene 4** logic (The Solution).</p>
            {:else if myProgress < 71.43}
                <p>Showing **Scene 5** logic (What is Optimal?).</p>
            {:else if myProgress < 85.71}
                <p>Showing **Scene 6** logic (Solving with Python).</p>
            {:else}
                <p>Showing **Scene 7** logic (The Optimal Meeting Place).</p>
            {/if}
        </div>
    </div>
</Scrolly>

<style>
    .card-stack {
        /* This container ensures the cards are the main scrollable content */
        max-width: 400px; /* Optional: Constrain width for better readability */
    }
    .card {
        /* Add vertical padding to each card to force scrolling */
        padding: 400px 0;
        text-align: left;
    }
    .card:first-child {
        /* Reduce padding on the top card to prevent a huge initial gap */
        padding-top: 150px;
    }
    .card:last-child {
        /* Reduce padding on the bottom card to prevent excessive final scroll */
        padding-bottom: 150px;
    }
    h3 {
        font-size: 1.5em;
        margin-bottom: 10px;
        color: #433417;
    }
    .progress-indicator {
        font-size: 0.9em;
        color: #999;
        margin-top: 20px;
    }
    .viz-panel {
        /* Ensure the visualization panel takes up vertical space within its sticky container */
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        background-color: #f7f7f7; /* Light background for the viz area */
        border: 1px solid #ddd;
        padding: 20px;
        box-sizing: border-box;
    }
</style>
