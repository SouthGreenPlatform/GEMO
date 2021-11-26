//draw bed annotations
export function drawBed(bedAnnot, maxLength){
	console.log(bedAnnot);

	let ratio = maxLength /600;
	let minWidth = 2;
	
	$( document ).ready(function() {

		console.log( "ready!" );
		console.log("drawBed ");

		//parcours les annotations
		$.each(bedAnnot, function(i, obj) {
			let start = parseInt(obj.start) / parseInt(ratio);
			//console.log("start "+start);
			let stop = parseInt(obj.stop) / parseInt(ratio);
			let width = parseInt(stop)/600-parseInt(start)/600;

			if(width<minWidth){width = minWidth;}

			//draw
/* 			console.log(obj.chr);
			d3.selectAll(".chromosome-set").select("[id^='chr"+obj.chr+"-']")
			.append("rect")       // attach a rectangle
			.style("fill", "black")
			.attr('title', "Name: "+obj.name+" \nStart: "+obj.start+" Stop: "+obj.stop)
			.attr('class', 'bed-annot')
			.attr("x", parseInt(start))         // position the left of the rectangle
			.attr("y", -10)          // position the top of the rectangle
			.attr("height", 10)    // set the height
			.attr("width", width);  */

			d3.selectAll(".chromosome-set").select("[id^='chr"+obj.chr+"-']")
			.append("svg:image")
			.attr('title', "Name: "+obj.name+" \nStart: "+obj.start+" Stop: "+obj.stop)
			.attr('class', 'bed-annot')
			.attr('x', parseInt(start)-7)
			.attr('y', -15)
			.attr('height', 15)
			.attr("xlink:href", "public/img/location-sign.png");



		
		});
		//tooltipster activation
		$('.bed-annot').tooltipster({
			theme: 'tooltipster-punk',
			contentAsHTML: false,
			//content: $('#tooltip_content'),
			interactive: true,
			contentCloning: true,
			delay: 100
		});
	});

	
}

export function ideoViewbox(){
	$( document ).ready(function() {
		let svg = document.getElementById('_ideogram');
		let width = parseInt($('#_ideogram').width());
		let height = parseInt($('#_ideogram').height());
		svg.setAttribute("viewBox", "0 -20 "+width+" "+height);
	});
}