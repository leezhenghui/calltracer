{
	'includes': [ '../common.gypi' ],
		'targets': [
			{
				"target_name": "example",
				"product_name": "example",
				"type": "executable",
				"sources": [
					"./example.c",
				],
				"cflags": [],
				"include_dirs": [
					"include",
          './plugins/svc_discover.h',
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
					'../build.gyp:calltracer',
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
        './deps/simplelogger/simplog.h',
        './deps/simplelogger/simplog.c',
      ],
			"include_dirs": [
				"include",
			'./src/calltracer.h',
			],
			'dependencies': [
				'../build.gyp:calltracer',
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
					"./plugins/svc_discover.c",
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
			  './deps/simplelogger',
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
        './plugins/hello_world_en.c'
      ],
			'cflags': [
				 '-fPIC'
			],
			'ldflags': [
			  '-shared'
			],
			'include_dirs': [
        './plugins/hello_world.h',
			  './deps/simplelogger',
			],
			'dependencies': [
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
        './plugins/hello_world_cn.c'
      ],
			'cflags': [
				 '-fPIC'
			],
			'ldflags': [
			  '-shared'
			],
			'include_dirs': [
        './plugins/hello_world.h',
			  './deps/simplelogger',
			],
			'dependencies': [
			],
			'configurations': {
				'Debug': {
					"cflags": [
						"-finstrument-functions"
						]
				}	
			}
    },
		]
}
