import template from '../../templates/nav.html'
import { $, $$, round, numberWithCommas, wait, getDimensions } from '../modules/util'
import Ractive from 'ractive'
import ractiveFade from 'ractive-transitions-fade'
import ractiveTap from 'ractive-events-tap'
//import share from '../modules/share'
//Ractive.DEBUG = false;
//smoothscroll.polyfill();
import shaka from 'shaka-player'
import ProgressBar from 'progressbar.js';
import moment from 'moment';
import '../modules/raf'
shaka.polyfill.installAll();

Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
    get: function(){
        return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
    }
})

export class Frontline {

	constructor(application) {

		var self = this

        this.application = application

        this.interval = null

        this.videos = document.querySelectorAll('.frontline-media');

        this.panels = document.querySelectorAll('.panel');

        this.setup()

        //http://v1-6-2.shaka-player-demo.appspot.com/docs/tutorial-player.html

  }

  setup() {

    var self = this

    this.videos.forEach( (video, index) => {

        var index = video.getAttribute('data-id')

        // video.setAttribute('poster', `${this.path}/assets/images/${this.folder}/${this.src[id].poster}`);

        video.setAttribute('crossorigin', 'anonymous');

        console.log(`<%= path %>/assets/videos/episode-1/${self.application.database[index].src}`)

        video.setAttribute('src', `<%= path %>/assets/videos/episode-1/${self.application.database[index].src}`);

        video.load();

      /*
      // C ors is a pain
      https://github.com/minio/minio/issues/5748
      */

      /*

      if (this.app.isIos) { //this.app.isApp || 

        video.setAttribute('src', `https://interactive.guim.co.uk/embed/aus/2020/ocean-pools/${this.width}/${this.src[id].video}`);

        video.load();

      } else {

        if (shaka.Player.isBrowserSupported()) {

          this.initPlayer(video, `https://aus-video.s3-ap-southeast-2.amazonaws.com/ocean-pools/dashing/${this.src[id].dash}`);

        } else {  

          //video.setAttribute('src', `https://aus-video.s3-ap-southeast-2.amazonaws.com/ocean-pools/hls/${this.src[id].hls}`);

          video.setAttribute('src', `https://interactive.guim.co.uk/embed/aus/2020/ocean-pools/${this.width}/${this.src[id].video}`);

          video.load();

        } 

      }

      */

    });

    this.ractivate()

  }

  initPlayer(video, manifest) {

    var player = new shaka.Player(video);

    player.load(manifest).then(function() {

      console.log('The video has now been loaded!');

    }).catch(function(error){

      console.error('Error code', error.code, 'object', error);

    });

  }

    neighbours(vid) {

        var self = this

        var neighbours = [ vid ]

        var units = this.application.database.length

        if (vid > 0) {

            neighbours.push(vid - 1)

        }

        if (vid < this.application.database.length - 1) {

            neighbours.push(vid + 1)

        }

        return neighbours

    }

    clearInterval() {

        if (this.interval!=null) {

            clearTimeout(self.interval);

            self.interval = null

        }

    }

    update(vid) {

        var self = this

        this.clearInterval()

        this.application.settings.currentVideo.pid = vid

        this.primary = document.querySelector(`#media-element-${vid}`);

        var memory = []

        // Work out who the neighbours are

        this.application.settings.active = self.neighbours(vid)
        
        for (var i = 0; i < this.application.database.length; i++) {

            if (this.application.database[i].video) {

                memory.push(this.application.database[i].vid)

            }

            this.application.database[i].primary = ( this.application.database[i].vid === vid ) ? true : false ;

            this.application.database[i].video = (self.contains(self.application.settings.active, self.application.database[i].vid)) ? true : false ;

        }

        var target = this.application.database.find( item => item.primary)

        this.application.settings.currentVideo.showControls = target.controls

        this.application.settings.currentVideo.hasCaptions = target.hasSubtitles

        this.application.settings.currentVideo.hasAudio = target.hasSubtitles

        this.application.settings.currentVideo.muted = true

        this.application.database.forEach( item => item.muted = self.muted)

        // Unload any videos that are outside the neighbourhood

        for (var i = 0; i < memory.length; i++) {

            if (!self.contains(self.application.settings.active, memory[i])) {

                self.unload(memory[i])

            }

        }

        this.ractive.set('muted', self.application.settings.currentVideo.muted)

        this.initialze()

    }

