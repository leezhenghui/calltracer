#!/usr/bin/env node

'use strict'

//========================================================
//       Dependened Modules
//========================================================

const program       = require('commander');
const path          = require('path');
const fs            = require('fs');
const Q             = require('q');
const colors        = require('colors');
const debug         = require('debug')('a2s');
const child_process = require('child_process');
const readline      = require('readline');

//=========================================================
//     Global Variables
//=========================================================

const ADDR2LINE_CMD = '/usr/bin/addr2line';
const SEQDIAG_CMD = '/usr/bin/seqdiag';

const DEFAULT_NUMBER_RADIX = 16;

const DIAG_LINE_COLORS = ['blue', 'green', 'orange'];
const DIAG_LINE_ERROR_COLOR = 'red';

let   colorCursor = 0;

//==========================================================
//  Class Definitions
//==========================================================

class CMDExecutor {
	constructor(cmd) {
		this.cmd = cmd;
	}

	/**
	 * Execute a shell command and return the stdout/stderror back as the execution result
	 *
	 * @params [<String>], the command execution parameters
	 *
	 * @callback func
	 *
	 * @return Promise, resolve: String, reject: String
	 *
	 */
	exec(params, callback) {
		let defer = Q.defer();
		let self = this;

		try {
			let runner = child_process.spawn(self.cmd, params, {'cwd': process.cwd(), stdio: 'pipe'});

			let reval = '';
			let fault = '';

			runner.on('close', function() {
			  // debug('Run cmd "' + self.cmd + '" with params: ', params, ' and result: ', reval);
				defer.resolve(reval);
			});
			
			runner.stdout.on('data', function (data) {
				reval += data;
			});

			runner.stderr.on('data', function (data) {
				fault += data;
			});

			runner.on('error', function(error) {
				console.error('Failed to run cmd "' + self.cmd + '" with params: ', params, ' due to: ', error);
				defer.reject({
			    reason: fault,
					details: error
				});
			});
		} catch(error) {
			console.error('Failed to launch cmd "' + self.cmd + '" with params: ', params, ' due to: ', error);
			defer.reject({ details: error, reason: 'Failed to launch cmd "' + self.cmd + '" with params: "' + JSON.stringify(params) + '"'});
		}

		return defer.promise.nodeify(callback);
	}
}


/**
 * The line in the call stack trace log
 *
 */
class Line {
	constructor (position, logFile, rawContent) {
		this.position = position;
		this.rawContent = rawContent;
		this.logFile = logFile;
	}

	getPosition() {
    return this.position;	
	}

	getLogFile() {
    return this.logFile;	
	}

	getContent() {
    return this.rawContent;	
	}
}

/**
 * The port is used to present source or target which participating in the interaction
 *
 * It is a function description in call stack trace
 *
 */
class Port {

	constructor(funcName, srcLoc, execPoint, addr, image) {
		this.funcName = funcName;
		this.srcLoc = srcLoc;
		this.execPoint = execPoint;
		this.addr = addr;
		if ('string' === typeof this.addr) {
	     this.addr = parseInt(this.addr, DEFAULT_NUMBER_RADIX); 	
		}
		this.image = image;
	}
	
	static get QNAME() {
		return 'PortParser';
	}
	
	static getOffsetInDL(addr, image) {
		let offset = 0;
		if (! image.isSharedLib()) {
			return null;
		}

		if ('string' === typeof addr) {
			addr = parseInt(addr, DEFAULT_NUMBER_RADIX);	
		}	
		offset = addr - image.getVMAStartAddr(); 
		offset = new Number(offset);
		return offset.toString(DEFAULT_NUMBER_RADIX);
	}

	static get ADDR_TO_LINE_PATTERN() {	
		return /^\s*(\S+)\s+(?:at)*\s*(\S+):([0-9\?]+)[\s+\S*|\s*]*$/g;
	}

