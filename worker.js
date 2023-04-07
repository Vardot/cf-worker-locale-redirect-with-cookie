// The mapping between country codes and locales. Set available locales that are not
// mapped to a country with the special key __no_country__ below.
const countryLocaleMap = {
  __no_country__: ['ar-sa', 'ar-jo', 'ar-qa', 'ar', 'en'],
  US: 'en-us',
  CA: 'en-us',
  SA: 'en-sa',
  BH: 'en-sa',
  EG: 'en-sa',
  KW: 'en-sa',
  OM: 'en-sa',
  QA: 'en-qa',
  AE: 'en-ae',
  JO: 'en-jo',
  IL: 'en-jo',
  PS: 'en-jo',
};
const defaultLocale = 'en';
const defaultCountry = 'US';

// Cookie params
const cookieName = 'hl';
const cookieAge = 31536000;
const cookieQueryStringName = 'update_hl';

export default {
  fetch: handleRequest,
};

async function handleRequest(request) {
  const { url, cf, headers } = request;

  if (isUserAgentExcluded(headers.get('User-Agent'))) {
    return fetch(request);
  }

  if (!isRedirectable(headers, url)) {
    return fetch(request);
  }

  const country = cf && cf.country ? cf.country : defaultCountry;
  const currentUrl = new URL(url);
  const currentLocale = getLocaleFromPath(currentUrl.pathname);
  const updateHl = currentUrl.searchParams.get(cookieQueryStringName);
  const validUpdateHl = Object.values(countryLocaleMap).flat().includes(updateHl);
  const cookieRegex = new RegExp(`${cookieName}=(\\w{2}(?:-\\w{2})?)`);
  const cookieLocale = headers.get('Cookie')?.match(cookieRegex)?.[1];

  let newLocale;

  if (validUpdateHl) {
    newLocale = updateHl;
  } else if (cookieLocale) {
    newLocale = cookieLocale;
  } else if (country in countryLocaleMap) {
    newLocale = countryLocaleMap[country];
  } else {
    newLocale = defaultLocale;
  }

  console.log(`New locale: ${newLocale}. Current locale: ${currentLocale}`);
  if (newLocale !== currentLocale) {
    const newUrl = rewriteUrlWithLocale(url, newLocale);
    console.log(`New URL: ${newUrl}`);
    // Create a new Response object with the same properties as the fetched response
    const redirectResponse = Response.redirect(newUrl, 302);
    const response = new Response(redirectResponse.body, redirectResponse);
    // Set the new cookie header
    response.headers.append('Set-Cookie', `${cookieName}=${newLocale}; Path=/; Max-Age=${cookieAge}`);
    return response;
  } else if (!cookieLocale || (updateHl && validUpdateHl)) {
    const fetchedResponse = await fetch(request);
    const response = new Response(fetchedResponse.body, fetchedResponse);
    // Set the new cookie header
    response.headers.append('Set-Cookie', `${cookieName}=${newLocale}; Path=/; Max-Age=${cookieAge}`);
    console.log(`Cookie: ${newLocale}`);
    return response;
  }

  return fetch(request);
}

// Check if the user agent is excluded
function isUserAgentExcluded(userAgent) {
  return excludedUserAgents.some((excludedUserAgent) => userAgent.includes(excludedUserAgent));
}

// Get the locale from the URL path
function getLocaleFromPath(path) {
  const locales = [...new Set(Object.values(countryLocaleMap).flat())].join('|');
  console.log(locales);
  const localeRegex = new RegExp(`^/(${locales})(?:$|/)`, 'i');
  const match = path.match(localeRegex);
  return match ? match[1].toLowerCase() : null;
}

// Rewrite the URL with the new locale
function rewriteUrlWithLocale(url, locale) {
  const { origin, pathname, search, hash } = new URL(url);
  const currentLocale = getLocaleFromPath(pathname);
  const newPath = currentLocale ? pathname.replace(`/${currentLocale}`, `/${locale}`) : `/${locale}${pathname}`;
  return `${origin}${newPath}${search}${hash}`;
}

