<script lang="ts">
    import { Scrolly } from "$lib";
    import { slide, fly } from "svelte/transition";

    type Props = {
        routeNum: number;
    };
    let { routeNum }: Props = $props();

    let progress: number = $state(0);
</script>

<Scrolly bind:progress --scrolly-story-width="0">
    <div id="virtual"></div>
    <div slot="viz" class="header" style="border: 1px solid blue;">
        <h1>RouteWise</h1>
        <h2>Visualizing Inefficient Federal Travel Spending</h2>
    </div>
</Scrolly>

<style>
    .header {
        height: 60vh;
        width: 100%;
        text-align: center;
    }
    #virtual {
        height: 60vh; /* Make the page scrollable with a 150% view height */
    }
    h1 {
        font-size: 10vh;
        color: #36454f;
        font-weight: 600; /* Slightly bolder font weight */
    }
</style>
