/*
 * =====================================================================================
 *
 *       Filename:  calltracer.h
 *
 *    Description:  The header file for call tracer
 *
 *        Version:  1.0
 *        Created:  12/13/2017 10:16:59 AM
 *       Revision:  none
 *       Compiler:  gcc
 *
 *         Author:  Zhenghui Lee (lizh), leezhenghui@gmail.com
 *   Organization:  ibm.com
 *
 * =====================================================================================
 */


#ifndef CALL_TRACER_H
#define CALL_TRACER_H 

#include <stdio.h>

/**
 * The lifecycle start event of tracer
 */
void calltracer_start(void) __attribute__ ((constructor, no_instrument_function));

/**
 * The lifecycle stop event of tracer 
 */
void calltracer_stop(void) __attribute__ ((destructor, no_instrument_function));

/**
 * Function enter tracer
 */
void __cyg_profile_func_enter(void* calllee, void* caller) __attribute__((no_instrument_function));

/** 
 * Function exit tracer
 */
void __cyg_profile_func_exit(void* calllee, void* caller) __attribute__((no_instrument_function));


/**
 * Tracer enable 
 *
 */
void calltracer_on() __attribute__((no_instrument_function));

/**
 * Tracer disable 
 *
 */
void calltracer_off() __attribute__((no_instrument_function));

#endif

