<script lang="ts">
    import { onMount } from "svelte";
    import * as d3 from "d3";
    import type { CPP_RouteWise } from "../types";
    import StoryOpen from "./StoryOpen.svelte";
    import ScrollyCard from "./ScrollyCard.svelte";

    // let routes_cpp = data.routes_cpp;
    let routes_cpp: CPP_RouteWise[] = [];
    let graph = null;

    let isLoading = true;

    // Function to load the CSV
    async function loadCsv() {
        console.log("Attempting to load CSV...");
        try {
            const csv = await d3.csv("/awards_us_2026.csv");
            console.log("CSV loaded:", csv.length);
            routes_cpp = csv.map((d) => ({
                ORIGIN_AIRPORT_ABBREV: d["ORIGIN_AIRPORT_ABBREV"],
                DESTINATION_AIRPORT_ABBREV: d["DESTINATION_AIRPORT_ABBREV"],
                YCA_FARE: +d["YCA_FARE"],
            }));
        } catch (error) {
            console.error("CSV loading failed:", error);
        }
    }
    // async function loadCsv() {
    //     try {
    //         const csvUrl = "./awards_us_2026.csv";
    //         routes_cpp = await d3.csv(
    //             csvUrl,
    //             (row: Record<string, string | undefined>) => {
    //                 const yca_fare = row.YCA_FARE ? +row.YCA_FARE : 0;
    //                 return {
    //                     ORIGIN_AIRPORT_ABBREV:
    //                         row.ORIGIN_AIRPORT_ABBREV as string,
    //                     DESTINATION_AIRPORT_ABBREV:
    //                         row.DESTINATION_AIRPORT_ABBREV as string,
    //                     YCA_FARE: yca_fare,
    //                 } as CPP_RouteWise;
    //             },
    //         );
    //         console.log("Loaded CSV Data:", routes_cpp);
    //     } catch (error) {
    //         console.error("Error loading CSV:", error);
    //     } finally {
    //         isLoading = false;
    //     }
    // }
    onMount(async () => {
        await loadCsv();
        const res = await fetch("/graph_fixed.json");
        graph = await res.json();
        isLoading = false;
    });
    // onMount(loadCsv);
</script>

<div class="container" style="border: 1px solid lightgray;">
    <!-- <StoryOpen routeNum={routes_cpp.length} /> -->
    {#if isLoading}
        <p>Loading data…</p>
    {:else}
        <StoryOpen />
        <ScrollyCard {routes_cpp} {graph} />
    {/if}
    <!-- {#if !isLoading && routes_cpp.length > 0}
        <ScrollyCard routes={routes_cpp} />
    {:else}
        <p>Loading route data...</p>
    {/if} -->
</div>

<style>
    .container {
        width: 100%;
        margin: 10px auto;
        padding: 50px 50px 50px 50px; /* top, right, bottom, left */
        align-content: center;
        box-sizing: border-box;
    }
</style>