	/**
	 * @param opts, {
	 *   image: <Object> // func owner image for the addr
	 * }
	 *
	 * addr2line result formats:
	 * 
	 * [1] The code is compiled with debug info, we can see the detailed symbol info 
	 *
	 * <method> at <src_loc>:<line>
	 *
	 * e.g:
	 *
	 * log at /home/lizh/playground/calltracer/out/../examples/example.c:27
	 *
	 * [2] Only can see the func name, no source code and line info. This usually happen the code was missing debug info.
	 *
	 * <method> at ??:?
	 *
	 * e.g: 
	 *
	 * _start at ??:?
	 *
	 * [3] Can't find any symbol on the given addr and image file
	 *
	 * ?? ??:0
	 *
	 *
	 * @return promise
	 */
	static parse(addr, opts, callback) {
		let addr2line = new CMDExecutor(ADDR2LINE_CMD);
		let fixedAddr = Port.getOffsetInDL(addr, opts.image) || addr;
		let params = ['-fp', '-e', opts.image.getFullPath(), fixedAddr];

		return addr2line.exec(params).then(function(output) {
			debug('Run addr2line command,  params:\n', params, '\n output:\n', '"' + output + '"');

			if (! Port.ADDR_TO_LINE_PATTERN.test(output)) {
				console.error('Unrecognized addr2line command output: ', output);
				throw {
					errorCode: 'E_ADDR2LINE_220',
			    reason: 'Unrecognized addr2line command output: ' + output
				};
			}

			let parsedOutput = Port.ADDR_TO_LINE_PATTERN.exec(output);

			let funcName = parsedOutput[1];
			let srcLoc = parsedOutput[2];
			let execPoint = parsedOutput[3];

			let reval = new Port(funcName, srcLoc, execPoint, addr, opts.image);

			return reval;
		}).nodeify(callback);
	}

	equalsTo(port) {
		if (! port) {
			return false;	
		}

		if (port.addr && port.addr === this.addr) {
			return true;
		}

		return false;
	}
	
	getVMA() {
		let self = this;
    if ('string' === typeof self.addr) {
	    return parseInt(self.addr, DEFAULT_NUMBER_RADIX);	
		}	

		return self.addr;
	}

	getVMAInHex() {
		let self = this;
		if ('string' === typeof self.addr) {
			return self.addr;
		}

		let hexVal = new Number(self.addr);

		return hexVal.toString(DEFAULT_NUMBER_RADIX);
	
	}
	
	getOffset() {
		let self = this;
		let hexVal = Port.getOffsetInDL(self.addr, port.image);

		if (! hexVal) return hexVal;

		return parseInt(hexVal, DEFAULT_NUMBER_RADIX);
	}
	
	getOffsetInHex() {
		let self = this;
		return Port.getOffsetInDL(self.addr, port.image);
	}

	toJSON() {
		let self = this;
		return {
			funcName: self.funcName,
			srcLoc: self.srcLoc,
			execPoint: self.execPoint,
			addr: self.getVMAInHex(),
			image: self.image
		};
	}
}

class Interaction {

	constructor(src, tar, type, timestamp, pid, tid) {
		this.source = src;
		this.target = tar;
		this.type = type;
		this.timestamp = timestamp;
		this.pid = pid;
		this.tid = tid;
	}
	
	static get QNAME() {
		return 'InteractionParser';
	}

	/**
	 * 
	 *   timestamp       gid     ppid     pid      tid     dir      caller          callee
	 *
	 *   1513570431      1000    14999    15000    15000    >    0x2ace57ad5f45    0x400811
	 */
	static get PATTERN() {
		return /^\s*([0-9]+)\s+[0-9]+\s+[0-9]+\s+([0-9]+)\s+([0-9]+)\s+([>|<])\s+([a-z0-9A-Z]+)\s+([0-9a-zA-Z]+)\s*$/gi;
	}

