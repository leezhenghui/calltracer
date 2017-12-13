/*
 * =====================================================================================
 *
 *       Filename:  trace.c
 *
 *    Description:  
 *
 *        Version:  1.0
 *        Created:  11/30/2017 05:54:04 PM
 *       Revision:  none
 *       Compiler:  gcc
 *
 *         Author:  Zhenghui Lee (lizh), leezhenghui@gmail.com
 *   Organization:  ibm.com
 *
 * =====================================================================================
 */

#include "./calltracer.h" 

void tracer_start(void) {
   printf("%s\n", __func__);
}

void tracer_stop(void) {
	printf("%s\n", __func__);
}

void __cyg_profile_func_enter (void *func,  void *caller)
{
	printf(">>> [fun-enter] caller addr: %p, callee addr: %p\n", caller, func);
}

void __cyg_profile_func_exit (void *func, void *caller)
{
	printf(">>> [fun-exit] caller addr: %p, callee addr: %p\n", caller, func);
}
