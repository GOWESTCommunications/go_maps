<?php
defined('TYPO3_MODE') or die();

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::makeCategorizable(
    'go_maps',
    'tx_gomaps_domain_model_address',
    'categories',
    [
        // Set a custom label
        'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.categories',
        // Override generic configuration, e.g. sort by title rather than by sorting
        'fieldConfiguration' => [
            'foreign_table_where' => ' AND sys_category.sys_language_uid IN (-1, 0) ORDER BY sys_category.title ASC',
        ],
        // string (keyword), see TCA reference for details
        'l10n_mode' => 'exclude',
        // list of keywords, see TCA reference for details
        'l10n_display' => 'hideDiff',
    ]
);

$tempCols = [
    'gme_marker' => [
        'exclude' => 1,
        'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.marker',
        'config' => \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::getFileFieldTCAConfig(
            'gme_marker',
            [
                'appearance' => [
                    'createNewRelationLinkTitle' => 'LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:images.addFileReference'
                ],
                'maxitems' => 1,
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
                ]
            ],
            $GLOBALS['TYPO3_CONF_VARS']['GFX']['imagefile_ext']
        ),
    ],
    'gme_image_size' => [
        'exclude' => 1,
        'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.image_size',
        'config' => [
            'type' => 'check',
            'default' => 0
        ],
    ],
    'gme_image_width' => [
        'exclude' => 1,
        'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.image_width',
        'config' => [
            'type' => 'input',
            'size' => 4,
            'eval' => 'int'
        ],
    ],
    'gme_image_height' => [
        'exclude' => 1,
        'label' => 'LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.image_height',
        'config' => [
            'type' => 'input',
            'size' => 4,
            'eval' => 'int'
        ],
    ]
];

// add new fields
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTCAcolumns('sys_category', $tempCols);

// new palette
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addFieldsToPalette(
    'sys_category',
    'gme_marker',
    'gme_marker, --linebreak--, gme_image_size, gme_image_width, gme_image_height',
    ''
);

// add fields
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addToAllTCAtypes(
    'sys_category',
    '--div--;LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:sys_category.tab.map,
	--palette--;LLL:EXT:go_maps/Resources/Private/Language/locallang_db.xlf:tx_gomaps_domain_model_address.palettes.marker;gme_marker'
);
