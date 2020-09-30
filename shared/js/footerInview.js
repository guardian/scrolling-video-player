import footer from '../../templates/footer.html'
import mustache from '../modules/mustache'

export default class footerInview {

  constructor(config, data) {

    this.config = config

    this.data = {}

    this.data.grid = this.chunkArrayInGroups(data, 3)

    for (const video of this.data.grid) {

      video.videos = video

    }

    this.videos = document.querySelectorAll('.footervid');
  
  }

  init() {

    var self = this

    var target = document.getElementById("the-frontline-series"); 

    var html = mustache(footer, self.data)

    target.innerHTML = html

    this.activate()

  }

  activate() {

    var self = this

    let inview = new IntersectionObserver(function(entries, observer) {

    entries.forEach(video => {

      if (video.isIntersecting) {

          video.target.play(); 

      } else {

        video.target.pause(); 

      }

    });

    }, this.config);

    this.videos.forEach( (video, index) => {

      inview.observe(video);

    });

  }

  chunkArrayInGroups(arr, size) {
      var result =  arr.reduce((all,one,i) => {
             const ch = Math.floor(i/size); 
             all[ch] = [].concat((all[ch]||[]),one); 
             return all
          }, [])

      return result
  }

}
