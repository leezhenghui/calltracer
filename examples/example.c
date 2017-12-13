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

void log(const char* str) {
	printf("%s\n", str);
	return 0;
}

// __attribute__((no_instrument_function))
int main(void) 
{
	printf("%s [Enter]\n", __func__);
	const char* str_en = "Hello, World";
	const char* str_cn = "你好, 世界"; 
	log(str_en);
	log(str_cn);
	printf("%s [Exit]\n", __func__);
	return 0;
}
