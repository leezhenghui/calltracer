# CallTracer

`CallTracer` is an instrument tool, which is able to be linked to a C/C++ program via shared lib, then record the program call stack history, as well as show up the call stack via mutiples vitualization ways, including: seqdiag, diagrams and flamegraph. 

It supports exectuable ELF, static libraries, shared libraries and dynamic-loading libraries. The primary goal for this tool is to provide a easy/firendly way for native(C/C++) program debugging. In the meanwhile, it is also an efficent utility to help programmer taking a closer look at a large program and firgure out how the program work in the details, without need a step-by-step debugger. 

Notable, turning on the func-trace will introduce significant performance impact,  please avoid using it on a production environment. 

## Prerequisite

- Linux OS

- Have `addr2line` command installed on your system

- Have `node.js` runtime on your environment

- Have `seqdiag` command installed if you want to generate seqdiag style sequencing diagram

## Examples

The sample is just used to demonstrate the usages of the tool. To make the sample cover mores situations, e.g: executable ELF, static-lib, and two kind of shared-libs, I am trying to split the sample into various modules with different lib types, this actually does not make any sense to a real-life program.

![Sample Components](./docs/example-design.jpeg)


## How to run

The project is using GYP as the compile tool.

```sh
git clone https://github.com/leezhenghui/calltracer.git 
git submodule update --init

make clean
make 
make run-debug 

```

Using below command to conver the trace log into a visualizer view:

```
  ./tools/iseq/iseq

```

## Visualizer 

### FlameGraph (default)

![FlameGraph Example](./docs/flamegraph.svg)

### Seqdiag

![Seqdiag Example](./docs/seqdiag.png)


### Diagrams 

![Diagrams Example](./docs/diagrams.svg)
