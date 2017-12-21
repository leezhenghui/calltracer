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

#include  "./plugins/svc_discover.h"

static void pre_main (void) __attribute__ ((constructor));
static void post_main (void) __attribute__ ((destructor));
	
static const char* str_en = "en";
static const char* str_cn = "cn"; 

static void pre_main (void) 
{
	printf("==> [pre_main] example\n");
}

static void post_main (void) 
{
	printf("==> [post_main] example\n");
}

void log(const char* str) {
	double (*fn)();

  void *handler = get_handler(str);
	fn = dlsym(handler, "sayHello");
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
