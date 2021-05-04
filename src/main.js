import { initConfig } from "./config.js";
import { chromosomeParser, annotationParser } from "./dataParser.js";
import { loadingon, loadingoff, displaytext, clear } from "./display.js";

////////////
let ploidyA ="";
//////////

let lgtChro =[]; //longueur des chromosomes
let chrBands = [];
let config;
let annotTable=[]; // annot file splited by line


////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////

async function load_accession(sampleJson){
	console.log("load accession");
	let FileName = sampleJson[0].FileName;
	let ploidy = sampleJson[0].Ploidy;
	let ChromFile = sampleJson[0].ChromFile;
	clear();
	//console.log(new Error().stack);
	
	//affiche le loader
	document.getElementById("loader").style.display = "block";
	
	config = initConfig();
	//load le fichier mosaique dans le formulaire

	let response = await fetch('/gemo/data/accessions/'+FileName);
	let responseText = await response.text();
	await $("#editorAnnot").val(responseText);

	//Ploidy
	config.ploidy = ploidy;
	$('#selectorploidy').val(ploidy);

	config.dataDir = '/gemo/data/';
	//config.dataDir = '/gemo/data/visuchromp/';
	response = await fetch('/gemo/data/chromosomes/'+ChromFile);
	responseText = await response.text();
	await $("#editorChr").val(responseText);

	load_ideogram();

	setTimeout(addTooltip,100);

	//addTooltip();
	
	//draw
	//loadingon();
	
}

////////////////////////////////////////////////////////////////
// Event show letters
////////////////////////////////////////////////////////////////
$('#SwitchLetters').change( function(){
	displaytext();
});

////////////////////////////////////////////////////////////////
// Load ideogram from preloaded accession
////////////////////////////////////////////////////////////////
function load_ideogram(){
	//clear();
	//values in chromosome form
	console.log("load ideogram");
	//console.log(config);
	const chrdata = $("#editorChr").val();
	//values in data form
	const annotdata = $("#editorAnnot").val();
	config.ploidyDesc = [];
	//colorchange();
	config.ploidy = Number($('#selectorploidy').val());
	//parse les données chromosomes
	let chrDataParsed = chromosomeParser(chrdata);
	config.ploidyDesc = chrDataParsed[0];
	config.ploidysize = chrDataParsed[1];
	chrBands = chrDataParsed[2];
	
	//parse les données blocs
	let annotDataParsed = annotationParser(annotdata, config.ploidy);
	config.rangeSet = annotDataParsed[0];
	annotTable = annotDataParsed[1];
	
	//Crée le graph
	if(chrdata != ""){
		//console.log(config);
		const ideogram = new Ideogram(config);

	}
	//apparition du bouton download
	$('#download').fadeIn()
	//repositione();
	$('#potatosalad').on('click', function(event){
    //The event won't be propagated to the document NODE and 
    // therefore events delegated to document won't be fired
   //event.stopPropagation();
	});
}

//Ajoute les tooltips, lien vers genome browser
function addTooltip(){

	console.log("add tooltip");
	//compteur pour retrouver les infos de coordonées du bloc
	let blocCount = 0;

	//parcourir chaque .range de .range-set = chaque bloc svg
	//si transparent => supprimer le bloc
	//sinon copier le bloc et append to range-set.parent dans une nouvelle balise g
	$(".range").each(function(index ){

		if ($(this).attr('style') == 'fill: transparent;'){
			//console.log("remove");
			$(this).remove();

		}else{

			//retreive annotations of the current bloc
			//annotTable = fichier accession
			let annotBloc = annotTable[blocCount];

			//console.log(annotBloc);
			//console.log($(this));
			//console.log("---------------------");

			const annotElements = annotBloc.split(' ');
			
			let chr = annotElements[0];
			let start = annotElements[2];
			let stop = annotElements[3];
			//console.log(chr + ' ' + start+ ' '+stop);

			let rangeset = $(this).parent();
			let chromosome = rangeset.parent();

			//retrieve chromosome position
			//let clippath = chromosome.attr('clip-path');
			//const regexp = /(chr\d+)/.exec(clippath);

			//set the url to the retrieved chromosome
			let url = 'Go to Banana Jbrowse\<br/\>\<a href=\"https://banana-genome-hub.southgreen.fr/content/m-acuminata-dh-pahang-version-2/?loc=chr'+chr+':'+start+'..'+stop+'\"\>Chr'+chr+' '+start+'..'+stop+'\<\/a\>'
			let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			g.setAttributeNS(null, 'class', 'bloc-annot');

			//set the tooltip content, link to genome browser
			g.setAttribute('title', url);
			chromosome.append(g);

			let annot = $(this)[0].cloneNode(true);
			annot.setAttribute('style', 'fill: transparent');
			g.append(annot);
			blocCount++;
			//console.log(blocCount);
			
		}
	});
	//tooltipster activation
    $('.bloc-annot').tooltipster({
		theme: 'tooltipster-punk',
		contentAsHTML: true,
		//content: $('#tooltip_content'),
		interactive: true,
		contentCloning: true,
		delay: 100
	});
	
	loadingoff();
}

