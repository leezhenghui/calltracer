/*
 * =====================================================================================
 *
 *       Filename:  hello_world.c
 *
 *    Description:  
 *
 *        Version:  1.0
 *        Created:  11/30/2017 05:01:09 PM
 *       Revision:  none
 *       Compiler:  gcc
 *
 *         Author:  Zhenghui Lee (lizh), leezhenghui@gmail.com
 *   Organization:  ibm.com
 *
 * =====================================================================================
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include  <dlfcn.h> 

#include  "./deps/simplelogger/simplog.h"
#include  "./plugins/hello_world.h"

#ifdef DEBUG
#define HELLOWORLD_CN_LIB "/out/build/Debug/lib.target/libhelloworld_cn.so"
#define HELLOWORLD_EN_LIB "/out/build/Debug/lib.target/libhelloworld_en.so"
#endif

#ifdef NDEBUG
#define HELLOWORLD_CN_LIB "/out/build/Release/lib.target/libhelloworld_cn.so"
#define HELLOWORLD_EN_LIB "/out/build/Release/lib.target/libhelloworld_en.so"
#endif

static void *lib_handle_en;
static void *lib_handle_cn;
static char cwd[1024];

static void pre_main (void) __attribute__ ((constructor));
static void post_main (void) __attribute__ ((destructor));
	
static const char* str_en = "en";
static const char* str_cn = "cn"; 

static void pre_main (void) 
{
	simplog.writeLog( SIMPLOG_DEBUG, "[pre_main] example");
	if (getcwd(cwd, sizeof(cwd)) != NULL) {
		printf("==> Working directory is %s\n", cwd);
	}

	char enlib_path[2048];
	memset(enlib_path, '\0', sizeof(enlib_path));
	strcat(enlib_path, cwd);
	strcat(enlib_path, HELLOWORLD_EN_LIB);
	printf("==> Loading en_lib from  %s\n", enlib_path);
	lib_handle_en = dlopen(enlib_path, RTLD_LAZY);

	char cnlib_path[2018];
	memset(cnlib_path, '\0', sizeof(cnlib_path));
	strcat(cnlib_path, cwd);
	strcat(cnlib_path, HELLOWORLD_CN_LIB);
	printf("==> Loading cn_lib from  %s\n", cnlib_path);
	lib_handle_cn = dlopen(cnlib_path, RTLD_LAZY);
}

static void post_main (void) 
{
	simplog.writeLog( SIMPLOG_DEBUG, "[post_main] example");
}

void log(const char* str) {
	double (*fn)();

	int is_en = strcmp(str, str_en);

	if ( is_en == 0) {
		fn = dlsym(lib_handle_en, "sayHello");
	} else {
		fn = dlsym(lib_handle_cn, "sayHello");
	}

	(*fn)();

	return 0;
}

// __attribute__((no_instrument_function))
int main(void) 
{
	printf("%s [Enter]\n", __func__);
	log(str_en);
	log(str_cn);
	printf("%s [Exit]\n", __func__);
	return 0;
}
