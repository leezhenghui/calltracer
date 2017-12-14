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

#include <stdio.h>
#include <sys/types.h>
#include <unistd.h>
#include <stdlib.h>
#include <sys/syscall.h>
#include <string.h>
#include <fcntl.h>

#include "./calltracer.h" 

#define CALL_STACK_TRACE_SPEC "cst"

static pid_t tid, pid, ppid; 
static gid_t gid;
static char logFile[255]    = "cst.log";    // Default log file name
static int log;    

void calltracer_start(void) {
	// Open the log file
	log = open( logFile, O_CREAT | O_APPEND | O_RDWR, 0664 );

	char msg[1024];
	sprintf(msg, "%s\n", "       gid        ppid     pid     tid     timestamp    dir      caller      callee");
	write(log, msg, strlen(msg));
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

	unsigned int timestamp = (unsigned int) time(NULL);
	char msg[2048];
	sprintf(msg, "%s:  %d      %d    %d    %d    %d    >    %p    %p\n", CALL_STACK_TRACE_SPEC, gid, ppid, pid, tid, timestamp, caller, callee);
	write(log, msg, strlen(msg));
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

	unsigned int timestamp = (unsigned int) time(NULL);
	char msg[2048];
	sprintf(msg, "%s:  %d      %d    %d    %d    %d    <    %p    %p\n", CALL_STACK_TRACE_SPEC, gid, ppid, pid, tid, timestamp, caller, callee);
	write(log, msg, strlen(msg));
}
