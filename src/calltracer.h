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
void tracer_start(void) __attribute__ ((constructor, no_instrument_function));

/**
 * The lifecycle stop event of tracer 
 */
void tracer_stop(void) __attribute__ ((destructor, no_instrument_function));

/**
 * Function enter tracer
 */
void __cyg_profile_func_enter(void* calller, void* callee) __attribute__((no_instrument_function));

/** 
 * Function exit tracer
 */
void __cyg_profile_func_exit(void* calller, void* callee) __attribute__((no_instrument_function));


/**
 * Tracer enable 
 *
 */
void tracer_on() __attribute__((no_instrument_function));

/**
 * Tracer disable 
 *
 */
void tracer_off() __attribute__((no_instrument_function));

#endif

