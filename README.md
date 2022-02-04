# spec-linter

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fpostman-open-technologies%2Fopenapi-linter%2Fmain%2Fdeployments%2Fazure-functions%2Ftemplate.json)

[Deploy to AWS](https://us-east-2.console.aws.amazon.com/cloudformation/home?region=us-east-2#/stacks/create/template?stackName=spec-linter-api&templateURL=https://public-spec-linter-api.s3.us-east-2.amazonaws.com/template.json)

An API for linting OpenAPI, AsyncAPI, and other JSON/YAML documents, built on top of [Spectral](https://github.com/stoplightio/spectral).

## 🛠 Usage

See the published [Postman Collection](https://postman.postman.co/workspace/OpenAPI-Linting~f8227475-4001-406c-b048-78ab9035ae1d/documentation/12959542-93cd90de-9f3c-4ed0-9c57-cc5a7712cf19) for more information on interacting with the spec-linter API.

Spectral config must be hosted at a URL. This API supports configuration in the following forms:

- JSON/YAML file
- Spectral JavaScript configuration (alpha, typically `.spectral.js`)
- Spectral TypeScript configuration (alpha, typically `.spectral.ts`)

## 🙏 Thanks

This project wouldn't be possible without the efforts of [Stoplight](https://stoplight.io/open-source/spectral/) and the [Spectral contributors](https://github.com/stoplightio/spectral/graphs/contributors).

## 📄 License

Apache-2.0
