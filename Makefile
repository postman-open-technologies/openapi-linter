build-router:
	$(MAKE) HANDLER=src/router.ts build-lambda-common

build-lambda-common: build-dependencies
	npm install
	rm -rf dist
	echo "{\"extends\": \"./tsconfig.json\", \"include\": [\"${HANDLER}\"] }" > tsconfig-only-handler.json
	npm run build -- --build tsconfig-only-handler.json
	cp -r dist "$(ARTIFACTS_DIR)/"

build-dependencies:
	[[ ! -d "$(ARTIFACTS_DIR)/nodejs" ]] && mkdir -p "$(ARTIFACTS_DIR)/nodejs"
	cp package.json package-lock.json "$(ARTIFACTS_DIR)/nodejs/"
	npm install --production --prefix "$(ARTIFACTS_DIR)/nodejs/"
	rm "$(ARTIFACTS_DIR)/nodejs/package.json"

.PHONY: build-lambda-common build-dependencies build-router