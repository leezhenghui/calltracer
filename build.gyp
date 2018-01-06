{
	'includes': [ 'common.gypi' ],
		'targets': [
			{
				"target_name": "example",
				"product_name": "example",
				"type": "executable",
				"sources": [
					"./examples/example.c",
				],
				"cflags": [],
				"include_dirs": [
					"include",
          './examples/plugins/svc_discover.h',
				],
				'link_settings': {
					'libraries': [
						'-ldl',
						'-pthread',
						]	
				},
				'ldflags': [
					'-rdynamic'
				],
				'dependencies': [
					'calltracer',
					'svc_discover'
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
      'target_name': 'simplelogger',
      'type': 'shared_library',
			'cflags': [
				 '-std=c99',
				 '-fPIC',
				 '-Wimplicit-function-declaration',
			],
      'sources': [
        './examples/deps/simplelogger/simplog.h',
        './examples/deps/simplelogger/simplog.c',
      ],
			"include_dirs": [
				"include",
			'./src/calltracer.h',
			],
			'dependencies': [
				'calltracer',
			],
			'configurations': {
				'Debug': {
					"cflags": [
						"-finstrument-functions"
						]
				}	
			},
    },
    {
      'target_name': 'svc_discover',
      'type': 'static_library',
      'sources': [
					"./examples/plugins/svc_discover.c",
      ],
			'cflags': [
			],
			'link_settings': {
				'libraries': [
					'-ldl'	
					]	
			},
			'ldflags': [
				'-rdynamic'
			],
			'include_dirs': [
			  './examples/deps/simplelogger',
			],
			'dependencies': [
				'simplelogger',
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
			'dependencies': [
				'simplelogger',
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
			'dependencies': [
				'simplelogger',
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
