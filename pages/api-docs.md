---
layout: default
title: API Documentation
nav_order: 3
---

<link rel="stylesheet" href="{{ site.baseurl }}/assets/css/openapi.css" />

<div class="api-intro">
  <h1>API Documentation</h1>
  
  <div class="base-url-container">
    <strong>Base URL:</strong>
    <code>https://api.heypressto.ai/</code>
  </div>

  <div class="api-description">
    <h2>Overview</h2>
    <p>
      This API provides programmatic access to Pressto's capabilities. All endpoints 
      are REST-based and return responses in JSON format. Authentication is required 
      for most endpoints using an API key in the request headers.
    </p>

    <h3>Authentication</h3>
    <p>
      Include your API key in the request headers:
      <pre><code>Authorization: Bearer pressto_YOUR_API_KEY</code></pre>
      You can get your API key from the developer tab of your Pressto profile page. All keys are scoped to a specific Pressto account and begin with `pressto_`.
    </p>

  </div>
</div>

<div id="api-container">Loading API documentation...</div>

<script src="{{ site.baseurl }}/assets/js/openapi-loader.js"></script>
<script>
  document.addEventListener("DOMContentLoaded", () => {
    const viewer = new OpenAPIViewer(
      "api-container",
      "https://api.heypressto.ai/api-docs"
    );
    viewer.load();
  });
</script>