    initialze() {

        var self = this

        this.panels.forEach( panel => {

            if (panel.classList.contains("cinema-foreground")) {
                panel.classList.remove("cinema-foreground");
                panel.classList.add("cinema-background");
            }
        })

        this.panels[self.application.settings.currentVideo.pid].classList.remove("cinema-background");

        this.panels[self.application.settings.currentVideo.pid].classList.add("cinema-foreground");

        console.log(`Play video ${self.application.settings.currentVideo.pid}`)

        this.videos[self.application.settings.currentVideo.pid].play(0)

        this.videos[self.application.settings.currentVideo.pid].muted = false



        var target = document.querySelector(`#media-element-${self.application.settings.currentVideo.pid}`);

        this.currentState(target).then( (data) => {

            self.manageState(data)

        })

        this.interval = setInterval(function() {

            var target = document.querySelector(`#media-element-${self.application.settings.currentVideo.pid}`);

            self.currentState(target).then( (data) => {

                self.manageState(data)

            })

        }, 1000);

    }

    async currentState(vid) {

        var state = {

            "readyState" : vid.readyState,

            "currentTime" : vid.currentTime,

            "paused" : vid.paused,

            "duration" : vid.duration

        }

        return await state

    }

    manageStartup(data) {

        var self = this

        if (data.readyState > 2) {

            clearTimeout(self.interval);

            self.interval = null

            self.update(self.application.settings.currentVideo.pid)

            self.scroll()

        }

    }

    manageState(stated) {

        var self = this

        if (self.primary) {

            if (self.primary.playing) {

                var prog =  ( (100 * stated.currentTime) / stated.duration / 100 )

                self.bar.set(prog);

            } else {

                self.bar.set(0);

                var videoList = document.getElementsByTagName("video");

                for (var i = 0; i < videoList.length; i++) {

                    if (!videoList[i].paused) {

                        videoList[i].pause()
                    }

                }

                if (!self.application.settings.currentVideo.showControls || !self.application.settings.currentVideo.isPaused) {

                    var promise = self.primary.play()

                    if (promise !== undefined) {

                        promise.then(_ => {

                            self.application.settings.currentVideo.isPlaying = true

                            self.handlePlay()

                        }).catch(error => {

                           // console.log("Show a play button")

                        });
                    }

                } else {

                    self.application.settings.currentVideo.isPlaying = false

                    self.handlePlay()

                }
            }
        }
    }

    playPause() {

        var self = this

        if (this.interval!=null) {

            clearTimeout(self.interval);

            this.interval = null

        }

        if (self.primary.playing) {

            self.primary.pause()

        }

        self.application.settings.currentVideo.isPaused = (self.application.settings.currentVideo.isPaused) ? false : true ;

        self.application.settings.currentVideo.isPlaying = (self.application.settings.currentVideo.isPaused) ? false : true ;

        this.handlePlay() 

        this.initialze()

    }

    handlePlay() {

        var self = this

        this.ractive.set('showControls', self.application.settings.currentVideo.showControls)

        this.ractive.set('hasCaptions', self.application.settings.currentVideo.hasCaptions)

        this.ractive.set('hasAudio', self.application.settings.currentVideo.hasAudio)

        this.ractive.set('isPlaying', self.application.settings.currentVideo.isPlaying)

    }

    handleAudio() {

        var self = this

        this.application.settings.currentVideo.muted = (self.application.settings.currentVideo.muted) ? false : true ;

        this.application.database.forEach( item => item.muted = self.application.settings.currentVideo.muted)

        //this.ractive.set('video', self.application.database)

        this.ractive.set('muted', self.application.settings.currentVideo.muted)

    }

