
sample:
	mkdir -p build
	browserify client.js > build/client.js
	cp index-sample.html build/index.html

js:
	browserify -t [ reactify --es6 ] test.jsx > test.js