////////////////////////////////////////////////////////////////
// Fonction qui recalcul le schéma à partir des données dans les cadres
////////////////////////////////////////////////////////////////
document.getElementById("reload").addEventListener("click", function(e) {
	console.log("update");
	clear();
	config = initConfig();
	loadingon();
	load_ideogram();
	//repositione();
	setTimeout(addTooltip, 100); //addTooltip();
	
});

////////////////////////////////////////////////////////////////
//
////////////////////////////////////////////////////////////////
function load_file(){
	console.log("chr to form");
	$("#editorChr").text("");
	//$("#fileInputC").show();
	const fileInputC = document.getElementById('fileInputC');
	//fileInputC.addEventListener('change', function(e) {
		const file = fileInputC.files[0];
		const reader = new FileReader();
		reader.onload = function(e) {

			const lines = reader.result.split('\n');
			if (lines[lines.length - 1] ==""){
				let texte = "";
				for(let i = 0; i < lines.length -1; i++){
					if (i < lines.length -2){
						texte = texte + lines[i];
						texte = texte + '\n';
					}
					else{
						texte = texte + lines[i];
					}
				}
				$("#editorChr").text(texte);
			}
			else{
				$("#editorChr").text(reader.result);
			}	
		};
		reader.readAsText(file);  
}

function load_file2(){
	console.log("annot to form");
	$("#fileInputD").show();
	const fileInputD = document.getElementById('fileInputD');
	//fileInputD.addEventListener('change', function(e) {
		const file = fileInputD.files[0];
		const reader = new FileReader();
		reader.onload = function(e) {

			//$("#editorAnnot").text(reader.result);

			const lines = reader.result.split('\n');
			if (lines[lines.length - 1] ==""){
				let texte = "";
				for(let i = 0; i < lines.length -1; i++){
					if (i < lines.length -2){
						texte = texte + lines[i];
						texte = texte + '\n';
					}
					else{
						texte = texte + lines[i];
					}
				}
				$("#editorAnnot").text(texte);
			}
			else{
				$("#editorAnnot").text(reader.result);
			}	
			//$("#fileInputD").hide();
		};
		reader.readAsText(file); 
	//});   
}


/* function repositione(){
	console.log("repositione");
	setTimeout(function(){
		const ideo = document.getElementById("_ideogram");
		//var tideo = document.getElementById("targetideo");
		//tideo.appendChild(ideo);
	}, 50);
} */







function colorchange(){
	for(let key in config.ancestors){
		if($("#selectorpreset :selected").val() == "preset1"){
			config.ancestors[key] = preset1[key];
		}else if ($("#selectorpreset :selected").val() == "preset2"){
			config.ancestors[key] = preset2[key];
		}else{
			config.ancestors[key] = preset3[key];
		}  
	}
	if($("#selectorpreset :selected").val() == "preset1"){
		for(let i = 0; i<config.rangeSet.length; i++){
			config.rangeSet[i].color = preset1.ploidy;
		}
	}else if ($("#selectorpreset :selected").val() == "preset2"){
		for(let i = 0; i<config.rangeSet.length; i++){
			config.rangeSet[i].color = preset2.ploidy;
		}
	}else{
		for(let i = 0; i<config.rangeSet.length; i++){
			config.rangeSet[i].color = preset3.ploidy;
		}
	} 
	//load_ideogram();
}





///////////////////////////////////////////////////
//Création de l'echelle du graph
//////////////////////////////////////////////////
function echelle(){
	//console.log(lgtChro);
    //var maxlgt = Math.max.apply(null,lgtChro); 
	let maxlgt = 0;
	for(let i = 0; i<ultimateCount; i++){
		if(maxlgt <= ultimateWidth[i]){
			maxlgt = ultimateWidth[i];
		}
	}

    const width = maxlgt,
        height = 50;

    const data = lgtChro;
    const maxlgtpb = Math.max.apply(null,lgtChro); 

    // Append SVG 
    const svg = d3.select("body")
                .append("svg")
		.attr("id", "scale")
                .attr("width", width)
                .attr("height", height)
		.attr("transform", 'translate(60,10)');

    // Create scale
    const scale = d3.scaleLinear()
                  .domain([0, d3.max(data)])
                  .range([0, width]);

    // Add scales to axis
    const x_axis = d3.axisBottom()
                   .scale(scale)
		   .ticks(5);

    //Append group and insert axis
    svg.append("g")
       .call(x_axis);
}



