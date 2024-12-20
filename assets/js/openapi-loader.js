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
}
