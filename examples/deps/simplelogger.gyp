{
  'includes': [ '../../common.gypi' ],
  'targets': [
    {
      'target_name': 'simplelogger',
      'type': 'shared_library',
			'cflags': [
				 '-std=c99',
				 '-fPIC',
				 '-Wimplicit-function-declaration',
			],
      'sources': [
        './simplelogger/simplog.h',
        './simplelogger/simplog.c',
      ],
			'configurations': {
				'Debug': {
					"cflags": [
						"-finstrument-functions"
						]
				}	
			},
    }
  ],
}
