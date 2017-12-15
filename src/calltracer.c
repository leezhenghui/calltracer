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

#define DEFAULT_LOG_FILE "cst.log"
#define FUNC_ENTRY_TAG ">"
#define FUNC_EXIT_TAG "<"

static pid_t tid, pid, ppid; 
static gid_t gid;
static char logFile[255] = DEFAULT_LOG_FILE;    // Default log file name
static int log;    

static unsigned int isTracerEnabled = 0;
static unsigned int isHeaderPrinted = 0;

static void print_header(void) {
	if (isHeaderPrinted) return;
	char msg[1024];
	sprintf(msg, "%s\n", "   gid       ppid     pid      tid     timestamp    dir      caller      callee");
	write(log, msg, strlen(msg));
	isHeaderPrinted = 1;
}

static void func_trace(const void *callee, const void *caller, const unsigned int isEntry) {

	if (! isTracerEnabled) {
    return;	
	}

#ifdef SYS_gettid
	if ((tid = syscall(SYS_gettid)) < 0) {
		perror("Failed to gettid!");
	}
#endif
	unsigned int timestamp = (unsigned int) time(NULL);
	char msg[2048];

	char* call_dirction_tag;
	if (isEntry) {
		call_dirction_tag = FUNC_ENTRY_TAG;
	} else {
    call_dirction_tag = FUNC_EXIT_TAG;	
	}
	sprintf(msg, "  %d      %d    %d    %d    %d    %s    %p    %p\n", gid, ppid, pid, tid, timestamp, call_dirction_tag, caller, callee);
	write(log, msg, strlen(msg));
}

void calltracer_start(void) {
	char *is_tracer_enabled_env;
	if ((is_tracer_enabled_env = getenv("CALLTRACER_ENABLE"))){
		isTracerEnabled = atoi(is_tracer_enabled_env);
	}

	if (! isTracerEnabled) {
    return;	
	}

	log = open( logFile, O_CREAT | O_APPEND | O_RDWR, 0664 );

	if ((ppid = getppid()) < 0 ) {
		perror("Failed to getppid!");
	}

	if ((pid = getpid()) < 0) {
		perror("Failed to getpid!");
	}

	if ((gid = getgid()) < 0 ) {
		perror("Failed to getgid!");
	}

	if (! isHeaderPrinted) {
		print_header();	
	}
}

void calltracer_stop(void) {
	if (log) {
    close(log);	
	}
}

void __cyg_profile_func_enter (void *callee,  void *caller)
{
	func_trace(callee, caller, 1);
}

void __cyg_profile_func_exit (void *callee, void *caller)
{
	func_trace(callee, caller, 0);
}
