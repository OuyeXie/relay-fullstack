import _ from 'lodash';
import debug from 'debug';
import cheerio from 'cheerio';
import Crawler from './crawler';

const sample = '<!DOCTYPE html>\n' +
  '<html xmlns="http://www.w3.org/1999/xhtml" lang="en" data-placeholder-focus="false">\n' +
  '<head>\n' +
  '<meta http-equiv="Content-Language" content="en" charset="utf-8"/>\n' +
  '<title>408 - 9288 University Crescent, Burnaby &#8212; For Sale @ $499,800 &#124; Zolo.ca</title>\n' +
  '<meta name="description" content="2 bed &#8211; 2 bath &#8211;  home For Sale at $499,800. MLS# R2193442. View 408 - 9288 University Crescent &amp; see 1 photos today!"/>\n' +
  '<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"/>\n' +
  '<meta name="HandheldFriendly" content="True"/>\n' +
  '<meta name="MobileOptimized" content="320"/>\n' +
  '<meta name="robots" content="NOODP, NOYDIR">\n' +
  '<link rel="hub" href="https://pubsubhubbub.appspot.com/"/>\n' +
  '<link rel="self" href="https://www.zolo.ca/rss_new_listings.php" type="application/rss+xml"/>\n' +
  '<link rel="dns-prefetch" href="//photos.zolo.ca">\n' +
  '<link rel="preconnect" href="//photos.zolo.ca">\n' +
  '<link rel="dns-prefetch" href="//www.xstatic.ca">\n' +
  '<link rel="preconnect" href="//www.xstatic.ca">\n' +
  '<link rel="dns-prefetch" href="//www.google-analytics.com">\n' +
  '<link rel="preconnect" href="//www.google-analytics.com">\n' +
  '<style>.async-hide { opacity: 0 !important; }</style>\n' +
  '<script>(function(a,s,y,n,c,h,i,d,e){s.className+=\' \'+y;h.start=1*new Date;\n' +
  '    h.end=i=function(){s.className=s.className.replace(RegExp(\' ?\'+y),\'\')};\n' +
  '    (a[n]=a[n]||[]).hide=h;setTimeout(function(){i();h.end=null},c);h.timeout=c;\n' +
  '    })(window,document.documentElement,\'async-hide\',\'dataLayer\',4000,\n' +
  '    {\'GTM-W6NBFMJ\':true});</script>\n' +
  '<script type="text/javascript">\n' +
  '        (function(i,s,o,g,r,a,m){i[\'GoogleAnalyticsObject\']=r;i[r]=i[r]||function(){\n' +
  '        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\n' +
  '        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\n' +
  '        })(window,document,\'script\',\'//www.google-analytics.com/analytics.js\',\'ga\');\n' +
  '\n' +
  '                ga(\'create\', \'UA-30681610-1\', \'auto\');\n' +
  '        \n' +
  '        /**\n' +
  '         * Global variable that holds specific values for Google Optimize.\n' +
  '         */\n' +
  '        var ZOLO_OPTIMIZE = {};\n' +
  '        ZOLO_OPTIMIZE.flickity = {};\n' +
  '        ZOLO_OPTIMIZE.flickity.autoPlay = 0;\n' +
  '\n' +
  '        \n' +
  '        ZOLO_OPTIMIZE.isGallery = 0;\n' +
  '        ZOLO_OPTIMIZE.pageType = \'Address - Active\';\n' +
  '        ga(\'set\', \'dimension1\', \'Address - Active\');\n' +
  '        \n' +
  '                ga(\'set\', \'dimension2\', \'IDX\');\n' +
  '        ZOLO_OPTIMIZE.listingType = \'IDX\';\n' +
  '        \n' +
  '                ga(\'set\', \'dimension3\', \'Registration State - 3\');\n' +
  '        ZOLO_OPTIMIZE.registrationState = \'Registration State - 3\';\n' +
  '        \n' +
  '                ga(\'require\', \'GTM-W6NBFMJ\');\n' +
  '        \n' +
  '        ga(\'set\', \'contentGroup1\', \'Address - Active\');\n' +
  '\n' +
  '                    // ga(\'set\', \'contentGroup4\', \'Active\');\n' +
  '                // ga(\'set\', \'contentGroup2\', \'Address\');\n' +
  '\n' +
  '        ga(\'send\', \'pageview\');\n' +
  '\n' +
  '            </script>\n' +
  '<meta name="google-site-verification" content="2WoQKxEZ6blET4tNwSiGxzXs6gk2JKU_IHWXk-nNlrs"/>\n' +
  '<meta name="twitter:card" content="gallery"><meta name="twitter:image0" content="https://photos.zolo.ca/408-9288-university-crescent-burnaby-R2193442-1.jpg?2017-09-12+20%3A05%3A00"><meta name="twitter:title" content="408 - 9288 University Crescent, Burnaby &#8212; For Sale @ $499,800"><meta name="twitter:description" content="2 bed - 2 bath -  home For Sale at $499,800. MLS# R2193442. View 408 - 9288 University Crescent &amp; see 1 photos today!"><meta name="twitter:domain" content="zolo.ca"><meta property="og:type" content="place">\n' +
  '<meta property="og:site_name" content="Zolo.ca">\n' +
  '<meta property="og:title" content="408 - 9288 University Crescent, Burnaby &#8212; For Sale @ $499,800">\n' +
  '<meta property="og:description" content="2 bed - 2 bath -  home For Sale at $499,800. MLS# R2193442. View 408 - 9288 University Crescent &amp; see 1 photos today!">\n' +
  '<meta property="place:street_address" content="9288 University Crescent">\n' +
  '<meta property="place:locality" content="Burnaby">\n' +
  '<meta property="place:region" content="BC">\n' +
  '<meta property="place:postal_code" content="V5A 4X7">\n' +
  '<meta property="place:location:latitude" content="49.278141"/>\n' +
  '<meta property="place:location:longitude" content="-122.904091"/>\n' +
  '<meta property="og:url" content="https://www.zolo.ca/burnaby-real-estate/9288-university-crescent/408"><meta property="og:image" content="https://photos.zolo.ca/408-9288-university-crescent-burnaby-R2193442-1.jpg?2017-09-12+20%3A05%3A00"><meta property="og:see_also" content="https://www.zolo.ca/burnaby-real-estate/9229-university-crescent/93"><meta property="og:see_also" content="https://www.zolo.ca/burnaby-real-estate/9025-highland-court/402"><meta property="og:see_also" content="https://www.zolo.ca/burnaby-real-estate/9168-slopes-mews/308"><meta property="og:see_also" content="https://www.zolo.ca/burnaby-real-estate/9877-university-crescent/403"><meta property="og:see_also" content="https://www.zolo.ca/burnaby-real-estate/9222-university-crescent/306"><meta property="og:see_also" content="https://www.zolo.ca/burnaby-real-estate/9250-university-high-street/308"> <link rel="canonical" href="https://www.zolo.ca/burnaby-real-estate/9288-university-crescent/408"/><link rel="alternate" href="android-app://com.ols.zolo/https/www.zolo.ca/burnaby-real-estate/9288-university-crescent/408"/>\n' +
  '<meta name="apple-mobile-web-app-capable" content="yes">\n' +
  '\n' +
  '<meta name="google-play-app" content="app-id=com.ols.zolo">\n' +
  '<link rel="apple-touch-icon" sizes="57x57" href="/apple-touch-icon-57x57.png">\n' +
  '<link rel="apple-touch-icon" sizes="60x60" href="/apple-touch-icon-60x60.png">\n' +
  '<link rel="apple-touch-icon" sizes="72x72" href="/apple-touch-icon-72x72.png">\n' +
  '<link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon-76x76.png">\n' +
  '<link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png">\n' +
  '<link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">\n' +
  '<link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png">\n' +
  '<link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">\n' +
  '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">\n' +
  '<link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32">\n' +
  '<link rel="icon" type="image/png" href="/android-chrome-192x192.png" sizes="192x192">\n' +
  '<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96">\n' +
  '<link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16">\n' +
  '<link rel="manifest" href="/manifest.json">\n' +
  '<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#008fd5">\n' +
  '<meta name="apple-mobile-web-app-title" content="Zolo">\n' +
  '<meta name="application-name" content="Zolo">\n' +
  '<meta name="msapplication-TileColor" content="#282829">\n' +
  '<meta name="msapplication-TileImage" content="/mstile-144x144.png">\n' +
  '<meta name="theme-color" content="#ffffff">\n' +
  '<style type="text/css">\n' +
  '        @font-face {\n' +
  '            font-family: \'Roboto Sub\';\n' +
  '            src:url(\'/font/Roboto-Regular-Sub.woff2?v0.1\') format(\'woff2\'),\n' +
  '            url(\'/font/Roboto-Regular-Sub.woff?v0.1\') format(\'woff\');\n' +
  '            font-weight: normal;\n' +
  '            font-weight: 400;\n' +
  '            font-style: normal;\n' +
  '        }\n' +
  '        @font-face {\n' +
  '            font-family: \'Roboto Full\';\n' +
  '            src:url(\'/font/Roboto-Regular-Sub.woff2?v0.1\') format(\'woff2\'),\n' +
  '            url(\'/font/Roboto-Regular-Sub.woff?v0.1\') format(\'woff\');\n' +
  '            font-weight: normal;\n' +
  '            font-weight: 400;\n' +
  '            font-style: normal;\n' +
  '        }\n' +
  '        @font-face {\n' +
  '            font-family: \'Roboto Full\';\n' +
  '            src:url(\'/font/Roboto-Medium-Sub.woff2?v0.1\') format(\'woff2\'),\n' +
  '            url(\'/font/Roboto-Medium-Sub.woff?v0.1\') format(\'woff\');\n' +
  '            font-weight: 500;\n' +
  '            font-style: normal;\n' +
  '        }\n' +
  '        @font-face {\n' +
  '            font-family: \'FontAwesome\';\n' +
  '            src: url("/font/FontAwesome.woff2?v=1.3") format("woff2"), url("/font/FontAwesome.woff?v=1.3") format("woff");\n' +
  '            font-weight: normal;\n' +
  '            font-style: normal\n' +
  '        }\n' +
  '    </style>\n' +
  '<link href="/css/screen.css?v=7.40.12" rel="stylesheet" type="text/css"/>\n' +
  '<script type="application/ld+json">\n' +
  '[\n' +
  '\n' +
  '\n' +
  '\t{\n' +
  '\t\t"@context" : "http://schema.org",\n' +
  '\t\t"@type" : "WebSite",\n' +
  '\t\t"name" : "Zolo",\n' +
  '\t\t"alternateName" : "Zolo.ca",\n' +
  '\t\t"url" : "https://www.zolo.ca"\n' +
  '\t},\n' +
  '\t{\n' +
  '\t\t"@context" : "http://schema.org",\n' +
  '\t\t"@type" : "Organization",\n' +
  '\t\t"name" : "Zolo",\n' +
  '\t\t"url" : "https://www.zolo.ca",\n' +
  '\t\t"logo": "https://www.zolo.ca/img/zolo-logo-graph.png",\n' +
  '\t\t"sameAs" : [\n' +
  '\t\t\t"https://www.facebook.com/zolocanada",\n' +
  '\t\t\t"https://www.twitter.com/zolocanada",\n' +
  '\t\t\t"https://www.pinterest.com/zolocanada",\n' +
  '\t\t\t"https://www.linkedin.com/company/zolo-canada",\n' +
  '\t\t\t"https://plus.google.com/+ZoloCanada",\n' +
  '\t\t\t"https://www.youtube.com/c/ZoloCanada",\n' +
  '\t\t\t"https://www.instagram.com/zolocanada"\n' +
  '\t\t]\n' +
  '\t}\n' +
  '\n' +
  '\n' +
  '\t,{\n' +
  '\t\t"@context": "http://schema.org",\n' +
  '\t\t"@type": "Residence",\n' +
  '\t\t"address": {\n' +
  '\t\t\t"@type": "PostalAddress",\n' +
  '\t\t\t"streetAddress": "408-9288 University Crescent",\n' +
  '\t\t\t"addressLocality": "Burnaby",\n' +
  '\t\t\t"addressRegion": "BC",\n' +
  '\t\t\t"postalCode": "V5A 4X7"\n' +
  '\t\t}\n' +
  '\t}\n' +
  '  \t\t,{\n' +
  '\t\t"@context": "http://schema.org",\n' +
  '\t\t"@type": "Product",\n' +
  '\t\t"name": "408-9288 University Crescent, Burnaby, BC, V5A 4X7",\n' +
  '\t\t"offers": {\n' +
  '\t\t\t"@type": "Offer",\n' +
  '\t\t\t"price": "499800",\n' +
  '\t\t\t"priceCurrency": "CAD"\n' +
  '\t\t},\n' +
  '\t\t"image": "https://photos.zolo.ca/408-9288-university-crescent-burnaby-R2193442-2.jpg?2017-09-12+20%3A05%3A00"\n' +
  '\t}\n' +
  '\t \n' +
  '  ,{\n' +
  '    "@context": "http://schema.org", \n' +
  '    "@type": "BreadcrumbList",\n' +
  '    "itemListElement": [\n' +
  '    \t{\n' +
  '        "@type": "ListItem",\n' +
  '        "position": 1,\n' +
  '        "item": {\n' +
  '          "@id": "https://www.zolo.ca/",\n' +
  '          "name": "Home",\n' +
  '          "type": "WebPage"\n' +
  '        }\n' +
  '      }\n' +
  '      ,{\n' +
  '        "@type": "ListItem",\n' +
  '        "position": 2,\n' +
  '        "item": {\n' +
  '          "@id": "https://www.zolo.ca/burnaby-real-estate",\n' +
  '          "name": "Burnaby",\n' +
  '          "type": "WebPage"\n' +
  '        }\n' +
  '      }\n' +
  '            ,{\n' +
  '        "@type": "ListItem",\n' +
  '        "position": 3,\n' +
  '        "item":{\n' +
  '          "@id": "https://www.zolo.ca/burnaby-real-estate/simon-fraser-univer",\n' +
  '          "name": "Simon Fraser Univer.",\n' +
  '          "type": "WebPage"\n' +
  '        }\n' +
  '      }\n' +
  '            ,{\n' +
  '        "@type": "ListItem",\n' +
  '        "position": 4,\n' +
  '        "item":{\n' +
  '          "@id": "https://www.zolo.ca/burnaby-real-estate/9288-university-crescent",\n' +
  '          "name": "9288 University Crescent",\n' +
  '          "type": "WebPage"\n' +
  '        }\n' +
  '      }\n' +
  '            ,{\n' +
  '        "@type": "ListItem",\n' +
  '        "position": 5,\n' +
  '        "item": {\n' +
  '          "@id": "https://www.zolo.ca/burnaby-real-estate/9288-university-crescent/408",\n' +
  '          "name": "Unit 408",\n' +
  '          "type": "WebPage"\n' +
  '        }\n' +
  '      }\n' +
  '          ]\n' +
  '  }\n' +
  '\n' +
  '\t\n' +
  ']\n' +
  '</script>\n' +
  '<!--[if IE]>\n' +
  '    <link href="/css/ie.css" rel="stylesheet" type=\'text/css\' />\n' +
  '    <![endif]-->\n' +
  '<script>\n' +
  '        // Required for Lazy Load of Open Sans Custom Webfont\n' +
  '        ;(function( doc ) {\n' +
  '            // IE9+\n' +
  '            if( !( \'geolocation\' in navigator ) ) {\n' +
  '                return;\n' +
  '            }\n' +
  '            var classes = [ "" ];\n' +
  '            // Fonts\n' +
  '            if( localStorage.robotoStageOne && localStorage.robotoStageTwo ) {\n' +
  '                classes.push( "fonts-b-loaded" );\n' +
  '            }\n' +
  '            document.documentElement.className += " " + classes.join( " " );\n' +
  '        })( document );\n' +
  '    </script>\n' +
  '<script>\n' +
  '\t\tvar ZOLO_DATA = {\n' +
  '\t\t\tpageAction: "property",\n' +
  '\t\t\tisListingPage: true,\n' +
  '\t\t\tisResidentialProperty: true,\n' +
  '\t\t\tsarea: "my_location",\n' +
  '\t\t\tmapArea: "9288 University Crescent  Burnaby BC",\n' +
  '\t\t\tpropertyId: "4646042",\n' +
  '\t\t\tpropertyLat: "49.278141",\n' +
  '\t\t\tpropertyLng: "-122.904091",\n' +
  '\t\t\tsearchCity: "burnaby",\n' +
  '\t\t\tsearchNeighborhood: "simon-fraser-univer",\n' +
  '\t\t\thasVirtualTour: false,\n' +
  '\t\t\ttourIsHttpsEnabled: false,\n' +
  '\t\t\tcustomFilterSearch: ""\n' +
  '\t\t}\n' +
  '\t</script> <script type="text/javascript">\n' +
  '\tvar ZOLO = {\n' +
  '\t\tpageAction: function(){ return ZOLO_DATA.pageAction; },\n' +
  '\t\tisListingPage: function(){ return ZOLO_DATA.isListingPage; },\n' +
  '\t\tisResidentialProperty: function(){ return ZOLO_DATA.isResidentialProperty; },\n' +
  '\t\tsarea: function(){ return ZOLO_DATA.sarea; },\n' +
  '\t\tmapArea: function(){ return ZOLO_DATA.mapArea; },\n' +
  '\t\tpropertyId: function(){ return ZOLO_DATA.propertyId; },\n' +
  '\t\tpropertyLat: function(){ return ZOLO_DATA.propertyLat; },\n' +
  '\t\tpropertyLng: function(){ return ZOLO_DATA.propertyLng; },\n' +
  '\t\twhichSearchDrawer: "",\n' +
  '\t\tsearchCity: function(){ return ZOLO_DATA.searchCity; },\n' +
  '\t\tsearchNeighborhood: function(){ return ZOLO_DATA.searchNeighborhood; },\n' +
  '\t\thasVirtualTour: function() { return ZOLO_DATA.hasVirtualTour; },\n' +
  '\t\ttourIsHttpsEnabled: function() { return ZOLO_DATA.tourIsHttpsEnabled; },\n' +
  '\t    customFilterSearch: function() { return ZOLO_DATA.customFilterSearch; }\n' +
  '\t}\n' +
  '\tvar MOBILEDETECT = {\n' +
  '\t\torientation: 0,\n' +
  '\t\tisMobile: false,\n' +
  '\t\tisiOS: false,\n' +
  '\t\tzoloMobile: false,\n' +
  '\t\treadDeviceOrientation: function () {\n' +
  '\t\t\twindow.innerWidth > window.innerHeight ? MOBILEDETECT.orientation = 1 : MOBILEDETECT.orientation = 0;\n' +
  '\t\t\tMOBILEDETECT.checkZoloMobile();\n' +
  '\t\t},\n' +
  '\t\tcheckZoloMobile: function () {\n' +
  '\t\t\tif ( MOBILEDETECT.isMobile && ( ( MOBILEDETECT.isiOS && MOBILEDETECT.orientation === 0 ) || ( !MOBILEDETECT.isiOS && window.innerWidth < 1024 ) || ( MOBILEDETECT.isiOS && MOBILEDETECT.orientation === 1 && window.innerWidth < 1024 ) ) ) {\n' +
  '\t\t\t\tif ( MOBILEDETECT.zoloMobile === false && !ZOLO.isListingPage() ) {\n' +
  '\t\t\t\t\tif ( document.getElementById( \'sarea\' ) instanceof HTMLElement ) {\n' +
  '\t\t\t\t\t\tdocument.getElementById( \'mobile_sarea\' ).value = document.getElementById( \'sarea\' ).value;\n' +
  '\t\t\t\t\t}\n' +
  '\t\t\t\t}\n' +
  '\t\t\t\t// $( \'#home_search_top input.text-input\' ).attr( \'type\', \'hidden\' );\n' +
  '\t\t\t\tMOBILEDETECT.zoloMobile = true;\n' +
  '\t\t\t} else {\n' +
  '\t\t\t\tif ( MOBILEDETECT.zoloMobile === true ) {\n' +
  '\t\t\t\t\tif ( document.getElementById( \'sarea\' ) instanceof HTMLElement ) {\n' +
  '\t\t\t\t\t\tdocument.getElementById( \'sarea\' ).value = document.getElementById( \'mobile_sarea\' ).value;\n' +
  '\t\t\t\t\t}\n' +
  '\t\t\t\t}\n' +
  '\t\t\t\tMOBILEDETECT.zoloMobile = false;\n' +
  '\t\t\t}\n' +
  '\t\t},\n' +
  '\t\tisZoloMobile: function () { return MOBILEDETECT.zoloMobile; }\n' +
  '\t}\n' +
  '\twindow.addEventListener( \'load\', function () { MOBILEDETECT.readDeviceOrientation(); });\n' +
  '\twindow.onresize = MOBILEDETECT.readDeviceOrientation;\n' +
  '\t</script>\n' +
  '<link rel="preload" href="https://www.zolo.ca/img/zolo-logo-mobile.png" as="image" media="(max-width: 768px)">\n' +
  '<link rel="preload" href="https://www.zolo.ca/img/zolo-logo.png" as="image" media="(min-width: 769px)">\n' +
  '</head>\n' +
  '<body class="listing listing-active logged-in preload">\n' +
  '<div class="wrapper">\n' +
  '<header class="header gut xs-flex xs-full-width fill-white xs-z4 xs-relative xs-border-bottom" id="header">\n' +
  '<nav class="nav-top xs-relative xs-flex xs-flex-align-center xs-full-width  container ">\n' +
  '<a href="https://www.zolo.ca/burnaby-real-estate" class="button button--menu button--back button--ripple xs-mr0 md-hide print-hide" style="margin-left: -1.5rem;"><i class="icon icon-arrow-back xs-block" style="font-size: 22px; height: 22px; width: 22px;"></i></a>\n' +
  '<a class="logo xs-flex-shrink-0 xs-mr4 md-mr0 xs-hide md-block" href="https://www.zolo.ca/"><img src="https://www.zolo.ca/img/zolo-logo.png" alt="Canada Real Estate &amp; Homes for Sale - Zolo.ca"></a>\n' +
  '<a class="logo xs-flex-shrink-0 xs-mr2 md-mr0 xs-block md-hide" href="https://www.zolo.ca/" "><img src="https://www.zolo.ca/img/zolo-logo-mobile.png" alt="Canada MLS"></a>\n' +
  '<div class="nav-top-search min-width-0 xs-full-width xs-relative xs-flex xs-flex-align-center md-hide print-hide">\n' +
  '<div class="xs-flex xs-flex-align-center truncate xs-border rounded xs-px1 xs-full-width shadow-1 drawer-location-toggle">\n' +
  '<div class="xs-py1 truncate xs-text-5 xs-full-width">Burnaby <span class="xs-hide sm-inline">Real Estate</span></div><i class="icon icon-keyboard-arrow-down xs-ml1 text-secondary"></i>\n' +
  '</div>\n' +
  '<div class="nav-top-actions xs-ml1 nowrap" style="margin-right:-1rem;">\n' +
  '<button class="button button--small button--menu button--stacked text-6 drawer-share-toggle"><i class="icon icon-share" style="font-size: 22px; height: 22px; width: 22px;"></i></button>\n' +
  '<button class="button button--small button--menu button--stacked button--save-home active" data-favorite="4646042"><i class="icon icon-favorite-outline" style="font-size: 22px; height: 22px; width: 22px;"></i></button>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="nav-menu xs-hide md-flex xs-flex-align-center xs-flex-shrink-1 xs-full-width xs-ml3">\n' +
  '<a href="https://www.zolo.ca/" class="button button--menu button--small">Find a Home</a>\n' +
  '<a href="https://www.zolo.ca/how-much-is-my-home-worth" class="button button--menu button--small">What\'s My Home Worth?</a>\n' +
  '<a href="https://www.zolo.ca/jobs" class="button button--menu button--small">Join Our Team!</a>\n' +
  '<div class="xs-ml-auto dropdown" style="height:40px;">\n' +
  '<button class="button button--menu button-icon-40" data-toggle="dropdown"><i class="icon icon-favorite"></i></button>\n' +
  '<ul class="dd-list list-unstyled dropdown-menu pull-right xs-pl1">\n' +
  '<li class="dd-list-item xs-full-width">\n' +
  '<a class="button button--dd xs-full-width xs-text-left xs-flex xs-flex-align-center" href="https://www.zolo.ca/index.php?ssid=203208&s_r=1&attributes=&has_photos=0&ptype_townhouse=1&ptype_condo=1&ptype_house=1&stype=&min_price=400000&max_price=1000000&min_beds=2&min_baths=0&min_sqft=0&openhouse_search=0&filter=1&sarea=Vancouver" rel="nofollow">\n' +
  '<div class="truncate xs-mr3">\n' +
  '<span>Vancouver</span>\n' +
  '<div class="xs-text-6 text-secondary">\n' +
  'House/Condo/Townhouse, 2bd, $400k-1000000 </div>\n' +
  '</div><span class="badge badge--small fill-blue text-primary-inverse xs-ml-auto">43</span></a>\n' +
  '</li>\n' +
  '<li class="dd-list-item xs-full-width">\n' +
  '<a class="button button--dd xs-full-width xs-text-left xs-flex xs-flex-align-center" href="https://www.zolo.ca/index.php?ssid=209197&s_r=1&attributes=&has_photos=0&ptype_townhouse=1&ptype_condo=1&ptype_house=1&stype=&min_price=400000&max_price=500000&min_beds=2&min_baths=0&min_sqft=0&openhouse_search=0&filter=1&sarea=Sfu" rel="nofollow">\n' +
  '<div class="truncate xs-mr3">\n' +
  '<span>Sfu</span>\n' +
  '<div class="xs-text-6 text-secondary">\n' +
  'House/Condo/Townhouse, 2bd, $400k-500k </div>\n' +
  '</div><span class="badge badge--small fill-blue text-primary-inverse xs-ml-auto">0</span></a>\n' +
  '</li>\n' +
  '<li class="dd-list-item xs-full-width">\n' +
  '<a class="button button--dd xs-full-width xs-text-left xs-flex xs-flex-align-center" href="https://www.zolo.ca/index.php?ssid=205910&s_r=1&attributes=&has_photos=0&ptype_townhouse=1&ptype_condo=1&ptype_house=1&stype=&min_price=400000&max_price=600000&min_beds=2&min_baths=0&min_sqft=0&openhouse_search=0&filter=1&sarea=Sfu" rel="nofollow">\n' +
  '<div class="truncate xs-mr3">\n' +
  '<span>Sfu</span>\n' +
  '<div class="xs-text-6 text-secondary">\n' +
  'House/Condo/Townhouse, 2bd, $400k-600k </div>\n' +
  '</div><span class="badge badge--small fill-blue text-primary-inverse xs-ml-auto">1</span></a>\n' +
  '</li>\n' +
  '<li class="dd-list-item xs-full-width xs-mt1">\n' +
  '<a class="button button--dd xs-full-width xs-text-left xs-flex xs-flex-align-center" href="https://www.zolo.ca/account/saved-searches" rel="nofollow">\n' +
  '<div class="truncate xs-mr3">\n' +
  '<span>1 More Saved Searches</span>\n' +
  '</div><i class="icon icon-keyboard-arrow-right text-muted xs-ml-auto" style="font-size:24px;height:24px;width:24px;"></i></a>\n' +
  '</li>\n' +
  '<li>\n' +
  '<hr class="xs-my1">\n' +
  '</li>\n' +
  '<li class="dd-list-item xs-full-width">\n' +
  '<a class="button button--dd xs-full-width xs-text-left xs-flex xs-flex-align-center" href="https://www.zolo.ca/account/favorites" rel="nofollow">\n' +
  '<div class="truncate xs-mr3">\n' +
  '<span>Saved Homes</span>\n' +
  '</div><span class="badge badge--small fill-blue text-primary-inverse xs-ml-auto">26</span></a>\n' +
  '</li>\n' +
  '</ul>\n' +
  '</div>\n' +
  '<a href="https://www.zolo.ca/account/notifications" class="menu-alerts button button--menu button--alert button-icon-40 xs-relative xs-ml1" rel="nofollow"><i class="icon icon-notifications"></i><div class="button--alert-count fill-orange text-white bold circle xs-text-center xs-inline-block"></div></a>\n' +
  '<a class="button button--menu button-icon-40 xs-relative xs-ml1" href="https://www.zolo.ca/account/settings"><i class="icon icon-settings"></i></a>\n' +
  '</div>\n' +
  '</nav>\n' +
  '</header>\n' +
  '<section class="listing-primary xs-flex xs-flex-column">\n' +
  '<section class="listing-details fill-white xs-border-bottom xs-flex-order-2 md-px3">\n' +
  '<div class="container">\n' +
  '<div class="listing-location sm-px2 sm-py3 md-px0 xs-flex xs-flex-column sm-flex-row xs-text-center sm-text-left xs-col-12 md-col-8 fill-white">\n' +
  '<div class="listing-location-address xs-p2 xs-mb1 sm-m0 sm-p0 xs-flex-order-1 sm-flex-grow-1 min-width-0 bold">\n' +
  '<h1 class="address xs-text-3 sm-text-2 truncate">408 - 9288 University Crescent</h1>\n' +
  '<div class="area xs-text-5 sm-text-4 text-secondary truncate"><a href="https://www.zolo.ca/burnaby-real-estate" class="link-secondary">Burnaby</a>, <a href="https://www.zolo.ca/burnaby-real-estate/simon-fraser-univer" class="link-secondary">Simon Fraser Univer.</a></div>\n' +
  '</div>\n' +
  '<div class="listing-price xs-p2 xs-mt2 sm-m0 sm-px3 sm-py0 sm-text-right xs-border-top-lighter sm-border-top-none sm-border-right-lighter xs-flex-shrink-0 xs-flex-order-3 sm-flex-order-2">\n' +
  '<div class="listing-price-value xs-text-2 bold xs-inline-block">\n' +
  '<span class="priv">\n' +
  '499,800 </span>\n' +
  '</div>\n' +
  '<div class="xs-text-5 sm-text-4 xs-inline-block sm-block xs-ml2 sm-ml0 text-red bold nowrap">\n' +
  '<span class="priv">For Sale</span>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="listing-data-summary sm-pl3 xs-mx-auto xs-flex-shrink-0 xs-flex-order-2 sm-flex-order-3 xs-text-center">\n' +
  '<div class="listing-values-bedrooms xs-inline-block">\n' +
  '<div class="listing-values-item-icon xs-text-2 xs-line-height-28">\n' +
  '<i class="icon icon-hotel"></i>\n' +
  '</div>\n' +
  '<div class="listing-values-item xs-text-5 sm-text-4 text-secondary bold nowrap">\n' +
  '<span class="priv">2</span>\n' +
  'Bed\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="listing-values-bathrooms xs-inline-block xs-mx4 md-mr0 md-ml3">\n' +
  '<div class="listing-values-item-icon xs-text-2 xs-line-height-28">\n' +
  '<i class="icon icon-shower"></i>\n' +
  '</div>\n' +
  '<div class="listing-values-item xs-text-5 sm-text-4 text-secondary bold nowrap">\n' +
  '<span class="priv">2</span>\n' +
  'Bath\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="listing-values-list-time xs-inline-block md-hide md-ml3">\n' +
  '<div class="listing-values-item-icon xs-text-2 xs-line-height-28">\n' +
  '<i class="icon icon-watch"></i>\n' +
  '</div>\n' +
  '<div class="listing-values-item xs-text-5 sm-text-4 text-secondary bold nowrap">\n' +
  '<span class="priv">43</span> Days\n' +
  '</div>\n' +
  '</div>\n' +
  ' </div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</section>\n' +
  '<section class="listing-photos xs-relative xs-flex-order-1 md-border-bottom fill-grey-bg-2">\n' +
  '<div class="carousel-multi js-remove-onload">\n' +
  '<div class="carousel-cell xs-aspect-3-2 xs-absolute">\n' +
  '<figure>\n' +
  '<div class="listing-slider-content-photo bg-center bg-cover aspect-content listing-slider-content-photo-main" style="background-image: url(https://photos.zolo.ca/408-9288-university-crescent-burnaby-R2193442-1.jpg?2017-09-12+20%3A05%3A00);"></div>\n' +
  '<figcaption>For Sale: 408 - 9288 University Crescent, Burnaby, BC | 2 Bed, 2 Bath Condo for $499,800. See 1 photos!</figcaption>\n' +
  '</figure>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="carousel carousel-fade carousel-multi is-hidden xs-aspect-3-2 js-carousel">\n' +
  '<div class="carousel-cell-wrapper xs-absolute">\n' +
  '<div class="carousel-cell   xs-aspect-3-2">\n' +
  '<div class="listing-slider-content-photo bg-center bg-cover aspect-content listing-slider-content-photo-main " data-flickity-bg-lazyload="https://photos.zolo.ca/408-9288-university-crescent-burnaby-R2193442-1.jpg?2017-09-12+20%3A05%3A00"></div>\n' +
  '</div>\n' +
  '<div class="carousel-cell listing-map-mini xs-aspect-3-2 xs-hide md-block xs-fullscreen-hide no-resize">\n' +
  '<a href="#drawer-map" class="listing-slider-content-photo bg-center bg-cover aspect-content listing-slider-content-photo-main" data-flickity-bg-lazyload="//maps.googleapis.com/maps/api/staticmap?key=AIzaSyAj59gMnWGKRVf0zlM9cJaS3UOlrdPO9D0&center=9288%20University%20Crescent%20%20Burnaby%20BC&zoom=13&scale=1&size=600x400&maptype=roadmap&format=png&visual_refresh=true&style=feature:all%7celement:geometry.fill%7csaturation:-100&style=feature:all%7celement:labels.text.fill%7csaturation:-100%7ccolor:0x444444&style=feature:landscape.man_made%7celement:geometry%7cvisibility:on%7cgamma:1%7cweight:1&style=feature:landscape.man_made%7celement:geometry%7csaturation:-100%7clightness:70%7cgamma:0.80&style=feature:landscape.natural%7celement:all%7cvisibility:simplified&style=feature:landscape.natural%7celement:geometry.fill%7ccolor:0xf2f2f2&style=feature:road%7celement:all%7csaturation:-100%7clightness:45%7cvisibility:simplified&style=feature:road.highway%7celement:all%7cvisibility:simplified&style=feature:water%7celement:all%7cvisibility:simplified&style=feature:water%7celement:geometry%7ccolor:0x46bcec&style=feature:poi%7celement:all%7cvisibility:off&style=feature:poi.park%7celement:geometry.fill%7cvisibility:on%7ccolor:0xebefeb&style=feature:transit%7celement:all%7cvisibility:off"></a>\n' +
  '<img class="map-marker pointer-events-none xs-absolute js-img-defer" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-img-defer-src="/img/map-pin-main-accent.png"/>\n' +
  '</div>\n' +
  '<div class="carousel-cell text-white xs-text-center xs-aspect-3-2 logged-out-hide no-resize js-flickity-contact-us-cell">\n' +
  '<div class="listing-slider-content-text aspect-content fill-primary xs-flex xs-flex-align-center xs-flex-justify-center">\n' +
  '<div class="marketing-content">\n' +
  '<h3 class="bold sm-mb1 sm-text-2">Tour this home with Zolo</h3>\n' +
  '<h5 class="xs-hide sm-block sm-text-3">It\'s an open house built around your schedule</h5>\n' +
  '<div class="marketing-content-cta-form xs-mt3"><a href="#contact_us" class="button js-carousel-fullscreen-close">Schedule a Showing</a></div>\n' +
  '<div class="marketing-content-cta-phone xs-mt3">\n' +
  '<a href="Tel:+17784021876" class="link-white" onclick="ga(\'send\', {\n' +
  '  hitType: \'event\',\n' +
  '  eventCategory: \'listing\',\n' +
  '  eventAction: \'call\',\n' +
  '  eventLabel: \'\'\n' +
  '  });">778 402-1876</a>\n' +
  '</div>\n' +
  ' </div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="carousel-fullscreen-header xs-fixed xs-t0 xs-l0 xs-r0 xs-z4 xs-p3 text-white fill-primary xs-hide sm-fullscreen-block clearfix xs-pr6">\n' +
  '<div class="col xs-col-8">\n' +
  '<div class="xs-inline-block bold xs-text-3 xs-mr2">$499,800</div>\n' +
  '<div class="xs-inline-block xs-mr2">2 bed</div>\n' +
  '<div class="xs-inline-block xs-mr2">2 bath</div>\n' +
  '<div class="xs-inline-block">920 ft<sup>2</sup></div>\n' +
  '</div>\n' +
  '<div class="col xs-col-4 xs-text-right xs-pr3">\n' +
  '<a href="#contact_us" class="button button--small button--action js-carousel-fullscreen-close js-flickity-contact-us">Contact Agent</a>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="button button--transparent-icon button-icon-50 button--resize circle logged-out-hide print-hide js-carousel-resize">\n' +
  '<i class="icon icon-fullscreen xs-fullscreen-hide"></i>\n' +
  '<i class="icon icon-close xs-hide xs-fullscreen-block"></i>\n' +
  '</div>\n' +
  '</div>\n' +
  '\n' +
  '\n' +
  '\n' +
  '\n' +
  '</section>\n' +
  '</section>\n' +
  '<section id="listing" class="gut md-py3">\n' +
  '<div class="container md-flex clearfix">\n' +
  '<section class="listing-map-mini xs-relative xs-aspect-3-2 sm-aspect-3-1 xs-border-bottom md-hide xs-gut-neg drawer-map-toggle print-hide">\n' +
  '<img class="listing-map-mini-wrapper aspect-content object-fit-cover xs-full-width xs-full-height js-listing-map-mini-wrapper js-img-defer" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-img-defer-src="/img/map-fallback.png"/>\n' +
  '<img class="map-marker pointer-events-none xs-absolute js-img-defer" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-img-defer-src="/img/map-pin-main-accent.png"/>\n' +
  '</section>\n' +
  '<div class="main-column col xs-col-12 md-col-8">\n' +
  '<section class="md-mb3 xs-hide md-block print-hide">\n' +
  '<a href="https://www.zolo.ca/" class="button button--mono">\n' +
  '<i class="icon icon-arrow-back md-mr1"></i>Back to Search\n' +
  '</a>\n' +
  '<div class="dropdown listing-actions-share xs-float-right">\n' +
  '<a href="#share" class="button button--mono"><i class="icon icon-share md-mr1 pointer-events-none"></i>Share</a>\n' +
  '<div class="dropdown-menu pull-right" id="share-home">\n' +
  '<a href="/cdn-cgi/l/email-protection#eed1bd9b8c848b8d9ad3b4818281cbddafcbdcdedaded6cbdcdec3cbdcded7dcd6d6cebb8087988b9c9d879a97cead9c8b9d8d8b809ac2cbdcdeac9b9c808f8c97c8ac818a97d3a7cbdcde998f809a8b8acbdcde9a81cbdcde9d868f9c8bcbdcde9a86879dcbdcde8681838bcbdcde99879a86cbdcde97819bcbddafcbdeaf869a9a9e9dcbddafcbdca8cbdca8999999c094818281c08d8fcbdca88c9b9c808f8c97c39c8b8f82c38b9d9a8f9a8bcbdca8d7dcd6d6c39b8087988b9c9d879a97c38d9c8b9d8d8b809acbdca8daded6" class="button button--dd xs-full-width xs-text-left"><i class="icon-email xs-mr1"></i> Email</a>\n' +
  '<a href="#" class="button button--dd xs-full-width xs-text-left" data-social="{&quot;type&quot;:&quot;facebook&quot;, &quot;url&quot;:&quot;https://www.zolo.ca/burnaby-real-estate/9288-university-crescent/408&quot;, &quot;text&quot;: &quot;What do you think about this 2 bed Apartment/Condo at 9288 University Crescent, Burnaby I found on Zolo.ca for  $499,800&quot;}"><i class="icon-facebook link-facebook xs-mr1"></i> Facebook</a>\n' +
  '<a href="#" class="button button--dd xs-full-width xs-text-left" data-social="{&quot;type&quot;:&quot;twitter&quot;, &quot;url&quot;:&quot;https://www.zolo.ca/burnaby-real-estate/9288-university-crescent/408&quot;, &quot;text&quot;: &quot;What do you think about this 2 bed Apartment/Condo in Burnaby for $499,800?&quot;, &quot;hashtags&quot;: &quot;Burnaby,Homes,Zolo&quot;}"><i class="icon-twitter link-twitter xs-mr1"></i> Twitter</a>\n' +
  '<a href="#" class="button button--dd xs-full-width xs-text-left" data-social="{&quot;type&quot;:&quot;pinterest&quot;, &quot;url&quot;:&quot;https://www.zolo.ca/burnaby-real-estate/9288-university-crescent/408&quot;, &quot;text&quot;: &quot;What do you think about this 2 bed Apartment/Condo at 9288 University Crescent, Burnaby I found on http://www.zolo.ca for $499,800?&quot;, &quot;image&quot;: &quot;https://www.xstatic.ca/home_photos/42/4646042/1.jpg&quot;}"><i class="icon-pinterest link-pinterest xs-mr1"></i> Pinterest</a>\n' +
  '</div>\n' +
  '</div>\n' +
  '<button class="xs-float-right xs-mr1 button button--mono button--save-home active" data-favorite="4646042">\n' +
  '<i class="icon icon-favorite-outline xs-mr1"></i>Save\n' +
  '</button>\n' +
  '</section>\n' +
  '<section class="section-listing section-listing-pad">\n' +
  '<h3 class="section-listing-title print-hide">Key Facts</h3>\n' +
  '<div class="section-listing-content">\n' +
  '<div class="column-container section-listing-content-pad">\n' +
  '<dl class="column">\n' +
  '<dt class="column-label">Mortgage <small>(est)</small></dt>\n' +
  '<dd class="column-value"><span class="priv">$1,744 <small>/mo</small> <a href="#mortgage-rates" class="mortgage-calc-jump" onclick="calculate_monthly_payment();"><i class="icon icon-calculator"></i></a></span></dd>\n' +
  '</dl>\n' +
  '<dl class="column">\n' +
  '<dt class="column-label">Taxes</dt>\n' +
  '<dd class="column-value"><span class="priv">$1,308<small> /yr</small></span></dd>\n' +
  '</dl>\n' +
  '<dl class="column">\n' +
  '<dt class="column-label">Strata Fees</dt>\n' +
  '<dd class="column-value">\n' +
  '<span class="priv">\n' +
  '$368 <small>/mo</small> </span>\n' +
  '</dd>\n' +
  '</dl>\n' +
  '<dl class="column">\n' +
  '<dt class="column-label">Type</dt>\n' +
  '<dd class="column-value"><span class="priv">Apartment/Condo</span></dd>\n' +
  '</dl>\n' +
  '<dl class="column">\n' +
  '<dt class="column-label">Style</dt>\n' +
  '<dd class="column-value"><span class="priv"><a href="#contact_us" class="button button--mono button--mini">Contact Us</a></span></dd>\n' +
  '</dl>\n' +
  '<dl class="column">\n' +
  '<dt class="column-label">Size</dt>\n' +
  '<dd class="column-value"><span class="priv">920 ft<sup>2</sup></span></dd>\n' +
  '</dl>\n' +
  '<dl class="column">\n' +
  '<dt class="column-label">Year Built</dt>\n' +
  '<dd class="column-value"><span class="priv">2004</span></dd>\n' +
  '</dl>\n' +
  '<dl class="column">\n' +
  '<dt class="column-label">Pets</dt>\n' +
  '<dd class="column-value"><span class="priv"><a href="#contact_us" class="button button--mono button--mini">Contact Us</a></span></dd>\n' +
  '</dl>\n' +
  '<dl class="column">\n' +
  '<dt class="column-label">Walkscore</dt>\n' +
  '<dd class="column-value">55</dd>\n' +
  '</dl>\n' +
  '<dl class="column">\n' +
  '<dt class="column-label">MLS&reg;</dt>\n' +
  '<dd class="column-value"><span class="priv">R2193442</span></dd>\n' +
  '</dl>\n' +
  '<dl class="column">\n' +
  '<dt class="column-label">Updated</dt>\n' +
  '<dd class="column-value last-updated">Sep 12, 2017 <span class="time">3:05 pm</span></dd>\n' +
  '</dl>\n' +
  '<dl class="column">\n' +
  '<dt class="column-label">Days on Market</dt>\n' +
  '<dd class="column-value"><span class="priv">43</span></dd>\n' +
  '</dl>\n' +
  '</div>\n' +
  '</div>\n' +
  '</section>\n' +
  '<section class="listing-agent-print xs-border-top-lighter xs-pt2">\n' +
  '<span class="listing-agent-print--title bold xs-inline-block xs-mr2">Your REALTOR<sup>&reg;</sup></span>\n' +
  '<span class="listing-agent-print--name xs-inline-block xs-mr2">Barry Allen (Van)</span>\n' +
  '<span class="xs-inline-block xs-mr2"><a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="2e6c4f5c5c57006f42424b4003584f40004b6e54414241004d4f">[email&#160;protected]</a></span>\n' +
  '<span class="xs-inline-block">778 402-1876</span>\n' +
  '</section>\n' +
  '<section class="section-listing section-listing-pad expandable">\n' +
  '<h3 class="section-listing-title">About</h3>\n' +
  '<div class="section-listing-content">\n' +
  '<div class="section-listing-content-pad xs-relative xs-overflow-hidden expandable-target expandable-target-long expandable-fade">\n' +
  '<span class="priv">\n' +
  ' <p> INVESTOR ALERT! Apartment with legal suite to rent. One Bedroom & Den suit (can be rented $1500/m) + Bachelor suite(can be rented $750/m) with separate entrance.south facing with spectacular view! Pre-paid leasehold property expiring 2102.walking distance to SFU. Open house Sunday 2-4 pm</p>\n' +
  '<hr/>\n' +
  '<p>This apartment/condo home located at 9288 University Crescent, Burnaby is currently for sale and has been available on Zolo.ca for 43 days. This property is listed at $499,800 with an estimated mortgage of $1,757* per month. It has 2 beds, 2 bathrooms, and is 920 square feet. The property was built in 2004. 9288 University Crescent is in the <a href="https://www.zolo.ca/burnaby-real-estate/simon-fraser-univer">Simon Fraser Univer.</a> neighborhood <a href="https://www.zolo.ca/burnaby-real-estate">Burnaby</a>. <a href="https://www.zolo.ca/burnaby-real-estate/sperling-duthie">Sperling Duthie</a>, <a href="https://www.zolo.ca/burnaby-real-estate/montecito">Montecito</a> and <a href="https://www.zolo.ca/burnaby-real-estate/westridge-bn">Westridge BN</a> are nearby neighborhoods. </p> </span>\n' +
  '<section class="section-open-houses xs-mt5 md-my5">\n' +
  '<h3 class="bold xs-mb3">408 - 9288 University Crescent Open House</h3>\n' +
  '<p>We do not have information on any open houses currently scheduled.</p>\n' +
  '<div class="xs-mt3">\n' +
  '<a class="button button--action shadow-1" href="#InputFullname">Schedule a Private Tour</a>\n' +
  '</div>\n' +
  '</section>\n' +
  '<div class="listing-agent-print">\n' +
  'Listed By: Nu Stream Realty Inc. </div>\n' +
  '</div>\n' +
  '<button class="expandable-toggle button button--mono xs-block xs-mx-auto xs-mb3 md-mb0 print-hide" style="width:50%;"></button>\n' +
  '</div>\n' +
  '</section>\n' +
  '<section class="section-listing section-listing-pad acc md-acc-open">\n' +
  '<input id="acc-listing-details" type="checkbox" class="acc-input">\n' +
  '<span class="acc-icon xs-text-2"></span>\n' +
  '<label for="acc-listing-details" class="acc-label section-listing-title">Full Details</label>\n' +
  '<article class="section-listing-content acc-content">\n' +
  '<h4 class="column-title bold xs-mb2">Property</h4>\n' +
  '<div class="column-container">\n' +
  '<div class="column">\n' +
  '<div class="column-label">Type</div>\n' +
  '<div class="column-value"><span class="priv">Residential Attached</span></div>\n' +
  '</div><div class="column">\n' +
  '<div class="column-label">Building Type</div>\n' +
  '<div class="column-value"><span class="priv">Apartment/Condo</span></div>\n' +
  '</div><div class="column">\n' +
  '<div class="column-label">Ownership</div>\n' +
  '<div class="column-value"><span class="priv">Leasehold prepaid-Strata</span></div>\n' +
  '</div><div class="column">\n' +
  '<div class="column-label">Size (sq ft)</div>\n' +
  '<div class="column-value"><span class="priv">920</span></div>\n' +
  '</div><div class="column">\n' +
  '<div class="column-label">Year Built</div>\n' +
  '<div class="column-value"><span class="priv">2004</span></div>\n' +
  '</div><div class="column">\n' +
  '<div class="column-label">Age</div>\n' +
  '<div class="column-value"><span class="priv">13</span></div>\n' +
  '</div>\n' +
  '</div><h4 class="column-title bold xs-mb2">Inside</h4>\n' +
  '<div class="column-container">\n' +
  '<div class="column">\n' +
  '<div class="column-label">Levels</div>\n' +
  '<div class="column-value"><span class="priv">4</span></div>\n' +
  '</div><div class="column">\n' +
  '<div class="column-label">Bedrooms</div>\n' +
  '<div class="column-value"><span class="priv">2</span></div>\n' +
  '</div><div class="column">\n' +
  '<div class="column-label">Full Bathrooms</div>\n' +
  '<div class="column-value"><span class="priv">2</span></div>\n' +
  '</div><div class="column">\n' +
  '<div class="column-label">Half Bathrooms</div>\n' +
  '<div class="column-value"><span class="priv">0</span></div>\n' +
  '</div><div class="column">\n' +
  '<div class="column-label">Fireplaces</div>\n' +
  '<div class="column-value"><span class="priv">1</span></div>\n' +
  '</div>\n' +
  '</div><h4 class="column-title bold xs-mb2">Building</h4>\n' +
  '<div class="column-container">\n' +
  '<div class="column">\n' +
  '<div class="column-label">View</div>\n' +
  '<div class="column-value"><span class="priv">Yes</span></div>\n' +
  '</div><div class="column">\n' +
  '<div class="column-label">View Description</div>\n' +
  '<div class="column-value"><span class="priv">FRASER RIVER</span></div>\n' +
  '</div>\n' +
  '</div><h4 class="column-title bold xs-mb2">Fees</h4>\n' +
  '<div class="column-container">\n' +
  '<div class="column">\n' +
  '<div class="column-label">Taxes</div>\n' +
  '<div class="column-value"><span class="priv">1308.15</span></div>\n' +
  '</div><div class="column">\n' +
  '<div class="column-label">Tax year</div>\n' +
  '<div class="column-value"><span class="priv">2016</span></div>\n' +
  '</div><div class="column">\n' +
  '<div class="column-label">Strata Fees</div>\n' +
  '<div class="column-value"><span class="priv">367.96</span></div>\n' +
  '</div>\n' +
  '</div><h4 class="column-title bold xs-mb2">Land</h4>\n' +
  '<div class="column-container">\n' +
  '<div class="column">\n' +
  '<div class="column-label">Lot Size (sq ft)</div>\n' +
  '<div class="column-value"><span class="priv">0</span></div>\n' +
  '</div><div class="column">\n' +
  '<div class="column-label">Lot Size (acres)</div>\n' +
  '<div class="column-value"><span class="priv">0</span></div>\n' +
  '</div><div class="column">\n' +
  '<div class="column-label">Lot Size (sq m)</div>\n' +
  '<div class="column-value"><span class="priv">0</span></div>\n' +
  '</div><div class="column">\n' +
  '<div class="column-label">Lot Size (hectares)</div>\n' +
  '<div class="column-value"><span class="priv">0</span></div>\n' +
  '</div><div class="column">\n' +
  '<div class="column-label">Area</div>\n' +
  '<div class="column-value"><span class="priv">Burnaby North</span></div>\n' +
  '</div>\n' +
  '</div> </article>\n' +
  '</section>\n' +
  '<section class="section-listing section-listing-pad acc md-acc-open">\n' +
  '<input id="acc-section-history" type="checkbox" class="acc-input">\n' +
  '<span class="acc-icon xs-text-2"></span>\n' +
  '<label for="acc-section-history" class="acc-label section-listing-title">Price History</label>\n' +
  '<div class="section-listing-content acc-content">\n' +
  '<div class="section-listing-content-pad">\n' +
  '<section class="listing-trends-table">\n' +
  '<div class="table-wrapper xs-overflow-scroll sm-overflow-auto no-scrollbar xs-mb5">\n' +
  '<table class="table-first-col-pl0 table-border xs-border-none">\n' +
  '<thead class>\n' +
  '<tr>\n' +
  '<th class="xs-col-3">Date</th>\n' +
  '<th class="xs-col-6">Event</th>\n' +
  '<th class="xs-col-3 xs-text-right sm-text-left">Price</th>\n' +
  '</tr>\n' +
  '</thead>\n' +
  '<tbody><tr>\n' +
  '<td>\n' +
  '<span class="priv">07/31/17</span>\n' +
  '</td>\n' +
  '<td>Listed For Sale</td>\n' +
  '<td class="xs-text-right sm-text-left"><span class="priv">$499,800</span></td>\n' +
  '</tr><tr>\n' +
  '<td>\n' +
  'XX/XX/XX\n' +
  '</td>\n' +
  '<td>\n' +
  'Sold\n' +
  '</td>\n' +
  '<td class="xs-text-right sm-text-left">\n' +
  '$XXX,XXX\n' +
  '</td>\n' +
  '</tr>\n' +
  '<tr>\n' +
  '<td>\n' +
  'XX/XX/XX\n' +
  '</td>\n' +
  '<td>\n' +
  'Listed For Sale\n' +
  '</td>\n' +
  '<td class="xs-text-right sm-text-left">\n' +
  '$XXX,XXX\n' +
  '</td>\n' +
  '</tr>\n' +
  '</tbody>\n' +
  '</table> </div>\n' +
  '<h4 class="xs-text-3 text-green">Interested in the full price history for this home?</h4>\n' +
  '<p>A Zolo real estate professional would be happy to provide a detailed listing history, sold prices, and comparable sales for this property.</p>\n' +
  '<a href="#InputFullname" class="button button--action button--secondary"><i class="icon icon-attach-money xs-mr1"></i>Request Sold History</a>\n' +
  '<p class="text-muted xs-text-5 xs-pt3 xs-mt3 xs-border-top-lighter xs-mb0">The online display of a property\'s sales history, including sold prices, is not currently permitted by the local real estate board.</p>\n' +
  '</section>\n' +
  '</div>\n' +
  '</div>\n' +
  '</section>\n' +
  '<section class="section-listing section-listing-pad acc md-acc-open">\n' +
  '<input id="acc-section-market-stats" type="checkbox" class="acc-input">\n' +
  '<span class="acc-icon xs-text-2"></span>\n' +
  '<label for="acc-section-market-stats" class="acc-label section-listing-title">Market Stats</label>\n' +
  '<div class="section-listing-content acc-content">\n' +
  '<div class="section-listing-content-pad">\n' +
  '<div class="listing-market-view--intro">The approximate value of a 2 bedroom 920 ft<sup>2</sup> condo in the area is:</div>\n' +
  '<div class="listing-market-view--value xs-mt3 xs-mb5 xs-text-1 bold">$486,713</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-left">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-event"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading bold">\n' +
  'You should visit soon.\n' +
  '</div>\n' +
  'Homes like this sell on average in 7 days.\n' +
  'There is an 56% chance that this home will be sold within one week of listing.\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-left">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-trending_up"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading bold">Expect to bid higher.</div>\n' +
  '4 out of 10 homes like this one have sold over asking.\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-left">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-local-atm"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading bold">You\'re unlikely to get a deal.</div>\n' +
  'Only 2 in 100 homes like this sell below 93% of asking.\n' +
  '</div>\n' +
  '</div>\n' +
  '<section class="listing-trends-table">\n' +
  '<div class="table-wrapper xs-overflow-scroll sm-overflow-auto no-scrollbar xs-mb3">\n' +
  '<table class="table-first-col-pl0 table-border xs-border-none xs-mt4">\n' +
  '<thead class>\n' +
  '<tr>\n' +
  '<th class="xs-col-5">Area</th>\n' +
  '<th class="xs-col-4 xs-text-right sm-text-left">Price</th>\n' +
  '<th class="xs-col-3 xs-text-right sm-text-left">Days</th>\n' +
  '</tr>\n' +
  '</thead>\n' +
  '<tbody><tr>\n' +
  '<td>This Home</td>\n' +
  '<td class="xs-align-top xs-text-right sm-text-left"><span class="priv">$499,800</span></td>\n' +
  '<td class="xs-align-top xs-text-right sm-text-left"><span class="priv">43</span></td>\n' +
  '</tr><tr>\n' +
  '<td>Hood<div class="text-secondary xs-block sm-inline-block xs-text-6 sm-text-5 sm-ml1">Simon Fraser Univer.</div></td>\n' +
  '<td class="xs-align-top xs-text-right sm-text-left">$580,670 <div class="xs-block sm-inline-block text-green xs-text-6 sm-text-5">+15.4%</div></td>\n' +
  '<td class="xs-align-top xs-text-right sm-text-left">26 <div class="xs-block sm-inline-block text-red xs-text-6 sm-text-5">-10.3%</div></td>\n' +
  '</tr><tr>\n' +
  '<td>City<div class="text-secondary xs-block sm-inline-block xs-text-6 sm-text-5 sm-ml1">Burnaby</div></td>\n' +
  '<td class="xs-align-top xs-text-right sm-text-left">$836,611 <div class="xs-block sm-inline-block text-green xs-text-6 sm-text-5">+18.5%</div></td>\n' +
  '<td class="xs-align-top xs-text-right sm-text-left">20 <div class="xs-block sm-inline-block text-red xs-text-6 sm-text-5">-4.8%</div></td>\n' +
  '</tr><tr>\n' +
  '<td>Metro<div class="text-secondary xs-block sm-inline-block xs-text-6 sm-text-5 sm-ml1">Greater Vancouver</div></td>\n' +
  '<td class="xs-align-top xs-text-right sm-text-left">$906,910 <div class="xs-block sm-inline-block text-green xs-text-6 sm-text-5">+11.7%</div></td>\n' +
  '<td class="xs-align-top xs-text-right sm-text-left">19 <div class="xs-block sm-inline-block text-red xs-text-6 sm-text-5">-9.5%</div></td>\n' +
  '</tr></tbody>\n' +
  '</table>\n' +
  '<small class="text-muted xs-inline-block xs-mt2"><b>Note:</b> +/- change calculated year-over-year</small>\n' +
  '</div>\n' +
  '</section><a href="https://www.zolo.ca/burnaby-real-estate/simon-fraser-univer/trends" class="button button--mono button-small xs-text-left xs-mt2 sm-mr2" style="white-space: normal !important;">\n' +
  '<i class="icon icon-equalizer xs-align-bottom"></i> Simon Fraser Univer. Housing Stats <i class="icon icon-keyboard-arrow-right xs-align-bottom"></i>\n' +
  '</a><a href="https://www.zolo.ca/burnaby-real-estate/trends" class="button button--mono button-small xs-text-left xs-mt2" style="white-space: normal !important;">\n' +
  '<i class="icon icon-equalizer xs-align-bottom"></i> Burnaby Housing Stats <i class="icon icon-keyboard-arrow-right xs-align-bottom"></i>\n' +
  '</a> </div>\n' +
  '</div>\n' +
  '</section>\n' +
  '<section class="section-listing section-listing-pad acc md-acc-open">\n' +
  '<input id="acc-section-building" type="checkbox" class="acc-input">\n' +
  '<span class="acc-icon xs-text-2"></span>\n' +
  '<label for="acc-section-building" class="acc-label section-listing-title">Building Units</label>\n' +
  '<div class="section-listing-content acc-content">\n' +
  '<div class="section-listing-content-pad">\n' +
  '<div class="xs-mb5">\n' +
  '<a href="#other-units-for-sale" class="link-primary xs-mr3"><span class="badge xs-ml0">2</span> units for sale</a> </div>\n' +
  '<section class="units-for-sale  " id="other-units-for-sale">\n' +
  '<h4>For Sale</h4>\n' +
  '<div class="xs-border-bottom-lighter xs-py1">2 Bed</div>\n' +
  '<div class="table xs-full-width xs-border-bottom-lighter xs-mb3 table-building">\n' +
  '<a href="https://www.zolo.ca/burnaby-real-estate/9288-university-crescent/201" class="tr table-building-row link-gray">\n' +
  '<div class="td table-building-unit"><span class="table-building-attr-name">Unit </span>201</div>\n' +
  '<div class="td table-building-price">$<span class>398,000</span></div>\n' +
  '<div class="td table-building-baths"><span class>1</span> <span class="table-building-attr-name">bath</span></div>\n' +
  '<div class="td table-building-size"><span class>700</span> ft<sup>2</sup></div>\n' +
  '</a>\n' +
  '<a href="https://www.zolo.ca/burnaby-real-estate/9288-university-crescent/408" class="tr table-building-row link-gray bold">\n' +
  '<div class="td table-building-unit"><span class="table-building-attr-name">Unit </span>408</div>\n' +
  '<div class="td table-building-price">$<span class>499,800</span></div>\n' +
  '<div class="td table-building-baths"><span class>2</span> <span class="table-building-attr-name">bath</span></div>\n' +
  '<div class="td table-building-size"><span class>920</span> ft<sup>2</sup></div>\n' +
  '</a>\n' +
  '</div> </section>\n' +
  '<a href="https://www.zolo.ca/burnaby-real-estate/9288-university-crescent" class="button button--mono button-small xs-text-left xs-mt3">\n' +
  '<i class="icon icon-condo xs-align-bottom"></i> View 9288 University Crescent <i class="icon icon-keyboard-arrow-right xs-align-bottom"></i>\n' +
  '</a>\n' +
  '</div>\n' +
  '</div>\n' +
  '</section>\n' +
  '<section class="section-listing section-listing-pad listing-schools acc md-acc-open">\n' +
  '<input id="acc-section-schools" type="checkbox" class="acc-input">\n' +
  '<span class="acc-icon xs-text-2"></span>\n' +
  '<label for="acc-section-schools" class="acc-label section-listing-title">Schools</label>\n' +
  '<div class="section-listing-content acc-content loading xs-relative">\n' +
  '<div class="section-listing-content-pad">\n' +
  '<div class="media-block">\n' +
  '<div class="media-left">\n' +
  '<div class="media-circle none">\n' +
  '<div class="media-text">n/a</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">University Highlands <span class="badge badge--small badge--mono">0.28 km</span></div>\n' +
  '<div class="media-sub-heading text-secondary">Elementary</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-left">\n' +
  '<div class="media-circle text-yellow">\n' +
  '<div class="media-text">6.2</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Glenayre <span class="badge badge--small badge--mono">1.17 km</span></div>\n' +
  '<div class="media-sub-heading text-secondary">Elementary</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-left">\n' +
  '<div class="media-circle text-green">\n' +
  '<div class="media-text">9.8</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Holy Cross <span class="badge badge--small badge--mono">6.44 km</span></div>\n' +
  '<div class="media-sub-heading text-secondary">Elementary</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-left">\n' +
  '<div class="media-circle text-yellow">\n' +
  '<div class="media-text">6.7</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Burnaby Mountain <span class="badge badge--small badge--mono">2.64 km</span></div>\n' +
  '<div class="media-sub-heading text-secondary">Secondary</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-left">\n' +
  '<div class="media-circle text-yellow">\n' +
  '<div class="media-text">6.6</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Port Moody <span class="badge badge--small badge--mono">2.71 km</span></div>\n' +
  '<div class="media-sub-heading text-secondary">Secondary</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-left">\n' +
  '<div class="media-circle text-green">\n' +
  '<div class="media-text">7.7</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Dr. Charles Best <span class="badge badge--small badge--mono">6.17 km</span></div>\n' +
  '<div class="media-sub-heading text-secondary">Secondary</div>\n' +
  '</div>\n' +
  '</div>\n' +
  ' <div class="text-6 text-muted xs-pt2">\n' +
  '* School ratings provided by School Report Cards by the Fraser Institute (2014)\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</section>\n' +
  '<section class="section-listing section-listing-pad acc md-acc-open">\n' +
  '<input id="acc-listing-transit" type="checkbox" class="acc-input">\n' +
  '<span class="acc-icon xs-text-2"></span>\n' +
  '<label for="acc-listing-transit" class="acc-label section-listing-title">Travel Times</label>\n' +
  '<div class="section-listing-content acc-content loading xs-relative">\n' +
  '<div class="section-listing-content-pad">\n' +
  '<div class="media-block">\n' +
  '<div class="media-left xs-pt1">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-location_city"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading xs-inline-block">Downtown Vancouver <span class="badge badge--small badge--mono">18.26 km</span></div>\n' +
  '<div class="xs-mt1 text-secondary"><div class="xs-inline-block xs-mr1"><i class="icon icon-directions-transit text-muted"></i> <span class="text-6">67 mins</span></div><div class="xs-inline-block xs-mr1"><i class="icon icon-directions-car text-muted"></i> <span class="text-6">32 mins</span></div></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-left xs-pt1">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-flight"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading xs-inline-block">Vancouver International Airport <span class="badge badge--small badge--mono">33.95 km</span></div>\n' +
  '<div class="xs-mt1 text-secondary"><div class="xs-inline-block xs-mr1"><i class="icon icon-directions-transit text-muted"></i> <span class="text-6">90 mins</span></div><div class="xs-inline-block xs-mr1"><i class="icon icon-directions-car text-muted"></i> <span class="text-6">44 mins</span></div></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-left xs-pt1">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-flight"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading xs-inline-block">Boundary Bay Airport <span class="badge badge--small badge--mono">48.66 km</span></div>\n' +
  '<div class="xs-mt1 text-secondary"><div class="xs-inline-block xs-mr1"><i class="icon icon-directions-car text-muted"></i> <span class="text-6">44 mins</span></div><div class="xs-inline-block xs-mr1"><i class="icon icon-directions-transit text-muted"></i> <span class="text-6">125 mins</span></div></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-left xs-pt1">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-directions_boat"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading xs-inline-block">Lonsdale Quay Seabus Northbound <div class="xs-inline-block"><span class="badge badge--mono badge--small" style>Seabus </span></div> <span class="badge badge--small badge--mono">26.96 km</span></div>\n' +
  '<div class="xs-mt1 text-secondary"><div class="xs-inline-block xs-mr1"><i class="icon icon-directions-car text-muted"></i> <span class="text-6">29 mins</span></div></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-left xs-pt1">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-directions_railway"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading xs-inline-block">Production Way-university Station <div class="xs-inline-block"><span class="badge badge--mono badge--small" style>Millennium Skytrain</span></div> <span class="badge badge--small badge--mono">3.94 km</span></div>\n' +
  '<div class="xs-mt1 text-secondary"><div class="xs-inline-block xs-mr1"><i class="icon icon-directions-walk text-muted"></i> <span class="text-6">50 mins</span></div><div class="xs-inline-block xs-mr1"><i class="icon icon-directions-bike text-muted"></i> <span class="text-6">17 mins</span></div><div class="xs-inline-block xs-mr1"><i class="icon icon-directions-car text-muted"></i> <span class="text-6">8 mins</span></div></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-left xs-pt1">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-directions_bus"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading xs-inline-block">Sb Tower Rd Fs University High St <div class="xs-inline-block"><span class="badge badge--mono badge--small" style>135</span></div> <span class="badge badge--small badge--mono">366 m</span></div>\n' +
  '<div class="xs-mt1 text-secondary"><div class="xs-inline-block xs-mr1"><i class="icon icon-directions-walk text-muted"></i> <span class="text-6">4 mins</span></div><div class="xs-inline-block xs-mr1"><i class="icon icon-directions-bike text-muted"></i> <span class="text-6">2 mins</span></div></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-left xs-pt1">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-directions_bus"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading xs-inline-block">Sfu Transit Exchange Bay 4 <div class="xs-inline-block"><span class="badge badge--mono badge--small" style>143</span></div> <span class="badge badge--small badge--mono">638 m</span></div>\n' +
  '<div class="xs-mt1 text-secondary"><div class="xs-inline-block xs-mr1"><i class="icon icon-directions-walk text-muted"></i> <span class="text-6">8 mins</span></div><div class="xs-inline-block xs-mr1"><i class="icon icon-directions-bike text-muted"></i> <span class="text-6">3 mins</span></div></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-left xs-pt1">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-directions_bus"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading xs-inline-block">Sfu Transit Exchange Bay 3 <div class="xs-inline-block"><span class="badge badge--mono badge--small" style>144</span></div> <span class="badge badge--small badge--mono">639 m</span></div>\n' +
  '<div class="xs-mt1 text-secondary"><div class="xs-inline-block xs-mr1"><i class="icon icon-directions-walk text-muted"></i> <span class="text-6">8 mins</span></div><div class="xs-inline-block xs-mr1"><i class="icon icon-directions-bike text-muted"></i> <span class="text-6">3 mins</span></div></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-left xs-pt1">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-directions_bus"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading xs-inline-block">Sfu Transit Exchange Bay 1 <div class="xs-inline-block"><span class="badge badge--mono badge--small" style>145</span></div> <span class="badge badge--small badge--mono">639 m</span></div>\n' +
  '<div class="xs-mt1 text-secondary"><div class="xs-inline-block xs-mr1"><i class="icon icon-directions-walk text-muted"></i> <span class="text-6">8 mins</span></div><div class="xs-inline-block xs-mr1"><i class="icon icon-directions-bike text-muted"></i> <span class="text-6">3 mins</span></div></div>\n' +
  '</div>\n' +
  '</div> </div>\n' +
  '</div>\n' +
  '</section>\n' +
  '<div class="section-listing section-listing-pad acc md-acc-open print-hide">\n' +
  '<input id="acc-listing-ammenities" type="checkbox" class="acc-input">\n' +
  '<span class="acc-icon xs-text-2"></span>\n' +
  '<label for="acc-listing-ammenities" class="acc-label section-listing-title">Amenities</label>\n' +
  '<div class="section-listing-content acc-content loading xs-relative">\n' +
  '<div class="section-listing-content-pad">\n' +
  '<div class="listing-ammenities-item acc">\n' +
  '<input id="acc-section-ammenities-top10closest" type="checkbox" class="acc-input">\n' +
  '<span class="acc-icon xs-text-2 xs-t1 text-muted"></span>\n' +
  '<label for="acc-section-ammenities-top10closest" class="acc-label">\n' +
  '<div class="media-block">\n' +
  '<div class="media-left">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-my-location"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body xs-align-middle">\n' +
  '<div class="media-heading">Top 10 Closest <span class="badge badge--small badge--mono"></span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</label>\n' +
  '<div class="secion-listing-content acc-content">\n' +
  '<div class="section-listing-content-pad xs-px2 xs-py1 xs-my1 xs-border-top-lighter xs-border-bottom-lighter">\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">One University Crescent</div>\n' +
  '<div class="media-sub-heading text-secondary">9300 University Crescent <span class="badge badge--small badge--mono">\n' +
  '0.01 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Novo 1</div>\n' +
  '<div class="media-sub-heading text-secondary">9288 - 9298 University Crescent <span class="badge badge--small badge--mono">\n' +
  '0.05 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Harmony At The Highlands</div>\n' +
  '<div class="media-sub-heading text-secondary">Suite 221-9339 University Cres <span class="badge badge--small badge--mono">\n' +
  '0.09 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Angelo\'s Carpet & Upholstery Cleaning</div>\n' +
  '<div class="media-sub-heading text-secondary">9380 University Crescent <span class="badge badge--small badge--mono">\n' +
  '0.15 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Burnaby Mountain hiking trails</div>\n' +
  '<div class="media-sub-heading text-secondary">University Dr E <span class="badge badge--small badge--mono">\n' +
  '0.25 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Awm Alliance Real Estate Group Ltd</div>\n' +
  '<div class="media-sub-heading text-secondary">9191 University Crescent <span class="badge badge--small badge--mono">\n' +
  '0.18 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Verdant Living</div>\n' +
  '<div class="media-sub-heading text-secondary">9191 University Crescent <span class="badge badge--small badge--mono">\n' +
  '0.2 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">University Highlands</div>\n' +
  '<div class="media-sub-heading text-secondary">9388 Tower road <span class="badge badge--small badge--mono">\n' +
  '0.28 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">University Highlands Elementary School</div>\n' +
  '<div class="media-sub-heading text-secondary">9388 Tower Rd <span class="badge badge--small badge--mono">\n' +
  '0.28 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Origin</div>\n' +
  '<div class="media-sub-heading text-secondary">9150 University High Street <span class="badge badge--small badge--mono">\n' +
  '0.29 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="listing-ammenities-item acc">\n' +
  '<input id="acc-section-ammenities-groceries" type="checkbox" class="acc-input">\n' +
  '<span class="acc-icon xs-text-2 xs-t1 text-muted"></span>\n' +
  '<label for="acc-section-ammenities-groceries" class="acc-label">\n' +
  '<div class="media-block">\n' +
  '<div class="media-left">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-shopping-basket"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body xs-align-middle">\n' +
  '<div class="media-heading">Groceries <span class="badge badge--small badge--mono">0.43 km</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</label>\n' +
  '<div class="secion-listing-content acc-content">\n' +
  '<div class="section-listing-content-pad xs-px2 xs-py1 xs-my1 xs-border-top-lighter xs-border-bottom-lighter">\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Nesters Market</div>\n' +
  '<div class="media-sub-heading text-secondary">9000 University High St <span class="badge badge--small badge--mono">\n' +
  '0.43 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">M&M Meat Shops</div>\n' +
  '<div class="media-sub-heading text-secondary">526 Clarke Road <span class="badge badge--small badge--mono">\n' +
  '1.69 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Longevity Health Foods</div>\n' +
  '<div class="media-sub-heading text-secondary">562 Clarke Road <span class="badge badge--small badge--mono">\n' +
  '2.1 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="listing-ammenities-item acc">\n' +
  '<input id="acc-section-ammenities-liquorstore" type="checkbox" class="acc-input">\n' +
  ' <span class="acc-icon xs-text-2 xs-t1 text-muted"></span>\n' +
  '<label for="acc-section-ammenities-liquorstore" class="acc-label">\n' +
  '<div class="media-block">\n' +
  '<div class="media-left">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-martini"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body xs-align-middle">\n' +
  '<div class="media-heading">Liquor Store <span class="badge badge--small badge--mono">2.1 km</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</label>\n' +
  '<div class="secion-listing-content acc-content">\n' +
  '<div class="section-listing-content-pad xs-px2 xs-py1 xs-my1 xs-border-top-lighter xs-border-bottom-lighter">\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Rhino\'s Pub & Liquor Store</div>\n' +
  '<div class="media-sub-heading text-secondary">541 Clarke Rd <span class="badge badge--small badge--mono">\n' +
  '2.1 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">BC Liquor Stores</div>\n' +
  '<div class="media-sub-heading text-secondary">3433 North Road #103 <span class="badge badge--small badge--mono">\n' +
  '2.9 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">The Burrard Public House</div>\n' +
  '<div class="media-sub-heading text-secondary">2414 Johns St <span class="badge badge--small badge--mono">\n' +
  '3.42 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="listing-ammenities-item acc">\n' +
  '<input id="acc-section-ammenities-restaurants" type="checkbox" class="acc-input">\n' +
  '<span class="acc-icon xs-text-2 xs-t1 text-muted"></span>\n' +
  '<label for="acc-section-ammenities-restaurants" class="acc-label">\n' +
  '<div class="media-block">\n' +
  '<div class="media-left">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-local-restaurant"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body xs-align-middle">\n' +
  '<div class="media-heading">Restaurants <span class="badge badge--small badge--mono">0.09 km</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</label>\n' +
  '<div class="secion-listing-content acc-content">\n' +
  '<div class="section-listing-content-pad xs-px2 xs-py1 xs-my1 xs-border-top-lighter xs-border-bottom-lighter">\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Harmony At The Highlands</div>\n' +
  '<div class="media-sub-heading text-secondary">Suite 221-9339 University Cres <span class="badge badge--small badge--mono">\n' +
  '0.09 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Nature\'s Garden Organic Deli</div>\n' +
  '<div class="media-sub-heading text-secondary">8968 University High St <span class="badge badge--small badge--mono">\n' +
  '0.5 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Nature\'s Garden Cafe SFU</div>\n' +
  '<div class="media-sub-heading text-secondary">8968 University High Street <span class="badge badge--small badge--mono">\n' +
  '0.5 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="listing-ammenities-item acc">\n' +
  '<input id="acc-section-ammenities-coffee" type="checkbox" class="acc-input">\n' +
  '<span class="acc-icon xs-text-2 xs-t1 text-muted"></span>\n' +
  '<label for="acc-section-ammenities-coffee" class="acc-label">\n' +
  '<div class="media-block">\n' +
  '<div class="media-left">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-coffee2"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body xs-align-middle">\n' +
  '<div class="media-heading">Coffee <span class="badge badge--small badge--mono">0.57 km</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</label>\n' +
  '<div class="secion-listing-content acc-content">\n' +
  '<div class="section-listing-content-pad xs-px2 xs-py1 xs-my1 xs-border-top-lighter xs-border-bottom-lighter">\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Pearl Fever Tea House</div>\n' +
  '<div class="media-sub-heading text-secondary">8951 Cornerstone Mews <span class="badge badge--small badge--mono">\n' +
  '0.57 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Renaissance Coffee</div>\n' +
  '<div class="media-sub-heading text-secondary">8906 University High Street <span class="badge badge--small badge--mono">\n' +
  '0.57 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Ethos Coffee House</div>\n' +
  '<div class="media-sub-heading text-secondary">8650 Cinnamon Drive <span class="badge badge--small badge--mono">\n' +
  '1.68 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="listing-ammenities-item acc">\n' +
  '<input id="acc-section-ammenities-bank" type="checkbox" class="acc-input">\n' +
  '<span class="acc-icon xs-text-2 xs-t1 text-muted"></span>\n' +
  '<label for="acc-section-ammenities-bank" class="acc-label">\n' +
  '<div class="media-block">\n' +
  '<div class="media-left">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-bank"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body xs-align-middle">\n' +
  '<div class="media-heading">Bank <span class="badge badge--small badge--mono">0.5 km</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</label>\n' +
  '<div class="secion-listing-content acc-content">\n' +
  '<div class="section-listing-content-pad xs-px2 xs-py1 xs-my1 xs-border-top-lighter xs-border-bottom-lighter">\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Scotiabank</div>\n' +
  '<div class="media-sub-heading text-secondary">8972 University High St <span class="badge badge--small badge--mono">\n' +
  '0.5 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">CIBC</div>\n' +
  '<div class="media-sub-heading text-secondary">546 Clarke Rd <span class="badge badge--small badge--mono">\n' +
  '2.14 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">CIBC Branch & ATM</div>\n' +
  '<div class="media-sub-heading text-secondary">403 552 Clarke Road <span class="badge badge--small badge--mono">\n' +
  '2.19 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="listing-ammenities-item acc">\n' +
  '<input id="acc-section-ammenities-gasstation" type="checkbox" class="acc-input">\n' +
  '<span class="acc-icon xs-text-2 xs-t1 text-muted"></span>\n' +
  '<label for="acc-section-ammenities-gasstation" class="acc-label">\n' +
  '<div class="media-block">\n' +
  '<div class="media-left">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-local-gas-station"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body xs-align-middle">\n' +
  '<div class="media-heading">Gas Station <span class="badge badge--small badge--mono">2.6 km</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</label>\n' +
  '<div class="secion-listing-content acc-content">\n' +
  '<div class="section-listing-content-pad xs-px2 xs-py1 xs-my1 xs-border-top-lighter xs-border-bottom-lighter">\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Shell Canada Products LTD</div>\n' +
  '<div class="media-sub-heading text-secondary">2751 Underhill Avenue <span class="badge badge--small badge--mono">\n' +
  '2.6 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Esso</div>\n' +
  '<div class="media-sub-heading text-secondary">3965 N Rd <span class="badge badge--small badge--mono">\n' +
  '3.36 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Petro Can</div>\n' +
  '<div class="media-sub-heading text-secondary">952 Como Lake Avenue <span class="badge badge--small badge--mono">\n' +
  '3.09 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="listing-ammenities-item acc">\n' +
  '<input id="acc-section-ammenities-health&amp;fitness" type="checkbox" class="acc-input">\n' +
  '<span class="acc-icon xs-text-2 xs-t1 text-muted"></span>\n' +
  '<label for="acc-section-ammenities-health&amp;fitness" class="acc-label">\n' +
  '<div class="media-block">\n' +
  '<div class="media-left">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-barbell"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body xs-align-middle">\n' +
  '<div class="media-heading">Health &amp; Fitness <span class="badge badge--small badge--mono">2.07 km</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</label>\n' +
  '<div class="secion-listing-content acc-content">\n' +
  '<div class="section-listing-content-pad xs-px2 xs-py1 xs-my1 xs-border-top-lighter xs-border-bottom-lighter">\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">She\'s Fit! Burquitlam</div>\n' +
  '<div class="media-sub-heading text-secondary">567 Clarke Rd <span class="badge badge--small badge--mono">\n' +
  '2.07 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">She\'s Fit! Burnaby/Coquitlam</div>\n' +
  '<div class="media-sub-heading text-secondary">567 Clarke Road <span class="badge badge--small badge--mono">\n' +
  '2.08 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Cameron Recreation Complex</div>\n' +
  '<div class="media-sub-heading text-secondary">9523 Cameron Street <span class="badge badge--small badge--mono">\n' +
  '2.75 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="listing-ammenities-item acc">\n' +
  '<input id="acc-section-ammenities-park" type="checkbox" class="acc-input">\n' +
  '<span class="acc-icon xs-text-2 xs-t1 text-muted"></span>\n' +
  '<label for="acc-section-ammenities-park" class="acc-label">\n' +
  '<div class="media-block">\n' +
  '<div class="media-left">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-nature-people"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body xs-align-middle">\n' +
  '<div class="media-heading">Park <span class="badge badge--small badge--mono">0.25 km</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</label>\n' +
  '<div class="secion-listing-content acc-content">\n' +
  '<div class="section-listing-content-pad xs-px2 xs-py1 xs-my1 xs-border-top-lighter xs-border-bottom-lighter">\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Burnaby Mountain hiking trails</div>\n' +
  '<div class="media-sub-heading text-secondary">University Dr E <span class="badge badge--small badge--mono">\n' +
  '0.25 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Burnaby Mountain Biking and Hiking Trails</div>\n' +
  '<div class="media-sub-heading text-secondary">University Drive East <span class="badge badge--small badge--mono">\n' +
  '0.62 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">East Grove Park</div>\n' +
  ' <div class="media-sub-heading text-secondary">9251 Ash Grove Crescent <span class="badge badge--small badge--mono">\n' +
  '1.48 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="listing-ammenities-item acc">\n' +
  '<input id="acc-section-ammenities-library" type="checkbox" class="acc-input">\n' +
  '<span class="acc-icon xs-text-2 xs-t1 text-muted"></span>\n' +
  '<label for="acc-section-ammenities-library" class="acc-label">\n' +
  '<div class="media-block">\n' +
  '<div class="media-left">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-local-library"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body xs-align-middle">\n' +
  '<div class="media-heading">Library <span class="badge badge--small badge--mono">1.09 km</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</label>\n' +
  '<div class="secion-listing-content acc-content">\n' +
  '<div class="section-listing-content-pad xs-px2 xs-py1 xs-my1 xs-border-top-lighter xs-border-bottom-lighter">\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">W.A.C. Bennett Library</div>\n' +
  '<div class="media-sub-heading text-secondary">8888 University Drive <span class="badge badge--small badge--mono">\n' +
  '1.09 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Burnaby Public Library, Cameron Branch</div>\n' +
  '<div class="media-sub-heading text-secondary">9523 Cameron Street <span class="badge badge--small badge--mono">\n' +
  '2.73 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Burnaby Public Library</div>\n' +
  '<div class="media-sub-heading text-secondary">9523 Cameron St <span class="badge badge--small badge--mono">\n' +
  '2.75 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="listing-ammenities-item acc">\n' +
  '<input id="acc-section-ammenities-medicalcare" type="checkbox" class="acc-input">\n' +
  '<span class="acc-icon xs-text-2 xs-t1 text-muted"></span>\n' +
  '<label for="acc-section-ammenities-medicalcare" class="acc-label">\n' +
  '<div class="media-block">\n' +
  '<div class="media-left">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-local-hospital"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body xs-align-middle">\n' +
  '<div class="media-heading">Medical Care <span class="badge badge--small badge--mono">2.16 km</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</label>\n' +
  '<div class="secion-listing-content acc-content">\n' +
  '<div class="section-listing-content-pad xs-px2 xs-py1 xs-my1 xs-border-top-lighter xs-border-bottom-lighter">\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">CBI Care Point Medical Centres</div>\n' +
  '<div class="media-sub-heading text-secondary">552 Clarke Rd <span class="badge badge--small badge--mono">\n' +
  '2.16 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">ABC Kids Occupational Therapy</div>\n' +
  '<div class="media-sub-heading text-secondary">803 Fowler Court <span class="badge badge--small badge--mono">\n' +
  '2.65 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Bikram Yoga Burnaby</div>\n' +
  '<div class="media-sub-heading text-secondary">4501 North Road <span class="badge badge--small badge--mono">\n' +
  '3.83 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="listing-ammenities-item acc">\n' +
  '<input id="acc-section-ammenities-pharmacy" type="checkbox" class="acc-input">\n' +
  '<span class="acc-icon xs-text-2 xs-t1 text-muted"></span>\n' +
  '<label for="acc-section-ammenities-pharmacy" class="acc-label">\n' +
  '<div class="media-block">\n' +
  '<div class="media-left">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-local-pharmacy"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body xs-align-middle">\n' +
  '<div class="media-heading">Pharmacy <span class="badge badge--small badge--mono">2.16 km</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</label>\n' +
  '<div class="secion-listing-content acc-content">\n' +
  '<div class="section-listing-content-pad xs-px2 xs-py1 xs-my1 xs-border-top-lighter xs-border-bottom-lighter">\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Shoppers Drug Mart</div>\n' +
  '<div class="media-sub-heading text-secondary">528 Clarke Road <span class="badge badge--small badge--mono">\n' +
  '2.16 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Safeway Extra</div>\n' +
  '<div class="media-sub-heading text-secondary">580 Clarke Road <span class="badge badge--small badge--mono">\n' +
  '2.06 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Suncor Energy Svc Inc</div>\n' +
  '<div class="media-sub-heading text-secondary">1155 Glenayre Drive <span class="badge badge--small badge--mono">\n' +
  '1.68 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="listing-ammenities-item acc">\n' +
  '<input id="acc-section-ammenities-mall" type="checkbox" class="acc-input">\n' +
  '<span class="acc-icon xs-text-2 xs-t1 text-muted"></span>\n' +
  '<label for="acc-section-ammenities-mall" class="acc-label">\n' +
  '<div class="media-block">\n' +
  '<div class="media-left">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-local-mall"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body xs-align-middle">\n' +
  '<div class="media-heading">Mall <span class="badge badge--small badge--mono">2.15 km</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</label>\n' +
  '<div class="secion-listing-content acc-content">\n' +
  '<div class="section-listing-content-pad xs-px2 xs-py1 xs-my1 xs-border-top-lighter xs-border-bottom-lighter">\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Burquitlam Plaza</div>\n' +
  '<div class="media-sub-heading text-secondary">526 Clarke Road <span class="badge badge--small badge--mono">\n' +
  '2.15 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Lougheed Town Centre/Lougheed Mall</div>\n' +
  '<div class="media-sub-heading text-secondary">9855 Austin Rd <span class="badge badge--small badge--mono">\n' +
  '3.07 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Lougheed Town Centre</div>\n' +
  '<div class="media-sub-heading text-secondary">9855 Austin Rd #106 <span class="badge badge--small badge--mono">\n' +
  '3.07 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="listing-ammenities-item acc">\n' +
  '<input id="acc-section-ammenities-movietheatre" type="checkbox" class="acc-input">\n' +
  '<span class="acc-icon xs-text-2 xs-t1 text-muted"></span>\n' +
  '<label for="acc-section-ammenities-movietheatre" class="acc-label">\n' +
  '<div class="media-block">\n' +
  '<div class="media-left">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-local-movies"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body xs-align-middle">\n' +
  '<div class="media-heading">Movie Theatre <span class="badge badge--small badge--mono">5.99 km</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</label>\n' +
  '<div class="secion-listing-content acc-content">\n' +
  '<div class="section-listing-content-pad xs-px2 xs-py1 xs-my1 xs-border-top-lighter xs-border-bottom-lighter">\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">SilverCity Coquitlam and VIP</div>\n' +
  '<div class="media-sub-heading text-secondary">170 Schoolhouse Street <span class="badge badge--small badge--mono">\n' +
  '5.99 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">SilverCity Coquitlam Cinemas and VIP</div>\n' +
  '<div class="media-sub-heading text-secondary">170 Schoolhouse Street <span class="badge badge--small badge--mono">\n' +
  '5.99 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Cineplex Cinemas Coquitlam and VIP</div>\n' +
  '<div class="media-sub-heading text-secondary">170 Schoolhouse Street <span class="badge badge--small badge--mono">\n' +
  '6 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="listing-ammenities-item acc">\n' +
  '<input id="acc-section-ammenities-bar" type="checkbox" class="acc-input">\n' +
  '<span class="acc-icon xs-text-2 xs-t1 text-muted"></span>\n' +
  '<label for="acc-section-ammenities-bar" class="acc-label">\n' +
  '<div class="media-block">\n' +
  '<div class="media-left">\n' +
  '<div class="media-circle">\n' +
  '<div class="media-icon icon-cup"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-body xs-align-middle">\n' +
  '<div class="media-heading">Bar <span class="badge badge--small badge--mono">0.57 km</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</label>\n' +
  '<div class="secion-listing-content acc-content">\n' +
  '<div class="section-listing-content-pad xs-px2 xs-py1 xs-my1 xs-border-top-lighter xs-border-bottom-lighter">\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Club Ilia</div>\n' +
  '<div class="media-sub-heading text-secondary">8902 University High Street <span class="badge badge--small badge--mono">\n' +
  '0.57 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Highland Pub</div>\n' +
  '<div class="media-sub-heading text-secondary">8888 University High Street <span class="badge badge--small badge--mono">\n' +
  '1.08 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="media-block">\n' +
  '<div class="media-body">\n' +
  '<div class="media-heading">Star Karaoke</div>\n' +
  '<div class="media-sub-heading text-secondary">565 Clarke Road <span class="badge badge--small badge--mono">\n' +
  '2.06 km\n' +
  '</span></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div> </div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<section class="section-listing section-listing-pad listing-mortgage acc md-acc-open" id="mortgage-rates">\n' +
  '<input id="acc-section-mortgage" type="checkbox" class="acc-input">\n' +
  '<span class="acc-icon xs-text-2"></span>\n' +
  '<label for="acc-section-mortgage" class="acc-label section-listing-title">Mortgage</label>\n' +
  '<div class="section-listing-content acc-content">\n' +
  '<div class="section-listing-content-pad xs-flex xs-flex-column sm-flex-row sm-flex-wrap">\n' +
  '<div class="mortgage-inputs xs-col-12 sm-col-6 xs-mb5 sm-mb0 sm-pr3 sm-border-right-lighter">\n' +
  '<div class="mortgage-price">\n' +
  '<label class="bold">Price</label>\n' +
  '<div class="input-icon-wrapper">\n' +
  '<input class="text-input fill-grey-input" type="tel" pattern="[0-9]*" autocomplete="off" id="property-value" placeholder name="property-value" value="499800">\n' +
  '<span class="input-icon input-dollar"></span>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="mortgage-down-payment-percent">\n' +
  '<label class="bold">Down Payment</label>\n' +
  '<div class="input-icon-wrapper">\n' +
  '<input class="text-input fill-grey-input" type="tel" pattern="[0-9]*" autocomplete="off" id="down-payment-amount" placeholder name="down-payment-amount" value="20">\n' +
  '<span class="input-icon input-percent"></span>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="mortgage-term">\n' +
  '<label class="bold">Term</label>\n' +
  '<div class="input-wrapper">\n' +
  '<select class="select fill-grey-input" type="text" id="term-years" placeholder name="term-years">\n' +
  '<option value="5">5 Years</option>\n' +
  '<option value="10">10 Years</option>\n' +
  '<option value="15">15 Years</option>\n' +
  '<option value="20">20 Years</option>\n' +
  '<option value="25" selected="selected">25 Years</option>\n' +
  '</select>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="mortgage-rate">\n' +
  '<label class="bold">Rate</label>\n' +
  '<div class="input-wrapper">\n' +
  '<select class="select fill-grey-input" type="text" id="term-rate" placeholder name="term-rate">\n' +
  '<option value="2.25">2.25% - 5-yr Variable</option><option value="2.44">2.44% - 3-yr Fixed</option><option value="2.49">2.49% - 5-yr Fixed</option><option value="2.79">2.79% - 2-yr Fixed</option><option value="2.89">2.89% - 1-yr Fixed</option><option value="4.59">4.59% - 10-yr Fixed</option> </select>\n' +
  '</div>\n' +
  '</div>\n' +
  '<button class="button button--action button--secondary xs-full-width xs-mt1" id="calculate-mortgage" onclick="calculate_monthly_payment();">Calculate</button>\n' +
  '</div>\n' +
  '<div class="mortgage-outputs xs-col-12 sm-col-6 sm-pl3">\n' +
  '<div class="mortgage-amount xs-mb1">\n' +
  '<label class="bold">Mortgage Amount</label>\n' +
  '<div class="xs-line-height-40" id="loanamount">\n' +
  '$800,000\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="mortgage-down-payment xs-mb1">\n' +
  '<label class="bold">Down Payment Amount</label>\n' +
  '<div class="xs-line-height-40" id="downpayment">\n' +
  '$200,000\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="mortgage-total-payment xs-mb1 xs-mt2 xs-pt3 xs-border-top-lighter">\n' +
  '<label class="bold">Monthly Mortgage Payment</label>\n' +
  '<div class="xs-line-height-40 bold text-1" id="monthly_mortgage_string">\n' +
  '$5,000\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</section>\n' +
  '</div>\n' +
  '<div class="side-column col xs-col-12 md-col-4 md-pl3 xs-relative">\n' +
  '<section id="sticky">\n' +
  '<nav class="nav-actions xs-flex xs-flex-align-center xs-px1 fill-white xs-fixed xs-b0 xs-l0 xs-r0 text-5 xs-shadow-top xs-z4 md-hide">\n' +
  '<div class="nav-actions-cta xs-flex-grow-1 xs-flex xs-flex-justify-end">\n' +
  '<a href="tel:+17784021876" class="button button--small button--action xs-mr1 xs-flex-grow-1" onclick="ga(\'send\', {\n' +
  '  hitType: \'event\',\n' +
  '  eventCategory: \'listing\',\n' +
  '  eventAction: \'call\',\n' +
  '  eventLabel: \'\'\n' +
  '  });">Call</a>\n' +
  '<a href="#contact_us" class="button button--small button--action xs-flex-grow-1">\n' +
  'Email\n' +
  '</a>\n' +
  '</div>\n' +
  '</nav>\n' +
  '</section>\n' +
  '<div class="listing-lead listing-lead-mt md-border md-mb3 fill-white stick md-px3" id="contact_us"><h3 class="xs-full-width bold xs-py3 xs-text-3 sm-text-2">Ask About this Home</h3>\n' +
  '<form class="listing-lead-form xs-mb3" action="https://www.zolo.ca/guide" method="post" name="contact_prop_details" id="top_contact_prop_details"><section class="realtor xs-relative xs-flex xs-flex-align-center xs-mb3">\n' +
  '<div class="realtor-img xs-aspect-1-1 xs-mr2" style="width:80px;">\n' +
  '<img class="realtor-img-photo xs-border rounded aspect-content fill-white js-img-defer" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-img-defer-src="https://photos.zolo.ca/agent-photo-181.jpg?0000-00-00+00%3A00%3A00"/>\n' +
  '</div>\n' +
  '<div class="realtor-details truncate xs-mr2">\n' +
  '<div class="realtor-name xs-text-5 sm-text-4 bold truncate">\n' +
  '<a href="/cdn-cgi/l/email-protection#d99bb8ababa0f798b5b5bcb7f4afb8b7f7bc99a3b6b5b6f7bab8" class="link-primary">Barry Allen (Van)</a>\n' +
  '</div>\n' +
  '<div class="realtor-title xs-text-6 sm-mb1 truncate">Chairman and Realtor</div>\n' +
  '<div class="realtor-contact xs-hide sm-block">778 402-1876</div>\n' +
  '</div>\n' +
  '<div class="realtor-call xs-ml-auto sm-hide">\n' +
  '<a href="Tel:+17784021876" class="button button--secondary" onclick="ga(\'send\', {\n' +
  '  hitType: \'event\',\n' +
  '  eventCategory: \'listing\',\n' +
  '  eventAction: \'call\',\n' +
  '  eventLabel: \'\'\n' +
  '  });"><i class="icon icon-phone xs-mr05"></i>Call</a>\n' +
  '</div>\n' +
  '</section><div class="listing-lead-form-inputs"><div class="input-icon-wrapper">\n' +
  '<input type="text" id="InputFullname" placeholder="Full Name" class="text-input rounded fill-grey-input" name="fullname" data-validate="true" data-required="true" required>\n' +
  '<span class="input-icon input-name"></span>\n' +
  '</div><div class="input-icon-wrapper">\n' +
  '<input type="email" id="inputEmail" placeholder="Email Address" class="text-input rounded fill-grey-input" name="emailaddress" type="email" data-validate="true" data-required="true" required value="ouyexie@gmail.com"/>\n' +
  '<span class="input-icon input-email"></span>\n' +
  '</div>\n' +
  '<div class="input-icon-wrapper">\n' +
  '<input type="tel" id="inputPhone" placeholder="Phone Number (Mobile)" class="text-input rounded fill-grey-input" name="mobile" data-validate="true" data-required="true" required pattern="^[\\s\\S]{10,}$"/>\n' +
  '<span class="input-icon input-phone"></span>\n' +
  '</div>\n' +
  '<textarea id="inputMessage" class="text-input rounded fill-grey-input" rows="4" name="c_message">I would like more information regarding a property at 9288 University Crescent  Burnaby Bc</textarea>\n' +
  '<button type="submit" class="button button--action pill xs-full-width xs-mt1 xs-text-3 xs-line-height-40 bold"><i class="icon icon-house xs-mr1"></i>Go Tour This Home</button>\n' +
  '</div>\n' +
  '<input type="hidden" name="cid" value="1"/>\n' +
  '<input type="hidden" name="pid" value="4646042"/>\n' +
  '<input type="text" name="Email" id="email" placeholder="Your email" class="xs-hide"/>\n' +
  '</form><div class="listing-courtesy xs-py3 xs-border-top-lighter">\n' +
  'Listed By: Nu Stream Realty Inc.\n' +
  '</div></div> </div>\n' +
  '</div>\n' +
  '</section>\n' +
  '<section id="drawer-map" class="listing-map drawer drawer-bottom-up drawer-desktop map md-px3">\n' +
  '<div class="drawer-body">\n' +
  '<div class="listing-map-wrapper xs-relative container md-border xs-full-height">\n' +
  '<div class="map-buttons map-buttons-tl xs-z1 xs-absolute xs-t2 xs-l2">\n' +
  '<button class="button button--white-icon button-icon-50 button-shadow circle xs-block md-hide drawer-map-close"><i class="icon icon-close"></i></button>\n' +
  '</div>\n' +
  '<div class="map-buttons map-buttons-tr xs-z1 xs-absolute xs-t2 xs-r2">\n' +
  '<div class="button button--white-icon button-icon-50 button-shadow circle xs-block btn-map-type"><i class="icon icon-public"></i></div>\n' +
  '</div>\n' +
  '<div class="map-buttons map-buttons-br xs-z1 xs-absolute xs-b3 xs-r2">\n' +
  '<div class="zoom-control md-mt4 xs-hide md-block">\n' +
  '<div class="button button--white-icon button-icon-50 button-shadow circle xs-block" id="zoomin"><i class="icon icon-add"></i></div>\n' +
  '<div class="button button--white-icon button-icon-50 button-shadow circle xs-block" id="zoomout"><i class="icon icon-remove"></i></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div id="map-loading" class="xs-full-width xs-absolute xs-b0 xs-z1">\n' +
  '<div class="progress progress-warning progress-striped xs-absolute xs-b0 xs-l0 xs-r0">\n' +
  '<div class="bar xs-full-width"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div id="ap_map_canvas" class="listing-map-container xs-full-height xs-full-width"></div>\n' +
  '</div>\n' +
  '</div>\n' +
  '</section>\n' +
  '<section class="gut">\n' +
  '<section class="section-similar print-hide xs-mb4 xs-pt3 md-pt5">\n' +
  '<div class="container">\n' +
  '<h3 class="bold xs-text-3 xs-mb1 sm-mt3 md-text-2 md-mb3">Similar Homes</h3>\n' +
  '<div class="listings-wrapper listing-similar-sidescroll no-scrollbar">\n' +
  '<ul class="listings md-flex md-flex-wrap list-unstyled" style="font-size: 0;">\n' +
  '<li class="listing-column text-4"><article class="card-listing xs-relative xs-full-height flex xs-flex-column-reverse new"><div class="card-listing--details xs-pt2 xs-text-5 fill-white flex xs-flex-column-reverse xs-flex-shrink-0"><div class="card-listing--location text-secondary truncate" itemscope itemtype="http://schema.org/SingleFamilyResidence"><a href="https://www.zolo.ca/burnaby-real-estate/9229-university-crescent/93" class="address link-secondary" itemprop="address" itemscope itemtype="http://schema.org/PostalAddress"><h3 class="card-listing--location xs-inline"><span class="street" itemprop="streetAddress">93-9229 University Crescent</span>, <span class="city" itemprop="addressLocality">Burnaby</span>, <span class="province" itemprop="addressRegion">BC</span></h3></a> <span class="neighbourhood xs-ml05">(Simon Fraser Univer.)</span><span itemprop="geo" itemscope itemtype="http://schema.org/GeoCoordinates"><meta itemprop="latitude" content="49.279034"><meta itemprop="longitude" content="-122.904877"></span></div><ul class="card-listing--values bold truncate xs-mb05 list-unstyled"><li class="price xs-inline xs-mr1">$548,800</li><li class="xs-inline xs-mr1">2 bd</li><li class="xs-inline xs-mr1">2 ba</li><li class="xs-inline xs-mr1">1111 sqft</li><li class="xs-hide sm-inline age">Built in <span>2006</span></li></ul></div><div class="card-listing--image xs-flex-grow-1 xs-relative xs-overflow-hidden type-townhouse"><a href="https://www.zolo.ca/burnaby-real-estate/9229-university-crescent/93" class="xs-block xs-aspect-3-2 card-listing--image-link">\n' +
  '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-img-defer-src="https://photos.zolo.ca/93-9229-university-crescent-burnaby-R2204769-1.jpg?2017-09-12+19%3A06%3A00" class="card-listing--img aspect-content object-fit-cover xs-full-width xs-full-height xs-z1  fill-grey-bg-2 js-modal-listing js-img-defer" id="4772586" alt="Townhouse for sale at 9229 University Cres Unit 93 Burnaby British Columbia"/>\n' +
  '</a><div class="xs-absolute xs-t2 xs-r2 xs-z2 favorite-wrapper"><a href="#" data-favorite="4772586" class="favorite circle xs-block "></a></div><div class="xs-absolute xs-b2 xs-r2 xs-z2 pointer-events-none"><span class="card-listing--tag-circle info-type type-townhouse"></span></div><div class="xs-absolute xs-b2 xs-l2 xs-z2 xs-inline-block pointer-events-none"><div class="text-primary-inverse text-shadow xs-text-6 xs-mb05">Open: Sat Sep 16, 1-3</div><span class="card-listing--tag xs-inline-block fill-blue text-white bold rounded xs-mr05">1 day</span><span class="card-listing--tag xs-inline-block fill-orange text-white bold rounded">Hot Home</span></div></div></article></li><li class="listing-column text-4"><article class="card-listing xs-relative xs-full-height flex xs-flex-column-reverse new"><div class="card-listing--details xs-pt2 xs-text-5 fill-white flex xs-flex-column-reverse xs-flex-shrink-0"><div class="card-listing--location text-secondary truncate" itemscope itemtype="http://schema.org/SingleFamilyResidence"><a href="https://www.zolo.ca/burnaby-real-estate/9025-highland-court/402" class="address link-secondary" itemprop="address" itemscope itemtype="http://schema.org/PostalAddress"><h3 class="card-listing--location xs-inline"><span class="street" itemprop="streetAddress">402-9025 Highland Court</span>, <span class="city" itemprop="addressLocality">Burnaby</span>, <span class="province" itemprop="addressRegion">BC</span></h3></a> <span class="neighbourhood xs-ml05">(Simon Fraser Univer.)</span><span itemprop="geo" itemscope itemtype="http://schema.org/GeoCoordinates"><meta itemprop="latitude" content="49.279121"><meta itemprop="longitude" content="-122.909790"></span></div><ul class="card-listing--values bold truncate xs-mb05 list-unstyled"><li class="price xs-inline xs-mr1">$529,900</li><li class="xs-inline xs-mr1">2 bd</li><li class="xs-inline xs-mr1">2 ba</li><li class="xs-inline xs-mr1">830 sqft</li><li class="xs-hide sm-inline age">Built in <span>2013</span></li></ul></div><div class="card-listing--image xs-flex-grow-1 xs-relative xs-overflow-hidden type-condo"><a href="https://www.zolo.ca/burnaby-real-estate/9025-highland-court/402" class="xs-block xs-aspect-3-2 card-listing--image-link">\n' +
  '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-img-defer-src="https://photos.zolo.ca/402-9025-highland-court-burnaby-R2138863-2.jpg?2017-02-16+00%3A54%3A00" class="card-listing--img aspect-content object-fit-cover xs-full-width xs-full-height xs-z1  fill-grey-bg-2 js-modal-listing js-img-defer" id="4744681" alt="Condo for sale at 9025 Highland Ct Unit 402 Burnaby British Columbia"/>\n' +
  '</a><div class="xs-absolute xs-t2 xs-r2 xs-z2 favorite-wrapper"><a href="#" data-favorite="4744681" class="favorite circle xs-block "></a></div><div class="xs-absolute xs-b2 xs-r2 xs-z2 pointer-events-none"><span class="card-listing--tag-circle info-type type-condo"></span></div><div class="xs-absolute xs-b2 xs-l2 xs-z2 xs-inline-block pointer-events-none"><span class="card-listing--tag xs-inline-block fill-blue text-white bold rounded xs-mr05">211 days</span></div></div></article></li><li class="listing-column text-4"><article class="card-listing xs-relative xs-full-height flex xs-flex-column-reverse new"><div class="card-listing--details xs-pt2 xs-text-5 fill-white flex xs-flex-column-reverse xs-flex-shrink-0"><div class="card-listing--location text-secondary truncate" itemscope itemtype="http://schema.org/SingleFamilyResidence"><a href="https://www.zolo.ca/burnaby-real-estate/9168-slopes-mews/308" class="address link-secondary" itemprop="address" itemscope itemtype="http://schema.org/PostalAddress"><h3 class="card-listing--location xs-inline"><span class="street" itemprop="streetAddress">308-9168 Slopes Mews</span>, <span class="city" itemprop="addressLocality">Burnaby</span>, <span class="province" itemprop="addressRegion">BC</span></h3></a> <span class="neighbourhood xs-ml05">(Simon Fraser Univer.)</span><span itemprop="geo" itemscope itemtype="http://schema.org/GeoCoordinates"><meta itemprop="latitude" content="49.278095"><meta itemprop="longitude" content="-122.919884"></span></div><ul class="card-listing--values bold truncate xs-mb05 list-unstyled"><li class="price xs-inline xs-mr1">$499,000</li><li class="xs-inline xs-mr1">2 bd</li><li class="xs-inline xs-mr1">1 ba</li><li class="xs-inline xs-mr1">743 sqft</li><li class="xs-hide sm-inline age">Built in <span>2017</span></li></ul></div><div class="card-listing--image xs-flex-grow-1 xs-relative xs-overflow-hidden type-condo"><a href="https://www.zolo.ca/burnaby-real-estate/9168-slopes-mews/308" class="xs-block xs-aspect-3-2 card-listing--image-link">\n' +
  '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-img-defer-src="https://photos.zolo.ca/308-9168-slopes-mews-burnaby-R2201456-2.jpg?2017-09-03+06%3A02%3A00" class="card-listing--img aspect-content object-fit-cover xs-full-width xs-full-height xs-z1  fill-grey-bg-2 js-modal-listing js-img-defer" id="4741742" alt="Condo for sale at 9168 Slopes Me Unit 308 Burnaby British Columbia"/>\n' +
  '</a><div class="xs-absolute xs-t2 xs-r2 xs-z2 favorite-wrapper"><a href="#" data-favorite="4741742" class="favorite circle xs-block "></a></div><div class="xs-absolute xs-b2 xs-r2 xs-z2 pointer-events-none"><span class="card-listing--tag-circle info-type type-condo"></span></div><div class="xs-absolute xs-b2 xs-l2 xs-z2 xs-inline-block pointer-events-none"><span class="card-listing--tag xs-inline-block fill-blue text-white bold rounded xs-mr05">13 days</span></div></div></article></li><li class="listing-column text-4"><article class="card-listing xs-relative xs-full-height flex xs-flex-column-reverse new"><div class="card-listing--details xs-pt2 xs-text-5 fill-white flex xs-flex-column-reverse xs-flex-shrink-0"><div class="card-listing--location text-secondary truncate" itemscope itemtype="http://schema.org/SingleFamilyResidence"><a href="https://www.zolo.ca/burnaby-real-estate/9877-university-crescent/403" class="address link-secondary" itemprop="address" itemscope itemtype="http://schema.org/PostalAddress"><h3 class="card-listing--location xs-inline"><span class="street" itemprop="streetAddress">403-9877 University Crescent</span>, <span class="city" itemprop="addressLocality">Burnaby</span>, <span class="province" itemprop="addressRegion">BC</span></h3></a> <span class="neighbourhood xs-ml05">(Simon Fraser Univer.)</span><span itemprop="geo" itemscope itemtype="http://schema.org/GeoCoordinates"><meta itemprop="latitude" content="49.277370"><meta itemprop="longitude" content="-122.906303"></span></div><ul class="card-listing--values bold truncate xs-mb05 list-unstyled"><li class="price xs-inline xs-mr1">$518,000</li><li class="xs-inline xs-mr1">2 bd</li><li class="xs-inline xs-mr1">1 ba</li><li class="xs-inline xs-mr1">742 sqft</li><li class="xs-hide sm-inline age">Built in <span>2017</span></li></ul></div><div class="card-listing--image xs-flex-grow-1 xs-relative xs-overflow-hidden type-condo"><a href="https://www.zolo.ca/burnaby-real-estate/9877-university-crescent/403" class="xs-block xs-aspect-3-2 card-listing--image-link">\n' +
  '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-img-defer-src="https://photos.zolo.ca/403-9877-university-crescent-burnaby-R2200781-2.jpg?2017-08-29+23%3A26%3A00" class="card-listing--img aspect-content object-fit-cover xs-full-width xs-full-height xs-z1  fill-grey-bg-2 js-modal-listing js-img-defer" id="4734287" alt="Condo for sale at 9877 University Cres Unit 403 Burnaby British Columbia"/>\n' +
  '</a><div class="xs-absolute xs-t2 xs-r2 xs-z2 favorite-wrapper"><a href="#" data-favorite="4734287" class="favorite circle xs-block "></a></div><div class="xs-absolute xs-b2 xs-r2 xs-z2 pointer-events-none"><span class="card-listing--tag-circle info-type type-condo"></span></div><div class="xs-absolute xs-b2 xs-l2 xs-z2 xs-inline-block pointer-events-none"><span class="card-listing--tag xs-inline-block fill-blue text-white bold rounded xs-mr05">15 days</span></div></div></article></li><li class="listing-column text-4"><article class="card-listing xs-relative xs-full-height flex xs-flex-column-reverse new"><div class="card-listing--details xs-pt2 xs-text-5 fill-white flex xs-flex-column-reverse xs-flex-shrink-0"><div class="card-listing--location text-secondary truncate" itemscope itemtype="http://schema.org/SingleFamilyResidence"><a href="https://www.zolo.ca/burnaby-real-estate/9222-university-crescent/306" class="address link-secondary" itemprop="address" itemscope itemtype="http://schema.org/PostalAddress"><h3 class="card-listing--location xs-inline"><span class="street" itemprop="streetAddress">306-9222 University Crescent</span>, <span class="city" itemprop="addressLocality">Burnaby</span>, <span class="province" itemprop="addressRegion">BC</span></h3></a> <span class="neighbourhood xs-ml05">(Simon Fraser Univer.)</span><span itemprop="geo" itemscope itemtype="http://schema.org/GeoCoordinates"><meta itemprop="latitude" content="49.279907"><meta itemprop="longitude" content="-122.905945"></span></div><ul class="card-listing--values bold truncate xs-mb05 list-unstyled"><li class="price xs-inline xs-mr1">$528,000</li><li class="xs-inline xs-mr1">2 bd</li><li class="xs-inline xs-mr1">2 ba</li><li class="xs-inline xs-mr1">963 sqft</li><li class="xs-hide sm-inline age">Built in <span>2009</span></li></ul></div><div class="card-listing--image xs-flex-grow-1 xs-relative xs-overflow-hidden type-condo"><a href="https://www.zolo.ca/burnaby-real-estate/9222-university-crescent/306" class="xs-block xs-aspect-3-2 card-listing--image-link">\n' +
  '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-img-defer-src="https://photos.zolo.ca/306-9222-university-crescent-burnaby-R2199895-2.jpg?2017-09-11+21%3A13%3A00" class="card-listing--img aspect-content object-fit-cover xs-full-width xs-full-height xs-z1  fill-grey-bg-2 js-modal-listing js-img-defer" id="4724167" alt="Condo for sale at 9222 University Cres Unit 306 Burnaby British Columbia"/>\n' +
  '</a><div class="xs-absolute xs-t2 xs-r2 xs-z2 favorite-wrapper"><a href="#" data-favorite="4724167" class="favorite circle xs-block "></a></div><div class="xs-absolute xs-b2 xs-r2 xs-z2 pointer-events-none"><span class="card-listing--tag-circle info-type type-condo"></span></div><div class="xs-absolute xs-b2 xs-l2 xs-z2 xs-inline-block pointer-events-none"><span class="card-listing--tag xs-inline-block fill-blue text-white bold rounded xs-mr05">19 days</span></div></div></article></li><li class="listing-column text-4"><article class="card-listing xs-relative xs-full-height flex xs-flex-column-reverse new"><div class="card-listing--details xs-pt2 xs-text-5 fill-white flex xs-flex-column-reverse xs-flex-shrink-0"><div class="card-listing--location text-secondary truncate" itemscope itemtype="http://schema.org/SingleFamilyResidence"><a href="https://www.zolo.ca/burnaby-real-estate/9250-university-high-street/308" class="address link-secondary" itemprop="address" itemscope itemtype="http://schema.org/PostalAddress"><h3 class="card-listing--location xs-inline"><span class="street" itemprop="streetAddress">308-9250 University High Street</span>, <span class="city" itemprop="addressLocality">Burnaby</span>, <span class="province" itemprop="addressRegion">BC</span></h3></a> <span class="neighbourhood xs-ml05">(Simon Fraser Univer.)</span><span itemprop="geo" itemscope itemtype="http://schema.org/GeoCoordinates"><meta itemprop="latitude" content="49.277435"><meta itemprop="longitude" content="-122.907288"></span></div><ul class="card-listing--values bold truncate xs-mb05 list-unstyled"><li class="price xs-inline xs-mr1">$508,000</li><li class="xs-inline xs-mr1">2 bd</li><li class="xs-inline xs-mr1">2 ba</li><li class="xs-inline xs-mr1">879 sqft</li><li class="xs-hide sm-inline age">Built in <span>2012</span></li></ul></div><div class="card-listing--image xs-flex-grow-1 xs-relative xs-overflow-hidden type-condo"><a href="https://www.zolo.ca/burnaby-real-estate/9250-university-high-street/308" class="xs-block xs-aspect-3-2 card-listing--image-link">\n' +
  '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-img-defer-src="https://photos.zolo.ca/308-9250-university-high-street-burnaby-R2198219-2.jpg?2017-08-18+16%3A29%3A00" class="card-listing--img aspect-content object-fit-cover xs-full-width xs-full-height xs-z1  fill-grey-bg-2 js-modal-listing js-img-defer" id="4708135" alt="Condo for sale at 9250 University High St Unit 308 Burnaby British Columbia"/>\n' +
  '</a><div class="xs-absolute xs-t2 xs-r2 xs-z2 favorite-wrapper"><a href="#" data-favorite="4708135" class="favorite circle xs-block "></a></div><div class="xs-absolute xs-b2 xs-r2 xs-z2 pointer-events-none"><span class="card-listing--tag-circle info-type type-condo"></span></div><div class="xs-absolute xs-b2 xs-l2 xs-z2 xs-inline-block pointer-events-none"><span class="card-listing--tag xs-inline-block fill-blue text-white bold rounded xs-mr05">28 days</span></div></div></article></li><li class="listing-column text-4"><article class="card-listing xs-relative xs-full-height flex xs-flex-column-reverse new"><div class="card-listing--details xs-pt2 xs-text-5 fill-white flex xs-flex-column-reverse xs-flex-shrink-0"><div class="card-listing--location text-secondary truncate" itemscope itemtype="http://schema.org/SingleFamilyResidence"><a href="https://www.zolo.ca/burnaby-real-estate/9232-university-crescent/405" class="address link-secondary" itemprop="address" itemscope itemtype="http://schema.org/PostalAddress"><h3 class="card-listing--location xs-inline"><span class="street" itemprop="streetAddress">405-9232 University Crescent</span>, <span class="city" itemprop="addressLocality">Burnaby</span>, <span class="province" itemprop="addressRegion">BC</span></h3></a> <span class="neighbourhood xs-ml05">(Simon Fraser Univer.)</span><span itemprop="geo" itemscope itemtype="http://schema.org/GeoCoordinates"><meta itemprop="latitude" content="49.279888"><meta itemprop="longitude" content="-122.905708"></span></div><ul class="card-listing--values bold truncate xs-mb05 list-unstyled"><li class="price xs-inline xs-mr1">$528,888</li><li class="xs-inline xs-mr1">2 bd</li><li class="xs-inline xs-mr1">2 ba</li><li class="xs-inline xs-mr1">993 sqft</li><li class="xs-hide sm-inline age">Built in <span>2006</span></li></ul></div><div class="card-listing--image xs-flex-grow-1 xs-relative xs-overflow-hidden type-condo"><a href="https://www.zolo.ca/burnaby-real-estate/9232-university-crescent/405" class="xs-block xs-aspect-3-2 card-listing--image-link">\n' +
  '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-img-defer-src="https://photos.zolo.ca/405-9232-university-crescent-burnaby-R2198126-2.jpg?2017-08-17+21%3A01%3A00" class="card-listing--img aspect-content object-fit-cover xs-full-width xs-full-height xs-z1  fill-grey-bg-2 js-modal-listing js-img-defer" id="4708076" alt="Condo for sale at 9232 University Cres Unit 405 Burnaby British Columbia"/>\n' +
  '</a><div class="xs-absolute xs-t2 xs-r2 xs-z2 favorite-wrapper"><a href="#" data-favorite="4708076" class="favorite circle xs-block "></a></div><div class="xs-absolute xs-b2 xs-r2 xs-z2 pointer-events-none"><span class="card-listing--tag-circle info-type type-condo"></span></div><div class="xs-absolute xs-b2 xs-l2 xs-z2 xs-inline-block pointer-events-none"><span class="card-listing--tag xs-inline-block fill-blue text-white bold rounded xs-mr05">26 days</span></div></div></article></li><li class="listing-column text-4"><article class="card-listing xs-relative xs-full-height flex xs-flex-column-reverse new"><div class="card-listing--details xs-pt2 xs-text-5 fill-white flex xs-flex-column-reverse xs-flex-shrink-0"><div class="card-listing--location text-secondary truncate" itemscope itemtype="http://schema.org/SingleFamilyResidence"><a href="https://www.zolo.ca/burnaby-real-estate/1695-augusta-avenue/111" class="address link-secondary" itemprop="address" itemscope itemtype="http://schema.org/PostalAddress"><h3 class="card-listing--location xs-inline"><span class="street" itemprop="streetAddress">111-1695 Augusta Avenue</span>, <span class="city" itemprop="addressLocality">Burnaby</span>, <span class="province" itemprop="addressRegion">BC</span></h3></a> <span class="neighbourhood xs-ml05">(Simon Fraser Univer.)</span><span itemprop="geo" itemscope itemtype="http://schema.org/GeoCoordinates"><meta itemprop="latitude" content="49.268028"><meta itemprop="longitude" content="-122.951317"></span></div><ul class="card-listing--values bold truncate xs-mb05 list-unstyled"><li class="price xs-inline xs-mr1">$539,900</li><li class="xs-inline xs-mr1">2 bd</li><li class="xs-inline xs-mr1">2 ba</li><li class="xs-inline xs-mr1">1102 sqft</li><li class="xs-hide sm-inline age">Built in <span>1988</span></li></ul></div><div class="card-listing--image xs-flex-grow-1 xs-relative xs-overflow-hidden type-condo"><a href="https://www.zolo.ca/burnaby-real-estate/1695-augusta-avenue/111" class="xs-block xs-aspect-3-2 card-listing--image-link">\n' +
  '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-img-defer-src="https://photos.zolo.ca/111-1695-augusta-avenue-burnaby-R2198036-2.jpg?2017-09-11+15%3A24%3A00" class="card-listing--img aspect-content object-fit-cover xs-full-width xs-full-height xs-z1  fill-grey-bg-2 js-modal-listing js-img-defer" id="4707005" alt="Condo for sale at 1695 Augusta Ave Unit 111 Burnaby British Columbia"/>\n' +
  '</a><div class="xs-absolute xs-t2 xs-r2 xs-z2 favorite-wrapper"><a href="#" data-favorite="4707005" class="favorite circle xs-block "></a></div><div class="xs-absolute xs-b2 xs-r2 xs-z2 pointer-events-none"><span class="card-listing--tag-circle info-type type-condo"></span></div><div class="xs-absolute xs-b2 xs-l2 xs-z2 xs-inline-block pointer-events-none"><span class="card-listing--tag xs-inline-block fill-blue text-white bold rounded xs-mr05">28 days</span></div></div></article></li><li class="listing-column text-4"><article class="card-listing xs-relative xs-full-height flex xs-flex-column-reverse new"><div class="card-listing--details xs-pt2 xs-text-5 fill-white flex xs-flex-column-reverse xs-flex-shrink-0"><div class="card-listing--location text-secondary truncate" itemscope itemtype="http://schema.org/SingleFamilyResidence"><a href="https://www.zolo.ca/burnaby-real-estate/9229-university-crescent/130" class="address link-secondary" itemprop="address" itemscope itemtype="http://schema.org/PostalAddress"><h3 class="card-listing--location xs-inline"><span class="street" itemprop="streetAddress">130-9229 University Crescent</span>, <span class="city" itemprop="addressLocality">Burnaby</span>, <span class="province" itemprop="addressRegion">BC</span></h3></a> <span class="neighbourhood xs-ml05">(Simon Fraser Univer.)</span><span itemprop="geo" itemscope itemtype="http://schema.org/GeoCoordinates"><meta itemprop="latitude" content="49.279034"><meta itemprop="longitude" content="-122.904877"></span></div><ul class="card-listing--values bold truncate xs-mb05 list-unstyled"><li class="price xs-inline xs-mr1">$578,000</li><li class="xs-inline xs-mr1">2 bd</li><li class="xs-inline xs-mr1">2 ba</li><li class="xs-inline xs-mr1">1113 sqft</li><li class="xs-hide sm-inline age">Built in <span>2006</span></li></ul></div><div class="card-listing--image xs-flex-grow-1 xs-relative xs-overflow-hidden type-townhouse"><a href="https://www.zolo.ca/burnaby-real-estate/9229-university-crescent/130" class="xs-block xs-aspect-3-2 card-listing--image-link">\n' +
  '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-img-defer-src="https://photos.zolo.ca/130-9229-university-crescent-burnaby-R2194943-1.jpg?2017-08-13+17%3A44%3A00" class="card-listing--img aspect-content object-fit-cover xs-full-width xs-full-height xs-z1  fill-grey-bg-2 js-modal-listing js-img-defer" id="4671612" alt="Townhouse for sale at 9229 University Cres Unit 130 Burnaby British Columbia"/>\n' +
  '</a><div class="xs-absolute xs-t2 xs-r2 xs-z2 favorite-wrapper"><a href="#" data-favorite="4671612" class="favorite circle xs-block "></a></div><div class="xs-absolute xs-b2 xs-r2 xs-z2 pointer-events-none"><span class="card-listing--tag-circle info-type type-townhouse"></span></div><div class="xs-absolute xs-b2 xs-l2 xs-z2 xs-inline-block pointer-events-none"><span class="card-listing--tag xs-inline-block fill-blue text-white bold rounded xs-mr05">35 days</span></div></div></article></li><li class="listing-column text-4"><article class="card-listing xs-relative xs-full-height flex xs-flex-column-reverse new"><div class="card-listing--details xs-pt2 xs-text-5 fill-white flex xs-flex-column-reverse xs-flex-shrink-0"><div class="card-listing--location text-secondary truncate" itemscope itemtype="http://schema.org/SingleFamilyResidence"><a href="https://www.zolo.ca/burnaby-real-estate/9339-university-crescent/403" class="address link-secondary" itemprop="address" itemscope itemtype="http://schema.org/PostalAddress"><h3 class="card-listing--location xs-inline"><span class="street" itemprop="streetAddress">403-9339 University Crescent</span>, <span class="city" itemprop="addressLocality">Burnaby</span>, <span class="province" itemprop="addressRegion">BC</span></h3></a> <span class="neighbourhood xs-ml05">(Simon Fraser Univer.)</span><span itemprop="geo" itemscope itemtype="http://schema.org/GeoCoordinates"><meta itemprop="latitude" content="49.277370"><meta itemprop="longitude" content="-122.906303"></span></div><ul class="card-listing--values bold truncate xs-mb05 list-unstyled"><li class="price xs-inline xs-mr1">$495,800</li><li class="xs-inline xs-mr1">2 bd</li><li class="xs-inline xs-mr1">2 ba</li><li class="xs-inline xs-mr1">959 sqft</li><li class="xs-hide sm-inline age">Built in <span>2005</span></li></ul></div><div class="card-listing--image xs-flex-grow-1 xs-relative xs-overflow-hidden type-condo"><a href="https://www.zolo.ca/burnaby-real-estate/9339-university-crescent/403" class="xs-block xs-aspect-3-2 card-listing--image-link">\n' +
  '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-img-defer-src="https://photos.zolo.ca/403-9339-university-crescent-burnaby-R2194425-2.jpg?2017-08-09+03%3A28%3A00" class="card-listing--img aspect-content object-fit-cover xs-full-width xs-full-height xs-z1  fill-grey-bg-2 js-modal-listing js-img-defer" id="4662906" alt="Condo for sale at 9339 University Cres Unit 403 Burnaby British Columbia"/>\n' +
  '</a><div class="xs-absolute xs-t2 xs-r2 xs-z2 favorite-wrapper"><a href="#" data-favorite="4662906" class="favorite circle xs-block "></a></div><div class="xs-absolute xs-b2 xs-r2 xs-z2 pointer-events-none"><span class="card-listing--tag-circle info-type type-condo"></span></div><div class="xs-absolute xs-b2 xs-l2 xs-z2 xs-inline-block pointer-events-none"><span class="card-listing--tag xs-inline-block fill-blue text-white bold rounded xs-mr05">42 days</span></div></div></article></li> </ul>\n' +
  '</div>\n' +
  '</div>\n' +
  '</section>\n' +
  '<section class="guide-related xs-border-top acc md-acc-open  md-mt6 ">\n' +
  '<input class="acc-input" id="acc-links" type="checkbox"><span class="acc-icon xs-text-2"></span> <label class="acc-label xs-py3 xs-text-3 bold md-hide" for="acc-links">You Might Also Like&hellip;</label>\n' +
  '<article class="text-secondary acc-content  xs-flex xs-flex-column ">\n' +
  '<section class="xs-flex-order-2 md-flex-order-1">\n' +
  '<div class="text-primary container-xs clearfix xs-pb3 md-py6">\n' +
  '<section class="guide-prices">\n' +
  '<h2 class="xs-mb3">About 408 - 9288 University Crescent, Burnaby</h2>\n' +
  '<p>Want to compare this condo to other condos in the condiminium? Take a look at the other active <a href="https://www.zolo.ca/burnaby-real-estate/9288-university-crescent">9288 University Crescent condo</a>. If this property isn\'t quite what you\'re looking for, view the other <span class="badge badge--outline xs-ml0">24</span> <a href="https://www.zolo.ca/burnaby-real-estate/simon-fraser-univer/condos">condos for sale in Simon Fraser Univer</a>, <span class="badge badge--outline xs-ml0">272</span> <a href="https://www.zolo.ca/burnaby-real-estate/condos">condos for sale in Burnaby</a>.</p>\n' +
  '9288 University Crescent is a home located in Burnaby. It is situated in the community of Simon Fraser Univer.. Nearby districts include Sperling Duthie, Montecito and Westridge Bn. University Crescent has 18 postings presently for sale, while the community of Simon Fraser Univer. has 38 homes for sale. That\'s just 7.85% of the 484 total properties listed in the city of Burnaby. The average asking price of a home in Simon Fraser Univer. is $915,907, with an estimated mortgage of $3,196 per month.* That is 9% higher than the average list price of $836,611 found across all Burnaby homes for sale. Properties listed in Simon Fraser Univer. are an average of 1,517 sq ft, with 3 beds and 2 baths. The majority of homes for sale in the community around 9288 University Crescent are houses.<p class="muted">* Monthly payments are an estimate based on a mortgage with 20% down @ 2.25% with a 5-yr Variable rate</p>\n' +
  '<div class="listing-summary-schema xs-mb3">\n' +
  '<span>\n' +
  'MLS: R2193442 </span>\n' +
  '<span class="xs-mx1">&ndash;</span>\n' +
  '<span>$499,800</span>\n' +
  '<span class="xs-mx1">&ndash;</span>\n' +
  '<span>\n' +
  '2 bedroom Apartment/Condo in Simon Fraser Univer. Burnaby </span>\n' +
  '</div>\n' +
  '</section>\n' +
  '</div>\n' +
  '</section>\n' +
  '<div class="container xs-pb3 md-py5  xs-flex-order-1 md-flex-order-2  xs-full-width  md-border-top ">\n' +
  '<div class="sm-flex sm-flex-wrap  md-flex-justify-center ">\n' +
  '<nav class="xs-col-12 sm-col-6 md-col-3 sm-pr3 xs-mb3 md-mb0">\n' +
  '<h4 class="bold xs-mb1">You Are Here...</h4>\n' +
  '<ol class="list-unstyled xs-line-height-40 sm-line-height-inherit">\n' +
  '<li class="xs-mb1 truncate">\n' +
  '<i class="icon icon-keyboard-arrow-right text-muted"></i><a href="https://www.zolo.ca/" class="link-secondary">For Sale</a></li><li class="xs-mb1 truncate">\n' +
  '<i class="icon icon-keyboard-arrow-right text-muted"></i><a href="https://www.zolo.ca/burnaby-real-estate" class="link-secondary">Burnaby</a></li><li class="xs-mb1 truncate">\n' +
  '<i class="icon icon-keyboard-arrow-right text-muted"></i><a href="https://www.zolo.ca/burnaby-real-estate/simon-fraser-univer" class="link-secondary">Simon Fraser Univer.</a></li><li class="xs-mb1 truncate">\n' +
  '<i class="icon icon-keyboard-arrow-right text-muted"></i><a href="https://www.zolo.ca/burnaby-real-estate/9288-university-crescent" class="link-secondary">9288 University Crescent</a></li><li class="xs-mb1 truncate">\n' +
  '<i class="icon icon-keyboard-arrow-right text-muted"></i><span class="text-muted">Unit 408</span></li> </ol>\n' +
  '</nav>\n' +
  '<nav class="xs-col-12 sm-col-6 md-col-3 sm-pr3 xs-mb3 md-mb0">\n' +
  '<h4 class="bold xs-mb1">Nearby Searches</h4>\n' +
  '<ul class="list-unstyled">\n' +
  '<li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/burnaby-real-estate/condos" class="link-secondary">Burnaby Condos</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/new-westminster-real-estate/condos" class="link-secondary">New Westminster Condos</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/port-moody-real-estate/condos" class="link-secondary">Port Moody Condos</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/north-vancouver-real-estate/condos" class="link-secondary">North Vancouver Condos</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/anmore-real-estate/condos" class="link-secondary">Anmore Condos</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/vancouver-real-estate/condos" class="link-secondary">Vancouver Condos</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/delta-real-estate/condos" class="link-secondary">Delta Condos</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/richmond-real-estate/condos" class="link-secondary">Richmond Condos</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/coquitlam-real-estate/condos" class="link-secondary">Coquitlam Condos</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/port-coquitlam-real-estate/condos" class="link-secondary">Port Coquitlam Condos</a>\n' +
  '</li> </ul>\n' +
  '</nav>\n' +
  '<nav class="xs-col-12 sm-col-6 md-col-3 sm-pr3 xs-mb3 md-mb0">\n' +
  '<h4 class="bold xs-mb1">Nearby Cities</h4>\n' +
  '<ul class="list-unstyled">\n' +
  '<li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/new-westminster-real-estate" class="link-secondary">New Westminster Real Estate</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/port-moody-real-estate" class="link-secondary">Port Moody Real Estate</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/north-vancouver-real-estate" class="link-secondary">North Vancouver Real Estate</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/anmore-real-estate" class="link-secondary">Anmore Real Estate</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/vancouver-real-estate" class="link-secondary">Vancouver Real Estate</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/delta-real-estate" class="link-secondary">Delta Real Estate</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/richmond-real-estate" class="link-secondary">Richmond Real Estate</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/coquitlam-real-estate" class="link-secondary">Coquitlam Real Estate</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/port-coquitlam-real-estate" class="link-secondary">Port Coquitlam Real Estate</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/west-vancouver-real-estate" class="link-secondary">West Vancouver Real Estate</a>\n' +
  '</li> </ul>\n' +
  '</nav>\n' +
  '<nav class="xs-col-12 sm-col-6 md-col-3 sm-pr3 xs-mb3 md-mb0">\n' +
  '<h4 class="bold xs-mb1">Popular Cities</h4>\n' +
  '<ul class="list-unstyled">\n' +
  '<li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/calgary-real-estate" class="link-secondary">Calgary Real Estate</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/edmonton-real-estate" class="link-secondary">Edmonton Real Estate</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/toronto-real-estate" class="link-secondary">Toronto Real Estate</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/regina-real-estate" class="link-secondary">Regina Real Estate</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/surrey-real-estate" class="link-secondary">Surrey Real Estate</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/saskatoon-real-estate" class="link-secondary">Saskatoon Real Estate</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/ottawa-real-estate" class="link-secondary">Ottawa Real Estate</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/mississauga-real-estate" class="link-secondary">Mississauga Real Estate</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/brampton-real-estate" class="link-secondary">Brampton Real Estate</a>\n' +
  '</li><li class="xs-mb1 truncate">\n' +
  '<a href="https://www.zolo.ca/hamilton-real-estate" class="link-secondary">Hamilton Real Estate</a>\n' +
  '</li> </ul>\n' +
  '</nav>\n' +
  '</div>\n' +
  '</div>\n' +
  '</article>\n' +
  '</section>\n' +
  '<section class="xs-border-top md-border-top-none acc md-acc-open">\n' +
  '<input class="acc-input" id="acc-disclaimer" type="checkbox">\n' +
  '<span class="acc-icon xs-text-2"></span>\n' +
  '<label class="acc-label xs-py3 xs-text-3 bold md-hide" for="acc-disclaimer">Disclaimer</label>\n' +
  '<article class="text-secondary acc-content">\n' +
  '<div class="container flex xs-flex-column sm-flex-row xs-pb3 md-py5 md-border-top">\n' +
  '<div>\n' +
  'The listing data is provided under copyright by the Chilliwack & District Real Estate Board, Fraser Valley Real Estate Board or Real Estate Board of Greater Vancouver. The listing data is deemed reliable but is not guaranteed accurate by the Chilliwack & District Real Estate Board, Fraser Valley Real Estate Board, Real Estate Board of Greater Vancouver, nor Zolo. </div>\n' +
  '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" data-img-defer-src="https://www.zolo.ca/img/mlsrdetail.png" class="reciprocity-logo xs-mt3 sm-mt0 sm-ml3 xs-flex-shrink-0 bg-contain bg-center js-img-defer" style="height:43px; width:106px;">\n' +
  '</div>\n' +
  '</article>\n' +
  '</section></section>\n' +
  '<footer class="xs-relative xs-px3 md-pb5 text-secondary fill-white">\n' +
  '<div class="footer-nav-boxes xs-border-top xs-flex xs-flex-column md-flex-row md-flex-wrap container md-pt5 acc md-acc-open">\n' +
  '<input class="acc-input" id="acc-footer" type="checkbox">\n' +
  '<span class="acc-icon xs-text-2"></span>\n' +
  '<label class="acc-label xs-py3 xs-text-3 text-primary bold md-hide" for="acc-footer">More</label>\n' +
  '<section class="md-col-8 md-pl0 md-pr3 acc-content">\n' +
  '<nav class="xs-mb3 sm-line-height-inherit bold">\n' +
  '<a class="link-secondary xs-inline-block xs-mr2 xs-mb1" href="https://www.zolo.ca/about.php">About</a>\n' +
  '<a class="link-secondary xs-inline-block xs-mr2 xs-mb1" href="https://www.zolo.ca/people">Agents</a>\n' +
  '<a class="link-secondary xs-inline-block xs-mr2 xs-mb1" href="https://www.zolo.ca/careers">Careers</a>\n' +
  '<a class="link-secondary xs-inline-block xs-mr2 xs-mb1" href="https://www.zolo.ca/contact_us.php">Contact</a>\n' +
  '<a class="link-secondary xs-inline-block xs-mr2 xs-mb1 nowrap" href="https://www.zolo.ca/terms.php">Privacy &amp; Terms</a>\n' +
  '<a class="link-secondary xs-inline-block xs-mr2 xs-mb1" href="https://www.zolo.ca/sitemap">Sitemap</a>\n' +
  '<a class="link-secondary xs-inline-block xs-mr2 xs-mb1" href="https://www.zolo.ca/mobile">Mobile</a>\n' +
  '<input class="acc-input" id="acc-offices" type="checkbox">\n' +
  '<label class="acc-label link-secondary xs-inline-block xs-mb1 nowrap" for="acc-offices">Offices +</label>\n' +
  '<section class="md-text-5 acc-content normal">\n' +
  '<address class="xs-mb3 sm-mb1 xs-mt3">\n' +
  '<span class="xs-block sm-inline-block">Zolo Realty, Brokerage</span>\n' +
  ' <span class="xs-block sm-inline-block">202 - 895 Lawrence Ave East</span>\n' +
  '<span class="xs-block sm-inline-block">Toronto, ON, M3C 3L2</span>\n' +
  '<span class="xs-block sm-inline-block">416-898-8932</span>\n' +
  '</address>\n' +
  '<address class="xs-mb3 sm-mb1">\n' +
  '<span class="xs-block sm-inline-block">Zolo Realty (BC) Inc.</span>\n' +
  '<span class="xs-block sm-inline-block">1031-88 West Pender St</span>\n' +
  '<span class="xs-block sm-inline-block">Vancouver, BC, V6B 6N9</span>\n' +
  '<span class="xs-block sm-inline-block">604-239-1671</span>\n' +
  '</address>\n' +
  '<address class="xs-mb3 sm-mb1">\n' +
  '<span class="xs-block sm-inline-block">Zolo Realty (Alberta) Inc.</span>\n' +
  '<span class="xs-block sm-inline-block">125 Hidden Cove NW</span>\n' +
  '<span class="xs-block sm-inline-block">Calgary, AB T3A 5G6</span>\n' +
  '<span class="xs-block sm-inline-block">587-889-6567</span>\n' +
  '</address>\n' +
  '<address>\n' +
  '<span class="xs-block sm-inline-block">Zolo Realty (Sask) Inc.</span>\n' +
  '<span class="xs-block sm-inline-block">7th Floor, 2010 – 11th Ave</span>\n' +
  '<span class="xs-block sm-inline-block">Regina, SK, S4P 0J3</span>\n' +
  '<span class="xs-block sm-inline-block">888-230-1595</span>\n' +
  '</address>\n' +
  '</section>\n' +
  '</nav>\n' +
  '<section class="xs-py2 md-pb0 md-text-5">\n' +
  '<div class="xs-mb1 sm-inline-block sm-mr3">\n' +
  '<a class="link-secondary xs-inline-block" href="https://www.zolo.ca/sitemap/latest">Newest Listing</a>\n' +
  '<a class="link-secondary" href="https://www.zolo.ca/kitchener-real-estate/339-veronica-drive">339 Veronica Drive, Kitchener, ON</a> </div>\n' +
  '<div class="xs-mb1 xs-inline-block xs-mr3">\n' +
  '</div>\n' +
  '<div class="xs-mb1 xs-inline-block">\n' +
  '0.37 </div>\n' +
  '<div class="xs-mt3 sm-mt0">\n' +
  'MLS&reg;, REALTOR&reg;, &amp; associated logos are trademarks of The Canadian Real Estate Association </div>\n' +
  '</section>\n' +
  '</section>\n' +
  '<section class="md-col-4 xs-border-top sm-border-top md-border-top-none md-border-left-lighter xs-mb6 md-mb0">\n' +
  '<div class="footer-recruit xs-py6 md-py0 xs-text-center">\n' +
  '<h4 class="text-1 text-primary xs-mb3">Are You a Realtor<sup>&reg;</sup>?</h4>\n' +
  '<a class="button xs-text-3 xs-px5 xs-line-height-40" href="https://www.zolo.ca/jobs"><i class="icon icon-thumb-up xs-mr1"></i> Join Zolo Today!</a>\n' +
  '</div> </section>\n' +
  '</div>\n' +
  '</footer>\n' +
  '</div> \n' +
  '<div class="drawer drawer-bottom-up drawer-top drawer-location fill-white md-hide print-hide" id="drawer-location">\n' +
  '<div class="drawer-header xs-pl2 xs-pr2 xs-flex xs-flex-align-center md-hide xs-border-bottom xs-z4 xs-relative" style="height: 60px;">\n' +
  '<button class="button button--menu drawer-location-close" style="margin-left:-1rem;"><i class="icon icon-arrow-back xs-block" style="font-size:22px;height:22px;width:22px;"></i></button>\n' +
  '<div class="filter-location-input xs-full-width xs-flex">\n' +
  '<form id="home_search_top" class="nav-filters-form xs-full-width xs-flex" name="home_search_top" action="https://www.zolo.ca/index.php">\n' +
  '<input autocomplete="off" class="text-input xs-text-5 xs-full-width xs-pr4 shadow-1 no-focus" type="text" placeholder="Search by location..." name="mobile_sarea" id="mobile_sarea" autocomplete="off" value="Burnaby">\n' +
  '<input type="hidden" name="sarea" id="sarea" value="My_location">\n' +
  '<input type="hidden" name="sarea_hidden" value="My_location " id="sarea_hidden">\n' +
  '</form>\n' +
  '<button id="clear-sarea-input-field" class="button button--menu xs-absolute xs-r3" style="margin-right:-1rem;"><i class="icon icon-close xs-block" style="font-size:22px;height:22px;width:22px;"></i></button>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="drawer-body" id="mobile-typeahead-dropdown-menu">\n' +
  '<ul id="mobile-other-searches-menu" class="typeahead dropdown-menu xs-full-width list-unstyled xs-border-none">\n' +
  '<li>\n' +
  '<a class="button button--lookahead xs-full-width xs-text-left xs-flex xs-flex-align-center mobile-nearby-cities-search" href="https://www.zolo.ca/new-westminster-real-estate">\n' +
  '<i class="icon icon-location-on text-muted xs-mr3" style="font-size:24px;height:24px;width:24px;"></i>\n' +
  '<div>\n' +
  '<div>New Westminster Real Estate</div>\n' +
  '</div>\n' +
  '</a>\n' +
  '</li>\n' +
  '<li>\n' +
  '<a class="button button--lookahead xs-full-width xs-text-left xs-flex xs-flex-align-center mobile-nearby-cities-search" href="https://www.zolo.ca/port-moody-real-estate">\n' +
  '<i class="icon icon-location-on text-muted xs-mr3" style="font-size:24px;height:24px;width:24px;"></i>\n' +
  '<div>\n' +
  '<div>Port Moody Real Estate</div>\n' +
  '</div>\n' +
  '</a>\n' +
  '</li>\n' +
  '<li>\n' +
  '<a class="button button--lookahead xs-full-width xs-text-left xs-flex xs-flex-align-center mobile-nearby-cities-search" href="https://www.zolo.ca/north-vancouver-real-estate">\n' +
  '<i class="icon icon-location-on text-muted xs-mr3" style="font-size:24px;height:24px;width:24px;"></i>\n' +
  '<div>\n' +
  '<div>North Vancouver Real Estate</div>\n' +
  '</div>\n' +
  '</a>\n' +
  '</li>\n' +
  '<li>\n' +
  '<a class="button button--lookahead xs-full-width xs-text-left xs-flex xs-flex-align-center mobile-nearby-cities-search" href="https://www.zolo.ca/anmore-real-estate">\n' +
  '<i class="icon icon-location-on text-muted xs-mr3" style="font-size:24px;height:24px;width:24px;"></i>\n' +
  '<div>\n' +
  '<div>Anmore Real Estate</div>\n' +
  '</div>\n' +
  '</a>\n' +
  '</li>\n' +
  '<li>\n' +
  '<a class="button button--lookahead xs-full-width xs-text-left xs-flex xs-flex-align-center mobile-nearby-cities-search" href="https://www.zolo.ca/vancouver-real-estate">\n' +
  '<i class="icon icon-location-on text-muted xs-mr3" style="font-size:24px;height:24px;width:24px;"></i>\n' +
  '<div>\n' +
  '<div>Vancouver Real Estate</div>\n' +
  '</div>\n' +
  '</a>\n' +
  '</li>\n' +
  '<li>\n' +
  '<a class="button button--lookahead xs-full-width xs-text-left xs-flex xs-flex-align-center mobile-nearby-cities-search" href="https://www.zolo.ca/delta-real-estate">\n' +
  '<i class="icon icon-location-on text-muted xs-mr3" style="font-size:24px;height:24px;width:24px;"></i>\n' +
  '<div>\n' +
  '<div>Delta Real Estate</div>\n' +
  '</div>\n' +
  '</a>\n' +
  '</li>\n' +
  '<li>\n' +
  '<a class="button button--lookahead xs-full-width xs-text-left xs-flex xs-flex-align-center mobile-nearby-cities-search" href="https://www.zolo.ca/richmond-real-estate">\n' +
  '<i class="icon icon-location-on text-muted xs-mr3" style="font-size:24px;height:24px;width:24px;"></i>\n' +
  '<div>\n' +
  '<div>Richmond Real Estate</div>\n' +
  '</div>\n' +
  '</a>\n' +
  '</li>\n' +
  '<li>\n' +
  '<a class="button button--lookahead xs-full-width xs-text-left xs-flex xs-flex-align-center mobile-nearby-cities-search" href="https://www.zolo.ca/coquitlam-real-estate">\n' +
  '<i class="icon icon-location-on text-muted xs-mr3" style="font-size:24px;height:24px;width:24px;"></i>\n' +
  '<div>\n' +
  '<div>Coquitlam Real Estate</div>\n' +
  '</div>\n' +
  '</a>\n' +
  '</li>\n' +
  '<li>\n' +
  '<a class="button button--lookahead xs-full-width xs-text-left xs-flex xs-flex-align-center mobile-nearby-cities-search" href="https://www.zolo.ca/port-coquitlam-real-estate">\n' +
  '<i class="icon icon-location-on text-muted xs-mr3" style="font-size:24px;height:24px;width:24px;"></i>\n' +
  '<div>\n' +
  '<div>Port Coquitlam Real Estate</div>\n' +
  '</div>\n' +
  '</a>\n' +
  '</li>\n' +
  '<li>\n' +
  '<a class="button button--lookahead xs-full-width xs-text-left xs-flex xs-flex-align-center mobile-nearby-cities-search" href="https://www.zolo.ca/west-vancouver-real-estate">\n' +
  '<i class="icon icon-location-on text-muted xs-mr3" style="font-size:24px;height:24px;width:24px;"></i>\n' +
  '<div>\n' +
  '<div>West Vancouver Real Estate</div>\n' +
  '</div>\n' +
  '</a>\n' +
  '</li>\n' +
  '</ul>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div id="drawer-share" class="drawer drawer-bottom-up drawer-half drawer-share print-hide md-hide">\n' +
  '<div class="drawer-body">\n' +
  '<nav class="xs-p2">\n' +
  '<a class="button button--nav button--icon" href="/cdn-cgi/l/email-protection#fbc4888e99919e988fc6a1949794dec8badec9cbcfcbc3dec9cbd6dec9cbc2c9c3c3dbae95928d9e8988928f82dbb8899e88989e958fd7dec9cbb98e89959a9982dd99949f82c6b2dec9cb8c9a958f9e9fdec9cb8f94dec9cb88939a899edec9cb8f939288dec9cb9394969edec9cb8c928f93dec9cb82948edec8badecbba938f8f8b88dec8badec9bddec9bd8c8c8cd581949794d5989adec9bd998e89959a9982d6899e9a97d69e888f9a8f9edec9bdc2c9c3c3d68e95928d9e8988928f82d698899e88989e958fdec9bdcfcbc3"><i class="icon icon-email xs-text-1 xs-mr1"></i>Email</a>\n' +
  '<button class="button button--nav button--icon" data-social="{&quot;type&quot;:&quot;facebook&quot;, &quot;url&quot;:&quot;https://www.zolo.ca/burnaby-real-estate/9288-university-crescent/408&quot;, &quot;text&quot;: &quot;What do you think about this 2 bed Apartment/Condo at 9288 University Crescent, Burnaby I found on Zolo.ca for  $499,800&quot;}"><i class="icon icon-facebook xs-text-1 xs-mr1 link-facebook"></i>Facebook</button>\n' +
  '<button class="button button--nav button--icon" data-social="{&quot;type&quot;:&quot;twitter&quot;, &quot;url&quot;:&quot;https://www.zolo.ca/burnaby-real-estate/9288-university-crescent/408&quot;, &quot;text&quot;: &quot;What do you think about this 2 bed Apartment/Condo in Burnaby for $499,800?&quot;, &quot;hashtags&quot;: &quot;Burnaby,Homes,Zolo&quot;}"><i class="icon icon-twitter xs-text-1 xs-mr1 link-twitter"></i>Twitter</button>\n' +
  '<button class="button button--nav button--icon" data-social="{&quot;type&quot;:&quot;pinterest&quot;, &quot;url&quot;:&quot;https://www.zolo.ca/burnaby-real-estate/9288-university-crescent/408&quot;, &quot;text&quot;: &quot;What do you think about this 2 bed Apartment/Condo at 9288 University Crescent, Burnaby I found on http://www.zolo.ca for $499,800?&quot;, &quot;image&quot;: &quot;https://www.xstatic.ca/home_photos/42/4646042/1.jpg&quot;}"><i class="icon icon-pinterest xs-text-1 xs-mr1  link-pinterest"></i>Pinterest</button>\n' +
  '</nav>\n' +
  '</div>\n' +
  '</div>\n' +
  '<div class="backdrop"></div>\n' +
  '<div class="modal hide" id="listingModal"></div>\n' +
  '<script>!function(e,t,r,n,c,h,o){function a(e,t,r,n){for(r=\'\',n=\'0x\'+e.substr(t,2)|0,t+=2;t<e.length;t+=2)r+=String.fromCharCode(\'0x\'+e.substr(t,2)^n);return r}try{for(c=e.getElementsByTagName(\'a\'),o=\'/cdn-cgi/l/email-protection#\',n=0;n<c.length;n++)try{(t=(h=c[n]).href.indexOf(o))>-1&&(h.href=\'mailto:\'+a(h.href,t+o.length))}catch(e){}for(c=e.querySelectorAll(\'.__cf_email__\'),n=0;n<c.length;n++)try{(h=c[n]).parentNode.replaceChild(e.createTextNode(a(h.getAttribute(\'data-cfemail\'),0)),h)}catch(e){}}catch(e){}}(document);</script><script src="/js/object.fit.images.js?v=0.10"></script>\n' +
  '<script>\n' +
  '\tfunction initImgDefer() {\n' +
  '\t\tvar imgDefer = document.getElementsByClassName(\'js-img-defer\');\n' +
  '\t\tfor (var i = 0; i < imgDefer.length; i++) {\n' +
  '\t\t\tif (imgDefer[i].getAttribute(\'data-img-defer-src\')) {\n' +
  '\t\t\t\timgDefer[i].setAttribute(\'src\',imgDefer[i].getAttribute(\'data-img-defer-src\'));\n' +
  '\t\t\t\tobjectFitImages(imgDefer[i]); // This function is only called if you\'re in IE\n' +
  '\t\t\t}\n' +
  '\t\t}\n' +
  '\t}\n' +
  '\tinitImgDefer();\n' +
  '</script>\n' +
  '<script>\n' +
  '    var tld = "https://www.zolo.ca/";\n' +
  '    var buyeruuid = "a430aa0f-6463-11e7-8390-bc764e10537b";\n' +
  '    var gm_api = "";\n' +
  '    var gm_key = "AIzaSyAj59gMnWGKRVf0zlM9cJaS3UOlrdPO9D0";\n' +
  '    var action = "property";\n' +
  '</script>\n' +
  '<script src="/js/minified/fontfaceobserver.js"></script>\n' +
  '<script src="/js/minified/fontfaceobserver.import.js?v=0.04"></script>\n' +
  '<script src="/js/minified/flickity.js?v=0.10"></script>\n' +
  '<script src="/js/minified/flickity-bg-lazyload.js?v=0.10"></script>\n' +
  '<script src="/js/minified/flickity.import.js?v=0.10.04"></script>\n' +
  '<script src="/js/minified/browser_push.js?v=0.02"></script>\n' +
  '<script src="/js/minified/jquery-1.8.3.min.js"></script>\n' +
  '<script src="/js/minified/bootstrap.min.js?v=0.06.02" defer></script>\n' +
  '\n' +
  '<script src="/js/minified/jquery.form.js"></script>\n' +
  '\n' +
  '<script src="/js/minified/jquery.social.js" defer></script>\n' +
  '<script src="/js/minified/jquery.social.import.js" defer></script>\n' +
  '<script src="/js/minified/tocca.import.js"></script>\n' +
  '<script src="/js/minified/tocca.js"></script>\n' +
  '<script src="/js/minified/waypoint.js"></script>\n' +
  '<script src="/js/minified/waypoint.sticky.js"></script>\n' +
  '<script src="/js/minified/waypoint.sticky.import.js"></script>\n' +
  '<script src="/js/minified/waypoint.banner.import.js"></script>\n' +
  '<script src="/js/minified/zolo.add.click.intercept.js?v=0.02.01"></script>\n' +
  '<script src="/js/minified/zolo.add.commas.js"></script>\n' +
  '<script src="/js/minified/zolo.app-banner.js"></script>\n' +
  '<script src="/js/minified/zolo.drawers.js?v=0.02"></script>\n' +
  '<script src="/js/minified/zolo.filters-management.js"></script>\n' +
  '<script src="/js/minified/zolo.form.search.js?v=0.05"></script>\n' +
  '<script src="/js/minified/zolo.general.js?v=0.03"></script>\n' +
  '<script src="/js/minified/zolo.mobile.buttons.js" defer></script>\n' +
  '<script src="/js/minified/zolo.search.typeahead.js?v=0.05" defer></script>\n' +
  '<script src="/js/minified/zolo.signup.form.js?v=0.02"></script>\n' +
  '\n' +
  '\n' +
  '<script src="/js/minified/zolo.search.drawer.js?v=0.13.33"></script>\n' +
  '<script src="/js/minified/stickyfill.js"></script>\n' +
  '<script src="/js/minified/stickyfill.import.js"></script>\n' +
  '<script src="/js/minified/zolo.calculate.monthly.payment.js" defer></script>\n' +
  '<script>\n' +
  '\tvar area =\'9288 University Crescent  Burnaby BC\';\n' +
  '\tvar default_lat = 49.278141;\n' +
  '\tvar default_lng = -122.904091;\n' +
  '\tvar cpid = "&cpid=4646042";\n' +
  '\tvar gm_api = "";\n' +
  '\n' +
  '\t// \t// gm_api = "https://maps.googleapis.com/maps/api/js?callback=propsloadmap";\n' +
  '\t// \t// \t// gm_api = gm_api+"&key="+gm_key;\n' +
  '\t// </script>\n' +
  '<script src="/js/minified/zolo.gallery.map.js?v=0.19.28"></script>\n' +
  '\n' +
  '<!--[if IE]>\n' +
  '<script src="/js/minified/compressed.polyfills.min.js"></script>\n' +
  '<![endif]-->\n' +
  '</body>\n' +
  '</html>\n';
