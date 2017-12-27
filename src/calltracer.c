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
#include <sys/timeb.h>

#include "./calltracer.h" 

#define DEFAULT_LOG_FILE "cst.log"
#define FUNC_ENTRY_TAG ">"
#define FUNC_EXIT_TAG "<"
#define MEM_MAPS_FILE_PATTERN "/proc/%d/maps"
#define FUNC_TRACE_BEGIN_PATTERN "***      Begin(pid: %d)      ***\n\n"
#define FUNC_TRACE_END_PATTERN   "\n***       END(pid: %d)       ***\n"
#define MEM_LAYOUT_SECTION_SEPARATOR "=== MEMORY LAYOUT ==="
#define FUNC_TRACE_SECTION_SEPARATOR "=== FUNC TRACE ==="
#define FUNC_TRACE_HEADER "   timestamp    gid       ppid     pid      tid     dir      caller      callee"

static pid_t tid, pid, ppid; 
static gid_t gid;
static char logFile[255] = DEFAULT_LOG_FILE;    // Default log file name
static int log;    

static unsigned int isTracerEnabled = 0;
static unsigned int isHeaderPrinted = 0;

__attribute__((no_instrument_function))
static void print_header(void) {
	char msg[1024];
	sprintf(msg, FUNC_TRACE_BEGIN_PATTERN, pid);
	write(log, msg, strlen(msg));
}

__attribute__((no_instrument_function))
static void print_footer(void) {
	char msg[1024];
	sprintf(msg, FUNC_TRACE_END_PATTERN, pid);
	write(log, msg, strlen(msg));
}

__attribute__((no_instrument_function))
static void mem_layout() {
	
	char buffer[2046];
	sprintf(buffer, "\n%s\n\n", MEM_LAYOUT_SECTION_SEPARATOR);
	write(log, buffer, strlen(buffer));
	
	char fmap[1024];
	sprintf(fmap, MEM_MAPS_FILE_PATTERN, pid);
	FILE *fp = fopen(fmap, "r");
	fseek(fp, 0, SEEK_SET);
	while (! feof(fp)) {
		fread(buffer, sizeof(buffer), 1, fp);
		write(log, buffer, strlen(buffer));
	}
	write(log, "\n\n", strlen("\n\n"));
	fclose(fp);
}

__attribute__((no_instrument_function))
static long long get_system_time() {
	struct timeb t;
	ftime(&t);
	return 1000 * t.time + t.millitm;
}

__attribute__((no_instrument_function))
static void func_trace(const void *callee, const void *caller, const unsigned int isEntry) {

	if (! isTracerEnabled) {
    return;	
	}

	char msg[2048];
	if (! isHeaderPrinted) {
		sprintf(msg, "%s\n\n", FUNC_TRACE_SECTION_SEPARATOR);
		write(log, msg, strlen(msg));
		sprintf(msg, "%s\n\n", FUNC_TRACE_HEADER);
		write(log, msg, strlen(msg));
		isHeaderPrinted = 1;
	}

#ifdef SYS_gettid
	if ((tid = syscall(SYS_gettid)) < 0) {
		perror("Failed to gettid!");
	}
#endif

	unsigned long long timestamp = get_system_time();

	char* call_dirction_tag;
	if (isEntry) {
		call_dirction_tag = FUNC_ENTRY_TAG;
	} else {
    call_dirction_tag = FUNC_EXIT_TAG;	
	}
	sprintf(msg, "  %lld      %d    %d    %d    %d    %s    %p    %p\n", timestamp, gid, ppid, pid, tid, call_dirction_tag, caller, callee);
	write(log, msg, strlen(msg));
}



void calltracer_start(void) {
	printf("==> calltracer start\n");
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

	print_header();	
	mem_layout();
}

void calltracer_stop(void) {
	printf("==> calltracer stop\n");
  // mem_layout in stop phase, as
	// the shared lib may being loaded during execution time via
	// dlopen way
	mem_layout();
	print_footer();
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

void calltracer_on() {

}

void calltracer_off() {

}
