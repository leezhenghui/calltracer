/*
 * =====================================================================================
 *
 *       Filename:  svc_discover.c
 *
 *    Description:  
 *
 *        Version:  1.0
 *        Created:  06/22/2017 09:12:08 PM
 *       Revision:  none
 *       Compiler:  gcc
 *
 *         Author:  Zhenghui Lee (lizh), leezhenghui@gmail.com
 *
 * =====================================================================================
 */

#include "svc_discover.h"
#include "../deps/simplelogger/simplog.h"
#include <stdio.h>
#include  <dlfcn.h> 

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

static const char* str_en = "en";
static const char* str_cn = "cn"; 

static void load_lib(const char* lang) {

	int is_en = strcmp(lang, str_en); 

	if ( is_en == 0 && lib_handle_en != NULL) {
		return;
	} else if (lib_handle_cn != NULL) {
		return;
	}

	if (getcwd(cwd, sizeof(cwd)) != NULL) {
		printf("==> Working directory is %s\n", cwd);
	}
	
	char lib_path[2048];
	memset(lib_path, '\0', sizeof(lib_path));
	strcat(lib_path, cwd);
	if (is_en == 0) {
		strcat(lib_path, HELLOWORLD_EN_LIB);
	} else {
		strcat(lib_path, HELLOWORLD_CN_LIB);
	}
	printf("==> Loading %s_lib from  %s\n", lang, lib_path);
	

	if ( is_en == 0) {
		lib_handle_en = dlopen(lib_path, RTLD_LAZY);
	} else {
		lib_handle_cn = dlopen(lib_path, RTLD_LAZY);
	}
}

/* 
 * ===  FUNCTION  ======================================================================
 *         Name: get_handler 
 *  Description:  
 * =====================================================================================
 */
void* get_handler(const char *lang)
{
	simplog.writeLog( SIMPLOG_DEBUG, "get_handler [Enter]");

	load_lib(lang);

	void* target;
	int is_en = strcmp(lang, str_en); 
	if ( is_en == 0) {
		target = lib_handle_en;
	} else {
		target = lib_handle_cn;
	}

	simplog.writeLog( SIMPLOG_DEBUG, "get_handler [Exit]");
	return target;
}		/* -----  end of function sayHello  ----- */
