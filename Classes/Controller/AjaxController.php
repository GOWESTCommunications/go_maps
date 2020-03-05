<?php

namespace Clickstorm\GoMaps\Controller;


use Clickstorm\GoMaps\Domain\Repository\AddressRepository;
use Clickstorm\GoMaps\Domain\Repository\MapRepository;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Object\ObjectManager;
use TYPO3\CMS\Extbase\Service\ImageService;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Fluid\View\StandaloneView;
use TYPO3\CMS\Frontend\Controller\TypoScriptFrontendController;
use TYPO3\CMS\Lang\LanguageService;

/***
 *
 * This file is part of the "wohnsinnspreise" Extension for TYPO3 CMS.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 *  (c) 2019 Michael Nußbaumer <m.nussbaumer@go-west.at>, GO.WEST Communications GmbH
 *
 ***/
/**
 * AjaxController
 */
class AjaxController extends \TYPO3\CMS\Extbase\Mvc\Controller\ActionController
{
    
    protected static $jsonCachePath = 'typo3temp/assets/json/go_maps/';
    protected static $jsonMapSchemaFile = 'map-addresses-###UID###-###LANG###.json';
    
    /**
     * AddressRepository
     *
     * @var AddressRepository
     * @inject
     */
    protected $addressRepository= null;
    
    /**
     * MapRepository
     *
     * @var MapRepository
     * @inject
     */
    protected $mapRepository= null;
    
    public function initAjax($request) {
        $this->request = $request;
        $this->objectManager = GeneralUtility::makeInstance(ObjectManager::class);
        $this->addressRepository = $this->objectManager->get(AddressRepository::class);
        $this->mapRepository = $this->objectManager->get(MapRepository::class);
        $this->imageService = GeneralUtility::makeInstance(ImageService::class);
        $this->languageService = $this->objectManager->get(LanguageService::class);
        $this->requrestArguments = $this->request->getQueryParams();
        
        $this->lang = $this->requrestArguments['lang'] ? $this->requrestArguments['lang'] : 'de';
        $this->languageService->init($this->lang);
        
        // initialize TSFE
        if (!is_object($GLOBALS['TSFE'])) {
            $GLOBALS['TSFE'] = GeneralUtility::makeInstance(TypoScriptFrontendController::class, $GLOBALS['TYPO3_CONF_VARS'], $targetPageId, 0);
            $GLOBALS['TSFE']->connectToDB();
            $GLOBALS['TSFE']->initFEuser();
            $GLOBALS['TSFE']->determineId();
            $GLOBALS['TSFE']->initTemplate();
            $GLOBALS['TSFE']->getConfigArray();
            $GLOBALS['TSFE']->initLLvars();
        }
        
        $GLOBALS['TSFE']->config['config']['language'] = $this->lang;
    
        # create cache directory
        GeneralUtility::mkdir_deep(GeneralUtility::getFileAbsFileName(static::$jsonCachePath));
    }
    
