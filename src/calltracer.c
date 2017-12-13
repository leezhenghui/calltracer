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

#include <sys/types.h>
#include <unistd.h>
#include <stdlib.h>
#include <sys/syscall.h>

#include "./calltracer.h" 

#define CALL_STACK_TRACE_SPEC "cst"

static pid_t tid, pid, ppid; 
static gid_t gid;

void calltracer_start(void) {
	// printf("%s\n", __func__);
	printf("             [gid]      [ppid]     [pid]     [tid]     [dir]      [caller]      [callee]\n");
}

void calltracer_stop(void) {
	// printf("%s\n", __func__);
}

void __cyg_profile_func_enter (void *callee,  void *caller)
{
	 if ((ppid = getppid()) < 0 ) {
		 perror("Failed to getppid!");
	 }

	 if ((pid = getpid()) < 0) {
		 perror("Failed to getpid!");
	 }

	 if ((gid = getgid()) < 0 ) {
		 perror("Failed to getgid!");
	 }

   #ifdef SYS_gettid
	 if ((tid = syscall(SYS_gettid)) < 0) {
		 perror("Failed to gettid!");
	 }
   #endif
	printf("[%s]:     [%d]      [%d]    [%d]    [%d]    [>]    [%p]    [%p]\n", CALL_STACK_TRACE_SPEC, gid, ppid, pid, tid, caller, callee);
}

void __cyg_profile_func_exit (void *callee, void *caller)
{
	 if ((ppid = getppid()) < 0 ) {
		 perror("Failed to getppid!");
	 }

	 if ((pid = getpid()) < 0) {
		 perror("Failed to getpid!");
	 }

	 if ((gid = getgid()) < 0 ) {
		 perror("Failed to getgid!");
	 }

   #ifdef SYS_gettid
	 if ((tid = syscall(SYS_gettid)) < 0) {
		 perror("Failed to gettid!");
	 }
   #endif

	printf("[%s]:     [%d]      [%d]    [%d]    [%d]    [<]    [%p]    [%p]\n", CALL_STACK_TRACE_SPEC, gid, ppid, pid, tid, caller, callee);
}
