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
				'link_settings': {
					'libraries': [
						'-ldl'	
						]	
				},
				'ldflags': [
					'-rdynamic'
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
      'target_name': 'helloworld_en',
      'type': 'shared_library',
      'sources': [
        './examples/plugins/hello_world_en.c'
      ],
			'cflags': [
				 '-fPIC'
			],
			'ldflags': [
			  '-shared'
			],
			'include_dirs': [
        './examples/plugins/hello_world.h',
			  './examples/deps/simplelogger',
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
      'target_name': 'helloworld_cn',
      'type': 'shared_library',
      'sources': [
        './examples/plugins/hello_world_cn.c'
      ],
			'cflags': [
				 '-fPIC'
			],
			'ldflags': [
			  '-shared'
			],
			'include_dirs': [
        './examples/plugins/hello_world.h',
			  './examples/deps/simplelogger',
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