///////////////////////////////////////////////
// MENU
///////////////////////////////////////////////
///////////////////////////////////////
///// Choix du form block / curve /////
///////////////////////////////////////
/* $('input[type=radio][name=formchoice]').change(function() {
    if (this.value == 'block') {
		$('#curveform').hide();
		$('#blockform').show();
    }
    else if (this.value == 'curve') {
        $('#curveform').show();
		$('#blockform').hide();
    }
}); */
///////////////////////////////////////
//Affichage du nom des fichiers input//
///////////////////////////////////////
$('.custom-file-input').on('change', function(){ 
	console.log("custom file");
	let files = $(this)[0].files; 
	name = ''; 
	for(var i = 0; i < files.length; i++){ 
		name += '\"' + files[i].name + '\"' + (i != files.length-1 ? ", " : ""); 
	} 
	$(this)
      .next(".custom-file-label")
      .html(name); 
});

//////////////////////////////////////////////////////
// Populate preloaded list of organisms and samples //
//////////////////////////////////////////////////////
//ref https://www.encodedna.com/jquery/cascading-select-dropdown-list-using-json-data.htm
//tab of preloaded example
let arrData = [];
    
// Fill the first dropdown with data.
$.getJSON('./config/pre-loaded.json', function (data) {

	//tab of organisms
    let organismTab = [];

	//retrieve organism in each json entry
    $.each(data, function (index, value) {
        organismTab.push(value.Organism);
        arrData = data;
    });

    // Remove duplicates. We want unique bird types.
    organismTab = Array.from(new Set (organismTab));
    // ref (https://www.encodedna.com/javascript/remove-duplicates-in-javascript-array-using-es6-set-and-from.htm)

    // Fill the first dropdown with unique bird types.
    $.each(organismTab, function (index, value) {
        $('#organism').append('<option value="' + value + '">' + value + '</option>');
    });
});

//fonction change select
$('#organism').change(function () {
    let selectedOrganism = this.options[this.selectedIndex].value;

	//retreive all entries for this organism
    let filterData = arrData.filter(function(value) {
        return value.Organism === selectedOrganism;
    });

    $('#sample')
        .empty()
        .append('<option value=""> -- Select sample -- </option>');

    $.each(filterData, function (index, value) {
        // Now, fill the second dropdown list with bird names.
        $('#sample').append('<option value="' + value.ID + '">' + value.Sample + '</option>');
    });
});

//fonction change sample
//load ideogram
$('#sample').change( function(){
	//retreive all entries for this ID sample
    let sampleJson = arrData.filter(function(value) {
        return value.ID === $("#sample option:selected")[0].value;
    });
	$('#chrompaint').hide();
	$('#page-content-wrapper').show();
	load_accession(sampleJson);
});



////////////////////////////////////////////////////////////////
// Load ideogram from preloaded accession
////////////////////////////////////////////////////////////////
function load_ideogram_from_form_data(){
	//clear();
	//values in chromosome form
	console.log("load_ideogram_from_form_data");
	//console.log(config);
	const chrdata = $("#editorChr").val();
	//values in data form
	const annotdata = $("#editorAnnot").val();
	const colordata = $("#editorColor").val();
	config.ploidyDesc = [];
	//colorchange();
	config.ploidy = Number($('#selectorploidy').val());
	//parse les données chromosomes
	let chrDataParsed = chromosomeParser(chrdata);
	config.ploidyDesc = chrDataParsed[0];
	config.ploidysize = chrDataParsed[1];
	chrBands = chrDataParsed[2];
	
	//parse les données blocs
	let annotDataParsed = annotationParser(annotdata, config.ploidy);
	config.rangeSet = annotDataParsed[0];
	annotTable = annotDataParsed[1];
	
	//Crée le graph
	if(chrdata != ""){
		//console.log(config);
		const ideogram = new Ideogram(config);

	}
	//apparition du bouton download
	$('#download').fadeIn()
	//repositione();
	$('#potatosalad').on('click', function(event){
    //The event won't be propagated to the document NODE and 
    // therefore events delegated to document won't be fired
   //event.stopPropagation();
	});
}









////////////////////////////////////////////////////////////////////////////////
//// C H R O M P A I N T ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