	/**
	 * @param String, the line item in the trace log
	 * @param opts, {
	 *   part: <Object> // current part
	 * }
	 *
	 * @return Promise
	 */
	static parse(line, opts, callback) {
		let timestamp, pid, tid, type, srcAddr, srcPort, targetAddr, targetPort;
	
		return Q().then(function() {
			let parsedReval = Interaction.PATTERN.exec(line.getContent());
			timestamp = parsedReval[1];
			pid = parsedReval[2];
			tid = parsedReval[3];
			type = parsedReval[4];
			srcAddr = parsedReval[5];
			targetAddr = parsedReval[6];
		}).then(function() {
			let currentPart = opts.processor.getCurrentPart();
			let ownerImage = currentPart.findImageByFuncVMA(srcAddr);

			return Port.parse(srcAddr, {image: ownerImage}).then(function(port) {
				debug('Line-' + line.getPosition() + '(' + path.basename(line.getLogFile()) + ') is ' + colors.green.bold('partial parsed') +': "left-side func-addr: ' + srcAddr + '" ==> Port: ' + JSON.stringify(port.toJSON()));
				srcPort = port;	
			});
		}).then(function() {
			let currentPart = opts.processor.getCurrentPart();
			let ownerImage = currentPart.findImageByFuncVMA(targetAddr);

			return Port.parse(targetAddr, {image: ownerImage}).then(function(port) {
				debug('Line-' + line.getPosition() + '(' + path.basename(line.getLogFile()) + ') is ' + colors.green.bold('partial parsed') + ': "right-side func-addr: ' + targetAddr + '" ==> Port: ' + JSON.stringify(port.toJSON()));
				targetPort = port;	
			});
		}).then(function() {
			//use colorful interaction to pair the req/resp
			let inter = new InteractionDiag(srcPort, targetPort, type, timestamp, pid, tid);
			let pairedInter = null;
			opts.processor.getCurrentPart().interactions.some(function(_inter) {
				if (_inter.isPaired(inter)) {
					pairedInter = _inter;
					return true;
				}
			});

			if (pairedInter) {
				inter.setColor(pairedInter.getColor());
			} else if (inter.isResponse()) {
				inter.setColor(DIAG_LINE_ERROR_COLOR);
			} else {
				let nextColor = colorCursor % DIAG_LINE_COLORS.length;
		    inter.setColor(DIAG_LINE_COLORS[nextColor]);	
				colorCursor ++;
			}
			opts.processor.getCurrentPart().pushInteraction(inter);
			debug('Line-' + line.getPosition() + '(' + path.basename(line.getLogFile()) + ') is ' + colors.green.bold('parsed') + ': "' + line.getContent() + '" ==> Interaction: ' + JSON.stringify(inter.toJSON()));
			return inter;
		}).fail(function(error) {
			console.error('Failed to parse interaction - "' + srcAddr + ' ' + type + ' ' + targetAddr + '" due to: ', error);
			throw error;
		}).nodeify(callback);
	}

	static canParse(line) {
		if (! line || ! line.getContent() || '' === line.getContent().trim()) {
	     return false;	
		}

		if (! Interaction.PATTERN.test(line.getContent())) {
		
			return false;
		}

		return true;
	}

	getSource() {
		return this.source; 
	}

	getTarget() {
		return this.target;	
	}

	getTimestamp() {
		return this.timestamp;
	}

	isRequest() {
		if ('>'	=== this.type.toLowerCase()) {
			return true;
		}

		return false;
	}

	isResponse() {
		if ( '<'	=== this.type.toLowerCase()) {
			return true;
		}
		return false;
	}

	getType() {
		return this.type;	
	}

	getTid() {
		return this.tid;	
	}

	getPid() {
		return this.pid;	
	}

	isPaired(inter) {
		let self = this;
		if (! inter) {
			return false;	
		}

		if (! inter.getSource().equalsTo(self.getSource()) ||
			  ! inter.getTarget().equalsTo(self.getTarget())
		) {
			return false;
		}
		
		if (inter.getPid() !== self.getPid() || 
			inter.getTid() !== self.getTid()) {
			return false;
		}

		if (self.getType() === inter.getType()) {
			return false;	
		}

		if (inter.isRequest() && inter.getTimestamp() > self.getTimestamp()){
			return false;	
		}

		if (inter.isResponse() && inter.getTimestamp() < self.getTimestamp()){
			return false;	
		}

		return true;
	}

