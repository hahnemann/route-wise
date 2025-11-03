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

<h2>Story Starts Here</h2>
<!-- <p>
    First, we demonstrate how to use the Scrolly element to update the genre
    distribution based on year, which is estimated based on the scrolly y
    position of the left text panel
</p> -->

<Scrolly bind:progress={myProgress}>
    <div class="card-stack">
        <div class="card">
            <h3>Scene 1: The Full Picture</h3>
            <p>
                This card represents the beginning of the journey. When this is
                visible (e.g., myProgress is low), the visualization should show
                all {routes.length} available routes, highlighting the sheer volume
                of options.
            </p>
            <p class="progress-indicator">Progress: {myProgress.toFixed(1)}%</p>
        </div>

        <div class="card">
            <h3>Scene 2: Filtering by Price</h3>
            <p>
                As we scroll down to this card, the visualization should update
                (e.g., when myProgress > 30). We will filter the data to only
                show routes where the average fare is below a certain threshold.
            </p>
            <p class="progress-indicator">Progress: {myProgress.toFixed(1)}%</p>
        </div>

        <div class="card">
            <h3>Scene 3: Choosing the Meeting Spot</h3>
            <p>
                When this final card is in view (e.g., myProgress > 70), the
                visualization focuses on the remaining destinations, simulating
                the decision process for the two travelers to find a common,
                affordable meeting spot.
            </p>
            <p class="progress-indicator">Progress: {myProgress.toFixed(1)}%</p>
        </div>
    </div>

    <div slot="viz" class="viz-panel">
        <div class="viz-content">
            <p>Visualization updates based on progress...</p>
            <p>Current Progress: **{myProgress.toFixed(1)}%**</p>
            {#if myProgress < 30}
                <p>Showing **Scene 1** logic.</p>
            {:else if myProgress < 70}
                <p>Showing **Scene 2** logic (Filter active).</p>
            {:else}
                <p>Showing **Scene 3** logic (Final selection).</p>
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
