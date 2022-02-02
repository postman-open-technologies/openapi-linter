# spec-linter

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fpostman-open-technologies%2Fopenapi-linter%2Fmulticloud%2Fdeployments%2Fazure-functions%2Ftemplate.json)

An API for linting OpenAPI, AsyncAPI, and other JSON/YAML documents, built on top of [Spectral](https://github.com/stoplightio/spectral).

## Usage

There's a published [Postman Collection to use the OAS Linting API](https://postman.postman.co/workspace/OpenAPI-Linting~f8227475-4001-406c-b048-78ab9035ae1d/documentation/12959542-93cd90de-9f3c-4ed0-9c57-cc5a7712cf19) in a public workspace, allowing linting to be run manually during development, scheduled via a monitor, or baked in as part of a CI/CD pipeline.

To make an HTTP request, POST to `{{baseUrl}}/linter` with the document you wish to validate as the request body and a ruleset URL. See the Postman collection for an example.

Spectral config must be hosted at a URL. This API supports configuration in the following forms:

- JSON/YAML file
- Spectral JavaScript configuration (typically `.spectral.js`)
- Spectral TypeScript configuration (typically `.spectral.ts`)

## License

Apache/2