	toJSON() {
		let self = this;
		return {
			source: self.getSource().toJSON(),
			target: self.getTarget().toJSON(),
			interactionType: self.getType(),
			timestamp: self.getTimestamp(),
			pid: self.getPid(),
			tid: self.getTid()
		};	
	}
}


class Image {
	constructor(path, vmaStart, vmaEnd) {
    this.fullPath= path;
		this.vmaStart = vmaStart;
		if ('string' === typeof this.vmaStart) {
	    this.vmaStart = parseInt(this.vmaStart, DEFAULT_NUMBER_RADIX);	
		}
		this.vmaEnd = vmaEnd;
		if ('string' === typeof this.vmaEnd) {
	    this.vmaEnd = parseInt(this.vmaEnd, DEFAULT_NUMBER_RADIX);	
		}
	}

	static get QNAME() {
		return 'ImageParser';
	}

	/**
	 * Pattern: 
	 *  e.g:
	 *    2adf33535000-2adf33539000 r-xp 00000000 08:11 60690196                   /home/lizh/playground/calltracer/out/build/Debug/lib.target/libsimplelogger.so
	 */
	static get PATTERN() {
    return /^\s*([a-zA-Z0-9]+)-([a-zA-Z0-9]+)\s+r-xp\s+[a-zA-Z0-9]+\s+[0-9]+:[0-9]+\s+[0-9]+\s+([\S]+)\s*$/g;	
	}

	/**
	 * VMA layout info:
	 *
	 *  [Format]: 
	 *
	 *  start-end permissions offset major:minor inode image
	 *
	 *  [Details]:
	 *
	 *  start-end: start and end addresses of the VMA.
	 *
	 *  permissions: r (read), w (write), and x (execute). The p (private) and s (shared) flags indicate the type of memory mapping.
	 *
	 *  offset: the offset into the underlying object where the VMA mapping begins.
	 *
	 *  major:minor: the major and minor number pairs of the device holding the file that has been mapped.
	 *
	 *  inode: the inode number of the mapped file.
	 *
	 *  image: the name of the mapped file.
	 *
	 *  e.g:
	 *
	 *  00400000-00401000 r-xp 00000000 08:11 44834810                           /home/lizh/playground/calltracer/out/build/Debug/example
	 *  2adf3310d000-2adf33130000 r-xp 00000000 08:01 918655                     /lib/x86_64-linux-gnu/ld-2.19.so
	 *  2adf33332000-2adf33334000 r-xp 00000000 08:11 44966015                   /home/lizh/playground/calltracer/out/build/Debug/lib.target/libcalltracer.so
	 *  2adf33535000-2adf33539000 r-xp 00000000 08:11 60690196                   /home/lizh/playground/calltracer/out/build/Debug/lib.target/libsimplelogger.so
	 *  2adf3373b000-2adf338f9000 r-xp 00000000 08:01 918627                     /lib/x86_64-linux-gnu/libc-2.19.so
	 *
	 *  @param line
	 *  @param opts , {getCurrentPart: function() {...}) 
	 *  @param callback
	 *
	 *  @return Promise, resolve: Image
	 *
	 */
	static parse(line, opts, callback) {
		let imgPath  = null;
		let startVMA = null;
		let endVMA   = null;
		return Q().then(function() {
			let parsedReval = Image.PATTERN.exec(line.getContent());
			startVMA = parsedReval[1];
			endVMA = parsedReval[2];
			imgPath = parsedReval[3];

			let image = new Image(imgPath, startVMA, endVMA);
			opts.processor.getCurrentPart().pushImage(image);
			debug('Line-' + line.getPosition() + '(' + path.basename(line.getLogFile()) + ') is ' + colors.green.bold('parsed') + ': "' + line.getContent() + '" ==> Image: ' + JSON.stringify(image.toJSON()));
			return image;
		}).fail(function(error) {
			console.error('Failed to parse image - "' + path.basename(imgPath) + '" due to :', error);
			throw error;
		}).nodeify(callback);
	}

