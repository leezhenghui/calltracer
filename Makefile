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
	@CALLTRACER_ENABLE=1 ./out/build/Debug/example
	@DEBUG=* ./tools/addr2src/a2s.js ./cst.log > ./a2s.log 2> ./a2s.log
	@seqdiag --no-transparency  ./out.seqdiag

./clean:
	@rm -rf ./out
	@rm ./cst.log
	@rm ./out.png
	@rm ./out.json
	@rm ./out.seqdiag
	@rm ./default.log
	@rm ./a2s.log
