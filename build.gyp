{
	'includes': [ 'common.gypi' ],
		'targets': [
			{
				"target_name": "example",
				"product_name": "example",
				"type": "executable",
				"sources": [
					"./examples/example.c"
				],
				"cflags": [],
				"include_dirs": [
					"include"
				],
				'dependencies': [
					'calltracer',
				   './examples/deps/simplelogger.gyp:simplelogger',
				],
				'configurations': {
					'Debug': {
							"cflags": [
								"-finstrument-functions"
							]
						}	
				}
			},
			{
				"target_name": "calltracer",
				"product_name": "calltracer",
				'type': 'shared_library',
				"sources": [
					"./src/calltracer.c",
					"./src/calltracer.h"
				],
				"cflags": [
					'-fPIC'
				],
				"include_dirs": [
					"include"
				],
				'dependencies': [
				]
			}
		]
}