	static canParse(line) {
		if (! line || ! line.getContent() || '' === line.getContent().trim()) {
	     return false;	
		}

		if (! Image.PATTERN.test(line.getContent())) {
		
			return false;
		}

		return true;
	}

	getBasename() {
		let baseName = path.basename(this.fullPath);
		return baseName;
	}
	
	getDir() {
		let dirname = path.dirname(this.fullPath);
		return dirname;
	}

	getFullPath() {
    return this.fullPath;	
	}

	getVMAStartAddr() {
		let self = this;
    if ('string' === typeof self.vmaStart) {
	    return parseInt(self.vmaStart, DEFAULT_NUMBER_RADIX);	
		}	

		return self.vmaStart;
	}
	
	getVMAStartAddrInHex() {
		let self = this;
    if ('string' === typeof self.vmaStart) {
	    return self.vmaStart;	
		}	

		let hexVal = new Number(self.vmaStart);
		return hexVal.toString(DEFAULT_NUMBER_RADIX);
	}

	getVMAEndAddr() {
		let self = this;
    if ('string' === typeof self.vmaEnd) {
	    return parseInt(self.vmaEnd, DEFAULT_NUMBER_RADIX);	
		}	

		return self.vmaEnd;
	}
	
	getVMAEndAddrInHex() {
		let self = this;
    if ('string' === typeof self.vmaEnd) {
	    return self.vmaEnd;	
		}	

		let hexVal = new Number(self.vmaEnd);
		return hexVal.toString(DEFAULT_NUMBER_RADIX);
	}

	/**
	 * Tell the lib type, so far, only support linux OS 
	 *
	 */
	isSharedLib() {
		let self = this;
		let extName = path.extname(self.getBasename()); 

		if ('.so' === extName.toLowerCase() || '.dll' === extName.toLowerCase()) {
			return true;
		}

		return false;
	}

	contains(funcAddr) {
		let self = this;
		if (! funcAddr) {
			return false;
		}

		if ( 'string' === typeof funcAddr) {
	    funcAddr = parseInt(funcAddr, DEFAULT_NUMBER_RADIX);	
		}

		if (funcAddr < self.getVMAStartAddr()) {
	    return false;	
		}

		if (funcAddr > self.getVMAEndAddr()) {
	    return false;	
		}

		return true;
	}

	toJSON() {
    let self = this;
		return {
	    isSharedLib: self.isSharedLib(),
			dir: self.getDir(),
			basename: self.getBasename(),
			vmaStart: self.getVMAStartAddrInHex(),
			vmaEnd: self.getVMAEndAddrInHex()
		};
	}
} 

class Part {
	constructor(pid) {
    this.pid = pid;	
		this.interactions = [];
		this.images = [];
	}

	/**
	 * Pattern of Part seperator:
	 * 
	 * e.g:
	 *
	 *   ***      Begin(pid: 15000)      ***
	 */
	static get PATTERN() {
		return /^\s*[\*]+\s*Begin\(pid:\s*([0-9]+)\s*\)\s*[\*]+\s*$/gi;
	}

	/**
	 *
	 * @return Promise, Part
	 */
	static parse(line, opts, callback) {
		return Q().then(function() {
			let parsedReval = Part.PATTERN.exec(line.getContent());
			let pid = parsedReval[1];
			let part = new Part(pid);
			opts.processor.pushPart(part);
			debug('Line-' + line.getPosition() + '(' + path.basename(line.getLogFile()) + ') is ' + colors.green.bold('parsed') + ': "' + line.getContent() + '" ==> Part: ' + JSON.stringify(part.toJSON()));
			return part;
		}).fail(function(error) {
			console.error('Failed to parse Part - "' + pid + '" due to :', error);
			throw error;
		}).nodeify(callback);
	}

	static get QNAME() {
		return 'PartParser';
	}