import {resetgraph} from "./chrompaint/import.js";
import {checkColorFile,checkLenFile,checkDataFile} from "./chrompaint/checkFile.js";
import {parsingData, parsingLen, parsingColor,randomColorGenerator,dataStuffing} from "./chrompaint/parse.js";
import {order, convertStrtoRangeSet, groupByColor, ancestorsGenerator, ploidyDescGenerator} from "./chrompaint/mosaique.js";
import {getKeyByValue, refreshFloor, curveOpacitySetup, refreshCurveOpacity, arraySetup, floorPositionsSetup, refreshfloorPositions, tracerCourbe} from "./chrompaint/graph.js";

// let dropArea = document.getElementById('drop-area');
let dataFileInput = document.getElementById('dataFile');
let colorFileInput = document.getElementById('colorFile');
let lenFileInput = document.getElementById('lenFile');


let haplotype = 2; //ploïdie

let rawData; //Données brut, comme envoyé.
let stuffedData; //Données brut, avec les lignes de bourrage. Sera pratique plus tard (généré à partir de rawData).
let data; //Nos données parsé (généré à partir de stuffedData).

let ancestorsNameColor; //Match les abréviation d'origine avec leurs noms complet ainsi qu'une couleur.

let chrConfig; //J'en aurais besoins si l'haplotype est changé après que les données ai été envoyé.
let mosaiqueConfig; //Version parsé pour ideogram.js de chrConfig

////////////RECUPERATION DES FICHIERS///////////////////////////////

//dropArea.addEventListener('drop', handleDrop, false);

dataFileInput.addEventListener('change',function(e){
    handleFiles(this.files,e.target.id);
});
colorFileInput.addEventListener('change',function(e){
    handleFiles(this.files,e.target.id);
});
lenFileInput.addEventListener('change',function(e){
    handleFiles(this.files,e.target.id);
});

document.getElementById("selectorploidy").value = haplotype;

document.getElementById("selectorploidy").addEventListener('change',function(){
    haplotype = document.getElementById("selectorploidy").value;
});

document.getElementById("submit").addEventListener("click",function(){

    //Si on est en mode "curve"
    var radio_form = $('#radio_form input:radio:checked').val()
    if(radio_form === "curve"){
        console.log("curve");

        //Affiche les div de chrompaint
        $('#chrompaint').show();
        $('#page-content-wrapper').hide();

        if(rawData === undefined){
            alert("Fichier de données manquant");
            throw "pas de données envoyé."
        }
        if(chrConfig === undefined){
            alert("Fichier de configuration des chromosomes manquant.");
            throw "Fichier de configuration des chromosomes manquant.";
        }
        else if(stuffedData === undefined) {
            stuffedData = dataStuffing(rawData, chrConfig);
            data = parsingData(stuffedData);
        }
        if (ancestorsNameColor === undefined) {
            ancestorsNameColor = randomColorGenerator(data);
        }
        resetgraph();
        graphSetup(data);
    }else{
        console.log("block");
		config = initConfig();
		loadingon();
		load_ideogram();
		//repositione();
		setTimeout(addTooltip, 100); //addTooltip();
    }
    
});

/**
 * extrait le fichier qui a été drag'n'drop à partir de l'event
 * @param e l'event.
 */

/* function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;
    handleFiles(files,e.target.id)
} */

/**
 * Lis le fichier (@file) et le traité suivant sont (@fileType). le contenue du fichier et parse par d3.tsvParse, puis le résultat est placé dans une variable globale.
 * On place les résultats dans des variables globales, parce que les biologistes sont imprévisibles et qu'ils peuvent vouloir mettre les fichiers dans n'importe quel ordre (Loi de Murphy).
 * @param files array. la liste des fichiers reçu par input. Ici on n'en reçoit qu'un à chaque fois donc on prends Files[0].
 * @param fileType string. En pratique c'est l'ID de l'input appellant (e.id.target), celui-ci étant (color/len/data)File il nous permet de le traiter dans un switch. voir 1* et 2*
 */