const RESOURCES = ['https://www.zolo.ca/burnaby-real-estate/9288-university-crescent/408'];
const HOST = 'www.zolo.ca';
const crawler = new Crawler({
  rateLimits: 200,
  timeout: 10000,
  retries: 1,
  retryTimeout: 10000
});

async function crawlData(resource) {
  debug('zolo')('request:', resource)
  const res = await crawler.queue({
    uri: resource,
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/x-www-form-urlencoded',
      Host: HOST,
      'User-Agent': 'Apache-HttpClient/UNAVAILABLE (java 1.4)',
    },
    jQuery: false
  })

  let response;
  try {
    response = res.response.body;
  } catch (e) {
    debug('zolo')('proxy request error', e);
  }
  return response;

  // return await getData(resource);
}

function parseData(rawData) {
  const $ = cheerio.load(rawData);
  const address = $('h1').text();
  const area = $('div .area').text();
  return { address, area };
}

async function getData(resource) {
  // const rawData = await crawlData(resource);
  const rawData = sample;
  const parsedData = parseData(rawData);
  console.log('+++++++', parsedData);
  return _.assign(parsedData, { resource });
}

async function data() {
  const responses = await Promise.all(RESOURCES.map(async resource => await getData(resource)))
  console.log('+++++++', responses);
  return responses;
}

export default { data };