	/**
	 *
	 * @return Promise, Boolean, true: can parse, false: can't parse
	 */
	static canParse(line) {
		if (! line || ! line.getContent() || '' === line.getContent().trim()) {
	     return false;	
		}
		if (! Part.PATTERN.test(line.getContent())) {
		
			return false;
		}
		return true;
	}

	findImageByFuncVMA(funcVMA) {
		let self = this;
    if (! funcVMA) {
	    return;	
		}	

		let targetImg = null;
		self.images.some(function(image) {
			if (image.contains(funcVMA)) {
		    
				targetImg = image;
				return true;
			}
			return false;
		});

		return targetImg;
	}

	pushImage(image) {
		let self = this;
		if (image) {
			self.images.push(image); 
		}	
	}

	pushInteraction(inter) {
		let self = this;
		if (inter) {
	    self.interactions.push(inter);	
		}
	
	}

	toJSON() {
		let self = this;
		return {
	    pid: self.pid,
			images: self.images,
			interactions: self.interactions
		};
	}
}

class InteractionDiag extends Interaction {
	constructor(src, tar, type, timestamp, pid, tid, color) {
		super(src, tar, type, timestamp, pid, tid);
		this.color = color || 'blue';
	}

	setColor(color) {
		this.color = color;
	}

	getColor() {
		return this.color;
	}

	toJSON() {
		let json = super.toJSON();
		json.color = this.color;
		return json;
	}
}

/**
 * Line Processor
 *
 */
class LineProcessor{
	constructor () {
		this.ignored = [];
		this.failed = [];
		this.parts = []; 
		this.parsedLineCount = 0;
	}

	static get ELEMENT_TYPES () {
		return [Part, Image, Interaction];	
	}

	static resolveParser(line) {
		let targetParser = null;
		LineProcessor.ELEMENT_TYPES.some(function(parser) {
			if (parser.canParse(line)){
				targetParser = parser;
				return true;
			}
		});
		return targetParser;
	}

	parse(line, callback) {
		let self = this;
		let parser = LineProcessor.resolveParser(line);
		try {

			if (! parser) {
				return Q().then(function() {
					debug('Line-' + line.getPosition() + '(' + path.basename(line.getLogFile()) + ') is ' + colors.yellow.bold('ignored') + ': "' + line.getContent() + '"');
					self.ignored.push(line);
				}).nodeify(callback);	
			}

			let opts = {};
			opts.processor = self;
			return parser.parse(line, opts).then(function(reval) {
				self.parsedLineCount++;
			}).fail(function(error) {
				console.error('Line-' + line.getPosition() + '(' + path.basename(line.getLogFile()) + ') is ' + colors.red.bold('failed to parse by ' + parser.QNAME), error);
				self.failed.push(line);	
			}).nodeify(callback);
		} catch (error) {
			console.error('Line-' + line.getPosition() + '(' + path.basename(line.getLogFile()) + ') is ' + colors.red.bold('failed to get start parsing,  due to: '), error);
			self.failed.push(line);	
			return Q().nodeify(callback);
		}
	}

	getCurrentPart() {
		let self = this;
		if (self.parts.length === 0) {
			return null;	
		}
		return self.parts[self.parts.length - 1];
	}

	pushPart(part) {
	  let self = this;
		self.parts.push(part);
	}

	aggregate() {
		let self = this;
		return {
	    parts: self.parts
		};
	}

	ignoredLines() {
		return this.ignored;
	}

	failedLines() {
    return this.failed;	
	}

	getParsedLineCount() {
    return this.parsedLineCount;	
	}
}

/**
 * Abstract class for  base phased task implementation
 * 
 * For each specific task, the 'getName' method is mandatory to be implemented. For others 3 methods, 
 * either overwrite the methods or just delegate to this basic implementation.  
 *  
 * @param {object} context
 */
class BaseTask {
	constructor (context) {
		this.context = context;
	}

	/**
	 * Get the task name
	 * 
	 * @returns name
	 */
	getName() {
		throw new Error('Unsupported method in abstract base abstract interceptor');
	}

