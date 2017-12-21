all: ./build ./calltracer ./calltracer-debug ./example ./example-debug ./helloworld_en ./helloworld_en-debug ./helloworld_cn ./helloworld_cn-debug

./build:
	@./tools/gyp/gyp build.gyp --depth=. -Goutput_dir=./build --generator-output=./out -f make -Dclang=1 

./calltracer-debug:
	@make calltracer -C ./out V=1 BUILDTYPE=Debug

./calltracer:
	@make calltracer -C ./out V=1 BUILDTYPE=Release

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
	# @CALLTRACER_ENABLE=1 LD_DEBUG=./ld.log LD_PRELOAD=/home/lizh/playground/c-workspace/calltracer/out/build/Debug/lib.target/libcalltracer.so ./out/build/Debug/example
	@CALLTRACER_ENABLE=1 ./out/build/Debug/example
	# @DEBUG=* ./tools/iseq/iseq -s 1 -l 5 -o ./out ./cst.log > ./out/iseq.log 2> ./out/iseq.log
	@DEBUG=* ./tools/iseq/iseq -s 0 -l unlimited -o ./out ./cst.log > ./out/iseq.log 2> ./out/iseq.log

./clean:
	@rm -rf ./out
	@rm ./cst.log
	@rm ./default.log