function isRedirectable(headers, url) {
  // Don't redirect none not HTML (static assets)
  const acceptHeader = headers.get('Accept');
  if (!acceptHeader || !acceptHeader.includes('text/html')) {
    return false;
  }

  // Workaround to not redirect precisely by extensions
  const path = new URL(url).pathname;
  const fileExtensionRegex = /\.(ico|css|js|jpg|webp|png|svg)$/;
  if (fileExtensionRegex.test(path)) {
    return false;
  }

  return true;
}


// The list of excluded user agents (bots)
const excludedUserAgents = [
  'Googlebot/',
  'Googlebot-Mobile',
  'Googlebot-Image',
  'Googlebot-News',
  'Googlebot-Video',
  'AdsBot-Google([^-]|$)',
  'AdsBot-Google-Mobile',
  'Feedfetcher-Google',
  'Mediapartners-Google',
  'Mediapartners (Googlebot)',
  'APIs-Google',
  'bingbot',
  'Slurp',
  '[wW]get',
  'LinkedInBot',
  'Python-urllib',
  'python-requests',
  'libwww-perl',
  'httpunit',
  'nutch',
  'Go-http-client',
  'phpcrawl',
  'msnbot',
  'jyxobot',
  'FAST-WebCrawler',
  'FAST Enterprise Crawler',
  'BIGLOTRON',
  'Teoma',
  'convera',
  'seekbot',
  'Gigabot',
  'Gigablast',
  'exabot',
  'ia_archiver',
  'GingerCrawler',
  'webmon ',
  'HTTrack',
  'grub.org',
  'UsineNouvelleCrawler',
  'antibot',
  'netresearchserver',
  'speedy',
  'fluffy',
  'findlink',
  'msrbot',
  'panscient',
  'yacybot',
  'AISearchBot',
  'ips-agent',
  'tagoobot',
  'MJ12bot',
  'woriobot',
  'yanga',
  'buzzbot',
  'mlbot',
  'YandexBot',
  'YandexImages',
  'YandexAccessibilityBot',
  'YandexMobileBot',
  'purebot',
  'Linguee Bot',
  'CyberPatrol',
  'voilabot',
  'Baiduspider',
  'citeseerxbot',
  'spbot',
  'twengabot',
  'postrank',
  'TurnitinBot',
  'scribdbot',
  'page2rss',
  'sitebot',
  'linkdex',
  'Adidxbot',
  'ezooms',
  'dotbot',
  'Mail.RU_Bot',
  'discobot',
  'heritrix',
  'findthatfile',
  'europarchive.org',
  'NerdByNature.Bot',
  'sistrix crawler',
  'Ahrefs(Bot|SiteAudit)',
  'fuelbot',
  'CrunchBot',
  'IndeedBot',
  'mappydata',
  'woobot',
  'ZoominfoBot',
  'PrivacyAwareBot',
  'Multiviewbot',
  'SWIMGBot',
  'Grobbot',
  'eright',
  'Apercite',
  'semanticbot',
  'Aboundex',
  'domaincrawler',
  'wbsearchbot',
  'summify',
  'CCBot',
  'edisterbot',
  'seznambot',
  'ec2linkfinder',
  'gslfbot',
  'aiHitBot',
  'intelium_bot',
  'facebookexternalhit',
  'Yeti',
  'RetrevoPageAnalyzer',
  'lb-spider',
  'Sogou',
  'lssbot',
  'careerbot',
  'wotbox',
  'wocbot',
  'ichiro',
  'DuckDuckBot',
  'lssrocketcrawler',
  'drupact',
  'webcompanycrawler',
  'acoonbot',
  'openindexspider',
  'gnam gnam spider',
  'web-archive-net.com.bot',
  'backlinkcrawler',
  'coccoc',
  'integromedb',
  'content crawler spider',
  'toplistbot',
  'it2media-domain-crawler',
  'ip-web-crawler.com',
  'siteexplorer.info',
  'elisabot',
  'proximic',
  'changedetection',
  'arabot',
  'WeSEE:Search',
  'niki-bot',
  'CrystalSemanticsBot',
  'rogerbot',
  '360Spider',
  'psbot',
  'InterfaxScanBot',
  'CC Metadata Scaper',
  'g00g1e.net',
  'GrapeshotCrawler',
  'urlappendbot',
  'brainobot',
  'fr-crawler',
  'binlar',
  'SimpleCrawler',
  'Twitterbot',
  'cXensebot',
  'smtbot',
  'bnf.fr_bot',
  'A6-Indexer',
  'ADmantX',
  'Facebot',
  'OrangeBot/',
  'memorybot',
  'AdvBot',
  'MegaIndex',
  'SemanticScholarBot',
  'ltx71',
  'nerdybot',
  'xovibot',
  'BUbiNG',
  'Qwantify',
  'archive.org_bot',
  'Applebot',
  'TweetmemeBot',
  'crawler4j',
  'findxbot',
  'S[eE][mM]rushBot',
  'yoozBot',
  'lipperhey',
  'Y!J',
  'Domain Re-Animator Bot',
  'AddThis',
  'Screaming Frog SEO Spider',
  'MetaURI',
  'Scrapy',
  'Livelap[bB]ot',
  'OpenHoseBot',
  'CapsuleChecker',
  'collection@infegy.com',
  'IstellaBot',
  'DeuSu/',
  'betaBot',
  'Cliqzbot/',
  'MojeekBot/',
  'netEstate NE Crawler',
  'SafeSearch microdata crawler',
  'Gluten Free Crawler/',
  'Sonic',
  'Sysomos',
  'Trove',
  'deadlinkchecker',
  'Slack-ImgProxy',
  'Embedly',
  'RankActiveLinkBot',
  'iskanie',
  'SafeDNSBot',
  'SkypeUriPreview',
  'Veoozbot',
  'Slackbot',
  'redditbot',
  'datagnionbot',
  'Google-Adwords-Instant',
  'adbeat_bot',
  'WhatsApp',
  'contxbot',
  'pinterest.com.bot',
  'electricmonk',
  'GarlikCrawler',
  'BingPreview/',
  'vebidoobot',
  'FemtosearchBot',
  'Yahoo Link Preview',
  'MetaJobBot',
  'DomainStatsBot',
  'mindUpBot',
  'Daum/',
  'Jugendschutzprogramm-Crawler',
  'Xenu Link Sleuth',
  'Pcore-HTTP',
  'moatbot',
  'KosmioBot',
  'pingdom',
  'AppInsights',
  'PhantomJS',
  'Gowikibot',
  'PiplBot',
  'Discordbot',
  'TelegramBot',
  'Jetslide',
  'newsharecounts',
  'James BOT',
  'Bark[rR]owler',
  'TinEye',
  'SocialRankIOBot',
  'trendictionbot',
  'Ocarinabot',
  'epicbot',
  'Primalbot',
  'DuckDuckGo-Favicons-Bot',
  'GnowitNewsbot',
  'Leikibot',
  'LinkArchiver',
  'YaK/',
  'PaperLiBot',
  'Digg Deeper',
  'dcrawl',
  'Snacktory',
  'AndersPinkBot',
  'Fyrebot',
  'EveryoneSocialBot',
  'Mediatoolkitbot',
  'Luminator-robots',
  'ExtLinksBot',
  'SurveyBot',
  'NING/',
  'okhttp',
  'Nuzzel',
  'omgili',
  'PocketParser',
  'YisouSpider',
  'um-LN',
  'ToutiaoSpider',
  'MuckRack',
  'Jamie\'s Spider',
  'AHC/',
  'NetcraftSurveyAgent',
  'Laserlikebot',
  '^Apache-HttpClient',
  'AppEngine-Google',
  'Jetty',
  'Upflow',
  'Thinklab',
  'Traackr.com',
  'Twurly',
  'Mastodon',
  'http_get',
  'DnyzBot',
  'botify',
  '007ac9 Crawler',
  'BehloolBot',
  'BrandVerity',
  'check_http',
  'BDCbot',
  'ZumBot',
  'EZID',
  'ICC-Crawler',
  'ArchiveBot',
  '^LCC ',
  'filterdb.iss.net/crawler',
  'BLP_bbot',
  'BomboraBot',
  'Buck/',
  'Companybook-Crawler',
  'Genieo',
  'magpie-crawler',
  'MeltwaterNews',
  'Moreover',
  'newspaper/',
  'ScoutJet',
  '(^| )sentry/',
  'StorygizeBot',
  'UptimeRobot',
  'OutclicksBot',
  'seoscanners',
  'Hatena',
  'Google Web Preview',
  'MauiBot',
  'AlphaBot',
  'SBL-BOT',
  'IAS crawler',
  'adscanner',
  'Netvibes',
  'acapbot',
  'Baidu-YunGuanCe',
  'bitlybot',
  'blogmuraBot',
  'Bot.AraTurka.com',
  'bot-pge.chlooe.com',
  'BoxcarBot',
  'BTWebClient',
  'ContextAd Bot',
  'Digincore bot',
  'Disqus',
  'Feedly',
  'Fetch/',
  'Fever',
  'Flamingo_SearchEngine',
  'FlipboardProxy',
  'g2reader-bot',
  'G2 Web Services',
  'imrbot',
  'K7MLWCBot',
  'Kemvibot',
  'Landau-Media-Spider',
  'linkapediabot',
  'vkShare',
  'Siteimprove.com',
  'BLEXBot/',
  'DareBoost',
  'ZuperlistBot/',
  'Miniflux/',
  'Feedspot',
  'Diffbot/',
  'SEOkicks',
  'tracemyfile',
  'Nimbostratus-Bot',
  'zgrab',
  'PR-CY.RU',
  'AdsTxtCrawler',
  'Datafeedwatch',
  'Zabbix',
  'TangibleeBot',
  'google-xrawler',
  'axios',
  'Amazon CloudFront',
  'Pulsepoint',
  'CloudFlare-AlwaysOnline',
  'Google-Structured-Data-Testing-Tool',
  'WordupInfoSearch',
  'WebDataStats',
  'HttpUrlConnection',
  'Seekport Crawler',
  'ZoomBot',
  'VelenPublicWebCrawler',
  'MoodleBot',
  'jpg-newsbot',
  'outbrain',
  'W3C_Validator',
  'Validator.nu',
  'W3C-checklink',
  'W3C-mobileOK',
  'W3C_I18n-Checker',
  'FeedValidator',
  'W3C_CSS_Validator',
  'W3C_Unicorn',
  'Google-PhysicalWeb',
  'Blackboard',
  'ICBot/',
  'BazQux',
  'Twingly',
  'Rivva',
  'Experibot',
  'awesomecrawler',
  'Dataprovider.com',
  'GroupHigh/',
  'theoldreader.com',
  'AnyEvent',
  'Uptimebot.org',
  'Nmap Scripting Engine',
  '2ip.ru',
  'Clickagy',
  'Caliperbot',
  'MBCrawler',
  'online-webceo-bot',
  'B2B Bot',
  'AddSearchBot',
  'Google Favicon',
  'HubSpot',
  'Chrome-Lighthouse',
  'HeadlessChrome',
  'CheckMarkNetwork/',
  'www.uptime.com',
  'Streamline3Bot/',
  'serpstatbot/',
  'MixnodeCache/',
  '^curl',
  'SimpleScraper',
  'RSSingBot',
  'Jooblebot',
  'fedoraplanet',
  'Friendica',
  'NextCloud',
  'Tiny Tiny RSS',
  'RegionStuttgartBot',
  'Bytespider',
  'Datanyze',
  'Google-Site-Verification'
];