	/**
	 * Invoke for normal action asynchronously
	 * @param {function}, function(error), if error presented, do with error, otherwise, do successfully
	 */
	doAsync(done){
		// do nothing for abstract method
		throw new Error('Unsupported method in abstract base abstract interceptor');
	}

	/**
	 * Invoke for undo action asynchronously
	 * @param {function}, function(error), if error presented, undo with error, otherwise, undo successfully
	 */
	undoAsync(done) {
		// do nothing for abstract method
		throw new Error('Unsupported method in abstract base abstract interceptor');
	}

	/**
	 * Cancel task execution
	 */ 
	cancel() {
		this._cancel = true;
	}

	/**
	 * Check is task cancelled
	 */ 
	isCancelled() {
		return this._cancel;
	} 
}

// timeout to 120 mins
let ASYNC_TIMEOUT = 120*60*1000;

/**
 * Tasks management, add the task by order(phase based task invocation), 
 * control the cursor to indicate current processing task
 */
class TasksMgrt {
	constructor () {
		this.cursor = -1;
		this.tasks = []; 
		this.continueOnError = false;
		this.rootCause = null;
		this._onProcessing = false;
	}

	/**
	 * Static method for task validation
	 */
	static isValidTask(task) {
		if (! task) return false;

		if (!task.getName || 
			!task.doAsync ||
			!task.undoAsync) return false;

		if (!(typeof task.getName === 'function') || 
			!(typeof task.doAsync === 'function') ||
			!(typeof task.undoAsync === 'function')) 
			return false

		return true;
	}

	/**
	 * Add a new task to task list
	 * 
	 * @param {Object}, <Task>
	 */
	addTask(task) {
		if (! TasksMgrt.isValidTask(task)) {
			throw new Error('Invalid Task: ', task);
		}

		this.tasks.push(task);
	}

	/**
	 * Remove task to task list
	 * 
	 * @param {Object}, <Task|string|number>
	 */
	removeTask(task) {
		var expectedKey = null;
		if ('string' === typeof task || 'number === typeof task') {
			expectedKey = task;
		} else {
			if (! TasksMgrt.isValidTask(task)) {
				throw new Error('Invalid Task: ', task);
			}

			expectedKey = task.getName();
		}

		for (var i= this.tasks.length; i >=0; i--) {
			if (this.tasks[i].getName() === expectedKey) {
				this.tasks.splice(i, 1);
			}
		}
	}

	/**
	 * Tell whether has next task in task list
	 *
	 * @return {Boolean}, true|false
	 */
	hasNext() {
		if (this.cursor >= this.tasks.length-1) return false;
		return true;
	}

	/**
	 * Get next task in task list
	 *
	 * @return {Task}, the next task in task queue
	 */
	next() {
		if (! this.hasNext()) return null;

		++this.cursor;
		return this.tasks[this.cursor];
	}

	/**
	 * Tell whether has previous task in task list
	 *
	 * @return {Boolean}, true|false
	 */
	hasPrevious() {
		if (this.cursor <= 0) return false;

		return true;
	}

	/**
	 * Get previous task in task list
	 *
	 * @return {Task}, the next task in task queue
	 */
	previous() {
		if (! this.hasPrevious()) return null;

		--this.cursor;
		return this.tasks[this.cursor];
	}

	/**
	 * Get current task in task list
	 *
	 * @return {Task}, the next task in task queue
	 */
	current () {
		return this.tasks[this.cursor];
	}

	/**
	 * Internal method which call by each task for the task execution navigation
	 *
	 */
	_done(error) {
		let self = this;

		if (error || self.continueOnError) {

			if (! this.continueOnError) {
				this.rootCause = error;
				this.continueOnError = true;
				console.debug('Error occurs for task ' + self.current().getName() +  ' execution, due to: ', error);
				self.current().undoAsync(self._done.bind(self));
				return;
			}

			if (self.hasPrevious()) {
				self.previous().undoAsync(self._done.bind(self));
				return;
			} 
			this._onProcessing = false;
			self.deferred.reject(self.rootCause);
			return;
		}


		if (self.hasNext()) {
			self.next().doAsync(self._done.bind(self));
			return;
		} 

		this._onProcessing = false;
		self.deferred.resolve();	
	}


