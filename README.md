# openapi-linter

An API for linting OpenAPI and other JSON/YAML documents, built on top of [Spectral](https://github.com/stoplightio/spectral).

## Usage

There's a published [Postman Collection to use the OAS Linting API](https://postman.postman.co/workspace/OpenAPI-Linting~f8227475-4001-406c-b048-78ab9035ae1d/documentation/12959542-93cd90de-9f3c-4ed0-9c57-cc5a7712cf19) in a public workspace, allowing linting to be run manually during development, scheduled via a monitor, or baked in as part of a CI/CD pipeline.

To make an HTTP request, POST to `{{baseUrl}}/lint/openapi` with the document you wish to validate as the rquest body and a ruleset URL. See the Postman collection for an example.

## License

Apache/2
