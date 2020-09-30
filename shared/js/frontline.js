import template from 'shared/templates/nav.html'
import { $, $$, round, numberWithCommas, wait, getDimensions } from 'shared/js/util'
import Ractive from 'ractive'
import ractiveFade from 'ractive-transitions-fade'
import ractiveTap from 'ractive-events-tap'
Ractive.DEBUG = false;
import shaka from 'shaka-player'
import ProgressBar from 'progressbar.js';
import scrollProgress from 'shared/js/scrollprogress.js';
import 'shared/js/raf'
shaka.polyfill.installAll();
import smoothscroll from 'smoothscroll-polyfill';
smoothscroll.polyfill();

Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
    get: function(){
        return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
    }
})

export class Frontline {

	constructor(application) {

		var self = this

        this.database = application

        this.interval = null

        this.blocks = document.querySelectorAll('.block');

        this.sunscreen = document.querySelector(`#sunscreen`);

        this.audio = document.querySelector(`#audio-prompt-container`);

        this.progressBar = document.querySelector(`#progressBar`);

        this.skipper = document.querySelectorAll(`.skip-btn`); 

        this.kickstarter = document.querySelector(`#start-playing-video`); 

        this.stasis = false

        this.counter = 0

        this.unplayed = true

        this.scrollProgress = new scrollProgress('.block').getTriggers()

        this.ractivate()

        //http://v1-6-2.shaka-player-demo.appspot.com/docs/tutorial-player.html
  
    }

