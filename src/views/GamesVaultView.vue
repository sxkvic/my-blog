<script setup lang="ts">
import GamesVaultPage from '../components/blog/GamesVaultPage.vue';
import { gameAccounts, siteData } from '../data/blog';
</script>

<template>
  <GamesVaultPage :site-name="siteData.name" :records="gameAccounts" />
</template>
