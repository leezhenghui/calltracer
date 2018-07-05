/*
 * =====================================================================================
 *
 *       Filename:  hello_world_en.c
 *
 *    Description:  
 *
 *        Version:  1.0
 *        Created:  06/22/2017 09:15:08 PM
 *       Revision:  none
 *       Compiler:  gcc
 *
 *         Author:  Zhenghui Lee (lizh), leezhenghui@gmail.com
 *
 * =====================================================================================
 */

#include "hello_world.h"
#include "../deps/simplelogger/simplog.h"
#include "../../common.h"
#include <stdio.h>

static void start (void) __attribute__ ((constructor));

static void stop (void) __attribute__ ((destructor));

static void start (void) 
{
	simplog.writeLog( SIMPLOG_DEBUG, "[module_start] hellow_world_en");
	// printf("[pre-invoke] sayHello_en()\n");
}

static void stop (void) 
{
	simplog.writeLog( SIMPLOG_DEBUG, "[module_stop] hellow_world_en");
	// printf("[post-invoke] sayHello_en()\n");
}

void doSomething() {
	printf("==> [doSomething] in hello_word_en shared object\n");
}

/* 
 * ===  FUNCTION  ======================================================================
 *         Name:  sayHello
 *  Description:  
 * =====================================================================================
 */
void sayHello ()
{
	simplog.writeLog( SIMPLOG_DEBUG, "hellow_world_en sayHello [Enter]");
	printf("   >>>   Hello World   <<< \n");
	doSomething();
	simplog.writeLog( SIMPLOG_DEBUG, "hellow_world_en sayHello [Exit]");
}		/* -----  end of function sayHello  ----- */