    neighbours(vid) {

        var self = this

        var neighbours = [ vid ]

        var units = this.database.videos.length

        if (vid > 0) {

            neighbours.push(vid - 1)

        }

        if (vid < this.database.videos.length - 1) {

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

        if (this.database.pid != vid) {

            var current = document.querySelector(`#media-element-${this.database.pid}`)

            if (current.playing) {

                self.consoler(`Pause: ${this.database.pid}`)

                current.pause()
            }

            self.stasis = false

        }

        this.database.pid = vid

        this.primary = document.querySelector(`#media-element-${vid}`);

        var memory = []

        // Work out who the neighbours are

        this.database.active = self.neighbours(vid)
        
        for (var i = 0; i < this.database.videos.length; i++) {

            if (this.database.videos[i].video) {

                memory.push(this.database.videos[i].vid)

            }

            this.database.videos[i].primary = ( this.database.videos[i].vid === vid ) ? true : false ;

            this.database.videos[i].video = (self.contains(self.database.active, self.database.videos[i].vid)) ? true : false ;

        }

        var target = this.database.videos.find( item => item.primary)

        this.database.showControls = target.controls

        this.database.hasCaptions = target.hasSubtitles

        this.database.hasAudio = target.hasSubtitles

        this.database.overlay = target.overlay

        this.database.isPlaying = this.primary.playing

        this.database.hasSubtitles = target.hasSubtitles

        this.database.videos.forEach( item => {
            

            if (item.vid === self.database.pid) {

                item.muted = self.database.isMuted

            } else {

                item.muted = true

            }

           /// console.log(`Muted:  ${item.muted}, ID:  ${item.vid}, PID:  ${self.database.pid}`)
            
        })

        // Unload any videos that are outside the neighbourhood

        for (var i = 0; i < memory.length; i++) {

            if (!self.contains(self.database.active, memory[i])) {

                self.unload(memory[i])

            }

        }

        this.activate().then( () => {

            this.ractive.set(self.database)

            self.initialze() 
        })

    }

    initialze() {

        var self = this

        var target = document.querySelector(`#media-element-${self.database.pid}`);

        this.currentState(target).then( (data) => {

            self.manageState(data)

        })

        this.interval = setInterval(function() {

            var target = document.querySelector(`#media-element-${self.database.pid}`);

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

        if (data.readyState >= 1) {

            clearTimeout(self.interval);

            self.interval = null

            self.update(self.database.pid)

            self.renderLoop()

        }

    }

    kickstart() {

        if (this.counter === 1) {

            var audioSwitch = document.querySelector(`#audio-prompt-container`);

            var manualSwitch = document.querySelector(`#start-playing-video`);

            audioSwitch.style.display = "none";

            manualSwitch.style.display = "inline-block";

        }

        this.counter = this.counter + 1

    }

    manageState(stated) {

        var self = this

        if (self.unplayed) {

            if (stated.paused) {

                if (stated.readyState===4) {

                    this.kickstart(stated)

                }

            } else {

                self.unplayed = false

            }

        }

        if (stated.paused && self.database.isPlaying && !self.stasis) {

            console.log("It says we are playing but we are paused")

            self.database.isPlaying = false

            self.ractive.set('isPlaying', self.database.isPlaying)

        }

        if (self.primary) {

            if (self.primary.playing) {

                var prog =  ( (100 * stated.currentTime) / stated.duration / 100 )

                self.bar.set(prog);

            } else {

                self.bar.set(0);

                var videoList = document.querySelectorAll(".frontline-media");

                for (var i = 0; i < videoList.length; i++) {

                    if (!videoList[i].paused) {

                        videoList[i].pause()
                    }

                }

                var ended = () => {

                    var target = self.database.videos.find( item => item.vid === self.database.pid)

                    if (!target.loop && self.database.pid < self.database.videos.length - 1) {

                        self.stasis = true

                        self.database.isPaused = true

                        self.consoler(`End interview: ${self.database.pid}`)

                        var next = self.blocks[self.database.pid + 1]

                        self.scrollTo(next)

                    }

                }

                if (!self.database.showControls || !self.database.isPaused) {

                    if (!self.stasis) {

                        var promise = self.primary.play()

                        if (promise !== undefined) {

                            promise.then(_ => {

                                self.database.isPlaying = true

                                self.consoler(`Play: ${self.database.pid}`)

                                self.primary.addEventListener('ended', ended);

                                self.ractive.set(self.database)

                            }).catch(error => {

                               // //console.log("Show a play button")

                            });
                        }

                    }

                } else {

                    self.database.isPlaying = false

                    self.ractive.set(self.database)

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

        self.database.isPaused = (self.database.isPaused) ? false : true ;

        self.database.isPlaying = (self.database.isPaused) ? false : true ;

        self.ractive.set(self.database)

        this.initialze()

    }

    handleAudio() {

        var self = this

        this.database.isMuted = (self.database.isMuted) ? false : true ;

        //this.database.videos.forEach( item => item.muted = self.database.isMuted)

        this.database.videos.forEach( item => {
            

            if (item.vid === self.database.pid) {

                item.muted = self.database.isMuted

            } else {

                item.muted = true

            }

           /// console.log(`Muted:  ${item.muted}, ID:  ${item.vid}, PID:  ${self.database.pid}`)
            
        })
        

        this.ractive.set('videos', self.database.videos)

        this.ractive.set('hasAudio', self.database.hasAudio)

        this.ractive.set('isMuted', self.database.isMuted)

    }

    unload(vid) {

        var self = this

       // var mediaElement = document.querySelector(`#media-element-${vid}`);

       // mediaElement.removeAttribute("src");

       // mediaElement.load();

    }

    resizer() {

        var self = this

        window.addEventListener("resize", function() {

            clearTimeout(document.body.data)

            document.body.data = setTimeout( function() { 

                console.log("Resize")

                self.scrollProgress = new scrollProgress('.block').getTriggers()

                self.ractive.set(self.database)

            }, 200);

        });

        window.addEventListener("orientationchange", function() {
            
            console.log("orientationchange")

            location.reload();
            
        }, false);

    }

	ractivate() {

		var self = this

		this.ractive = new Ractive({

            events : { 

                tap: ractiveTap,

            },

			target : "#app",

			template : template,

			data : self.database

		});

        this.primary = document.querySelector(`#media-element-${self.database.pid}`);

        this.ractive.on( 'play', () => self.playPause() );

        this.ractive.on( 'mute', () => self.handleAudio() );

        this.bar = new ProgressBar.Circle('#progress', {
              strokeWidth: 6,
              color: '#FF0000',
              trailColor: '#eee',
              trailWidth: 1,
              svgStyle: null
        });

        this.audio.addEventListener("click", () => {

            self.handleAudio()

            self.audio.classList.toggle("sound-off");

        });


        this.kickstarter.addEventListener("click", () => {

            self.primary.play()

            self.unplayed = false

            self.handleAudio()

            var audioSwitch = document.querySelector(`#audio-prompt-container`);

            var manualSwitch = document.querySelector(`#start-playing-video`);

            manualSwitch.style.display = "none";

            audioSwitch.style.display = "inline-block";

            self.audio.classList.toggle("sound-off");

        });

        this.skipper.forEach(button => {

            var id = +button.getAttribute('data-id');

            var next = self.blocks[id + 1]

            button.addEventListener('click',() => self.scrollTo(next));

        });

        this.activate().then( self.setInterval() )

        this.resizer()

	}

    consoler(text) {

        var self = this

        console.log(text)

        //this.database.consoler = this.database.consoler += `<p>${text}</p>`

        //this.ractive.set('consoler', this.database.consoler)

    }

    setInterval() {

        var self = this

        this.interval = setInterval(function() {

            var target = document.querySelector(`#media-element-${self.database.pid}`);

            self.currentState(target).then( (data) => {

                self.manageStartup(data)

            })

        }, 250);

    }

    async activate() {

        var self = this

        for await (const active of self.database.active) {

            var manifest = self.database.videos.find( item => item.vid === active)

            if (!manifest.loaded) {

                manifest.loaded = true

                self.consoler(`Loading: ${manifest.src}`)

                var video = document.getElementById(`media-element-${active}`)

                var image = (self.database.portrait && manifest.hasSubtitles) ? `${manifest.src}-squared` : manifest.src ;

                video.setAttribute('poster', `${this.database.videopath}/images/${this.database.videoWidth}/${image}.jpg`);

                video.setAttribute('crossorigin', 'anonymous');                

                self.setPlayer(video, manifest)

            }

        }

        return true

    }

    setPlayer(video, manifest) {

        var self = this

        var folder = (self.database.portrait && manifest.hasSubtitles) ? 'squared' : 'standard' ;

        console.log(`${this.database.videopath}/${folder}/hls/${manifest.src.trim()}/index.m3u8`)

        if (self.database.app.isApp) { // HLS videos fron embed folder of gdn-cdn

            self.consoler("Using the app")

            //self.consoler(`Android: ${self.database.app.isAndroid}`)

            if (self.database.app.Android) {

                self.consoler("Using Android")

                this.initShakaPlayer(video, `${this.database.videopath}/${folder}/dash/${manifest.src.trim()}-manifest.mpd`);

            } else {

                self.consoler(`Using iOS: ${self.database.app.isIos}`)

                self.consoler(`iPhone: ${self.database.app.isiPhone}`)

                self.consoler(`iPad: ${self.database.app.isiPad}`)

                this.initHLSPlayer(video, manifest, folder)

            }

        } else {

            if (self.database.app.isIos) {

                self.consoler(`Using iOS (not the app): ${self.database.app.isIos}`)

                this.initHLSPlayer(video, manifest, folder)

            } else {

                if (shaka.Player.isBrowserSupported()) {

                    self.consoler("Using the shaka player")

                    this.initShakaPlayer(video, `${this.database.videopath}/${folder}/dash/${manifest.src.trim()}-manifest.mpd`);

                } else {  

                    self.consoler("Using HLS video")

                    this.initHLSPlayer(video, manifest, folder)

                } 

            }

        }

    }

    initHLSPlayer(video, manifest, folder) {

        var self = this

        self.consoler("Using HLS video")

        video.setAttribute('src', `${this.database.videopath}/${folder}/hls/${manifest.src.trim()}/index.m3u8`);

        video.load();

    }

    initShakaPlayer(video, manifest) {

        var self = this

        var player = new shaka.Player(video);

        player.load(manifest).then(function() {


        }).catch(function(error){

            self.consoler('Error code', error.code, 'object', error);

        });

    }

    renderLoop() {

        var self = this

        this.scrollHeight = document.body.scrollHeight - window.innerHeight

        this.requestAnimationFrame = requestAnimationFrame( function() {

            var top = window.pageYOffset

            var bottom = window.pageYOffset + ( window.innerHeight);

            var percentage = 100 / self.scrollHeight * top

            self.progressBar.style.width = percentage + "%";

            for (const target of self.scrollProgress) {

                if (target.trigger > bottom) {

                    if ((target.id - 1) != self.database.pid) { //pid

                        console.log(`Trigger zone ${target.id - 1}`)

                        self.update(target.id - 1)

                    }

                    break

                }

            }

          self.renderLoop()

        })

    }

    contains(a, b) {

        return (Array.isArray(b)) ? b.some(x => a.indexOf(x) > -1) : a.indexOf(b) > -1 ;

    }

    scrollTo(element) {

        var self = this

        setTimeout(function() {

            self.database.isPaused = false

            //var elementTop = window.pageYOffset + element.getBoundingClientRect().top // Next section at top of the viewport

            var elementTop = window.pageYOffset + element.getBoundingClientRect().top - ( window.innerHeight / 2 )

            window.scroll({

              top: elementTop,

              behavior: "smooth"

            });

        }, 100);

    }

}