function handleFiles(files,fileType) {
    let fileName = fileType.replace("File",""); //1* colorFile -> color.
    let reader = new FileReader();              //initalisation d'un reader pour lire le fichier, si si, un reader, pour lire.
    let file = files[0];
	var radio_form = $('#radio_form input:radio:checked').val()

    reader.readAsText(file, "UTF-8");
    reader.onload = function (e) {
	
		if(radio_form === "curve"){
			console.log("curve");
			switch(fileName){                       //2*
				case'data':
					if(checkDataFile(d3.tsvParse(e.target.result))) {
						rawData = d3.tsvParse(e.target.result);
						//dropArea.style.animation = "valid 1s ease forwards"; //Parce que sinon ils ne vont pas comprendre que leur fichier a bien été déposé.
						$("#editorAnnot").val(e.target.result);
					}
					break;
				case'color':
					if(checkColorFile(d3.tsvParse(e.target.result))) {
						ancestorsNameColor = parsingColor(d3.tsvParse(e.target.result));
						$("#editorColor").val(e.target.result);
					}
					break;
				case'len':
					if(checkLenFile(d3.tsvParse(e.target.result))) {
						chrConfig = d3.tsvParse(e.target.result);
						mosaiqueConfig = parsingLen(chrConfig);
						$("#editorChr").val(e.target.result);
					}
					break;
			}
		}else{
			console.log("block");
			switch(fileName){
				case'data':
					$("#editorAnnot").val(e.target.result);
					break;
				case'color':
					$("#editorColor").val(e.target.result);
					break;
				case'len':
					$("#editorChr").val(e.target.result);
					break;
			}
		}
    };
    reader.onerror = function () {
        alert("Echec de chargement du fichier");
        //dropArea.style.backgroundImage = "invalid 1s ease forwards";
    }
}
///////////////////////CREATION DU GRAPHIQUE//////////////////////////////////////

let selectedOrigin = "Velut";   // l'origine actuellement séléctionné dont le seuil sera modifié si modification il y a.
let selectedChromosome = 0;     //index du chromosome séléctionné.
let WIDTH = 0;                  //Width de la div qui contiendras le graph, pourquoi global ? Pourquoi pas ?
let HEIGHT = 0;

/**
 * C'est ici qu'on va créé tous ce dont on a besoin pour notre graphique. On séléctionne les div déjà créée dans index.html et on append par dessus en ajoutant attribut style et eventListenier (.on() sous d3).
 * D3 renvoie l'objet séléctionné ou modifié après chaque fonction ce qui donne la syntaxe particulière :
 * d3.select("#madiv").attr("class","une_class") qui est équivalent à : document.getElementById("madiv").classList.add("une_class")
 * @param data array nos données parsé. voir parse.js.
 */

