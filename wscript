import Options

def set_options(opt):
  pass
  #opt.tool_options('compiler_cc')

def configure(conf):
  print "--- calltracer ---"
  #conf.check_tool('compiler_cc')

  #conf.env.append_value("CCFLAGS", "-D_GNU_SOURCE")

def build(bld):
  libcalltracer = bld.new_task_gen("cc", "shlib")
  libcalltracer.source = "src/calltracer.c"
  libcalltracer.target = "calltracer"
  libcalltracer.name = 'calltracer'
  libcalltracer.includes = '. ../..'
  libcalltracer.install_path = None
  if bld.env["USE_DEBUG"]:
    libcalltracer.clone("debug");