    public function createMapJson(ServerRequestInterface $request, ResponseInterface $response) {
        $this->initAjax($request);
    
        $mapQuery = $this->mapRepository->createQuery();
        $mapQuery->getQuerySettings()->setRespectStoragePage(FALSE);
        $mapQuery->setLimit(5);
    
        $allMaps = $mapQuery->execute();
        
        $allAddresses = [];
        foreach ($allMaps as $map) {
            $mapAddresses = [];
            foreach ($map->getAddresses() as $address) {
                $addressIndex = (int)$address->getUid() - 1;
                if(!isset($allAddresses[$addressIndex])) {
                
                    $infoWindowView = $this->getView('Ajax/InfoWindow');
                    $infoWindowView->assign('address', $address);
                    $infoWindowView->assign('map', $map);
                    $infoWindowContent = $infoWindowView->render();
                    
                
                    $mapAddresses[$addressIndex] = $allAddresses[$addressIndex] = [
                        'uid' => $address->getUid(),
                        'title' => $address->getTitle(),
                        'latitude' => number_format($address->getLatitude(), 6, '.', ''),
                        'longitude' => number_format($address->getLongitude(), 6, '.', ''),
                        'address' => $address->getAddress(),
                        'city' => $address->getCity(),
                        'country' => $address->getCountry(),
                        'zip' => $address->getZip(),
                        'imageWidth' => $address->getImageWidth(),
                        'imageHeight' => $address->getImageHeight(),
                        'openByClick' => $address->getOpenByClick() ? 1 : 0,
                        'closeByClick' => $address->getCloseByClick() ? 1 : 0,
                        'opened' => $address->getOpened() ? 1 : 0,
                        'infoWindowContent' => $infoWindowContent,
                        'infoWindowLink' => $address->getInfoWindowLink(),
                    ];
                
                    $markerImgSize = 0;
                    $categories = [];
                    if($markerImg = $address->getMarker()) {
                        $markerImgSize = $address->getImageSize() ? 1 : 0;
                        foreach($address->getCategories() as $cat) {
                            $categories[] = $cat->getUid();
                        }
                    } else {
                        foreach($address->getCategories() as $cat) {
                            if($markerImg = $cat->getGmeMarker()) {
                                $markerImgSize = $cat->getGmeImageSize() ? 1 : 0;
                            }
                        
                            $categories[] = $cat->getUid();
                        }
                    }
                
                    if(is_array($categories)) {
                        $mapAddresses[$addressIndex]['categories'] = implode(',', $categories);
                        $allAddresses[$addressIndex]['categories'] = implode(',', $categories);
                    }
                
                    if($markerImg) {
                        if($imageUid = $markerImg->getUid()) {
                        
                            $markerImg = $this->imageService->getImage($imageUid, null, 1);
                            if($markerImgSize) {
                                $processingInstructions = [
                                    'width' => $address->getImageWidth(),
                                    'height' => $address->getImageHeight() . 'c',
                                ];
                            
                                $markerImg = $this->imageService->applyProcessingInstructions($markerImg, $processingInstructions);
                            }
                            $markerImg = $this->imageService->getImageUri($markerImg, 1);
                        
                            $mapAddresses[$addressIndex]['marker'] = $markerImg;
                            $mapAddresses[$addressIndex]['imageSize'] = $markerImgSize;
                        
                            $allAddresses[$addressIndex]['marker'] = $markerImg;
                            $allAddresses[$addressIndex]['imageSize'] = $markerImgSize;
                        }
                    }
                
                
                } else {
                    $mapAddresses[$addressIndex] = $allAddresses[$addressIndex];
                }
            }
            
            $mapJsonFileName = GeneralUtility::getFileAbsFileName(static::$jsonCachePath . static::$jsonMapSchemaFile);
            $mapJsonFileName = str_replace(['###UID###', '###LANG###'], [$map->getUid(), $this->lang], $mapJsonFileName);
            file_put_contents($mapJsonFileName, json_encode(array_values($mapAddresses)));
        }
    
    
        $allAddressesJsonFileName = GeneralUtility::getFileAbsFileName(static::$jsonCachePath . static::$jsonMapSchemaFile);
        $allAddressesJsonFileName = str_replace(['###UID###', '###LANG###'], ['all', $this->lang], $allAddressesJsonFileName);
        file_put_contents($allAddressesJsonFileName, json_encode(array_values($allAddresses)));
    
    
        return $response;
    }
    
    /**
     * @return StandaloneView
     */
    protected function getView($templateName) {
        
        $layoutPaths = [
            GeneralUtility::getFileAbsFileName('EXT:go_maps/Resources/Private/Layouts'),
            $GLOBALS['TSFE']->tmpl->setup['plugin.']['tx_gomaps.']['view.']['layoutRootPaths.'][10],
        ];
        $partialPaths = [
            GeneralUtility::getFileAbsFileName('EXT:go_maps/Resources/Private/Partials'),
            $GLOBALS['TSFE']->tmpl->setup['plugin.']['tx_gomaps.']['view.']['partialRootPaths.'][10],
        ];
        $templatePaths = [
            GeneralUtility::getFileAbsFileName('EXT:go_maps/Resources/Private/Templates'),
            $GLOBALS['TSFE']->tmpl->setup['plugin.']['tx_gomaps.']['view.']['templateRootPaths.'][10],
        ];
        
        $view = GeneralUtility::makeInstance(StandaloneView::class);
        $view->setLayoutRootPaths($layoutPaths);
        $view->setPartialRootPaths($partialPaths);
        $view->setTemplateRootPaths($templatePaths);
        
        try {
            $view->setTemplate($templateName);
        } catch (InvalidTemplateResourceException $e) {
            // no template $templateName found in given $templatePaths
            exit($e->getMessage());
        }
        
        return $view;
    }
}