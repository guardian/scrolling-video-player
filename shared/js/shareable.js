import share from '../modules/share'

export default class shareable {

  constructor(settings, app) {

    this.settings = settings

    this.social = {}

    this.social.title = settings.title 

    this.social.url = settings.url

    this.social.description = settings.description

    this.social.fbImg = settings.fbImg

    this.social.twImg = settings.twImg

    this.social.twHash = settings.twHash

    /*

    var metaTags = document.querySelectorAll('meta');

    [...metaTags].forEach(function(tag, i) {

      console.log(tag)

    })

    */

    this.app = app

  }

  precheck() {

    if (this.app.isApp && !this.app.isAndroid) { // Hide share buttons in iOS app

      document.querySelectorAll(".social_isolation")[0].style.display = "none";

    } else {

      try {

        this.social.title = (this.settings.title!="") ? this.settings.title : document.querySelectorAll('meta[property="og:title"]')[0].content;

        this.social.url = (this.settings.url!="") ? this.settings.url : document.querySelectorAll('meta[property="og:url"]')[0].content;

        this.social.description = (this.settings.description!="") ? this.settings.description : document.querySelectorAll('meta[property="og:description"]')[0].content;

        this.social.fbImg = (this.settings.fbImg!="") ? this.settings.fbImg : document.querySelectorAll('meta[property="og:image"]')[0].content;

        this.social.twImg = (this.settings.twImg!="") ? this.settings.twImg : document.querySelectorAll('meta[name="twitter:image"]')[0].content;

        this.activate()

      } catch(err) {

        document.querySelectorAll(".social_isolation")[0].style.display = "none";

      }
    }
  }

  activate() {

    var self = this

    this.share = share(this.social.title, this.social.url, this.social.fbImg, this.social.image, this.social.twHash, this.social.description);

    const platforms = document.querySelectorAll(".interactive-share");

    [...platforms].forEach(platform => {

        var network = platform.getAttribute('data-network');

        platform.addEventListener('click',() => self.share(network));

    });

  }

  getShareUrl() { 
      var isInIframe = (parent !== window);
      var parentUrl = null;
      var shareUrl = (isInIframe) ? document.referrer : window.location.href;
      return shareUrl;  
  }

}