function graphSetup(data){

    let ancestorsNameColorBackup = JSON.parse(JSON.stringify(ancestorsNameColor));

    //Ici on va récupérer les dimensions de notre container.

    let visu = document.getElementById('graph');

    let style = getComputedStyle(visu);

    let marginLeft = parseInt(style.marginLeft);
    let marginRight = parseInt(style.marginRight);
    let marginTop = parseInt(style.marginTop);
    let marginBottom = parseInt(style.marginBottom);

    WIDTH = visu.clientWidth - marginLeft - marginRight;
    HEIGHT = visu.clientHeight - marginTop - marginBottom;


    //création de notre svg qui sera notre container pour notre graphique

    let svg = d3.select("#graph").append("svg")
        .attr("width", (WIDTH + marginLeft) + marginRight)
        .attr("height", HEIGHT + marginTop + marginBottom)
        .append("g")
        .attr("transform", "translate(" + marginLeft + "," + marginTop + ")");


    //création d'un clip path, tous tracés hors de cet élement ne sera pas affichée (résout le problème des courbes dépassant les axes lors du zoom)

    svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", WIDTH )
        .attr("height", HEIGHT )
        .attr("x", 0)
        .attr("y", 0);

    svg.append('g')
        .attr("id","graphlimit")
        .attr("clip-path", "url(#clip)");


    //mise en place des axes et du zoom.

    //y

    //ici on crée une échelle, domaine de définition + taille à l'écran.
    let y = d3.scaleLinear()
        .range([HEIGHT, 0])     //la taille à l'écran.
        .domain([0,1]);         //domaine de définition, comme en math.

    //ici on crée un axe (axisLeft(), parce que ce sera notre ordonné et à gauche.) et on lui donne notre échelle crée plus haut (scale()).
    let yAxis = d3.axisLeft()
        .scale(y);

    //x

    let x = d3.scaleLinear()
        .domain([0,d3.max(data[selectedChromosome].values[0].values, function (d) {
            return d.avr;
        })])
        .range([0, WIDTH]);

    let xAxis = d3.axisBottom()
        .scale(x);

    //On place nos axes dans notre svg

    let axisG = svg.append("g")
        .attr("id", "xaxis")
        .attr("transform", "translate(0," + HEIGHT + ")")
        .call(xAxis)
        .style("color", "white")
        .attr("y", 6)
        .attr("dy", ".71em");


    svg.append("g")
        .attr("id", "yaxis")
        .call(yAxis)
        .style("color", "white")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .text("Valeur de l'origine");

    //ici on va créer le zoom. x notre échelle en place,1) x2 une copie sur laquelle on peut zoomer,2) quand un zoom a lieux,3) on copie x2 dans x,4)On re-échelonne xAxis (pour prendre en compte notre nouveaux df),5)On re-call xAxis sur notre élement axe (axisG),6) on refresh le graphique pour actualiser la position des données sur celui ci.

    let x2 = x.copy();                         //1

    let zoom = d3.zoom()
        .scaleExtent([1, 10])               //échelle de zoom
        .on("zoom", zoomed);                   //2

    d3.select("svg")
        .call(zoom);                           //on place notre zoom sur notre svg

    function zoomed() {
        x = d3.event.transform.rescaleX(x2);   //3
        xAxis.scale(x);                        //4
        axisG.call(d3.axisBottom(x));          //5
        tracerCourbe(selectedChromosome,data,lineGen,svg,ancestorsNameColor); //6 à chaque zoom on redessine nos courbes.
    }

    //déclaration de notre générateur de courbe

    let lineGen = d3.line()
        .x(function(d) {
            return x(d.avr);
        })
        .y(function(d) {
            return y(d.valeur);
        });/*.curve(d3.curveBasis); Interpolation, pour avoir des courbes plus lisse mais fausse la lecture à l'oeil.*/


    //Création du selecteur de chromosome (dropdown) et du resetColor

    let container = d3.select("#floorContainer").append("div")
        .attr("id","top_part");

    //Chromosome selector

    container.append("select")
        .attr("id","chromosomeSelector")
        .on("change",function(){
            selectedChromosome = document.getElementById("chromosomeSelector").value;
            tracerCourbe(selectedChromosome,data,lineGen,svg,ancestorsNameColor,ancestorsNameColor);
        });

    //ResetColor button

    container.append("input")
        .attr("type","button")
        .attr("value","reset colors")
        .style("padding","5px")
        .style("background","#ccc")
        .style("cursor", "pointer")
        .style("border-radius","5px")
        .style("border","1px solid #ccc")
        .on("mouseover",function(){
            this.style.backgroundColor = "#dbdbdb";
        })
        .on("mouseout",function(){
            this.style.backgroundColor = "#ccc";
        })
        .on("mousedown",function(){
            this.style.backgroundColor = "#aaa";
        })
        .on("mouseup",function(){
            this.style.backgroundColor = "#dbdbdb";
        })
        .on("click",function(){
            //reset color in my array
            ancestorsNameColor = JSON.parse(JSON.stringify(ancestorsNameColorBackup));

            //apply new array to input's values
            let colorsInputs = document.getElementsByClassName("color");
            for(let color of colorsInputs) {
                let ancestorsId = color.parentNode.lastChild.id;
                color.value = ancestorsNameColor[ancestorsId][1];
            }

            //refresh graph and ideogram
            mosaique(floorValues,data);
            tracerCourbe(selectedChromosome,data,lineGen,svg,ancestorsNameColor,ancestorsNameColor);
        });


    data.forEach(function(current_data,i){ //impossible d'utiliser .data() .enter() ici pour des raisons obscure.

        d3.select("#chromosomeSelector")
            .append("option")
            .text(current_data.key)
            .attr("value", i);
    });


    //Création d'une légende pour chaque origine (ainsi que des inputs : seuil, affichage etc)

    let legend = d3.select("#floorContainer").append("div").attr("id","legend").selectAll('g')
        .data(data[selectedChromosome].values)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .style("margin-bottom",""+((HEIGHT/ancestorsNameColor.length)/2)+"px");

    legend.append('input')
        .attr("class","displayedCurve")
        .attr("type","checkbox")
        .attr("checked","")
        .attr("name",function(d){
            return d.key;
        });

    curveOpacitySetup();

    legend.append('input')
        .attr("class","color")
        .attr("type","color")
        .attr("value",function(d){
            return ancestorsNameColor[d.key][1];
        })
        .on("change",function(){
            let ancestorsId = this.parentNode.lastChild.id;
            ancestorsNameColor[ancestorsId][1] = this.value;
            mosaique(floorValues,data);
            tracerCourbe(selectedChromosome,data,lineGen,svg,ancestorsNameColor);
        });


    legend.append('text')
        .style("width","30%")
        .text(function(d) {
            return ancestorsNameColor[d.key][0];
        });

    legend.append('input')
        .attr("class","floor")
        .attr("type","number")
        .attr("step","0.001")
        .attr("max","1.20")
        .attr("min","0.1")
        .attr("value",1/haplotype)
        .attr("id", function(d){
            return d.key;
        })
        .on("mousedown",function(){
            selectedOrigin = ancestorsNameColor[this.id][0];
        })
        .on("change",function(){
            //x = (y-4) * [1 - (z/1.20)]
            origine = getKeyByValue(ancestorsNameColor,selectedOrigin);
            floorValues[origine] = parseFloat(this.value);
            let z = (yHeight-4) * (1 - (this.value/1)); // mouse position == mouse[1]
            let d = "M" + z + "," + WIDTH;
            d += " " + z + "," + 0;
            floorPositions[origine] = d;
            globalUpdate(floorValues,selectedChromosome,floorPositions,data);
        });

    document.getElementsByClassName("legend")[0].classList.add("clicked"); //ajout de la class clicked au premier node de la classe legend.

    legendSetup(); //Ajout de nos eventListener sur les légendes les checkbox, les seuils etc..

    //Tout est prêt pour tracer nos courbes.

    tracerCourbe(selectedChromosome,data,lineGen,svg,ancestorsNameColor);

    //A partir d'ici c'est l'ajout des tooltips, des seuils et de leurs intéractions

    let mouseG = svg.append("g")
        .attr("class", "mouse-over-effects");

    mouseG.append("path") // ligne vertical noir.
        .attr("class", "mouse-line")
        .style("stroke", "white")
        .style("stroke-width", "1px")
        .style("opacity", "0")
        .style("transform", "rotate(90deg) translate(0,-"+ WIDTH + "px)");

    mouseG.append("text")
        .style("stroke","white")
        .style("fill","white")
        .attr("class","y-value");


    let yHeight = document.getElementById("yaxis").firstChild.getBoundingClientRect().height; //retrouver la taille en px du df de y
    let origine = getKeyByValue(ancestorsNameColor,selectedOrigin); //getKeyByValue(ancestorsNameColor,"Velut") retourne "V"
    let floorPositions = arraySetup(haplotype); // crée le dico qui contiendra les positions pour les seuils fixe (ligne en pointillé)
    let floorValues = arraySetup(haplotype); // crée le même dico mais avec les valeurs des seuils (0.5,0.25,...)
    floorPositionsSetup(floorPositions,mouseG,WIDTH,ancestorsNameColor,yHeight); // crée les lignes en pointillé (ainsi que le conteneur) selon le dico crée au dessus.


    mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
        .attr('width', WIDTH) // can't catch mouse events on a g element
        .attr('height', yHeight-4)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseout', function() { // on mouse out hide line
            d3.select(".mouse-line")
                .style("opacity", "0");
            d3.select(".y-value")
                .style("opacity", "0");
        })
        .on('mouseover', function() { // on mouse in show line
            d3.select(".mouse-line")
                .style("opacity", "1");
            d3.select(".y-value")
                .style("opacity", "1");
        })
        .on('mousemove', function() { // mouse moving over canvas
            let mouse = d3.mouse(this);
            d3.select(".mouse-line")
                .attr("d", function() {
                    let d = "M" + mouse[1] + "," + WIDTH;
                    d += " " + mouse[1] + "," + 0;
                    return d;
                });
            d3.select(".y-value")
                .attr("transform",function() {
                    return "translate(" + 10 + "," + (mouse[1] - 10) + ")";
                })
                .text((1-(mouse[1]/(yHeight-4))).toFixed(3)); //afficher au dessus de la ligne du tooltip la valeur de y
        })
        .on("click", function () {
            let mouse = d3.mouse(this);
            origine = getKeyByValue(ancestorsNameColor,selectedOrigin);
            //1.20 * [1 - (x/(y-4))]
            floorValues[origine] = parseFloat((1-(mouse[1]/(yHeight-4))).toFixed(3)); //Ajout de la valeur du seuil à notre FloorValue à l'origine actuellement séléctioné (selectedOrigin)

            //display fixed Floor (dashed line) :

            floorPositions[origine] = document.getElementsByClassName("mouse-line")[0].attributes.d.value; //update floorPositions with the value clicked

            globalUpdate(floorValues,selectedChromosome,floorPositions,data);
        });

    globalUpdate(floorValues,selectedChromosome,floorPositions,data);
}

