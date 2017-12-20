/*
 * =====================================================================================
 *
 *       Filename:  hello_world_cn.c
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

#include "hello_world.h"
#include "../deps/simplelogger/simplog.h"
#include <stdio.h>

static void start (void) __attribute__ ((constructor));

static void stop (void) __attribute__ ((destructor));

static void start (void) 
{
	simplog.writeLog( SIMPLOG_DEBUG, "[module_start] hellow_world_cn");
}

static void stop (void) 
{
	simplog.writeLog( SIMPLOG_DEBUG, "[module_stop] hellow_world_cn");
}
/* 
 * ===  FUNCTION  ======================================================================
 *         Name:  sayHello
 *  Description:  
 * =====================================================================================
 */
void sayHello ()
{
	simplog.writeLog( SIMPLOG_DEBUG, "hellow_world_cn sayHello [Enter]");
	printf("   >>>   世界，你好   <<< \n");
	simplog.writeLog( SIMPLOG_DEBUG, "hellow_world_cn sayHello [Exit]");
}		/* -----  end of function sayHello  ----- */
