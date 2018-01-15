all: ./build ./example ./example-debug ./helloworld_en ./helloworld_en-debug ./helloworld_cn ./helloworld_cn-debug

./build:
	@./tools/gyp/gyp ./examples/examples.gyp --depth=. -Goutput_dir=./build --generator-output=./out -f make -Dclang=1 

./helloworld_en:
	@make helloworld_en -C ./out V=1 BUILDTYPE=Release

./helloworld_en-debug:
	@make helloworld_en -C ./out V=1 BUILDTYPE=Debug

./helloworld_cn:
	@make helloworld_cn -C ./out V=1 BUILDTYPE=Release

./helloworld_cn-debug:
	@make helloworld_cn -C ./out V=1 BUILDTYPE=Debug

./example-debug:
	@make example -C ./out V=1 BUILDTYPE=Debug

./example:
	@make example -C ./out V=1 BUILDTYPE=Release

./run:
	@./out/build/Release/example

./run-debug:
	@CALLTRACER_ENABLE=1 ./out/build/Debug/example
	@DEBUG=* ./tools/iseq/iseq -s 0 -l unlimited -v all -o ./out > ./out/iseq.log 2> ./out/iseq.log

./clean:
	@rm -rf ./out
	@rm -f ./cst-*.log
	@rm -f ./default.log
	@rm -f ./core
