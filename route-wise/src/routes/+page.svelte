<script lang="ts">
    import { onMount } from "svelte";
    import * as d3 from "d3";
    import type { CPP_RouteWise } from "../types";

    let routes_cpp: CPP_RouteWise[] = [];

    // Function to load the CSV
    async function loadCsv() {
        try {
            const csvUrl = "./awards_us_2026.csv";
            routes_cpp = await d3.csv(csvUrl, (row: Record<string, string | undefined>) => {
                const yca_fare = row.YCA_FARE ? +row.YCA_FARE : 0;
                return {
                    ORIGIN_AIRPORT_ABBREV: row.ORIGIN_AIRPORT_ABBREV as string,
                    DESTINATION_AIRPORT_ABBREV:
                        row.DESTINATION_AIRPORT_ABBREV as string,
                    YCA_FARE: yca_fare,
                } as CPP_RouteWise;
            });
            console.log("Loaded CSV Data:", routes_cpp);
        } catch (error) {
            console.error("Error loading CSV:", error);
        }
    }
    onMount(loadCsv);
</script>

<div class="container"></div>

<style>
    .container {
        width: 80vw;
        margin: 10px auto;
        padding: 10px;
        align-content: center;
    }
</style>
