---
layout: default
title: API Documentation
---

<link rel="stylesheet" href="{{ site.baseurl }}/assets/css/openapi.css" />

<div class="api-intro">
  <h1>API Documentation</h1>
  
  <div class="base-url-container">
    <strong>Base URL:</strong>
    <code>https://api.yaarn.ai/</code>
  </div>

  <div class="api-description">
    <h2>Overview</h2>
    <p>
      This API provides programmatic access to Yaarn's capabilities. All endpoints 
      are REST-based and return responses in JSON format. Authentication is required 
      for most endpoints using an API key in the request headers.
    </p>

    <h3>Authentication</h3>
    <p>
      Include your API key in the request headers:
      <pre><code>Authorization: Bearer yaarn_YOUR_API_KEY</code></pre>
      You can get your API key from the developer tab of your Yaarn profile page. All keys are scoped to a specific Yaarn account and begin with `yaarn_`.
    </p>

  </div>
</div>

<div id="api-container">Loading API documentation...</div>

<script src="{{ site.baseurl }}/assets/js/openapi-loader.js"></script>
<script>
  document.addEventListener("DOMContentLoaded", () => {
    const viewer = new OpenAPIViewer(
      "api-container",
      "https://api.yaarn.ai/api-docs"
    );
    viewer.load();
  });
</script>
