build-router:
	$(MAKE) HANDLER=src/router.ts build-lambda-common

build-lambda-common:
	npm install
	rm -rf dist
	echo "{\"extends\": \"./tsconfig.json\", \"include\": [\"${HANDLER}\"] }" > tsconfig-only-handler.json
	npm run build -- --build tsconfig-only-handler.json
	cp -r dist "$(ARTIFACTS_DIR)/"
	$(MAKE) build-dependencies

build-dependencies:
	cp package.json package-lock.json "$(ARTIFACTS_DIR)"
	npm install --production --prefix "$(ARTIFACTS_DIR)"
	rm "$(ARTIFACTS_DIR)/package.json"

.PHONY: build-lambda-common build-dependencies build-router