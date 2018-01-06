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
#include <dlfcn.h> 
#include <pthread.h>

#include  "./plugins/svc_discover.h"

#define NUMT 2 

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

	fork();

	printf("%s [Enter]\n", __func__);

	pthread_t tid[NUMT];
	int i;
	int error;

 	for(i = 0; i< NUMT; i++) {
 		char* str_lang = ((i == 0) ? str_en : str_cn);
 		error = pthread_create(&tid[i],
 				NULL, /*  default attributes please */ 
 				log,
 				str_lang);
 		if(0 != error)
 			fprintf(stderr, "Couldn't run thread number %d, errno %d\n", i, error);
 		else
 			fprintf(stderr, "Thread %d, gets %s\n", i, str_lang);
 	}

//	 log(str_en);
//	 log(str_cn);
	
 	for(i = 0; i< NUMT; i++) {
 		error = pthread_join(tid[i], NULL);
 		fprintf(stderr, "Thread %d terminated\n", i);
 	}

	printf("%s [Exit]\n", __func__);
	return 0;
}
