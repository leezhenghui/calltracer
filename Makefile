all: ./build ./calltracer ./calltracer-debug ./example ./example-debug

./build:
	@./tools/gyp/gyp build.gyp --depth=. -Goutput_dir=./build --generator-output=./out -f make -Dclang=1 

./calltracer-debug:
	@make calltracer -C ./out V=1 BUILDTYPE=Debug

./calltracer:
	@make calltracer -C ./out V=1 BUILDTYPE=Release

./example-debug:
	@make example -C ./out V=1 BUILDTYPE=Debug

./example:
	@make example -C ./out V=1 BUILDTYPE=Release

./run:
	@./out/build/Release/example

./run-debug:
	@./out/build/Debug/example

./clean:
	@rm -rf ./out
