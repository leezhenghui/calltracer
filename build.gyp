{
	'includes': [ './common.gypi' ],
		'targets': [
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
			},
		]
}
