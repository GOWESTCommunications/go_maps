<?php

return [
    'ctrl' => [
        'title' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address',
        'label' => 'title',
        'tstamp' => 'tstamp',
        'crdate' => 'crdate',
        'cruser_id' => 'cruser_id',
        'default_sortby' => 'ORDER BY title',
        'versioningWS' => true,
        'origUid' => 't3_origuid',
        'languageField' => 'sys_language_uid',
        'transOrigPointerField' => 'l10n_parent',
        'transOrigDiffSourceField' => 'l10n_diffsource',
        'delete' => 'deleted',
        'enablecolumns' => [
            'disabled' => 'hidden',
            'starttime' => 'starttime',
            'endtime' => 'endtime',
        ],
        'searchFields' => 'title,address,info_window_content,kundennummer',
        'iconfile' => 'EXT:go_maps/Resources/Public/Icons/tx_gomaps_domain_model_address.svg'
    ],
    'interface' => [
        'showRecordFieldList' => 'sys_language_uid, l10n_parent, l10n_diffsource, hidden, title, categories,
                                  configuration_map, latitude, longitude, address, marker, image_size, image_width,
                                  image_height, info_window_content, info_window_images, info_window_link, close_by_click, open_by_click, zweitfiliale',
    ],
    'types' => [
        '0' => [
            'showitem' => '--palette--;;address,
                    --div--;Position,
					--palette--;;data, configuration_map, --pallette--;;marker,
					--div--;LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.info_window,
					info_window_images, --palette--;;link,
					--palette--;LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.palettes.interaction;interaction,
					--div--;LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.others,
					sys_language_uid, l10n_parent, l10n_diffsource, hidden, --palette--;;time,categories',
        ]
    ],
    'palettes' => [
        'address' => ['showitem' => 'title, company, kundennummer, --linebreak--, name, email, --linebreak--, phonenumber, fax, web, --linebreak--, street, housenumber, zip, city, country, zweitfiliale, --linebreak--, description'],
        'data' => ['showitem' => 'latitude, longitude, address'],
        'interaction' => ['showitem' => 'open_by_click, close_by_click, opened'],
        'link' => ['showitem' => 'info_window_link'],
        'marker' => ['showitem' => 'marker, --linebreak--, image_size, image_width, image_height'],
        'time' => ['showitem' => 'starttime, endtime'],
    ],
    'columns' => [
        'sys_language_uid' => [
            'exclude' => 1,
            'label' => 'LLL:EXT:lang/Resources/Private/Language/locallang_general.xlf:LGL.language',
            'config' => [
                'type' => 'select',
                'renderType' => 'selectSingle',
                'special' => 'languages',
                'items' => [
                    [
                        'LLL:EXT:lang/Resources/Private/Language/locallang_general.xlf:LGL.allLanguages',
                        -1,
                        'flags-multiple'
                    ]
                ],
                'default' => 0,
            ],
        ],
        'l10n_parent' => [
            'displayCond' => 'FIELD:sys_language_uid:>:0',
            'exclude' => 1,
            'label' => 'LLL:EXT:lang/Resources/Private/Language/locallang_general.xlf:LGL.l18n_parent',
            'config' => [
                'type' => 'select',
                'renderType' => 'selectSingle',
                'items' => [
                    ['', 0],
                ],
                'foreign_table' => 'tx_gomaps_domain_model_address',
                'foreign_table_where' => 'AND tx_gomaps_domain_model_address.pid=###CURRENT_PID### AND tx_gomaps_domain_model_address.sys_language_uid IN (-1,0)',
            ],
        ],
        'l10n_diffsource' => [
            'config' => [
                'type' => 'passthrough',
            ],
        ],
        't3ver_label' => [
            'label' => 'LLL:EXT:lang/Resources/Private/Language/locallang_general.xlf:LGL.versionLabel',
            'config' => [
                'type' => 'input',
                'size' => 30,
                'max' => 255,
            ]
        ],
        'hidden' => [
            'exclude' => 1,
            'label' => 'LLL:EXT:lang/Resources/Private/Language/locallang_general.xlf:LGL.hidden',
            'config' => [
                'type' => 'check',
            ],
        ],
        'starttime' => [
            'exclude' => 1,
            'allowLanguageSynchronization' => true,
            'label' => 'LLL:EXT:lang/Resources/Private/Language/locallang_general.xlf:LGL.starttime',
            'config' => [
                'type' => 'input',
                'renderType' => 'inputDateTime',
                'size' => 13,
                'eval' => 'datetime',
                'checkbox' => 0,
                'default' => 0,
                'range' => [
                    'lower' => mktime(0, 0, 0, date('m'), date('d'), date('Y'))
                ],
            ],
        ],
        'endtime' => [
            'exclude' => 1,
            'allowLanguageSynchronization' => true,
            'label' => 'LLL:EXT:lang/Resources/Private/Language/locallang_general.xlf:LGL.endtime',
            'config' => [
                'type' => 'input',
                'renderType' => 'inputDateTime',
                'size' => 13,
                'eval' => 'datetime',
                'checkbox' => 0,
                'default' => 0,
                'range' => [
                    'lower' => mktime(0, 0, 0, date('m'), date('d'), date('Y'))
                ],
            ],
        ],
        'title' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.title',
            'config' => [
                'type' => 'input',
                'size' => 30,
                'eval' => 'trim,required'
            ],
        ],
        'subtitle' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.subtitle',
            'config' => [
                'type' => 'input',
                'size' => 30,
                'eval' => 'trim'
            ],
        ],
        'company' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.company',
            'config' => [
                'type' => 'input',
                'size' => 30,
                'eval' => 'trim'
            ],
        ],
        'kundennummer' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.kundennummer',
            'config' => [
                'type' => 'input',
                'size' => 30,
                'eval' => 'trim'
            ],
        ],
        'name' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.name',
            'config' => [
                'type' => 'input',
                'size' => 30,
                'eval' => 'trim'
            ],
        ],
        'email' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.email',
            'config' => [
                'type' => 'input',
                'size' => 30,
                'eval' => 'trim'
            ],
        ],
        'phonenumber' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.phonenumber',
            'config' => [
                'type' => 'input',
                'size' => 30,
                'eval' => 'trim'
            ],
        ],
        'fax' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.fax',
            'config' => [
                'type' => 'input',
                'size' => 30,
                'eval' => 'trim'
            ],
        ],
        'web' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.web',
            'config' => [
                'type' => 'input',
                'size' => 30,
                'eval' => 'trim'
            ],
        ],
        'street' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.street',
            'config' => [
                'type' => 'input',
                'size' => 30,
                'eval' => 'trim'
            ],
        ],
        'housenumber' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.housenumber',
            'config' => [
                'type' => 'input',
                'size' => 5,
                'eval' => 'trim'
            ],
        ],
        'zip' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.zip',
            'config' => [
                'type' => 'input',
                'size' => 5,
                'eval' => 'trim'
            ],
        ],
        'city' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.city',
            'config' => [
                'type' => 'input',
                'size' => 30,
                'eval' => 'trim'
            ],
        ],
        'country' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.country',
            'config' => [
                'type' => 'input',
                'size' => 30,
                'eval' => 'trim'
            ],
        ],
        'zweitfiliale' => [
            'exclude' => 1,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.zweitfiliale',
            'config' => [
                'type' => 'check',
            ],
        ],
        'description' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.description',
            'config' => [
                'type' => 'text',
                'cols' => 40,
                'rows' => 15,
                'eval' => 'trim',
                'enableRichtext' => 1,
                'fieldControl' => [
                    'fullScreenRichtext' => [
                        'disabled' => false,
                    ]
                ]
			],
        ],
        'configuration_map' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.configuration_map',
            'config' => [
                'type' => 'user',
                'userFunc' => Clickstorm\GoMaps\Utility\LocationUtility::class . '->render',
                'parameters' => [
                    'longitude' => 'longitude',
                    'latitude' => 'latitude',
                    'address' => 'address',
                    'street' => 'street',
                    'zip' => 'zip',
                    'city' => 'city',
                ],
            ],
        ],
        'latitude' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.latitude',
            'config' => [
                'type' => 'input',
                'size' => 30,
                'eval' => 'trim,required,' . Clickstorm\GoMaps\Evaluation\Double6Evaluator::class
            ],
        ],
        'longitude' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.longitude',
            'config' => [
                'type' => 'input',
                'size' => 30,
                'eval' => 'trim,required,' . Clickstorm\GoMaps\Evaluation\Double6Evaluator::class
            ],
        ],
        'address' => [
            'exclude' => 0,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.address',
            'config' => [
                'type' => 'input',
                'size' => 30,
                'eval' => 'trim,required'
            ],
        ],
        'marker' => [
            'exclude' => 1,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.marker',
            'config' => \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::getFileFieldTCAConfig(
                'marker',
                [
                    'appearance' => [
                        'createNewRelationLinkTitle' => 'LLL:EXT:cms/locallang_ttc.xlf:images.addFileReference'
                    ],
                    'overrideChildTca' => [
                        'types' => [
                            'foreign_types' => [
                                '0' => [
                                    'showitem' => '
                        --palette--;LLL:EXT:lang/locallang_tca.xlf:sys_file_reference.imageoverlayPalette;imageoverlayPalette,
                        --palette--;;filePalette'
                                ],
                                \TYPO3\CMS\Core\Resource\File::FILETYPE_TEXT => [
                                    'showitem' => '
                        --palette--;LLL:EXT:lang/locallang_tca.xlf:sys_file_reference.imageoverlayPalette;imageoverlayPalette,
                        --palette--;;filePalette'
                                ],
                                \TYPO3\CMS\Core\Resource\File::FILETYPE_IMAGE => [
                                    'showitem' => '
                        --palette--;LLL:EXT:lang/locallang_tca.xlf:sys_file_reference.imageoverlayPalette;imageoverlayPalette,
                        --palette--;;filePalette'
                                ],
                                \TYPO3\CMS\Core\Resource\File::FILETYPE_AUDIO => [
                                    'showitem' => '
                        --palette--;LLL:EXT:lang/locallang_tca.xlf:sys_file_reference.imageoverlayPalette;imageoverlayPalette,
                        --palette--;;filePalette'
                                ],
                                \TYPO3\CMS\Core\Resource\File::FILETYPE_VIDEO => [
                                    'showitem' => '
                        --palette--;LLL:EXT:lang/locallang_tca.xlf:sys_file_reference.imageoverlayPalette;imageoverlayPalette,
                        --palette--;;filePalette'
                                ],
                                \TYPO3\CMS\Core\Resource\File::FILETYPE_APPLICATION => [
                                    'showitem' => '
                        --palette--;LLL:EXT:lang/locallang_tca.xlf:sys_file_reference.imageoverlayPalette;imageoverlayPalette,
                        --palette--;;filePalette'
                                ]
                            ],
                        ]
                    ],
                    'maxitems' => 1
                ],
                $GLOBALS['TYPO3_CONF_VARS']['GFX']['imagefile_ext']
            ),
        ],
        'image_size' => [
            'exclude' => 1,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.image_size',
            'config' => [
                'type' => 'check',
                'default' => 0
            ],
        ],
        'image_width' => [
            'exclude' => 1,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.image_width',
            'config' => [
                'type' => 'input',
                'size' => 4,
                'eval' => 'int'
            ],
        ],
        'image_height' => [
            'exclude' => 1,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.image_height',
            'config' => [
                'type' => 'input',
                'size' => 4,
                'eval' => 'int'
            ],
        ],
        'info_window_content' => [
            'exclude' => 1,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.info_window_content',
            'config' => [
                'type' => 'text',
                'cols' => 40,
                'rows' => 15,
                'eval' => 'trim',
                'enableRichtext' => 1,
                'fieldControl' => [
                    'fullScreenRichtext' => [
                        'disabled' => false,
                    ]
                ]
			],
		],
		'info_window_images' => [
			'exclude' => 1,
			'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.info_window_images',
			'config' => \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::getFileFieldTCAConfig(
				'tx_gomaps_info_window_image',
				[
					'appearance' => [
						'createNewRelationLinkTitle' => 'LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:images.addFileReference'
					],
                    'overrideChildTca' => [
                        'types' => [
                            'foreign_types' => [
                                '0' => [
                                    'showitem' => '
							--palette--;LLL:EXT:lang/Resources/Private/Language/locallang_tca.xlf:sys_file_reference.imageoverlayPalette;imageoverlayPalette,
							--palette--;;filePalette'
                                ],
                                \TYPO3\CMS\Core\Resource\File::FILETYPE_TEXT => [
                                    'showitem' => '
							--palette--;LLL:EXT:lang/Resources/Private/Language/locallang_tca.xlf:sys_file_reference.imageoverlayPalette;imageoverlayPalette,
							--palette--;;filePalette'
                                ],
                                \TYPO3\CMS\Core\Resource\File::FILETYPE_IMAGE => [
                                    'showitem' => '
							--palette--;LLL:EXT:lang/Resources/Private/Language/locallang_tca.xlf:sys_file_reference.imageoverlayPalette;imageoverlayPalette,
							--palette--;;filePalette'
                                ],
                                \TYPO3\CMS\Core\Resource\File::FILETYPE_AUDIO => [
                                    'showitem' => '
							--palette--;LLL:EXT:lang/Resources/Private/Language/locallang_tca.xlf:sys_file_reference.imageoverlayPalette;imageoverlayPalette,
							--palette--;;filePalette'
                                ],
                                \TYPO3\CMS\Core\Resource\File::FILETYPE_VIDEO => [
                                    'showitem' => '
							--palette--;LLL:EXT:lang/Resources/Private/Language/locallang_tca.xlf:sys_file_reference.imageoverlayPalette;imageoverlayPalette,
							--palette--;;filePalette'
                                ],
                                \TYPO3\CMS\Core\Resource\File::FILETYPE_APPLICATION => [
                                    'showitem' => '
							--palette--;LLL:EXT:lang/Resources/Private/Language/locallang_tca.xlf:sys_file_reference.imageoverlayPalette;imageoverlayPalette,
							--palette--;;filePalette'
                                ]
                            ],
                        ]
                    ],
                    'maxitems' => 1
                ],
                $GLOBALS['TYPO3_CONF_VARS']['GFX']['imagefile_ext']
            ),
        ],
        'info_window_link' => [
            'exclude' => 1,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.info_window_link',
            'config' => [
                'type' => 'radio',
                'items' => [
                    [
                        'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.info_window_link.0',
                        0
                    ],
                    [
                        'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.info_window_link.1',
                        1
                    ],
                    [
                        'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.info_window_link.2',
                        2
                    ]
                ],
                'size' => 1,
                'maxitems' => 1,
                'eval' => ''
            ],
        ],
        'close_by_click' => [
            'exclude' => 1,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.close_by_click',
            'config' => [
                'type' => 'check',
                'default' => 0
            ],
        ],
        'open_by_click' => [
            'exclude' => 1,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.open_by_click',
            'config' => [
                'type' => 'check',
                'default' => 0
            ],
        ],
        'opened' => [
            'exclude' => 1,
            'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.opened',
            'config' => [
                'type' => 'check',
                'default' => 0
            ],
        ],
        'map' => [
            'config' => [
                'type' => 'inline',
                'foreign_table' => 'tx_gomaps_domain_model_map',
                'MM' => 'tx_gomaps_map_address_mm',
                'MM_opposite_field' => 'map',
            ],
        ],
    ],
];
