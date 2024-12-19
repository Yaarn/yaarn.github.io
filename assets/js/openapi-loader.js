class OpenAPIViewer {
  constructor(elementId, specUrl) {
    this.container = document.getElementById(elementId);
    this.specUrl = specUrl;
  }

  async load() {
    try {
      this.container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            Loading API documentation...
        </div>
      `;
      const response = await fetch(this.specUrl);
      const spec = await response.json();
      this.render(spec);
    } catch (error) {
      this.container.innerHTML = `<div class="error">Failed to load API specification: ${error.message}</div>`;
    }
  }

  render(spec) {
    // Basic rendering of the OpenAPI spec
    let html = `
            <div class="api-docs">
                <h1>${spec.info.title || "API Documentation"}</h1>
                <p>${spec.info.description || ""}</p>
                
                <h2>Endpoints</h2>
        `;

    // Render each path and its methods
    for (const [path, pathItem] of Object.entries(spec.paths)) {
      html += `
                <div class="endpoint">
                    <h3>${path}</h3>
            `;

      for (const [method, operation] of Object.entries(pathItem)) {
        html += `
                    <div class="method ${method}">
                        <h4>${method.toUpperCase()}</h4>
                        <p>${operation.summary || ""}</p>
                        ${
                          operation.description
                            ? `<p>${operation.description}</p>`
                            : ""
                        }
                        
                        ${this.renderParameters(operation)}
                        ${this.renderRequestBody(operation)}
                        ${this.renderResponses(operation)}
                        ${this.renderExample(path, method, operation)}
                    </div>
                `;
      }

      html += `</div>`;
    }

    html += `</div>`;
    this.container.innerHTML = html;
  }

  renderParameters(operation) {
    if (!operation.parameters || operation.parameters.length === 0) {
      return "";
    }

    let html = `<div class="parameters">
                  <h5>Parameters</h5>
                  <ul>`;

    for (const param of operation.parameters) {
      html += `
        <li>
          <strong>${param.name}</strong> (${param.in})
          ${param.required ? '<span class="required">*required</span>' : ""}
          <br/>
          ${param.description || ""}
          ${param.schema ? `<br/>Type: ${param.schema.type}` : ""}
        </li>`;
    }

    html += `</ul></div>`;
    return html;
  }

  renderRequestBody(operation) {
    if (!operation.requestBody) {
      return "";
    }

    const content = operation.requestBody.content;
    let html = `<div class="request-body">
                  <h5>Request Body</h5>`;

    for (const [mediaType, mediaTypeObject] of Object.entries(content)) {
      html += `
        <div class="content-type">
          <strong>${mediaType}</strong>
          ${this.renderSchema(mediaTypeObject.schema)}
        </div>`;
    }

    html += `</div>`;
    return html;
  }

  renderResponses(operation) {
    if (!operation.responses) {
      return "";
    }

    let html = `<div class="responses">
                  <h5>Responses</h5>`;

    for (const [code, response] of Object.entries(operation.responses)) {
      html += `
        <div class="response">
          <strong>${code}</strong>: ${response.description || ""}
          ${
            response.content ? this.renderResponseContent(response.content) : ""
          }
        </div>`;
    }

    html += `</div>`;
    return html;
  }

  renderResponseContent(content) {
    let html = "";
    for (const [mediaType, mediaTypeObject] of Object.entries(content)) {
      html += `
        <div class="content-type">
          <strong>${mediaType}</strong>
          ${this.renderSchema(mediaTypeObject.schema)}
        </div>`;
    }
    return html;
  }

  renderSchema(schema) {
    if (!schema) return "";

    let html = '<div class="schema">';

    // Handle object type
    if (schema.type === "object" && schema.properties) {
      html += "<ul>";
      for (const [prop, details] of Object.entries(schema.properties)) {
        html += `
          <li>
            <strong>${prop}</strong>: ${details.type}
            ${details.description ? `<br/>${details.description}` : ""}
            ${
              details.type === "object" && details.properties
                ? this.renderSchema(details)
                : ""
            }
            ${
              details.type === "array" && details.items
                ? `<br/>Items: ${this.renderSchema(details.items)}`
                : ""
            }
            ${details.enum ? `<br/>Enum: [${details.enum.join(", ")}]` : ""}
            ${details.format ? `<br/>Format: ${details.format}` : ""}
            ${details.pattern ? `<br/>Pattern: ${details.pattern}` : ""}
            ${
              details.minimum !== undefined
                ? `<br/>Minimum: ${details.minimum}`
                : ""
            }
            ${
              details.maximum !== undefined
                ? `<br/>Maximum: ${details.maximum}`
                : ""
            }
          </li>`;
      }
      html += "</ul>";
    }
    // Handle array type
    else if (schema.type === "array" && schema.items) {
      html += `Array of ${schema.items.type}`;
      if (schema.items.type === "object" || schema.items.properties) {
        html += this.renderSchema(schema.items);
      }
    }
    // Handle primitive types with additional properties
    else {
      html += `${schema.type}`;
      if (schema.enum) {
        html += `<br/>Enum: [${schema.enum.join(", ")}]`;
      }
      if (schema.format) {
        html += `<br/>Format: ${schema.format}`;
      }
      if (schema.pattern) {
        html += `<br/>Pattern: ${schema.pattern}`;
      }
      if (schema.minimum !== undefined) {
        html += `<br/>Minimum: ${schema.minimum}`;
      }
      if (schema.maximum !== undefined) {
        html += `<br/>Maximum: ${schema.maximum}`;
      }
    }

    html += "</div>";
    return html;
  }

  addSearch() {
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search endpoints...";
    searchInput.addEventListener("input", (e) => {
      const value = e.target.value.toLowerCase();
      document.querySelectorAll(".endpoint").forEach((endpoint) => {
        const text = endpoint.textContent.toLowerCase();
        endpoint.style.display = text.includes(value) ? "block" : "none";
      });
    });
    this.container.insertBefore(searchInput, this.container.firstChild);
  }

  renderExample(path, method, operation) {
    let curlExample = `curl -X ${method.toUpperCase()} '${this.getBaseUrl()}${this.formatPath(
      path,
      operation
    )}'`;

    // Add headers
    const headers = this.getExampleHeaders(operation);
    if (headers.length > 0) {
      curlExample += headers.map((header) => `\n  -H '${header}'`).join("");
    }

    // Add request body if needed
    const requestBody = this.getExampleRequestBody(operation);
    if (requestBody) {
      curlExample += `\n  -d '${JSON.stringify(requestBody, null, 2)}'`;
    }

    return `
      <div class="example">
        <h5>Example Request</h5>
        <pre style="white-space: pre-wrap; word-wrap: break-word;"><code style="word-break: break-all;">${curlExample}</code></pre>
      </div>
    `;
  }

  getBaseUrl() {
    // Try to get the server URL from the OpenAPI spec, otherwise use a placeholder
    return this.spec?.servers?.[0]?.url || "https://api.yaarn.ai/public";
  }

  formatPath(path, operation) {
    // Replace path parameters with example values
    let formattedPath = path;
    if (operation.parameters) {
      const pathParams = operation.parameters.filter((p) => p.in === "path");
      pathParams.forEach((param) => {
        const example = this.getParameterExample(param);
        formattedPath = formattedPath.replace(`{${param.name}}`, example);
      });
    }

    // Add query parameters if any
    if (operation.parameters) {
      const queryParams = operation.parameters.filter((p) => p.in === "query");
      if (queryParams.length > 0) {
        formattedPath +=
          "?" +
          queryParams
            .map((param) => `${param.name}=${this.getParameterExample(param)}`)
            .join("&");
      }
    }

    return formattedPath;
  }

  getParameterExample(param) {
    if (param.example !== undefined) return param.example;
    if (param.schema?.example !== undefined) return param.schema.example;

    // Generate example based on type
    switch (param.schema?.type) {
      case "string":
        return param.schema.enum ? param.schema.enum[0] : "string";
      case "integer":
        return "1";
      case "number":
        return "1.0";
      case "boolean":
        return "true";
      default:
        return "example";
    }
  }

  getExampleHeaders(operation) {
    const headers = [];

    // Add Content-Type if there's a request body
    if (operation.requestBody?.content) {
      const contentType = Object.keys(operation.requestBody.content)[0];
      headers.push(`Content-Type: ${contentType}`);
    }

    // Add header parameters
    if (operation.parameters) {
      const headerParams = operation.parameters.filter(
        (p) => p.in === "header"
      );
      headerParams.forEach((param) => {
        headers.push(`${param.name}: ${this.getParameterExample(param)}`);
      });
    }

    return headers;
  }

  getExampleRequestBody(operation) {
    if (!operation.requestBody?.content) return null;

    const contentType = Object.keys(operation.requestBody.content)[0];
    const schema = operation.requestBody.content[contentType].schema;

    return this.generateExampleFromSchema(schema);
  }

  generateExampleFromSchema(schema) {
    if (!schema) return null;

    // Use example if provided
    if (schema.example) return schema.example;

    // Generate based on type
    switch (schema.type) {
      case "object":
        if (!schema.properties) return {};
        const obj = {};
        for (const [prop, propSchema] of Object.entries(schema.properties)) {
          obj[prop] = this.generateExampleFromSchema(propSchema);
        }
        return obj;

      case "array":
        if (!schema.items) return [];
        return [this.generateExampleFromSchema(schema.items)];

      case "string":
        return schema.enum ? schema.enum[0] : "string";

      case "integer":
        return 1;

      case "number":
        return 1.0;

      case "boolean":
        return true;

      default:
        return null;
    }
  }
}