    handleCaptions() {

        var self = this

        this.application.settings.currentVideo.displayCaptions = (this.application.settings.currentVideo.displayCaptions) ? false : true ;

        this.application.database.forEach( item => item.displayCaptions = self.application.settings.currentVideo.displayCaptions)

        //this.ractive.set('video', this.application.database)

        this.ractive.set('displayCaptions', self.application.settings.currentVideo.displayCaptions)

    }

    unload(vid) {

        var self = this

        //var mediaElement = document.querySelector(`#media-element-${vid}`);

        //mediaElement.removeAttribute("src");

       // mediaElement.load();

    }

    resizer() {

        var self = this

        window.addEventListener("resize", function() {

            clearTimeout(document.body.data)

            document.body.data = setTimeout( function() { 

                // var now = (window.innerWidth < 740) ? true : false ;

            }, 200);

        });

        navigator.connection.addEventListener('change', function() {

        });

    }

	ractivate() {

		var self = this

		this.ractive = new Ractive({

            events: { 

                tap: ractiveTap,

            },

			target: "#app",

			template: template,

			data: { 

                eligible: self.application.settings.preflight,

                filepath: self.application.settings.filepath,

                isMobile: self.application.settings.isMobile,

                isApp: self.application.settings.isApp,

                isIos: self.application.settings.isIos,

                isIosApp: self.application.settings.isIosApp,

                isPlaying : self.application.settings.currentVideo.isPlaying,

                hasCaptions : self.application.settings.currentVideo.hasCaptions,

                hasAudio : self.application.settings.currentVideo.hasAudio,

                showControls : self.application.settings.currentVideo.showControls,

                displayCaptions : self.application.settings.currentVideo.displayCaptions

			}

		});

        this.primary = document.querySelector(`#media-element-${self.application.settings.currentVideo.pid}`);


        this.ractive.on( 'play', () => self.playPause() );

        this.ractive.on( 'mute', () => self.handleAudio() );

        this.ractive.on( 'captions', () => self.handleCaptions() );

        this.bar = new ProgressBar.Circle('#progress', {
              strokeWidth: 6,
              color: '#FF0000',
              trailColor: '#eee',
              trailWidth: 1,
              svgStyle: null
        });

        this.renderLoop()

        this.interval = setInterval(function() {

            var target = document.querySelector(`#media-element-${self.application.settings.currentVideo.pid}`);

            self.currentState(target).then( (data) => {

                self.manageStartup(data)

            })

        }, 250);

	}

    scroll() {

        var self = this

        let observer = new IntersectionObserver((entries, observer) => { 
            
            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    self.update(+entry.target.dataset.id)

                }

            });

        }, { rootMargin : "0px 0px 100% 0%"});

        document.querySelectorAll('.block').forEach(trigger => { observer.observe(trigger) });

    }

    renderLoop() {

        var self = this

        document.getElementsByClassName('background')[0];

        this.requestAnimationFrame = requestAnimationFrame( function() {

            var percentage = (100 / document.body.offsetHeight * window.pageYOffset)

            let orientation = `${percentage}deg`

            let colorOne = `hsl(0, 100%, 50%)` // hsl(360, 100%, 50%)

            let colorTwo =  `hsl(${40 + ( percentage * 3 ) }, 100%, 50%)` // hsl(400, 100%, 50%)

            dom.style.backgroundImage = self.prefix + 'linear-gradient(' + orientation + ', ' + colorOne + ', ' + colorTwo + ')';

            self.renderLoop()

        })
    }
    
    contains(a, b) {

        return (Array.isArray(b)) ? b.some(x => a.indexOf(x) > -1) : a.indexOf(b) > -1 ;

    }

    unmatched_array(a, b) {

        // array matches
        if (Array.isArray(b)) {

            var filteredArray = b.filter(function( c ) {
                if (a.indexOf(c) === -1) {
                    return c;
                }
            });

            return filteredArray

        }

        // string match
        return  (a.indexOf(b) === -1) ? b : [] ;

    }

}