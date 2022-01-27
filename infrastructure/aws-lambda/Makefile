build-router:
	npm install	
	rm -rf dist
	npm run build.aws-lambda
	cp -r ./dist "$(ARTIFACTS_DIR)/"
	$(MAKE) -f $(MAKEFILE_LIST) build-dependencies

build-dependencies:
	cp ./infrastructure/aws-lambda/package.json ./infrastructure/aws-lambda/package-lock.json "$(ARTIFACTS_DIR)"
	npm install --production --prefix "$(ARTIFACTS_DIR)"
	# rm "$(ARTIFACTS_DIR)/package.json"

.PHONY: build-lambda-common build-dependencies build-router