const path = require('path')
const MobileDetect = require('mobile-detect')

const url = require(path.join(__dirname, 'url'))
const crypto = require('crypto') // eslint-disable-line
const debug = require('debug')('app:renderPageCC')

const commons = require(path.join(__dirname, '..', '..', 'commons'))

// module global variable strings relating to Content-Security-Policy
// they are created beforehand for fast delivery
var CSPstr0, CSPstr1

module.exports = {

  // isUrlRoot is true when url path is empty / and false when is /CC
  render: function (req, res, serverData, wordsOfCountry) {
    // ISO 2 letter Country Code
    const CC = req.params.cc.toUpperCase()
    debug('Country code: ' + CC)

    var md = new MobileDetect(req.headers['user-agent'])

    // data to be rendered embedded in the HTML file
    var data = {}

    data.isGetCC = true
    data.isStats = false

    // Object with all the expressions for each country
    data.words = wordsOfCountry
    data.words.word_per += '&#32;' // add non-breaking space
    data.words.word_per = data.words.word_per.replace(/(&#32;).*/g, '$1') // removes excess of "&#32;"

    // global constant data for every request, and that was already loaded when the server app was initialized
    data.serverData = serverData
    delete data.serverData.availableCountries.XX

    // information depending on this request from the client
    var pageData = {
      /* check https://github.com/jfoclpf/autocosts/wiki/URL-parts-terminology */
      url: {
        href: url.getHref(req), // full url, ex: "https://autocosts.info/PT"
        origin: url.getOrigin(req), // basic url, ex: "https://autocosts.info"
        protocol: url.getProtocol(req), // `http:` or `https:`
        canonical: url.getCurrentUrl(req)
      },
      languageCode: serverData.languagesCountries[CC], // ISO language code (ex: pt-PT)
      isThisATest: url.isThisATest(req), // boolean variable regarding if present request is a test
      notLocalhost: !url.isThisLocalhost(req), // boolean variable regarding if present request is from localhost
      mainLogoFilename: url.getNameOfDomain(serverData.urls.canonicalHostname[CC]) + '.svg', // ex: 'autocosti.svg'
      isMobile: Boolean(md.mobile()), // true or false whether it is a mobile device
      isThisARecognizedHost: url.isThisARecognizedHost(req.get('host'), serverData.urls)
    }
    data.pageData = pageData
    // ISO 2 letter Country Code
    data.CC = data.words.CC = data.pageData.CC = CC

    data.emptyChar = '' // empty character to be used in handlebars for whitespace trimming
    data.layout = 'main'

    if (pageData.notLocalhost) {
      const nonce = crypto.randomBytes(16).toString('base64')
      data.nonce = nonce
      const CSPstr = this.getCSPstr(nonce)

      debug(CSPstr.replace(/;/g, ';\n'))
      res.set('Content-Security-Policy', CSPstr)
    } else {
      data.nonce = ''
    }

    res.set('Cache-Control', 'public, max-age=31536000')
    res.type('text/html')
    res.render('main', data)
  },

  // Content Security Policy for webpages in Internet
  // generates two global variable strings CSPstr0 and CSPstr1
  preGenerateCSPstring: function (serverData) {
    var switches = serverData.settings.switches
    var fileNames = serverData.fileNames

    var reliableDomains = []

    if (serverData.settings.cdn.enabled) {
      reliableDomains.push(commons.extractHostname(serverData.settings.cdn.url))
      for (var key in fileNames.client) {
        var file = fileNames.client[key]
        if (file.cdn) {
          reliableDomains.push(file.cdn)
        }
      }
    }

    // see https://goo.gl/z6MGXb
    var frameStr = ''
    if (switches.googleCaptcha) {
      reliableDomains.push('https://www.google.com/recaptcha/')
      reliableDomains.push('https://www.gstatic.com/recaptcha/')
      frameStr = 'frame-src https://www.google.com/recaptcha/;' + ' '
    }

    if (switches.googleAnalytics) {
      reliableDomains.push('https://www.google-analytics.com')
    }

    if (switches.uber) {
      reliableDomains.push('https://api.uber.com')
    }

    // filters repeated values
    var uniqueReliableDomains = reliableDomains.filter(function (item, pos) {
      return reliableDomains.indexOf(item) === pos
    })
    debug(uniqueReliableDomains)

    // adds string with reliable domains/urls
    var domainsStr = ''
    for (var i = 0; i < uniqueReliableDomains.length; i++) {
      domainsStr += uniqueReliableDomains[i] + ' '
    }

    // this is a global variable
    CSPstr0 = `default-src 'self' ${domainsStr} ; `
    CSPstr0 += `script-src 'self' ${domainsStr} 'unsafe-eval' 'unsafe-inline' `

    // nonce info will be here inbetween, see function getCSPstr

    // this is a global variable
    CSPstr1 = 'style-src \'self\' \'unsafe-inline\'; '
    CSPstr1 += 'img-src \'self\' https://www.google-analytics.com data:; '
    CSPstr1 += 'object-src \'self\' blob:; '
    CSPstr1 += 'base-uri \'self\'; '
    CSPstr1 += frameStr
  },

  // get CSP string since pre-generation of CSP string was done initially as the server.js starts
  getCSPstr: function (nonce = '') {
    // for 'strict-dynamic' read
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src#strict-dynamic
    var nonceStr
    if (nonce) {
      nonceStr = `'nonce-${nonce}' 'strict-dynamic';`
    } else {
      nonceStr = ';'
    }

    return CSPstr0 + nonceStr + CSPstr1
  }

}