	/**
	 * Process the tasks asynchronously
	 *
	 * @return {promise}, the result of processing
	 */
	processAsync(context, callback, timeout) {
		let self = this;

		self.deferred = Q.defer();
		// set default promise timeout
		if (! timeout) {
			timeout = ASYNC_TIMEOUT;
		}
		self.deferred.promise.timeout(timeout);

		if (self.hasNext()){
			this._onProcessing = true;
			self.next().doAsync(self._done.bind(self));
		} else {
			self.deferred.reject(new Error('No task registered!'));
		}

		return self.deferred.promise.nodeify(callback);
	}

	getTasks() {
		return this.tasks;
	}

	isOngoing() {
		return this._onProcessing;
	}
}

class SequencingLineParseTask extends BaseTask {

	constructor(context, line) {
    super(context);	
		this.line = line;
	}
	
	undoAsync(done) {
		done();
	}

  doAsync(done) {
		let self = this;
		let processor = self.context.processor;

		return processor.parse(self.line).then(function() {
			done();
		}).fail(function(error) {
			console.error('Failed to perform sequencing-line-parse-task, due to:', error);
			done(error);
		});
	}
}

class SequencingLogFileParseTask extends BaseTask {
	constructor(context, logFile) {
    super(context);	
		this.logFile = logFile;
	}
	
	undoAsync(done) {
		done();
	}

  doAsync(done) {
		let self = this;
		let processor = self.context.processor;

		let slpTaskMgrt = new TasksMgrt(); 
		let subCtx = {processor: processor};

		let rl = readline.createInterface({
			input: fs.createReadStream(self.logFile),
			crlfDelay: Infinity
		});
		let position = 0;

		rl.on('line', function(l){
			position ++;
			let line = new Line(position, self.logFile, l);

			let seqLPT = new SequencingLineParseTask(subCtx, line);
			slpTaskMgrt.addTask(seqLPT);
		});
		
		rl.on('close', function(){
			slpTaskMgrt.processAsync(subCtx, function(error, result) {
				if (error) {
					console.error('Failed to perform sequencing-logfile-parse-task, due to:', error);
			    return  done(error);	
				}

				done();
			});
		});
	}
}

//=========================================================
//                   Main 
//=========================================================

const logs = [];

program
	.version('1.0.0')
	.usage('[options] <logfile> ...')
	.parse(process.argv);

if (! program.args || program.args.length === 0) {
	console.error(colors.red('[Error]: ') + 'Missing arguments of log file(s) to translate!'); 
	program.outputHelp();
	process.exit(1);
}

program.args.forEach(function (logFile) {
	if (path.isAbsolute(logFile)) {
		if (! fs.existsSync(logFile)) {
			console.error(colors.red('[Error]: ') + 'log file does not exist - "' + logFile + '"');	
			program.outputHelp();
			process.exit(1);
		}
		logs.push(logFile);
		return;	
	}
	logFile = path.resolve(process.cwd(), logFile);
	logs.push(logFile);
	if (! fs.existsSync(logFile)) {
		console.error(colors.red('[Error]: ') + 'log file does not exist - "' + logFile + '"');	
		program.outputHelp();
		process.exit(1);
	}
});

console.log('\n*******************************************************');

logs.forEach(function(logfile) {
	console.log('==>  LOG FILE: "' + logfile + '"');
});

console.log('*******************************************************\n\n');


const context = {};
const tm = new TasksMgrt();
const lp =  new LineProcessor();
context.processor = lp;

logs.forEach(function(log) {
	let seqLogfilePT = new SequencingLogFileParseTask(context, log);
	tm.addTask(seqLogfilePT);
});

tm.processAsync(context, function(error, result) {
	console.log('parsed lines: ' + JSON.stringify(lp.aggregate()));
	fs.writeFileSync('out.json', JSON.stringify(lp.aggregate()), 'utf8');
});
