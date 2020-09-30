// if you want to import a module from shared/js then you can
// just do e.g. import Scatter from "shared/js/scatter.js"

import settings from 'shared/data/settings'
import { Preflight } from 'shared/js/preflight'
import { Frontline } from 'shared/js/frontline'
import { $, $$, round, numberWithCommas, wait, getDimensions } from 'shared/js/util'


var app = {

	init: (key) => {

		fetch(`https://interactive.guim.co.uk/docsdata/${key}.json?t=${new Date().getTime()}`).then(res => res.json())
			.then((data) => {

				var wrangle = new Preflight(data.sheets.videos, key, settings)

				wrangle.process().then( (application) => {

					new Frontline(application)

				})
				
			})

	}

}

app.init("1Z0BmZ-kxGMKZc8fXJIhBbVgBwFuw9B7jl1qfG8j39kk")