function legendSetup(){
    let legend = document.getElementById("legend");
    for (let i = 0; i < legend.children.length; i++) {
        legend.children[i].addEventListener("click",function(){
            selectedOrigin = legend.children[i].innerText;
            for (let j = 0; j < legend.children.length; j++) {
                legend.children[j].classList.remove("clicked");
            }
            legend.children[i].classList.add("clicked");
        });
        legend.children[i].addEventListener("mouseover", function () {
            legend.children[i].style.backgroundColor = "#dbdbdb"
        });
        legend.children[i].addEventListener("mouseout", function () {
            legend.children[i].style.backgroundColor = "#ccc"
        });
    }

}

function globalUpdate(floorValues,selectedChromosome,floorPositions,data){
    refreshCurveOpacity();
    refreshFloor(floorValues,selectedChromosome);
    refreshfloorPositions(floorPositions,selectedChromosome);
    mosaique(floorValues,data);
}

///////////////////CREATION DES DONNEES ET SETUP POUR IDEOGRAM///////////////////////

function mosaique(floorValue){

    /*
    1 0 0 200000 #7DC7D2
    1 0 200001 400000 #7AA1D2
    1 0 400001 600000 #7AA1D2
    1 0 600001 800000 #BCE2CA
    1 0 800001 1000000 #7AA1D2
    1 0 1000001 1200000 #7AA1D2
    1 0 1200001 1400000 #7DC7D2
     */


    // préparation du tableau pour le bloc idéogramme

    let mosaique = [];

    for (let i = 0; i < stuffedData.length; i++) {
        mosaique.push([]);
    }

    let metaBlocks = [];
    let block = [];
    let chrStr = "chr";
    let originalChrNumber = "";
    let countHaplotype = 0;

    for (let i = 0; i < mosaique.length; i++) {

        originalChrNumber = stuffedData[i]["chr"].replace(/chr/g,"");

        Object.keys(floorValue).forEach(function(origineKey) {

            if(countHaplotype !== -1) {

                //Si pour la valeur de l'origine courante le seuil est dépassé, (détéction d'une dose) et qu'il reste un haplotype à alouer alors j'ajoute une ligne dans mon block
                if (stuffedData[i][origineKey] >= floorValue[origineKey] && countHaplotype < haplotype) {

                    for (let j = 0; j <= haplotype ; j++) {
                        if(stuffedData[i][origineKey] >= (floorValue[origineKey]*(j+1)) && countHaplotype < haplotype){
                            block.push([originalChrNumber, countHaplotype, parseInt(stuffedData[i]["start"]), parseInt(stuffedData[i]["end"]), ancestorsNameColor[origineKey][1],'\n']);
                            countHaplotype++;
                        }
                    }

                }

                //Si une dose est détécté mais que plus d'haplotype dispo je met tout le block en gris.
                else if (stuffedData[i][origineKey] >= floorValue[origineKey] && countHaplotype >= haplotype) {
                    block = []; //reset block
                    for (let j = 0; j < haplotype; j++) {
                        block.push([originalChrNumber, j, parseInt(stuffedData[i]["start"]), parseInt(stuffedData[i]["end"]), "#808080",'\n']);
                    }
                    countHaplotype = -1;
                }

            }

        });

        //Si à la fin de la recherche de dose il reste de la place je la remplie avec du gris.
        if(block.length < haplotype){
            let emplacementRestant = haplotype - block.length;
            for (let j = 0; j < emplacementRestant; j++) {
                block.push([originalChrNumber,countHaplotype,parseInt(stuffedData[i]["start"]),parseInt(stuffedData[i]["end"]),"#808080",'\n']);
                countHaplotype++;
            }
        }

        countHaplotype = 0;
        metaBlocks.push(block);
        block = [];
        chrStr = "chr";


    }

    let groupedBlock = groupByColor(metaBlocks);

    groupedBlock = order(groupedBlock,haplotype); //variable à récuperer pour gemo.

    metaBlocks = [];
    for (let block of groupedBlock){
        metaBlocks.push(block.flat(1));
    }


    let strMosaique = metaBlocks.join(" ").replace(/,/g,' ');
    strMosaique = strMosaique.replace(/^ +/gm,""); //variable à récuperer pour gemo.(sous forme de string) encodeURIComponent....


    console.log(strMosaique);

    ideogramConfig(strMosaique);

}


function ideogramConfig(mosaique){

    let chrNumber;
    let chr = {};

    for (let i = 0; i < stuffedData.length; i++) {
        chr[stuffedData[i]["chr"]] = 1;
    }
    chrNumber = Object.keys(chr).length;
    if(chrNumber < 11){ //Il faut 11 chromosomes minimum dans la ploidyDesc, surement en rapport avec l'organisme.
        chrNumber = 11;
    }

    console.log(chrNumber);

    let dataSet = convertStrtoRangeSet(mosaique,haplotype);
    let ploidyDesc = ploidyDescGenerator(haplotype,chrNumber);
    let ancestors = ancestorsGenerator(haplotype);

    console.log(ploidyDesc);
    console.log(ancestors);

    let configChrompaint = {
        rotatable:false,
        orientation: 'horizontal',
        organism: 'banana',
        ploidy: haplotype,
        dataDir: "/gemo/config/",
        container: "#box4",
        rangeSet: dataSet,
        chrMargin: 0,
        chrHeight: WIDTH*1.1,
        chrWidth: HEIGHT/50,
        ancestors:ancestors,
        ploidyDesc:ploidyDesc,
    };

    console.log(configChrompaint);

    const ideogramChrompaint = new Ideogram(configChrompaint);
    

}






