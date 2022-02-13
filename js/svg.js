import { SVG } from '@svgdotjs/svg.js'
import { SVG, extend as SVGextend, Element as SVGElement } from '@svgdotjs/svg.js'

////////////////////////////////////////////////////////////////////
// SVG Animations
///////////////////////////////////////////

var draw = SVG().addTo('body').size(800, 800)
var rect = draw.rect(800, 800).attr({ fill: '#06'})

SVG.on(document, 'DOMContentLoaded', function() {
  var draw = SVG().addTo('body')
})
