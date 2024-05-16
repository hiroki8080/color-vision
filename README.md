# color-vision

*Currently under development.
This is a simple visual programming prototype.
The picture drawn on the browser is processed using the wasm module converted using py2wasm.
The wasm module is the following project.

https://github.com/hiroki8080/iron-pyrite


# install

※unverified

`npm install`


# execute

1. Go to iron-pyrite/pyrite directory
2. Convert it to wasm module with the following command.

`py2wasm main.py -o main.wasm`

3. Move the created color-vision/wasm module to the wasm directory.
4. Start the server with the command below.

`npm run dev`

5.Access http://localhost:5173/