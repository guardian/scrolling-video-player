export class Preflight {

	constructor(data, key, settings) {

		var self = this

		this.googledoc = data

        this.settings = settings 

        this.settings.screenWidth = window.innerWidth;

        this.settings.screenHeight = window.innerHeight; 

        this.settings.portrait = (this.settings.screenHeight > this.settings.screenWidth)  ? true : false ;

        this.settings.filepath = "<%= path %>"

        this.settings.platform = navigator.platform.toLowerCase();

        this.settings.userAgent = navigator.userAgent.toLowerCase();

        this.settings.isMobile = this.mobileCheck()

        this.settings.app = {}

        this.settings.app.isApp = (window.location.origin === "file://" || window.location.origin === null) ? true : false ;

        this.settings.app.isIos = this.ios()

        this.settings.app.isAndroid = ( /(android)/i.test(navigator.userAgent) ) ? true : false ;

        this.settings.app.isiPhone = ( /(iPhone)/i.test(navigator.platform) ) ? true : false ;

        this.settings.app.isiPad = navigator.userAgent.match(/iPad/i) != null;

        this.settings.localstore = this.localStorage()

        this.settings.randomID = this.randomString(32)

        this.settings.key = key

        this.settings.cookie = (this.settings.testing) ? `ga_dev_${this.settings.key}` : `ga_${this.settings.key}` ;

        this.settings.max = self.calculateCover({width: self.settings.screenWidth, height: self.settings.screenHeight}, [16,9])

        this.settings.sub = self.videoWidth(self.settings.max.width)

        this.settings.prefix = this.getCssValuePrefix()

        this.settings.active = [ 0, 1 ]

        this.settings.isMuted = true

        this.settings.consoler = ""

        this.settings.videoWidth = self.videoSize(this.settings.screenWidth)

	}

    videoSize(width) {

      return (width < 401) ? 400 : 
      (width < 481) ? 480 : 
      (width < 641) ? 640 :
      (width < 961) ? 960 :
      (width < 1281) ? 1280 : 1920 ;

    }
    
    getCssValuePrefix() {

        var rtrnVal = '';

        var prefixes = ['-o-', '-ms-', '-moz-', '-webkit-'];

        var dom = document.createElement('div');

        for (var i = 0; i < prefixes.length; i++) {

            dom.style.background = prefixes[i] + 'linear-gradient(#000000, #ffffff)';

            if (dom.style.background) {

                rtrnVal = prefixes[i];
                
            }
        }

        dom = null;

        return rtrnVal;
    }

    calculateCover(frame, sides) {

        var ratio = sides[1] / sides[0];
        var cover = { width: frame.width, height: Math.ceil(frame.width * ratio) };

        if (cover.height <= frame.height) {
            cover.height = frame.height;
            cover.width = Math.ceil(frame.height / ratio);
        }

        return cover;

    }

    videoWidth(width) {

        return (width < 427) ? 426 :
            (width < 641) ? 640 :
            (width < 854) ? 853 :
            (width < 1281) ? 1280 : 1920 ;

    }

    ios() {

        var iDevices = [
            'iPad Simulator',
            'iPhone Simulator',
            'iPod Simulator',
            'iPad',
            'iPhone',
            'iPod'
        ];

        if (!!navigator.platform) {
            while (iDevices.length) {
                if (navigator.platform === iDevices.pop()){ 
                    return true; 
                }
            }
        }

        return false;

    }

    mobileCheck() {
        var check = false;
        (function(a) {
            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true
        })(navigator.userAgent || navigator.vendor || window.opera);
        var isiPad = navigator.userAgent.match(/iPad/i) != null;
        return (check || isiPad ? true : false);
    }

    localStorage() {

        var self = this

        if (typeof localStorage !== 'undefined') {
            try {
                localStorage.setItem('verify', 'confirm');
                if (localStorage.getItem('verify') === 'confirm') {
                    localStorage.removeItem('verify');
                    //localStorage is enabled
                    return true;
                } else {
                    //localStorage is disabled
                    return false;
                }
            } catch(e) {
                //localStorage is disabled
                return false;
            }
        } else {
            //localStorage is not available
            return false;
        }
    }

    randomString(length) {
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }

    localStorage() {

        var self = this

        if (typeof localStorage !== 'undefined') {
            try {
                localStorage.setItem('verify', 'confirm');
                if (localStorage.getItem('verify') === 'confirm') {
                    localStorage.removeItem('verify');
                    //localStorage is enabled
                    return true;
                } else {
                    //localStorage is disabled
                    return false;
                }
            } catch(e) {
                //localStorage is disabled
                return false;
            }
        } else {
            //localStorage is not available
            return false;
        }
    }

    async process() {

        var self = this

        await this.googledoc.forEach( (value) => {

            value["vid"] = +value["vid"];

            value["loop"] = (value["loop"]!="") ? true : false ;

            value["controls"] = (value["controls"]!="FALSE") ? true : false ;

            value["autoplay"] = (value["autoplay"]==="TRUE") ? true : false ;

            value["video"] = false

            value["primary"] = false

            value["displayCaptions"] = true

            value["hasAudio"] = (value["hasAudio"]==="FALSE") ? false : true ;

            value["overlay"] = (value["overlay"]==="TRUE") ? true : false ;

            value["muted"] = false

            value["loaded"] = false

            value["display"] = (self.settings.portrait && value["subs"]!="") ? "squared" : "standard" ;

        });

        this.googledoc[0].video = true

        this.googledoc[1].video = true

        this.googledoc[0].primary = true

        this.database = { 

            videopath: self.settings.videopath,

            videos: self.googledoc,

            eligible: self.settings.preflight,

            filepath: self.settings.filepath,

            isMobile: self.settings.isMobile,

            app: self.settings.app,

            isPlaying : self.settings.currentVideo.isPlaying,

            isPaused : self.settings.currentVideo.isPaused,

            hasCaptions : self.settings.currentVideo.hasCaptions,

            hasAudio : self.settings.currentVideo.hasAudio,

            overlay : self.settings.currentVideo.overlay,

            isMuted : self.settings.isMuted,

            showControls : self.settings.currentVideo.showControls,

            displayCaptions : self.settings.currentVideo.displayCaptions,

            consoler : self.settings.consoler,

            pid : self.settings.currentVideo.pid,

            active : self.settings.active,

            videoWidth : self.settings.videoWidth,

            portrait: self.settings.portrait,

        }

        return this.database

    }

}