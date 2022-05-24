import React from 'react';
import { useEffect } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {API_address} from '../libraries/API_address';
import * as html2canvas from 'html2canvas';
//import ReactDOM from 'react-dom';
import { Routes, Route, Link, useHistory, useNavigate } from "react-router-dom";

import { Accordion, Button, Form, FloatingLabel, ListGroup, Card, Table, Spinner, ProgressBar } from 'react-bootstrap';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';

import NavBar from "../components/NavBar";

import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';
import '../css/ScheduleGen.css';

import { Cookie } from '../libraries/cookie';
import {BaseName} from "../libraries/basename";

//IMPORTANTE PARA QUE NO SE VEA MAL AL ABRIR EL TECLADO EN MÓVIL
//https://stackoverflow.com/questions/32963400/android-keyboard-shrinking-the-viewport-and-elements-using-unit-vh-in-css
var viewport = document.querySelector("meta[name=viewport]");
viewport.setAttribute("content", viewport.content + ", height=" + window.innerHeight);

//var thread = require('thread-js');







async function getHoraris(){
	

	let err_mssg = "En aquests moments sembla que no podem contactar els nostres servidors.\nTorna a intentar-ho més endevant.";

	let response = {};
	let promise = new Promise(()=>{}, ()=>{}, ()=>{});
	
	let headers = new Headers();
	headers.append("Content-Type", "application/x-www-form-urlencoded");

	headers.append("authorization", Cookie.get("jwt"));

	let resp_ok = true;

	return promise = await fetch(
		API_address + "/horari/getHorarisAssignatures", {
			method: "GET",
			//body: data,
			headers: headers,
			timeout: 5000
	})
	.then(
		resp => { //SÍ ha sido posible conectar con la API

			//Si todo es correcto (status 200-299)
			if (resp.ok){
				response = resp.json();
			}
			
			return response;
		}, 
		resp => { //NO ha sido posible conectar con la API
			window.alert(err_mssg);
			return;
		}
	)
	/*.then(
		data => {
			//console.log(data);
		}
	);*/
}



















class NumInput extends React.Component {
	constructor(props){
		super(props);
		this.min = props.min ? props.min : 0;
		this.max = props.max ? props.max : 0;
		this.value = props.defaultVal ? props.defaultVal : 0;
		this.onChangeFunc = props.onChangeFunc ? props.onChangeFunc : ()=>{};

		this.changeValue(this.value, false);
	}


	changeValue(newValue, usedByUser){
		if (newValue<this.min) newValue = this.min;
		if (newValue>this.max) newValue = this.max;

		//if ((newValue>=this.min) && (newValue<=this.max)){
			this.value = newValue;
			this.onChangeFunc(newValue, usedByUser);
			this.forceUpdate();
		//}
	}


	render(){
		let mostra_limits = this.props.mostra_limits ? this.props.mostra_limits : false;

		return(<>

			<div className="d-inline-flex align-items-center">
				{mostra_limits?
				<Button
					size="sm py-0 px-1 me-2"
					onClick={()=>{this.changeValue(this.min, true)}}
				>
					<b>{this.min}◄</b>
				</Button>
				:""}
				<Button
					size="sm ms-2"
					onClick={()=>{this.changeValue(this.value-1, true)}}
				>
					<b>−</b>
				</Button>

				<span className="mx-3">
					<h4 className="m-0 p-0"><b>{this.value}</b></h4>
				</span>

				<Button
					size="sm me-2"
					onClick={()=>{this.changeValue(this.value+1, true)}}
				>
					<b>+</b>
				</Button>
				{mostra_limits?
				<Button
					size="sm py-0 px-1 ms-2"
					onClick={()=>{this.changeValue(this.max, true)}}
				>
					<b>►{this.max}</b>
				</Button>
				:""}
			</div>



		</>);
	}
}













class InitialScreen extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
		};
		//console.log(Object.keys(this));
		
		this.mati = {inici:"8:30", fi:"14:30"};
		this.tarda = {inici:"15:00", fi:"21:00"};

		//this.max_assignatures_select = 10;
		this.max_assignatures_select = 7; //Disseny ¬¬
		this.min_assignatures_result = 1;
		this.max_assignatures_result = 7;

		this.min_horaris_result = 1;
		this.max_horaris_result = 50;

		this.horaris = [];
		this.cursos = {};
		this.assig_grups = {};

		this.preferencies = {
			max_assignatures_used_by_user: false,
			max_assignatures: 1,
			max_horaris: 10,


			hores_mortes: "min", //"min", "max", "ignore"
			hores_mortes_imp: 8,

			dies_lliures: "prin", //"prin", "mitj", "final"
			dies_lliures_imp: 8,

			prioritza_matiT_tardaF: true,
			prioritza_matiT_tardaF_imp: 8,

			comencar_tardT_aviatF_mati: true,
			comencar_tard_aviat_imp_mati: 5,
			acabar_tardT_aviatF_mati: false,
			acabar_tard_aviat_imp_mati: 2,

			comencar_tardT_aviatF_tarda: true,
			comencar_tard_aviat_imp_tarda: 5,
			acabar_tardT_aviatF_tarda: false,
			acabar_tard_aviat_imp_tarda: 2
		}

		this.total_combinations_count = 0;
		this.discarded_overlap_count = 0;
		this.discarded_not_enough_assigns = 0;

		this.combinacions_a_mostrar = [];
		this.horaris_render = <></>;
		
		this.temps_inici_render_horari = new Date();
		this.render_horari_loading_status = "";
		this.statusInterval = null;


		this.combinacions_possibles = [];
		this.need_recompute = true;
	}



	initialitzaHoraris(horaris){
		this.horaris = horaris;

		this.initialitzaCursos(horaris);

		//console.log(horaris);
		this.forceUpdate();
	}

	initialitzaCursos(horaris){
		//let count3 = 0;
		let cursos = {};
		for (let i=0; i<horaris.length; i++){

			//console.log(((horaris[i].codgrup.length==3)||(horaris[i].codgrup.length==5))?"":horaris[i].codgrup); //Para asegurarnos de que el nombre de todos los grupos sigue la misma estructura
			//if(horaris[i].codgrup.length==3){
				//console.log(horaris[i].codgrup.length+"   "+horaris[i].sigles_ud)
				//count3++;
			//}

			let curs = (!isNaN(horaris[i].codgrup[1])) ? parseInt(horaris[i].codgrup[1]) : 0;
			if (curs > 0){
				if (!cursos.hasOwnProperty(curs)){
					cursos[curs] = []
				}
				if (!cursos[curs].some(item => item.sigles_ud === horaris[i].sigles_ud)){
					cursos[curs].push({
						sigles_ud: horaris[i].sigles_ud,
						nom: horaris[i].nom,
						pool_flag: false
					});
				}
			}
		}

		//console.log(cursos);
		//console.log(Object.keys(cursos));
		//console.log(Object.keys(cursos).length);
		//for(let i=0; i<Object.keys(cursos).length; i++){
		//	console.log(cursos[Object.keys(cursos)[i]].length);
		//}

		this.cursos = cursos;
	}


	initialitzaAssigGrups(sigles_ud){
		//Mantendremos en memoria todos los AssigGrups que inicialice el usuario, pero solo tendremos en cuenta los que correspondan a asignaturas de this.pool_flagged
		if (this.assig_grups.hasOwnProperty(sigles_ud)) return;

		let fragments_horaris = this.horaris.filter(l=>{return l.sigles_ud == sigles_ud});
		//console.log(fragments_horaris);
		/*for (let i=0; i<fragments_horaris.length; i++){
			console.log({
				codgrup: fragments_horaris[i].codgrup,
				dia: fragments_horaris[i].dia,
				ordre: fragments_horaris[i].ordre,
				setmana: fragments_horaris[i].setmana,
				//tpla: fragments_horaris[i].tpla,
				durada: fragments_horaris[i].h_i+" - "+fragments_horaris[i].h_f,
			})
		}*/

		this.assig_grups[sigles_ud] = {
			//conviccio: Math.random(), //para probar que los valores no se pierden aunque des-seleccionemos la asignatura
			conviccio: false,
			grups: {}
		}
		
		let hi_ha_hores_no_comunes = false;
		let len3_len5 = [0,0];
		for (let i=0; i<fragments_horaris.length; i++){
			len3_len5[(fragments_horaris[i].codgrup.length==3) ? 0:1] += 1;
		}

		//Asumimos que siempre habrá 1 grupo comun (len3), y que la presencia de más de 1 grupo no común significará que esos serán los grupos a tener en cuenta, y que se les sumarán los fragmanetos horarios comunes a todos ellos.
		//hi_ha_hores_no_comunes = ((len3_len5[0]>=1) && (len3_len5[1]>=1));
		
		//LO RETIRO, el caso de TCAP demuestra que puede haber asignaturas sin grupos len3; por tanto, la alternativa es
		hi_ha_hores_no_comunes = (len3_len5[1]>=1);

		/*
		if (hi_ha_hores_no_comunes){
			for (let i=0; i<fragments_horaris.length; i++){
				if(fragments_horaris[i].codgrup.length==5){

					//Inicializamos el grupo si no existe
					if (!(this.assig_grups[sigles_ud].grups).hasOwnProperty(fragments_horaris[i].codgrup)){
						this.assig_grups[sigles_ud].grups[fragments_horaris[i].codgrup] = []

						//Hacemos push de todos los fragmentos comunes al grupo actual
						for (let j=0; j<fragments_horaris.length; j++){
							if(fragments_horaris[j].codgrup.length==3){
								this.assig_grups[sigles_ud].grups[fragments_horaris[i].codgrup].push(
									fragments_horaris[j]
								);
							}
						}
					}

					//Hacemos push del fragmento encontrado al grupo correspondiente
					this.assig_grups[sigles_ud].grups[fragments_horaris[i].codgrup].push(
						fragments_horaris[i]
					);
				}
			}
		}
		else{
			for (let i=0; i<fragments_horaris.length; i++){
				if(fragments_horaris[i].codgrup.length==3){

					//Inicializamos el grupo si no existe
					if (!(this.assig_grups[sigles_ud].grups).hasOwnProperty(fragments_horaris[i].codgrup)){
						this.assig_grups[sigles_ud].grups[fragments_horaris[i].codgrup] = []
					}

					//Hacemos push del fragmento encontrado al grupo correspondiente
					this.assig_grups[sigles_ud].grups[fragments_horaris[i].codgrup].push(
						fragments_horaris[i]
					);

				}
			}
		}
		*/



		for (let i=0; i<fragments_horaris.length; i++){
			if(fragments_horaris[i].codgrup.length==(hi_ha_hores_no_comunes?5:3)){
				//Inicializamos el grupo si no existe
				if (!(this.assig_grups[sigles_ud].grups).hasOwnProperty(fragments_horaris[i].codgrup)){
					this.assig_grups[sigles_ud].grups[fragments_horaris[i].codgrup] = {};
					this.assig_grups[sigles_ud].grups[fragments_horaris[i].codgrup]["fragments"] = [];
					this.assig_grups[sigles_ud].grups[fragments_horaris[i].codgrup]["conviccio"] = false;

					if (hi_ha_hores_no_comunes){
						//Hacemos push de todos los fragmentos comunes al grupo actual
						for (let j=0; j<fragments_horaris.length; j++){
							if(
								(fragments_horaris[j].codgrup.length==3)
								&&
								(fragments_horaris[j].codgrup == fragments_horaris[i].codgrup.slice(0,3))
							){
								this.assig_grups[sigles_ud].grups[fragments_horaris[i].codgrup]["fragments"].push(
									fragments_horaris[j]
								);
							}
						}
					}
				}

				//Hacemos push del fragmento encontrado al grupo correspondiente
				this.assig_grups[sigles_ud].grups[fragments_horaris[i].codgrup]["fragments"].push(
					fragments_horaris[i]
				);
			}
		}




		console.log(this.assig_grups);

	}





	padTimeString(str){
		//i.e "8:30" -> "08:30"
		return (str.length==4?"0":"")+str;
	}
	horesSolapen(i1, f1, i2, f2){
		//https://stackoverflow.com/questions/36011227/javascript-check-if-time-ranges-overlap
		//https://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap

		//return !((f1<=i2)||(f2<=i1));
		return ((f1>i2)&&(i1<f2));
	}
	fragmentsSolapen(fr1, fr2){
		//setmana==null -> les 4 setmanes
		//setmana==1 -> 1a i 3a setmanes	//setmana==2 -> 2a i 4a setmanes
		//ordre sempre serà null si setmana és null
		//ordre==null -> les 2 o 4 setmanes
		//ordre==1 -> 1a o 2a setmanes	//ordre==2 -> 3a o 4a setmanes
		//dia {1..5} == {dilluns..divendres}

		
		//console.log("===========:   "+fr1.codgrup+"   "+fr2.codgrup);
		//console.log("####### dia:   "+fr1.dia+"   "+fr2.dia);
		//Si son de días diferentes no solapan
		if (fr1.dia != fr2.dia) return false;

		//console.log("### setmana:   "+fr1.setmana+"   "+fr2.setmana);
		//Si ambos se hacen en 2 semanas específicas de 4
		if ((fr1.setmana!=null)&&(fr2.setmana!=null)){
			//Si son de semanas diferentes no solapan
			if (fr1.setmana != fr2.setmana) return false;

			//console.log("##### ordre:   "+fr1.ordre+"   "+fr2.ordre);
			//Si son del mismo par de semanas
			//Si ambos se hacen en 1 semana específica de ese par
			if ((fr1.ordre!=null)&&(fr2.ordre!=null)){
				//Si son de semanas diferentes no solapan
				if (fr1.ordre != fr2.ordre) return false;
			}
		}
		//if( ((fr1.sigles_ud == "INCO-I1O01") || (fr2.sigles_ud == "INCO-I1O01")) && ((fr1.sigles_ud == "FOPR-I1O23") || (fr2.sigles_ud == "FOPR-I1O23")) && ((fr1.dia==4)&&(fr2.dia==4)))
			//console.log("IT'S HAPPENING");

		//Si hemos llegado hasta aquí sin pasar por return, significa que los dos fragmentos suceden el mismo día de la misma semana (por lo menos 1 semana al mes como mínimo). Solo queda comparar las horas de inicio y fin de cada uno

		let i1 = this.padTimeString(fr1.h_i); let f1 = this.padTimeString(fr1.h_f);
		let i2 = this.padTimeString(fr2.h_i); let f2 = this.padTimeString(fr2.h_f);

		//Provisional hasta averiguar qué sucede con horesSolapen???
		if ((i1==i2) && (f1==f2)) return true;

		//console.log("##### inici:   "+i1+"   "+i2);
		//console.log("######## fi:   "+f1+"   "+f2);
		//this.horesSolapen("08:30", "10:30", "10:29", "12:30"); //test
		return this.horesSolapen(i1, f1, i2, f2);
		
	}
	horarisSolapen(h1, h2){
		//h1 y h2 son listas de fragmentos de horarios (cada lista es un grupo)
		//console.log("INICI HORARIS SOLAPEN"+h1.length+"   "+h2.length);
		for(let i=0; i<h1.length; i++){
			for(let j=0; j<h2.length; j++){
				if (this.fragmentsSolapen(h1[i], h2[j])) return true;
			}
		}
		return false;
	}






/*
	//Esta versión debería ser funcional, pero a JS no le gustan tantas llamadas recursivas ¬¬
	emmagatzemmaIPassaANextAssig(sigles_ud, nom_grup, grups_assig_afegits, comprovar_assigs_amb_conviccio){
		//if (nom_grup != null) this.total_combinations_count++;
		//if (grups_assig_afegits.length > 0) this.total_combinations_count++;
		this.total_combinations_count++;

		//Comprobamos que el nuevo grupo que vamos a añadir sea compatible con todos los demás que habíamos añadido anteriormente
		let compatibles = true;
		if (nom_grup != null){
			for (let i=0; (compatibles && (i<grups_assig_afegits.length)); i++){
				//compatibles = !this.horarisSolapen(
				//	this.assig_grups[sigles_ud].grups[nom_grup].fragments, //nou grup
				//	this.assig_grups[grups_assig_afegits[i].sigles_ud].grups[grups_assig_afegits[i].nom_grup].fragments //grup(s) que ja haviem afegit
				//	);
			}
		}
		//Si el grupo resulta ser compatible (no se solapa), lo añadimos a la lista de esta rama de recursión, y continuamos
		let new_grups_assig_afegits = [...grups_assig_afegits];
		if (compatibles){
			new_grups_assig_afegits.push({
				sigles_ud: sigles_ud,
				nom_grup: nom_grup
			});
		}
		else{this.discarded_overlap_count++;}
		this.creaCombinacionsPossibles(new_grups_assig_afegits, comprovar_assigs_amb_conviccio);
	}
*/


/*
emmagatzemmaIPassaANextAssig(sigles_ud, nom_grup, grups_assig_afegits, comprovar_assigs_amb_conviccio){
	//if (nom_grup != null) this.total_combinations_count++;
	//if (grups_assig_afegits.length > 0) this.total_combinations_count++;
	this.total_combinations_count++;

	//Comprobamos que el nuevo grupo que vamos a añadir sea compatible con todos los demás que habíamos añadido anteriormente
	let solapen = false;
	if (nom_grup != null){
		for (let i=0; ((!solapen) && (i<grups_assig_afegits.length)); i++){
			//compatibles = !this.horarisSolapen(
			//	this.assig_grups[sigles_ud].grups[nom_grup].fragments, //nou grup
			//	this.assig_grups[grups_assig_afegits[i].sigles_ud].grups[grups_assig_afegits[i].nom_grup].fragments //grup(s) que ja haviem afegit
			//	);


			//ESTO NO HA SERVIDO DE NADA :)))))))
			
			let h1 = this.assig_grups[sigles_ud].grups[nom_grup].fragments;
			let h2 = this.assig_grups[grups_assig_afegits[i].sigles_ud].grups[grups_assig_afegits[i].nom_grup].fragments;


			for(let x=0; x<h1.length; x++){
				for(let y=0; y<h2.length; y++){

					let fr1 = h1[x];
					let fr2 = h2[y];

					if (fr1.dia != fr2.dia) solapen = false;
					else{
						if ((fr1.setmana!=null)&&(fr2.setmana!=null)){
							//Si son de semanas diferentes no solapan
							if (fr1.setmana != fr2.setmana) solapen = false;
							else{
								if ((fr1.ordre!=null)&&(fr2.ordre!=null)){
									//Si son de semanas diferentes no solapan
									if (fr1.ordre != fr2.ordre) solapen = false;
								}
							}
						}
						else{
							let i1 = ((fr1.h_i).length==4?"0":"")+fr1.h_i
							let f1 = ((fr1.h_f).length==4?"0":"")+fr1.h_f

							let i2 = ((fr2.h_i).length==4?"0":"")+fr2.h_i
							let f2 = ((fr2.h_f).length==4?"0":"")+fr2.h_f
					
							solapen = ((f1>i2)&&(i1<f2));
						}
					}
				}
			}


		}
	}
	//Si el grupo resulta ser compatible (no se solapa), lo añadimos a la lista de esta rama de recursión, y continuamos
	let new_grups_assig_afegits = [...grups_assig_afegits];
	//let new_grups_assig_afegits = [];
	//for (let i=0; i<grups_assig_afegits.length; i++){
	//	new_grups_assig_afegits.push(grups_assig_afegits[i]);
	//}

	if (!solapen){
		new_grups_assig_afegits.push({
			sigles_ud: sigles_ud,
			nom_grup: nom_grup
		});
	}
	else{this.discarded_overlap_count++;}
	this.creaCombinacionsPossibles(new_grups_assig_afegits, comprovar_assigs_amb_conviccio);
}
*/




	emmagatzemmaIPassaANextAssig(sigles_ud, nom_grup, grups_assig_afegits, comprovar_assigs_amb_conviccio){
		this.total_combinations_count++;
		
		let new_grups_assig_afegits = [...grups_assig_afegits];
		new_grups_assig_afegits.push({
			sigles_ud: sigles_ud,
			nom_grup: nom_grup
		});

		this.creaCombinacionsPossibles(new_grups_assig_afegits, comprovar_assigs_amb_conviccio);
	}


	exploraGrups(sigles_ud, grups_assig_afegits, comprovar_assigs_amb_conviccio){
		
		let grups = this.assig_grups[sigles_ud].grups;
		let i=0;
		let T_find_preferent_F_no_hi_ha_preferent = true;
		while (i < Object.keys(grups).length){
			if (T_find_preferent_F_no_hi_ha_preferent){
				//Si encontramos un grupo preferente (solo puede haber 1 como máximo), continuaremos a la siguiente capa de recursión usando solo ese
				if (grups[Object.keys(grups)[i]].conviccio){

					this.emmagatzemmaIPassaANextAssig(sigles_ud, Object.keys(grups)[i], grups_assig_afegits, comprovar_assigs_amb_conviccio);

					i = Object.keys(grups).length; //Para salir del bucle
				}
				else{
					if (i == (Object.keys(grups).length-1)){
						T_find_preferent_F_no_hi_ha_preferent = false;
						i = -1; //Para volver al principio del bucle
					}
				}
			}
			//Si no hay un grupo preferente, se continuará a la siguiente capa de recursión añadiendo cada grupo disponible a su propia rama (si es compatible con los que ya haya añadidos)
			else{
				this.emmagatzemmaIPassaANextAssig(sigles_ud, Object.keys(grups)[i], grups_assig_afegits, comprovar_assigs_amb_conviccio);
			}
			i++;
		}
		//Si la asignatura no es preferente, también se explorará un grupo null, para simbolizar la posibilidad de dejar sin añadir esta asignatura (pero de cara al código la añadimos así para que no vuelva a repetirse)
		if (!this.assig_grups[sigles_ud].conviccio){
			this.emmagatzemmaIPassaANextAssig(sigles_ud, null, grups_assig_afegits, comprovar_assigs_amb_conviccio);
		}
	}


	creaCombinacionsPossibles(grups_assig_afegits, comprovar_assigs_amb_conviccio){
		//grups_assig_afegits es una lista de objetos {sigles_ud, nom_grup}

		//Descartamos las asignaturas añadidas con un grupo null que simboliza que no han sido añadidas
		//console.log(grups_assig_afegits.length);
		let assigs_amb_grup_no_null = grups_assig_afegits.filter(a_g => a_g.nom_grup != null);
		//let assigs_amb_grup_no_null = [];
		//for (let i=0; i<grups_assig_afegits.length; i++){
		//	if (grups_assig_afegits[i].nom_grup != null) assigs_amb_grup_no_null.push(grups_assig_afegits[i]);
		//}




		//Si hemos llegado a la cantidad máxima (objetivo) de asignaturas que añadir
		if(assigs_amb_grup_no_null.length == this.preferencies.max_assignatures){
			//Acabamos la rama guardando antes el resultado
			this.combinacions_possibles.push(assigs_amb_grup_no_null);
			return;
		}
		if (grups_assig_afegits.length > 0) this.discarded_not_enough_assigns++;

		//Si no hay más asignaturas posibles que añadir
		if (grups_assig_afegits.length == this.pool_flagged.length){
			//Acabamos la rama sin guardar el resultado (porque no son suficientes asignaturas)
			return;
		}
		


		//Si la recursión no ha llegado a su fin, continuamos con el siguiente nivel, buscando la siguiente asignatura que añadir
		if (comprovar_assigs_amb_conviccio){
			let found_conviccio = false;
			let i = 0;
			while((!found_conviccio) && i<this.pool_flagged.length){
				//Si encontramos en el pool de asignaturas una asignatura que tiene convicción y que no habíamos marcado previamente en esta rama de recursión, conservamos su índice para proceder a explorarla
				if (this.assig_grups[this.pool_flagged[i].sigles_ud].conviccio && (!grups_assig_afegits.some(item => item.sigles_ud === this.pool_flagged[i].sigles_ud)) )
					found_conviccio = true;

				if(!found_conviccio) i++;
			}
			//Si no hemos encontrado ninguna nueva asignatura marcada con convicción, pasamos a recorrer las asignaturas que no la tienen en una nueva llamada a esta función
			if(!found_conviccio) this.creaCombinacionsPossibles(grups_assig_afegits, false);

			//Si sí que hemos encontrado una asignatura con convicción, pasamos a explorar sus grupos
			else this.exploraGrups(this.pool_flagged[i].sigles_ud, grups_assig_afegits, comprovar_assigs_amb_conviccio);


		}
		else{
			let found_new = false;
			let i = 0;
			while((!found_new) && i<this.pool_flagged.length){
				if (!grups_assig_afegits.some(item => item.sigles_ud === this.pool_flagged[i].sigles_ud)){
					this.exploraGrups(this.pool_flagged[i].sigles_ud, grups_assig_afegits, comprovar_assigs_amb_conviccio);
					found_new = true;
				}
				i++;
			}
		}
	}












	creaCombinacionsPossiblesIteratiu(){

		//let pool_flagged = [];

		//setTimeout(()=>{

		let pool_flagged = [...this.pool_flagged];
		//Con esto, los que tengan conviccio quedan al final del todo, por el mismo orden en que se encontrasen
		pool_flagged = pool_flagged.sort((a,b)=>{
			//return (  ( (this.assig_grups[a.sigles_ud].conviccio) ? -1 : ((this.assig_grups[b.sigles_ud].conviccio) ? 1 : 0) )  );
			//Con esto, los que tengan conviccio quedan atrás del todo, pero su orden original ha quedado invertido
			return (  ( (this.assig_grups[a.sigles_ud].conviccio) ? 1 : ((this.assig_grups[b.sigles_ud].conviccio) ? -1 : 0) )  );
		});
		let conviccio_count = 0;
		for (let i=pool_flagged.length-1; i >= 0; i--){
			if (this.assig_grups[pool_flagged[i].sigles_ud].conviccio) conviccio_count++;
			//if (!this.assig_grups[pool_flagged[i].sigles_ud].conviccio) i = 0;
			else i = 0;
		}
		//Con esto, los que tengan conviccio quedan al principio del todo, y su orden original queda restablecido
		for (let i=0; i < conviccio_count; i++){pool_flagged.push(pool_flagged.pop());}


		console.log(conviccio_count);
		
		//},139);

		//this.combinacions_possibles
		let combinacions_possibles = [[]]; //Auxiliar


		let iteracions_status = 0;
		for (let i=0; i < pool_flagged.length; i++){

			let grups = {};

			setTimeout(()=>{

			//Comprobamos los grupos de la asignatura. Si hay alguno con convicción, solo usaremos ese
			grups = this.assig_grups[pool_flagged[i].sigles_ud].grups;
			Object.keys(grups).some(key => {
				if (grups[key].conviccio){
					let grups_key = grups[key];
					grups = {};
					grups[key] = grups_key;
					return true;
				}
				return false;
			});
			console.log(grups);


				this.render_horari_loading_status = "Computant les possibles combinacions per a "
				+this.preferencies.max_assignatures
				+" assignatur"+((this.preferencies.max_assignatures==1) ? "a":"es")+"..."
				+"<br/><br/>"+
				"Explorant la "+(i+1)+"ª assignatura (de "+pool_flagged.length+") seleccionada: <br/>"+pool_flagged[i].sigles_ud+
				" ("+Object.keys(grups).length+" grup"+((Object.keys(grups).length==1)?"":"s")+")"
				+"<br/>"
				//+"<ProgressBar animated now={"+(100*i/pool_flagged.length)+"} label={"+i+"+'/'+"+pool_flagged.length+"} />"
				+"<div class='progress' style='box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19);' >"
				+"	<div class='progress-bar progress-bar-animated progress-bar-striped' role='progressbar' style='width: "+(100*i/pool_flagged.length)+"%' >"+i+"/"+pool_flagged.length+"</div>"
				+"</div>"
				;
				this.updateLoadingStatus();

			},140+i*2);

			setTimeout(()=>{

			let combinacions_possibles_length = combinacions_possibles.length;

			//PRUNING
			//Ejecutamos el bucle hacia atrás para poder eliminar lo antes posible las combinaciones que no van a llegar a la cantidad deseada de asignaturas sin temer por que cambien los índices (j) de la lista.
			for (let j = combinacions_possibles_length-1; j >= 0; j--){
			//for (let j=0;   j < combinacions_possibles_length; j++){

				//PRUNING
				//Si la cantidad de asignaturas que todavía se pueden añadir no conseguirían ni tan solo en su totalidad hacer que la combinación actual llegase a la cantidad de asignaturas elegida por el usuario, eliminamos la combinación
				if ((combinacions_possibles[j].length+(pool_flagged.length-i)) < this.preferencies.max_assignatures){
					combinacions_possibles.splice(j,1);
					//this.discarded_not_enough_assigns++;
				}
				else{

					//Si hay convicción, la asignatura se añadirá siempre. Si no la hay, se añadirá una iteración adicional en la que esta asignatura no se haya añadido

					if (!this.assig_grups[pool_flagged[i].sigles_ud].conviccio){
						//Añadimos una entrada duplicada para simular un caso en el que no se añade la asignatura
						combinacions_possibles.push([...combinacions_possibles[j]]);
					}

					//Si todavía se puede añadir alguna asignatura
					if (combinacions_possibles[j].length < this.preferencies.max_assignatures){

						

						for (let k=0; k < Object.keys(grups).length; k++){

							//PRUNING
							//Comprobar si se solapa con las actuales!!!
							let solapa = false;
							for (let l=0; ( (!solapa)&&(l < combinacions_possibles[j].length) ); l++){

								solapa = this.horarisSolapen(
									this.assig_grups[pool_flagged[i].sigles_ud].grups[Object.keys(grups)[k]].fragments, //nou grup
									this.assig_grups[combinacions_possibles[j][l].sigles_ud].grups[combinacions_possibles[j][l].nom_grup].fragments
								);

							}

							if ((combinacions_possibles[j].length+1) == this.preferencies.max_assignatures){
								if (solapa) this.discarded_overlap_count++;
							}


							if (!solapa){
								this.total_combinations_count++;

								let nova_entrada = [...combinacions_possibles[j]];
								nova_entrada.push({
									sigles_ud: pool_flagged[i].sigles_ud,
									nom_grup: Object.keys(grups)[k] //pool_flagged[i].nom_grup
								});
								if (nova_entrada.length == this.preferencies.max_assignatures)
									this.combinacions_possibles.push(nova_entrada);
								else{
									combinacions_possibles.push(nova_entrada);
									this.discarded_not_enough_assigns++;
								}
							}
							
						}
						
						
						

					}
					/*else{
						this.discarded_not_enough_assigns++;
					}*/	
				}

				//Si es la primera iteración de todas (1a iteración aplicada a combinacions_possibles = [[]] ), significará que se ha añadido por lo menos 1 entrada, y que ya podemos eliminar la entrada auxiliar que pusimos al principio
				
				//if ((i==0) && (j==0) /*&& (combinacions_possibles_length==1) && (combinacions_possibles[0]==[])*/ ){
				if ( (i==0) && (j == (combinacions_possibles_length-1)) ){
					combinacions_possibles.pop();
				}

				
				//Nope, no puede hacerse así; añade demasiado delay
				//iteracions_status++;
				//setTimeout(()=>{this.updateLoadingStatus()}, iteracions_status * 10);
				//this.updateLoadingStatus();
			}


			},140+i*2+1);
		}
		//this.total_combinations_count = combinacions_possibles.length; //Puesto aquí no sirve xd
		//console.log(this.total_combinations_count);

		//},135);
	}








































	eliminaSolapaments(){
		this.combinacions_possibles = this.combinacions_possibles.filter(combinacio => {
			let solapa = false;
			for (let i=0; i<combinacio.length; i++){
				for (let j=i+1; j<combinacio.length; j++){
					if (i != j){
						solapa = this.horarisSolapen(
							this.assig_grups[combinacio[i].sigles_ud].grups[combinacio[i].nom_grup].fragments,
							this.assig_grups[combinacio[j].sigles_ud].grups[combinacio[j].nom_grup].fragments,
						);

						if (solapa){
							this.discarded_overlap_count++;
							return !solapa;
						}
					}
				}
			}
			return !solapa;
		})
	}


	posaPuntsAlsMilers(x){
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	}


	






	computaPuntuacio(estadistica, max){
		let puntuacio = 0;

		//Normalizamos las puntuaciones en base a las máximas:
		let norm = {};
		for (let i=0; i<Object.keys(max).length; i++){
			if (max[Object.keys(max)[i]] == 0)
				norm[Object.keys(max)[i]] = 0;
			else
				norm[Object.keys(max)[i]] = estadistica[Object.keys(max)[i]] / max[Object.keys(max)[i]];
		}

		//Hacemos el tratamiento de las puntuaciones normalizadas según las preferencias del usuario.

		puntuacio += 

			+ (  this.preferencies.hores_mortes_imp * ( 
				(this.preferencies.hores_mortes == "min") ?
					(1-norm.hores_mortes)
				:
					((this.preferencies.hores_mortes == "max") ?
						norm.hores_mortes
					:
						0
					)
			)  )
			


			+ ( this.preferencies.dies_lliures_imp * 
					(()=>{
						switch(this.preferencies.dies_lliures){
							case("prin"):
								return norm.dies_lliures_principi_setmana;
							case("mitj"):
								return norm.dies_lliures_enmig_setmana;
							case("final"):
								return norm.dies_lliures_final_setmana;
							case("quan_s"):
								return norm.dies_lliures_total;
							case("prop_cap"):
								return (
									estadistica.dies_lliures_principi_setmana
										+
									estadistica.dies_lliures_final_setmana
								)
								/
								(
									max.dies_lliures_principi_setmana
										+
									max.dies_lliures_final_setmana
								);
						}
					})()
				
				 )



			+ ( this.preferencies.prioritza_matiT_tardaF_imp * (
				(this.preferencies.prioritza_matiT_tardaF == true) ? 
					//norm.hores_classe_mati
					estadistica.hores_classe_mati
				:
					//norm.hores_classe_tarda
					estadistica.hores_classe_tarda
			)/(estadistica.hores_classe_mati+estadistica.hores_classe_tarda) )




			+ ( this.preferencies.comencar_tard_aviat_imp_mati * (
				(this.preferencies.comencar_tardT_aviatF_mati == true) ?
					norm.hores_lliures_aviat_mati
				:
					(1-norm.hores_lliures_aviat_mati)
			) )

			+ ( this.preferencies.acabar_tard_aviat_imp_mati * (
				(this.preferencies.acabar_tardT_aviatF_mati == true) ?
					(1-norm.hores_lliures_tard_mati)
				:
					norm.hores_lliures_tard_mati
			) )




			+ ( this.preferencies.comencar_tard_aviat_imp_tarda * (
				(this.preferencies.comencar_tardT_aviatF_tarda == true) ?
					norm.hores_lliures_aviat_tarda
				:
					(1-norm.hores_lliures_aviat_tarda)
			) )


			+ ( this.preferencies.acabar_tard_aviat_imp_tarda * (
				(this.preferencies.acabar_tardT_aviatF_tarda == true) ?
					(1-norm.hores_lliures_tard_tarda)
				:
					norm.hores_lliures_tard_tarda
			) )

		;




		return puntuacio;
	}


	

	recopilaEstadistiquesIOrdena(){

		//console.log(this.combinacions_possibles.length);

		let plantilla = {

			hores_mortes: 0,

			dies_lliures_principi_setmana: 0,
			dies_lliures_enmig_setmana: 0,
			dies_lliures_final_setmana: 0,
			dies_lliures_total: 0,

			hores_classe_mati: 0,
			hores_classe_tarda: 0,
			
			hores_lliures_aviat_mati: 0,
			hores_lliures_tard_mati: 0,

			hores_lliures_aviat_tarda: 0,
			hores_lliures_tard_tarda: 0

			//FINAL: 0
		}
		let max_estadistiques = {...plantilla};

		let mati = this.mati;
		let tarda = this.tarda;
		let hores = this.makeHoresList(mati, tarda, mati.inici, tarda.fi);
		//this.hourStringToValue(hora_fi)-this.hourStringToValue(hora_i)

		for (let i=0; i<this.combinacions_possibles.length; i++){
			this.combinacions_possibles[i]["puntuacions"] = {...plantilla};
			//Aquí evaluaremos en una primera pasada y con valores brutos las puntuaciones pertinentes

			//Creamos una lista de fragmentos para facilitar el recorrido
			let fragments = [];
			for (let a=0; a<this.combinacions_possibles[i].length; a++){
				(this.assig_grups[this.combinacions_possibles[i][a].sigles_ud].grups[this.combinacions_possibles[i][a].nom_grup].fragments).forEach(frag => {
						let f = {...frag};
						f["nom_grup"] = this.combinacions_possibles[i][a].nom_grup;
						fragments.push(f);
					//}
				});
			}

			//let i_dies = [...Array(5).keys()]
			for (let setmana=1; setmana<3; setmana++){
			for (let ordre=1; ordre<3; ordre++){

				//Inicializamos un tramo diario
				let tram_diari = {d_i: 1, /*d_f: 1,*/ classeTlliureF: false};

				for (let dia=1; dia<=6; dia++){

					let es_dia_lliure = false;

					let i_hora=0;
					//Inicializamos un tramo horario
					let tram_horari = {h_i: i_hora, /*h_f: i_hora,*/ classeTlliureF: false};

					//Recorremos las horas del día en bucle
					while ( (i_hora<hores.length) && (dia<6) ){

						//Buscamos un fragmento que corresponda al tramo actual (solo debería haber uno porque ya habíamos eliminado los solapamientos)
						let frag = fragments.find(f =>
							((f.setmana == null) || (f.setmana == setmana)) && ((f.ordre == null) || (f.ordre == ordre)) && (f.dia == dia) && (f.h_i == hores[i_hora])
						);

						//Inicializamos el primer tramo horario en caso de ser primera hora
						if ((i_hora==0) && frag) tram_horari.classeTlliureF = true;

						//Comprobamos si ha de empezar un tramo distino o si seguimos con el actual (clase vs libre)
						let nou_tram = ( ((i_hora>0) && (i_hora<(hores.length-1))) && ((tram_horari.classeTlliureF==true) && (!frag)) || ((tram_horari.classeTlliureF==false) && (frag)) );

						//Si comienza un nuevo tramo, o llegamos al final del día (final del último tramo posible)
						if ( nou_tram || (i_hora == (hores.length-1)) ) {
							//Recolectamos las estadísticas correspondientes al último tramo explorado.

							//let duracio_total = this.hourStringToValue(hores[i_hora])-this.hourStringToValue(hores[tram_horari.h_i]);

							//COMPUTAMOS LAS ESTADÍSTICAS CORRESPONDIENTES



							//Horas de clase
							if (tram_horari.classeTlliureF){


								//Si el tramo empieza en algún momento de la mañana (salvo el final)
								if (tram_horari.h_i < hores.indexOf(mati.fi)){
									this.combinacions_possibles[i]["puntuacions"]["hores_classe_mati"] += 
										this.hourStringToValue(hores[Math.min(i_hora, hores.indexOf(mati.fi))])
										-
										this.hourStringToValue(hores[tram_horari.h_i])
									;
								}


								//Si el tramo empieza en algún momento de la tarde o antes (salvo el final), y acaba en algún momento de la tarde (salvo el inicio)
								if ((tram_horari.h_i < (hores.length-1)) && (i_hora > hores.indexOf(tarda.inici))){
									this.combinacions_possibles[i]["puntuacions"]["hores_classe_tarda"] += 
										this.hourStringToValue(hores[i_hora])
										-
										this.hourStringToValue(tarda.inici)
									;
								}

							}






							//Horas libres
							else{//if (!tram_horari.classeTlliureF){

								//Si el tramo empieza al principio de la mañana
								if (tram_horari.h_i == 0){

									//Si el tramo termina al final del día -> Día libre
									if (i_hora == hores.length-1){
										es_dia_lliure = true;
									}

									//Horas libres al principio de la mañana
									if (!es_dia_lliure)
									this.combinacions_possibles[i]["puntuacions"]["hores_lliures_aviat_mati"] += 
										this.hourStringToValue(hores[Math.min(i_hora, hores.indexOf(mati.fi))])
										-
										this.hourStringToValue(hores[tram_horari.h_i])
									;
								}

								//Si el tramo empieza en algún momento de la tarde o antes (salvo el final) 
								if (tram_horari.h_i < (hores.length-1)){
									
									//Si el tramo acaba en algún momento de la tarde (salvo el inicio)
									if (i_hora > hores.indexOf(tarda.inici)){
										//Horas libres al principio de la tarde
										if (!es_dia_lliure)
										this.combinacions_possibles[i]["puntuacions"]["hores_lliures_aviat_tarda"] += 
										this.hourStringToValue(hores[i_hora])
										-
										this.hourStringToValue(tarda.inici)
										;
									}

									//Si el tramo acaba al final de la tarde
									if (i_hora == (hores.length-1)){
										//Horas libres al final de la tarde
										if (!es_dia_lliure)
										this.combinacions_possibles[i]["puntuacions"]["hores_lliures_tard_tarda"] += 
										this.hourStringToValue(hores[i_hora])
										-
										this.hourStringToValue(hores[Math.max(hores.indexOf(tarda.inici), tram_horari.h_i)])
									;
									}

									
								}




								//Si el tramo empieza en algún momento de la mañana (salvo el final) y termina al final de la mañana o más allá
								if ((tram_horari.h_i < hores.indexOf(mati.fi)) && (i_hora >= hores.indexOf(mati.fi))){
									//Horas libres al final de la mañana
									if (!es_dia_lliure)
									this.combinacions_possibles[i]["puntuacions"]["hores_lliures_tard_mati"] += 
										this.hourStringToValue(mati.fi)
										-
										this.hourStringToValue(hores[tram_horari.h_i])
									;
								}





								//Si el tramo empieza pasado el principio de la mañana, y acaba antes que el último tramo posible -> Horas muertas
								if ((tram_horari.h_i > 0) && (i_hora < (hores.length-1))){

									//Horas muertas en cualquier punto del día (incluye la hora de la comida (14:30-15:00))
									this.combinacions_possibles[i]["puntuacions"]["hores_mortes"] += 
										this.hourStringToValue(hores[i_hora])
										-
										this.hourStringToValue(hores[tram_horari.h_i])
									;
								}



							}




							tram_horari = {h_i: i_hora, /*h_f: i_hora,*/ classeTlliureF: !tram_horari.classeTlliureF};
						}
						//else {tram_horari.h_f = i_hora;}
						


						if (frag){
							i_hora += hores.indexOf(frag.h_f)-hores.indexOf(frag.h_i);
						}
						else{
							i_hora++;
						}
					}


					//Inicializamos el primer tramo diario en caso de ser primer día
					if ((dia==1) && (!es_dia_lliure)) tram_diari.classeTlliureF = true;

					//Comprobamos si ha de empezar un tramo distino o si seguimos con el actual (clase vs libre)
					let nou_tram = ( ((dia>1) && (dia<6)) && ((tram_diari.classeTlliureF==true) && (es_dia_lliure)) || ((tram_diari.classeTlliureF==false) && (!es_dia_lliure)) );

					if (es_dia_lliure && (dia < 6)){
						this.combinacions_possibles[i]["puntuacions"]["dies_lliures_total"] += 1;
					}

					//Si comienza un nuevo tramo, o llegamos al final de la semana
					if ( nou_tram || (dia == 6) ){
						//Recolectamos las estadísticas correspondientes al último tramo explorado.

						//Días libres
						if (!tram_diari.classeTlliureF){

							//let duracio = dia - tram_diari.d_i;

							//COMPUTAMOS LAS ESTADÍSTICAS CORRESPONDIENTES

							//A principios de semana (lunes-x)
							if (tram_diari.d_i == 1){
								this.combinacions_possibles[i]["puntuacions"]["dies_lliures_principi_setmana"] += dia - tram_diari.d_i;
							}

							//A finales de semana (x-viernes)
							if (dia == 6){
								this.combinacions_possibles[i]["puntuacions"]["dies_lliures_final_setmana"] += dia - tram_diari.d_i;
							}

							//A mediados de semana (martes-jueves)
							if ((dia > 2) && (dia <= 6)){
								this.combinacions_possibles[i]["puntuacions"]["dies_lliures_enmig_setmana"] += Math.min(dia,5) - Math.max(2, tram_diari.d_i);
							}
						}

						tram_diari = {d_i: dia, /*h_f: i_hora,*/ classeTlliureF: !tram_diari.classeTlliureF};
					}


				}
			}
			}


			//Actualizamos los máximos a cada iteración
			Object.keys(this.combinacions_possibles[i]["puntuacions"]).forEach(key => {
				if (this.combinacions_possibles[i]["puntuacions"][key]>max_estadistiques[key])
					max_estadistiques[key] = this.combinacions_possibles[i]["puntuacions"][key];
			})

		}

		//Ordenamos de mayor a menor puntuación
		this.combinacions_possibles = this.combinacions_possibles.sort((c1,c2)=>{
			let val_1 = this.computaPuntuacio(c1.puntuacions, max_estadistiques);
			let val_2 = this.computaPuntuacio(c2.puntuacions, max_estadistiques);

			if (val_1 < val_2) return 1;
			if (val_1 > val_2) return -1;
			return 0;
		});

		//Console.log para verificar métricas
		for(let i=0; i < Math.min(this.preferencies.max_horaris, this.combinacions_possibles.length); i++){
			console.log("\n\n\nESTADÍSTIQUES #"+(i+1)+" (puntuació "+this.computaPuntuacio(this.combinacions_possibles[i].puntuacions, max_estadistiques)+"):")
			console.log(this.combinacions_possibles[i]["puntuacions"]);
		}


	}















	updateLoadingStatus(){
		window.document.getElementById("render_horari_loading_status").innerHTML = 
		//(new Date()).toString()+"<br/>"+
		this.render_horari_loading_status;
		//console.log(new Date().toString());
	}






	generaPossiblesHoraris(){
		//let generadorWorker = new Worker("../libraries/ScheduleGen_worker.js");

		//let mati = {inici:"8:30", fi:"14:30"};
		//let tarda = {inici:"15:00", fi:"21:00"};
		
		//setTimeout(()=>{
			//this.temps_inici_render_horari = new Date();
			//this.render_horari_loading_status = "Inicialitzant...";
			//this.updateLoadingStatus();
		//},120);
		

		
		setTimeout(()=>{
			if (this.need_recompute) {
				this.render_horari_loading_status = "Computant les possibles combinacions per a "
				+this.preferencies.max_assignatures
				+" assignatur"+((this.preferencies.max_assignatures==1) ? "a":"es")+"...";
				this.updateLoadingStatus();
			}
			this.horaris_render = "";
		},125);

		//125-160?  130+index
		//setTimeout(()=>{
		

		if (this.need_recompute){
		setTimeout(()=>{
			this.combinacions_possibles = [];
			this.total_combinations_count = 0;
			this.discarded_not_enough_assigns = 0;
			this.discarded_overlap_count = 0;
		},129);

			//this.creaCombinacionsPossibles([], true);
			//this.eliminaSolapaments();

			this.creaCombinacionsPossiblesIteratiu();
		}
		this.need_recompute = false;
		
		setTimeout(()=>{
		console.log(this.combinacions_possibles);

		console.log("      Total combinacions provades:  "+(this.discarded_not_enough_assigns+this.discarded_overlap_count+this.combinacions_possibles.length));

		console.log("--------------Poques assignatures: -"+this.discarded_not_enough_assigns);
		console.log("          Combinacions resultants:  "+(this.discarded_overlap_count+this.combinacions_possibles.length));
		console.log("-----------------------Solapament: -"+this.discarded_overlap_count);
		
		console.log("Combinacions possibles resultants:  "+this.combinacions_possibles.length);
		},170);
		//},130);



		setTimeout(()=>{
			this.render_horari_loading_status = "Ordenant d'acord amb les preferencies seleccionades...";
			this.updateLoadingStatus();
		},180);
			
		setTimeout(()=>{
		this.recopilaEstadistiquesIOrdena();
		},200);

		/*
		
		//Aquí procederemos al cómputo de las puntuaciones pertinentes sobre la puntuación máxima conseguida en cada campo, y a ponderarlas unidas en una puntuación final
		let max_puntuacions = {
			hores_lliures_aviat_mati: 0,
			hores_lliures_tard_mati: 0,

			hores_lliures_aviat_tarda: 0,
			hores_lliures_tard_tarda: 0,

			hores_mortes: 0,

			dies_lliures_principi_setmana: 0,
			dies_lliures_enmig_setmana: 0,
			dies_lliures_final_setmana: 0,

			FINAL: 0
		}

		for (let i=0; i<this.combinacions_possibles; i++){
			this.combinacions_possibles[i]["puntuacions"] = {
				hores_lliures_aviat_mati: 0,
				hores_lliures_tard_mati: 0,

				hores_lliures_aviat_tarda: 0,
				hores_lliures_tard_tarda: 0,

				hores_mortes: 0,

				dies_lliures_principi_setmana: 0,
				dies_lliures_enmig_setmana: 0,
				dies_lliures_final_setmana: 0,

				FINAL: 0
			}
		}

		this.combinacions_possibles.sort((a, b) => (a.puntuacions.FINAL - b.puntuacions.FINAL));
		*/





		//setTimeout(()=>{
			//this.render_horari_loading_status = "Renderitzant taules horàries!";
			//this.updateLoadingStatus();
		//},220);

		setTimeout(()=>{
		this.combinacions_a_mostrar = this.combinacions_possibles.slice(0, this.preferencies.max_horaris);


		

		this.horaris_render = <>
			{this.combinacions_a_mostrar.length == 0 ? <>
				{"No s'ha trobat cap combinació de grups possible (sense solapaments) que mostrar per a "}{this.preferencies.max_assignatures}{" assignatur"}
				{this.preferencies.max_assignatures==1?"a":"es"}
				{"..."}
				<br/><br/>
				{"Prova a canviar la teva selecció i/o els paràmetres introduïts."}
			</>:<>

				{this.total_combinations_count==1 ? (""):("")}

				{"D'entre les "}
				{(this.total_combinations_count-this.discarded_not_enough_assigns+this.discarded_overlap_count)==1?"(només 1)":this.posaPuntsAlsMilers(this.total_combinations_count-this.discarded_not_enough_assigns+this.discarded_overlap_count)}
				{" combinacions de grups trobades per a "}{this.preferencies.max_assignatures}{" assignatur"}
				{this.preferencies.max_assignatures==1?"a":"es"}
				{", s'ha"}{this.discarded_overlap_count==1?"":"n"} 
				{" descartat "}
				{this.posaPuntsAlsMilers(this.discarded_overlap_count)}
				{" per solapament."}

				<br/><br/>
				
				{this.combinacions_possibles.length==1?
					"Només hi ha 1 combinació d'horaris possible, que és la que mostrem a continuació"
				:
					"D'entre les "+
					
					this.posaPuntsAlsMilers(this.combinacions_possibles.length)
					
					+" combinacions no descartades, mostrem les "+

					(Math.min(this.preferencies.max_horaris, this.combinacions_a_mostrar.length))
					
					+" millors a continuació:"
				}
				<br/>


				{
					this.combinacions_a_mostrar.map((combinacio, i) => {
						return(<>
							<br/><br/><br/>
							<p className="text-end mb-0">
								<Button
									className="pt-0 position-relative shadow border-dark" style={{right:"-0.25rem", bottom:"0"}}
									size="sm"
									onClick={()=>{

										setTimeout(()=>{
											window.document.getElementById("span_posicio_horari_"+(i+1)).style.display = "none";
										}, 50);

										//console.log(window.document.getElementById("horari_"+(i+1)))

										setTimeout(()=>{
											html2canvas( window.document.getElementById("horari_"+(i+1)),{scale:3} ).then(canvas => {
												//window.document.body.appendChild(canvas);

												let date = new Date();

												//["∶","˸","﹕", "᠄", "：", "︓"].forEach(x=>{console.log("12"+x+"34"+x+"56")})
												let datestring = date.getFullYear()
												+"-"
												+(("0"+date.getMonth()).slice(-2))
												+"-"
												+(("0"+date.getDate()).slice(-2))
												+"_"
												+(("0"+date.getHours()).slice(-2))
												+"∶"
												+(("0"+date.getMinutes()).slice(-2))
												+"∶"
												+(("0"+date.getSeconds()).slice(-2))
												;
												
												const image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
												const a = document.createElement('a');
												a.setAttribute('download', "Horari ViGtory #"+(i+1)+" "+datestring+".png");
												a.setAttribute('href', image);
												a.click();
											})
										}, 100);


										setTimeout(()=>{
											window.document.getElementById("span_posicio_horari_"+(i+1)).style.display = "block";
										}, 150);





										}
									}
								>
									<span className="d-inline-flex align-content-center">
										{
										//📸&#xFE0E;
										//<h5 className="d-inline my-0 text-decoration-underline">⇩</h5>
										}
										<h3 className="d-inline my-0">📷&#xFE0E;</h3>
										&nbsp;
										<span className="pt-1 align-self-center">{" Captura #"+(i+1)}</span>
									</span>
								</Button>
							</p>
							<div id={"horari_"+(i+1)}>
							{this.renderTaulaHoraris(combinacio, i+1, true, [], 0)}



							<Table style={{tableLayout:"fixed", width:"100%", borderCollapse:"collapse"}}>
								<thead>
									<tr>
										<th style={{backgroundColor:"#3488bb", color:"white", width:"auto", border:"1px solid #30577b", width:"75%"}}>
											{"Assignatures de l'horari #"+(i+1)}
										</th>
										<th style={{backgroundColor:"#3488bb", color:"white", width:"auto", border:"1px solid #30577b", width:"25%"}}>
											{"Grups"}
										</th>
									</tr>
								</thead>

								<tbody>
									{combinacio.sort((a,b)=>(a.sigles_ud<b.sigles_ud)).map(comb => {
									
									let nom_assig = this.pool_flagged.filter(assig => assig.sigles_ud==comb.sigles_ud)[0].nom;

									return(
									<tr>
										<td className="text-start py-1" style={{backgroundColor:"#eef5ff", borderColor:"#30577b", border:"solid", borderWidth:"1px"}}>
											<span className="text-break me-2">
											<b>{comb.sigles_ud}</b>
											<br/>
											&nbsp;&nbsp;&nbsp;
											{"  ⤷ "+nom_assig}
										</span>
										</td>
										<td style={{backgroundColor:"#eef5ff", borderColor:"#30577b", border:"solid", borderWidth:"1px", verticalAlign:"middle"}}>
											{comb.nom_grup}
										</td>
									</tr>
									);})}
									
								</tbody>
							</Table>




								
							</div>
						
						</>);
					})
				}

			</>}

		</>;

		},240);

		//window.document.getElementsByClassName("render_horari")[0].innerHTML = "";
		setTimeout(()=>{this.forceUpdate();}, 250)
		
	}





	determinaHoraMinHoraMax(mati, tarda, fragments){
		let hora_min = tarda.fi;
		let hora_max = mati.inici;
		
		for (let i=0; i<fragments.length; i++){
				if (this.padTimeString(fragments[i].h_i) < this.padTimeString(hora_min)) hora_min = fragments[i].h_i;
				if (this.padTimeString(fragments[i].h_f) > this.padTimeString(hora_max)) hora_max = fragments[i].h_f;
		}

		return [hora_min, hora_max];
	}

	makeHoresList(mati, tarda, hora_min, hora_max){
		let hores = [];

		let hora_a_introduir = hora_min;
		hores.push(hora_a_introduir);
		while(this.padTimeString(hora_a_introduir) < this.padTimeString(hora_max)){
			let h_split = hora_a_introduir.split(":");
			if(this.padTimeString(hora_a_introduir) == this.padTimeString(mati.fi)){
				hora_a_introduir = (parseInt(h_split[0])+1)+":00";
			}
			else{
				hora_a_introduir = (parseInt(h_split[0])+1)+":"+h_split[1];
			}
			hores.push(hora_a_introduir);
		}

		return hores;
	}

	hourStringToValue(str){
		let s = str.split(":");
		return ( parseInt(s[0]) + parseInt(s[1])/60 );
	}

	renderTaulaHoraris(combinacio, posicio, checkAll_T_onlyNext_F, check_next){

		
		let mati = this.mati;
		let tarda = this.tarda;
		let hores = [];
		let dies = [(checkAll_T_onlyNext_F?("#"+posicio):""), "Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres"];


		let nomes_i_dies = [...Array(dies.length).keys()].splice(1);
		let delete_rowspan = [];

		let check_later = [];


		//Creamos una lista de fragmentos para facilitar la manipulación en caso de solapamientos visuales de asignaturas que no empiecen y acaben a la vez
		let fragments = [];
		for (let i=0; i<combinacio.length; i++){
			//console.log(this.assig_grups);
			//console.log(combinacio);
			(this.assig_grups[combinacio[i].sigles_ud].grups[combinacio[i].nom_grup].fragments).forEach(frag => {
					let f = {...frag};
					f["nom_grup"] = combinacio[i].nom_grup;
					fragments.push(f);
				//}
			});
		}

		


		//Para probar que se renderiza todo bien:
		//el caso de 8:30-11:30 lo hace bien
		//el caso de 9:30-10:30 NO lo hace bien
		//el caso de 9:30-11:30 aún está por probar ??????
		//let test_hi = [["8:30", "10:30"], ["9:30", "11:30"], ["10:30", "12:30"]];
		/*
		let test_hi = [
			["8:30", "10:30"], 
			["8:30", "11:30"], 
			["9:30", "10:30"], 
			["9:30", "11:30"]
		];
		for (let i=0; i<test_hi.length; i++){
			fragments.push({
				anyaca: 2021,
				codgrup: "🐱",
				dia: 2,
				grau: "N",
				//h_f: "10:30",
				//h_i: "8:30",
				h_f: test_hi[i][1],
				h_i: test_hi[i][0],
				nom: "🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱",
				ordre: null,
				quadri: 1,
				setmana: 2,
				sigles_ud: "🐱🐱🐱 "+i,
				tpla: "T",
				nom_grup: "🐱",
				codaul: "VG🐱"
			})
		}
		*/


		let HoraMinHoraMax = this.determinaHoraMinHoraMax(mati, tarda, fragments)
		hores = this.makeHoresList(mati, tarda, HoraMinHoraMax[0], HoraMinHoraMax[1]);



		nomes_i_dies.map(i_dia=>{

			for (let i_hora=0; i_hora<hores.length-1; i_hora++){
			//[...Array(hores.length-1).keys()].map(i_hora=>{

				let hora_i = null;
				let hora_f = null;

				hora_i = hores[i_hora];


				//Buscamos todos los fragmentos que empiecen en este mismo día y hora
				let frags = fragments.filter(frag=>( 
					(frag.dia == i_dia) && (frag.h_i == hora_i) 
				));

				//Buscamos las horas (unique, sin repetición) a las que acaban estos fragmentos, para encontrar si son diversas o si siempre es la misma
				let hores_f = frags.reduce((a, d)=>{
					if (a.indexOf(d.h_f) === -1) {
						a.push(d.h_f);
					}
					return a;
				}, []);
				//Ordenamos de mayor duración a menor duración para mostrar primero aquellos fragmentos que sean de mayor tamaño
				hores_f = hores_f.sort((a,b)=>{return ( (this.padTimeString(a)<this.padTimeString(b)) ? 1 : -1 )});

				//Priorizamos los segmentos de 2 horas de duración porque son los más frecuentes (y por lo tanto tienen mayores probabilidades de solaparse con segmentos de la misma duración), y nuestro interés es mostrar la máxima cantidad de información posible a la menor profundidad posible
				let priority_len = 2;
				let getDuration = (hora_fi) => {
					return (this.hourStringToValue(hora_fi)-this.hourStringToValue(hora_i));
				}
				hores_f = hores_f.sort((a,b)=>{return (  ( (getDuration(a) == priority_len) ? -1 : ((getDuration(b) == priority_len) ? 1 : 0) )  );});
				
				//Determinamos el final del rango de horas que nos interesa comprobar, quedándonos únicamente con la hora de fin que corresponda a la profundidad de la tabla que estemos explorando en este momento (si no hay horas para esta profundidad, recibiremos un undefined)
				let depth = 0;

				if (!checkAll_T_onlyNext_F){
					depth = check_next.filter(chk => ( (chk.dia==i_dia) && (chk.hora==hora_i) ));
					if (depth.length > 0){depth = depth.sort((a,b) => {return ( (a.depth<b.depth) ? 1 : -1 )})[0].depth;}
					else {depth = -1;}
				}

				hora_f = hores_f.slice(depth, depth+1)[0]; //No usamos splice porque alteraría la original

				
				

				//Si reconocemos horas a una profundidad visualizable
				if (hora_f){

					//Filtramos aquellos fragmentos que, para el mismo día, no tienen exactamente los mismos principio y final combinados que los que hemos elegido para mostrar en esta profundidad, pero sí tiene un principio comprendido entre el principio y el final elegidos
					

					let rowspan = hores.indexOf(hora_f) - hores.indexOf(hora_i);

					
					for (let x=0; x<rowspan; x++){
						fragments = fragments.filter(frag => {
							
							if (frag.dia != i_dia) return true;

							

							let hora_added = hores[i_hora+x];

							if (frag.h_i == hora_added){

								if (!( (frag.h_i == hora_i) && (frag.h_f == hora_f) )){

									let d = 0;
									if (!checkAll_T_onlyNext_F){
										d = check_next.filter(chk => ( (chk.dia==i_dia) && (chk.hora==frag.h_i) ));
										if (d.length > 0){d = d.sort((a,b) => {return ( (a.depth<b.depth) ? 1 : -1 )})[0].depth;}
										else {d = -1;}
									}
									if (frag.h_i == hora_i) d+=1;

									//Eliminamos los fragmentos que no vamos a mostrar de la iteración actual, guardando una referencia a ellos para la siguiente
									check_later.push({dia:i_dia, hora:frag.h_i, depth: d});
									return false;
								}
							}
							

							return true;
								
						});
					}

					//Marcamos las casillas que no vamos a renderizar en la tabla final
					for (let x=1; x<rowspan; x++){
							delete_rowspan.push({dia:i_dia, hora:hores[i_hora+x]});
					}
					
				}
				//En caso de no haber una profundidad visualizable (no hay fragmentos que empiecen a esta hora, o ya hemos recorrido todas las profundidades para los fragmentos que empiezan a esta hora), eliminamos todos los fragmentos que empiecen a esta hora
				else{
					fragments = fragments.filter(frag => {
							
						if ((frag.dia == i_dia) && (frag.h_i == hora_i)) return false;

						return true;
							
					});
				}


			//});
			}
		});




		//Determinamos el rango de horas a mostrar en la tabla final (para ahorrarnos imprimir filas vacías)
		HoraMinHoraMax = this.determinaHoraMinHoraMax(mati, tarda, fragments);
		//Lista de horas final a imprimir vía tabla
		hores = this.makeHoresList(mati, tarda, HoraMinHoraMax[0], HoraMinHoraMax[1]);





		if (fragments.length == 0) return(<></>);



		return(
		<>
			{checkAll_T_onlyNext_F ? "" : 
			<>
				
			</>
			}

			<Table style={{tableLayout:"fixed", width:"100%", borderCollapse:"collapse"}}>
		

				<thead>
					<tr>
						{dies.map((dia, i)=>{return(
							<th className="px-0" style={i==0?{borderLeft:"none", borderTop:"none", width:"15%"}:{backgroundColor:"#3488bb", color:"white", width:"auto", border:"1px solid #30577b"}}>
								{i==0 ?
									<span id={"span_posicio_horari_"+(i+1)}>
										{dia}
									</span>
									:
									dia
								}
							</th>
						);})}
					</tr>
				</thead>

				<tbody>
					{[...Array(hores.length-1).keys()].map(i_hora=>{

						

						return(
							<tr>
								
								<td className="px-0" style={{backgroundColor:"#3488bb", color:"white", border:"1px solid #30577b", verticalAlign:"middle"}}>
									{hores[i_hora]+" - "+hores[i_hora+1]}
								</td>

								{nomes_i_dies.map((i_dia)=>{
									
									let text = [];
									let rowspan = 0;
									



									for (let i=0; i<fragments.length; i++){


										if ((fragments[i].dia == i_dia)&&(fragments[i].h_i==hores[i_hora])){

											if (rowspan == 0){
												rowspan = 
												/*parseInt((fragments[i].h_f).split(":"[0]))
												-
												parseInt((fragments[i].h_i).split(":"[0]));*/
												hores.indexOf(fragments[i].h_f) - hores.indexOf(fragments[i].h_i);
											}
											
											let x_set = (
												//fragments[i].setmana+fragments[i].ordre+
												(fragments[i].setmana==null) ? "" : (":s"+fragments[i].setmana
												+((fragments[i].ordre==null) ? "" : (fragments[i].ordre))
												)
											);

											let t = <>
												<b>{fragments[i].sigles_ud}</b>
												<br/>
												<span className="fst-italic">{fragments[i].codaul ? fragments[i].codaul : "VG?---"}</span>
												<br/>
												{fragments[i].tpla ? <><span className="text-muted">{(
													(fragments[i].tpla=="T") ? "(Teoria)" :
													((fragments[i].tpla=="L") ? "(Lab.)" : "")
												)}</span><br/></>:""}
												<span style={{
													textDecorationLine:"underline",
													//textDecorationStyle:"dotted"
													}}>
													{" grup "+fragments[i].nom_grup}
												</span>
												{(x_set!="") ? <><br/>{x_set}</> : ""}
											</>;
											text.push(t);
										}

									}
									

									let has_content = text.length;
									let content = text.map((txt, txt_i) => {return(<>
										{txt}
										{(txt_i<(text.length-1)) ? <>
											<br/><br/><br/>
										</>:""}
									</>)});
									
									
									
									
									
									
									
									return(
									
									(delete_rowspan.some(del_cell => ( (del_cell.dia == i_dia)&&(del_cell.hora==hores[i_hora]) )))?<></>:
									<td className="w-auto border-1" rowSpan={has_content ? rowspan.toString():"1"} style={
										(this.padTimeString(hores[i_hora]) == this.padTimeString(mati.fi))?
									{backgroundColor:"#cccccc", borderColor:"#30577b", border:"solid"}
									:
									((has_content)?
										{backgroundColor:"#eef5ff", borderColor:"#30577b", border:"solid"}
										:
										{backgroundColor:"rgb(241, 241, 241)", borderColor:"#30577b", border:"solid"}
									)}>
										{content}
									</td>
								);})}


							</tr>
						);



					})}

				</tbody>

			</Table>
			

			{(check_later.length>0) ?
				//check_later ?
				this.renderTaulaHoraris(combinacio, posicio, false, check_later/*, depth+1*/)
				:
				""
			}


		</>);
	}









	cosParametresMatiTarda(matiTtardaF, comencaTacabaF){
		let MT = matiTtardaF ? "mati" : "tarda";
		let CA = comencaTacabaF ? "comencar" : "acabar";
		//flex-fill
		return(
			
				
				<>
				<div className="d-flex align-items-center justify-content-center">

					<span>{"Prefereixo "+(comencaTacabaF?"començar":"acabar")+" "}</span>

					<Form.Select 
						className="mx-1 py-0"
						size="sm"
						style={{width:"fit-content"}}
						defaultValue={this.preferencies[CA+"_tardT_aviatF_"+MT]==true?1:0}
						onChange={(e)=>{
							this.preferencies[CA+"_tardT_aviatF_"+MT] = e.currentTarget.value==1?true:false;
							this.forceUpdate();
						}}
					>
						<option value={0}>{"Aviat"}</option>
						<option value={1}>{"Tard"}</option>
					</Form.Select>
					<span>{matiTtardaF ? " pels matins.":" per les tardes."}</span>

				</div>
				


				<span>
					{"Importància "+(comencaTacabaF?"de començar":"d'acabar")+" "+((this.preferencies[CA+"_tardT_aviatF_"+MT]==true)?"tard":"aviat")+(matiTtardaF?" pels matins":" per les tardes")+":"}
				</span>
				<br/>
				<NumInput 
					min={0} max={10} 
					defaultVal={this.preferencies[CA+"_tard_aviat_imp_"+MT]} 
					onChangeFunc={(newVal)=>{
						this.preferencies[CA+"_tard_aviat_imp_"+MT] = newVal;
						//this.forceUpdate();
					}}
					mostra_limits={true}
				/>
				</>


		);
	}

	parametresMatiTarda(matiTtardaF){
		return(
		<p className="text-center mb-0">
			<h5><b><u>{matiTtardaF ? "Matí" : "Tarda"}</u></b></h5>
			{this.cosParametresMatiTarda(matiTtardaF, true)}
			<br/><br/>
			{this.cosParametresMatiTarda(matiTtardaF, false)}
		</p>
		);
	}







	
	render(){

		//console.log(Object.keys(this));

		let total_flagged_count = 0;
		let total_conviccio_assig_count = 0;
		this.pool_flagged = [];
		for (let i=0; i<(Object.keys(this.cursos).length); i++){
			for (let j=0; j<this.cursos[Object.keys(this.cursos)[i]].length; j++){
				let assign = this.cursos[Object.keys(this.cursos)[i]][j];

				total_flagged_count += assign.pool_flag ? 1:0;
				if (this.assig_grups.hasOwnProperty(assign.sigles_ud))
					total_conviccio_assig_count += this.assig_grups[assign.sigles_ud].conviccio ? 1:0;

				if (assign.pool_flag)
				this.pool_flagged.push({
					sigles_ud: assign.sigles_ud,
					nom: assign.nom
				});

			}
		}
		let rest_assig = this.max_assignatures_select-total_flagged_count;
		//this.min_assignatures_result = total_conviccio_assig_count;



		//Añadimos el campo key para que React re-renderice los props adecuadamente. Si no, no vuelve a llamar al constructor y se queda estancado con los valores por defecto.

		let min = Math.max(this.min_assignatures_result, total_conviccio_assig_count);
		let max = Math.min(this.max_assignatures_result, this.pool_flagged.length)
		this.preferencies.max_assignatures = this.preferencies.max_assignatures_used_by_user ? Math.min(this.preferencies.max_assignatures, max) : max;
		
		let numInput_assigs = <NumInput 
			key={"numInput_assigs_"+min+"_"+max}
			min={min} 
			max={max} 
			defaultVal={this.preferencies.max_assignatures} 
			onChangeFunc={(newVal, usedByUser)=>{
				this.need_recompute = true;
				this.preferencies.max_assignatures = newVal; 
				if (usedByUser){
					this.preferencies.max_assignatures_used_by_user = true;
					//console.log("CLICKED!!!");
				}
			}}
			mostra_limits={true}
		/>;
		//console.log(this.preferencies.max_assignatures_used_by_user, this.preferencies.max_assignatures);

		min = this.min_horaris_result;
		max = this.max_horaris_result;
		let numInput_resultats = <NumInput 
			key={"numInput_resultats_"+min+"_"+max}
			min={min} 
			max={max} 
			defaultVal={this.preferencies.max_horaris} 
			onChangeFunc={(newVal, usedByUser)=>{
				this.preferencies.max_horaris = newVal;
				this.forceUpdate();
			}}
			mostra_limits={true}
		/>;




		let hores_mortes = 
			<p className="text-center mb-0">
				<h5><b><u>{"Hores mortes"}</u></b></h5>
				
				<div className="d-flex align-items-center justify-content-center">
					<span>{"Prefereixo"}</span>
					<Form.Select 
						className="mx-1 py-0"
						size="sm"
						style={{width:"fit-content"}}
						defaultValue={this.preferencies["hores_mortes"]}
						onChange={(e)=>{
							this.preferencies["hores_mortes"] = e.currentTarget.value;
							this.forceUpdate();
						}}
					>
						<option value={"min"}>{"Minimitzar"}</option>
						{//<option value={"ignore"}>{"Ignorar"}</option>
						}
						<option value={"max"}>{"Maximitzar"}</option>
					</Form.Select>
					<span>{" les hores mortes."}</span>

				</div>
				


				<span>
					{"Importància d"+(

						(this.preferencies["hores_mortes"]=="ignore")
						?
							"'ignorar"
						:
							"e "+( (this.preferencies["hores_mortes"]=="min")
							?
							"minimitzar"
							:
							"maximitzar")

						)+" les hores mortes:"}
				</span>
				<br/>
				<NumInput 
					min={0} max={10} 
					defaultVal={this.preferencies["hores_mortes_imp"]} 
					onChangeFunc={(newVal)=>{
						this.preferencies["hores_mortes_imp"] = newVal;
						//this.forceUpdate();
					}}
					mostra_limits={true}
				/>
			</p>
		;




		//"prin", "mitj", "final"
		let dies_lliures = 
			<p className="text-center mb-0">
				<h5><b><u>{"Dies lliures"}</u></b></h5>
				
				<div className="d-flex align-items-center justify-content-center">
					<span>{"Prefereixo dies lliures a "}</span>
					<Form.Select 
						className="mx-1 py-0"
						size="sm"
						style={{width:"fit-content"}}
						defaultValue={this.preferencies["dies_lliures"]}
						onChange={(e)=>{
							this.preferencies["dies_lliures"] = e.currentTarget.value;
							this.forceUpdate();
						}}
					>
						<option value={"prin"}>{"Principis"}</option>
						<option value={"mitj"}>{"Mitjans"}</option>
						<option value={"final"}>{"Finals"}</option>
						<option value={"quan_s"}>{"Quan sigui"}</option>
						<option value={"prop_cap"}>{"Prop del cap"}</option>
					</Form.Select>
					<span>{" de setmana."}</span>

				</div>
				


				<span>
					{"Importància dels dies lliures "+
					
						(()=>{
							switch(this.preferencies["dies_lliures"]){
								case("prin"): return "a principis de";
								case("mitj"): return "a mitjans de";
								case("final"): return "a finals de";
								case("quan_s"): return "quan sigui de la";
								case("prop_cap"): return "a prop del cap de";
							}
						})()
					
						+" setmana:"}
				</span>
				<br/>
				<NumInput 
					min={0} max={10} 
					defaultVal={this.preferencies["dies_lliures_imp"]} 
					onChangeFunc={(newVal)=>{
						this.preferencies["dies_lliures_imp"] = newVal;
						//this.forceUpdate();
					}}
					mostra_limits={true}
				/>
			</p>
		;






		let prioritza_matiT_tardaF = 
			<p className="text-center mb-0">
				<h5><b><u>{"Matí o Tarda"}</u></b></h5>
				
				<div className="d-flex align-items-center justify-content-center">
					<span>{"Prefereixo fer classe "+((this.preferencies["prioritza_matiT_tardaF"]==true) ? "pel " : "per la ")}</span>
					<Form.Select 
						className="mx-1 py-0"
						size="sm"
						style={{width:"fit-content"}}
						defaultValue={this.preferencies["prioritza_matiT_tardaF"]==true?1:0}
						onChange={(e)=>{
							this.preferencies["prioritza_matiT_tardaF"] = e.currentTarget.value==1?true:false;
							this.forceUpdate();
						}}
					>
						<option value={1}>{"Matí"}</option>
						<option value={0}>{"Tarda"}</option>
					</Form.Select>

				</div>
				


				<span>
					{"Importància de fer classe "+((this.preferencies["prioritza_matiT_tardaF"]==true) ? "pel matí" : "per la tarda")+":"}
				</span>
				<br/>
				<NumInput 
					min={0} max={10} 
					defaultVal={this.preferencies["prioritza_matiT_tardaF_imp"]} 
					onChangeFunc={(newVal)=>{
						this.preferencies["prioritza_matiT_tardaF_imp"] = newVal;
						//this.forceUpdate();
					}}
					mostra_limits={true}
				/>
			</p>
		;















		let parametresMatiTarda = [this.parametresMatiTarda(true), this.parametresMatiTarda(false)];

		

		return(
			<>
				<NavBar currentSection={this.props.currentSection} />
				<br/><br/><br/><br/>



				<div className="schedule_gen mx-auto" >

					<p className="text-center" >
						{(rest_assig<=0?"No pots escollir cap ":"Escull fins a ")}{rest_assig!=0?rest_assig:""}{" assignatur"+(rest_assig<2?"a":"es")}{total_flagged_count>0?" més":""}{" a tenir en compte:"}
					</p>


					<ListGroup className="assigSelectList">

						{(Object.keys(this.cursos)).map(curs=>{

							let flagged_count = 0;
							for (let i=0; i<this.cursos[curs].length; i++){
								flagged_count += this.cursos[curs][i].pool_flag ? 1:0;
							}
							let curs_marcat = (flagged_count >= this.cursos[curs].length/2);
							//let curs_marcat = (flagged_count == this.cursos[curs].length);
							

							return(<>

							<ListGroup.Item 
								className={"ps-2 pe-2 py-1 assigSelectAll"+(curs_marcat?" flagged":"")}
								
								onClick={()=>{
									/*let continue_loop = true;
									for (let i=0; i<this.cursos[curs].length; i++){
										if (this.cursos[curs][i].pool_flag == curs_marcat){
											
											let simulated = total_flagged_count + (this.cursos[curs][i].pool_flag ? -1:1);
											console.log(simulated);
											
											this.cursos[curs][i].pool_flag = !curs_marcat;
										}
									}*/
									
									for (let i=0; i<this.cursos[curs].length; i++){
										if (this.cursos[curs][i].pool_flag == curs_marcat){
											window.document.getElementById("select_assig_"+this.cursos[curs][i].sigles_ud).click();
										}
									}

									this.forceUpdate();
								}}
							>
								<span className="text-decoration-none d-flex align-items-center justify-content-between">
									<span className="text-break me-2">
										<h3 className="mb-0"><b>{"Curs "+curs}</b></h3>
									</span>
									<span 
										className="individualSelect px-2" 
										style={{whiteSpace:"nowrap"}}
									>
										<p className="text-end mb-1">

											{//<h5 className="d-inline">{curs_marcat ? "☑":"☐"}</h5>
											}

											<span className="d-inline">
												{curs_marcat ? "Deselecciona-ho tot":"Selecciona-ho tot"}
											</span>&nbsp;
											<h5 className="d-inline">{curs_marcat ? "☑":"☐"}</h5>
										</p>
									</span>
									
								</span>
								
							</ListGroup.Item>







							{this.cursos[curs].map(assig => {
								//console.log(assig);
								return(<>


									<ListGroup.Item 
										className={"pe-2 py-1"+(assig.pool_flag?" flagged":"")}
										id={"select_assig_"+assig.sigles_ud}
										style={{borderTop:"0"}}
										onClick={()=>{
											let simulated = (total_flagged_count+((!assig.pool_flag)?1:-1));
											if (simulated <= this.max_assignatures_select){
												this.need_recompute = true;
												assig.pool_flag = !assig.pool_flag;
												total_flagged_count = simulated;
												if(assig.pool_flag){this.initialitzaAssigGrups(assig.sigles_ud)}
												this.forceUpdate();
											}
										}}
									>
										<span className="text-decoration-none d-flex align-items-center justify-content-between">
											<span className="text-break me-2">
											
											<b key={assig+"b"}>{assig.sigles_ud}</b>
											<br/>
											&nbsp;&nbsp;&nbsp;
											{"  ⤷ "+assig.nom}

											</span>
											<span 
												className="individualSelect px-2" 
												style={{whiteSpace:"nowrap"}}
											>
											<p className="text-end mb-1">
												<h5 className="d-inline">
													{assig.pool_flag ? "☑":"☐"}
												</h5>
											</p>
											</span>
											
										</span>
										
									</ListGroup.Item>



							</>)
							})}
						</>)
						})}

					</ListGroup>






					{this.pool_flagged.length ?<>
						<br/><br/>
						<p className="text-center" >
							{"Marca quines assignatures "+

							(
								((this.max_assignatures_result-total_conviccio_assig_count)<=0)?"(no pots marcar cap més) ":("(fins a "+

									(
										((this.max_assignatures_result-total_conviccio_assig_count) < this.max_assignatures_result) ? 
											((this.max_assignatures_result-total_conviccio_assig_count)+" més") 
										: 
											this.max_assignatures_result
									)+") "

								)
							)
							+"i grups de la selecció que has fet tens per segur que vols cursar:"}
						</p>
					</>:""}



					<ListGroup className="assigSelectList">

						{this.pool_flagged.map(assig => {

							let assig_marcada = this.assig_grups[assig.sigles_ud].conviccio;
							return(<>
								


								<ListGroup.Item 
									className={"ps-2 pe-2 py-1 assigSelectAll"+(assig_marcada?" flagged":"")}
									
									onClick={()=>{
										if ( ((!assig_marcada) && total_conviccio_assig_count<this.max_assignatures_result) || assig_marcada)
											this.assig_grups[assig.sigles_ud].conviccio = !assig_marcada;

										this.need_recompute = true;
										
										this.forceUpdate();
									}}
								>
									<span className="text-decoration-none d-flex align-items-center justify-content-between">
										<span className="text-break me-2">
											<b key={assig+"b"}>{assig.sigles_ud}</b>
											<br/>
											&nbsp;&nbsp;&nbsp;
											{"  ⤷ "+assig.nom}
										</span>
										<span 
											className="individualSelect px-2" 
											style={{whiteSpace:"nowrap"}}
										>
											<p className="text-end mb-1">

												{//<h5 className="d-inline">{curs_marcat ? "☑":"☐"}</h5>
												}

												<span className="d-inline">
													{assig_marcada ? "La cursaré segur":"No sé si la cursaré"}
												</span>&nbsp;
												<h5 className="d-inline">{assig_marcada ? "☑":"☐"}</h5>
											</p>
										</span>
										
									</span>
									
								</ListGroup.Item>








								{(Object.keys(this.assig_grups[assig.sigles_ud].grups).sort()).map(nom_grup => {
									//let grup = this.assig_grups[assig.sigles_ud].grups[nom_grup];
									let grup_marcat = this.assig_grups[assig.sigles_ud].grups[nom_grup].conviccio;

									return(<>

										<ListGroup.Item 
											className={"pe-2 py-1"+(grup_marcat?" flagged":"")}
											id={"select_assig_"+assig.sigles_ud}
											style={{borderTop:"0"}}
											onClick={()=>{
												if (!grup_marcat){
													let keys = Object.keys(this.assig_grups[assig.sigles_ud].grups);
													for (let i=0; i<keys.length; i++){
														this.assig_grups[assig.sigles_ud].grups[keys[i]].conviccio = false;
													}
												}
												this.assig_grups[assig.sigles_ud].grups[nom_grup].conviccio = !grup_marcat;

												this.need_recompute = true;

												this.forceUpdate();
											}}
										>
											<span className="text-decoration-none d-flex align-items-center justify-content-between">
												<span className="text-break me-2">
												
												{"Grup "+nom_grup}

												</span>
												<span 
													className="individualSelect ps-2 pe-1"
													style={{whiteSpace:"nowrap"}}
												>
												<p className="text-end mb-1">
													<span className="d-inline">
														{grup_marcat ? "Definitiu 🔵":"No ho tinc clar ⚪"}
													</span>
												</p>
												</span>
												
											</span>
											
										</ListGroup.Item>


									</>);
								})}


							</>);
						})}

					</ListGroup>




					{this.pool_flagged.length ?<>
						<br/><br/>

						<ListGroup className="paramSelectList">
							<ListGroup.Item 
									className={"ps-2 pe-2 py-1 paramSelectAll"}
							>
							<h3 className="mb-0"><b>{"Altres paràmetres"}</b></h3>
							</ListGroup.Item>



							<ListGroup.Item 
								className={"pe-2 py-1"}
								style={{borderTop:"0"}}
							>
								<p className="text-center mb-0">
									Quantitat d'assignatures desitjada:
									<br/>
									{numInput_assigs}
								</p>
							</ListGroup.Item>



							<ListGroup.Item 
								className={"pe-2 py-1 no_hover"}
								style={{borderTop:"0"}}
							>
								<p className="text-center mb-0">
									Quantitat màxima de millors resultats a mostrar:
									<br/>
									{numInput_resultats}
								</p>
							</ListGroup.Item>








							<ListGroup.Item 
								className={"pe-2 py-1 no_hover"}
								style={{borderTop:"0"}}
							>
								{hores_mortes}
							</ListGroup.Item>


							<ListGroup.Item 
								className={"pe-2 py-1 no_hover"}
								style={{borderTop:"0"}}
							>
								{dies_lliures}
							</ListGroup.Item>


							<ListGroup.Item 
								className={"pe-2 py-1 no_hover"}
								style={{borderTop:"0"}}
							>
								{prioritza_matiT_tardaF}
							</ListGroup.Item>





							<ListGroup.Item 
								className={"pe-2 py-1 no_hover"}
								style={{borderTop:"0"}}
							>
								{parametresMatiTarda[0]}
							</ListGroup.Item>

							<ListGroup.Item 
								className={"pe-2 py-1 no_hover"}
								style={{borderTop:"0"}}
							>
								{parametresMatiTarda[1]}
							</ListGroup.Item>








						</ListGroup>











						<br/><br/>
						<p className="text-center">
							<Button
								onClick={()=>{
									/*window.document.getElementsByClassName("render_horari")[0].innerHTML =
										renderToStaticMarkup(
											<div className="text-center" >
												HELLO!
											</div>
										);
									;*/
									/*this.horaris_render = 
										<div className="text-center">
											HELLO!
										</div>
									;
									this.forceUpdate();*/



										/*renderToStaticMarkup(<>
											{(new Date()).toDateString()}
											<br/>
											{this.render_horari_loading_status}
										</>);*/


									/*this.temps_inici_render_horari = new Date();
									//window.clearInterval(this.statusInterval);
									this.statusInterval = window.setInterval(async ()=>{
										let f = () => {
											console.log(new Date().toString());
											window.document.getElementById("render_horari_loading_status").innerHTML = (new Date()).toString()
										};
										await f();
										
									}, 10);*/




									/*let timeoutStatus = ()=>{
										setTimeout(()=>{
											console.log(new Date().toString());
											window.document.getElementById("render_horari_loading_status").innerHTML = (new Date()).toString();
											if (this.horaris_render == ""){timeoutStatus();}
										}, 10);
									};*/



//let func = async () => {
									setTimeout(()=>{
										window.document.getElementById("render_horari_loading").style.display="block";
										//this.horaris_render = "";
										//timeoutStatus();
									}, 100);

									//setTimeout(()=>{timeoutStatus();}, 150);
/*									
let clone_json = {};
console.log(this);
console.log(Object.getOwnPropertyNames(this));
console.log(Object.keys(this));
Object.keys(this).forEach((key)=>{
	if (!["props", "context", "refs", "updater", "state", "_reactInternalInstance", "_reactInternals"].some(k=>k==key)){
		//if (typeof (this[key]) === 'function'){
			//clone_json[key]=() => {this[key]()};
		//if (typeof (this[key]) === 'Symbol(react.element)'){
		if (React.isValidElement(this[key])){
			clone_json[key] = renderToStaticMarkup(this[key])
		}
		else
			clone_json[key] = this[key];
		}
	}
);*/
//clone_json["generaPossiblesHoraris"]=this.generaPossiblesHoraris;
/*clone_json["padTimeString"]=this.padTimeString.toString();
console.log(clone_json);
									//setTimeout(()=>{
										//this.generaPossiblesHoraris();
										//window.document.getElementById("render_horari_done").innerHTML = renderToStaticMarkup(this.horaris_render);

										thread().run(function (done) {
											console.log("HELLO WORKER");
											console.log(this.padTimeString);
											console.log(typeof this.padTimeString);
											console.log(this.mati);


											console.log(eval(this.padTimeString));//se cuelga
											this.padTimeString = eval(this.padTimeString);
											console.log(typeof this.padTimeString);
											console.log(this.padTimeString("8:30"));*/
											/*console.log(this.padTimeString("8:30"));
											var func = ()=>{
												this.generaPossiblesHoraris();
												//let clone_json = {};
												Object.keys(this).forEach((key)=>{
													//if (typeof (this[key]) === 'Symbol(react.element)'){
													if (React.isValidElement(this[key])){
														this[key] = renderToStaticMarkup(this[key]);
													}
												});
												console.log("IN WORKER: "+this.horaris_render)
												return this.horaris_render;
											}*/
											//done(null, 4/*func()*/)
										/*}, clone_json*//*{...clone_json
											mati: this.mati,
											tarda: this.tarda,

											max_assignatures_select: this.max_assignatures_select,
											min_assignatures_result: this.min_assignatures_result,
											max_assignatures_result: this.max_assignatures_result,

											min_horaris_result: this.min_horaris_result,
											max_horaris_result: this.max_horaris_result,

											horaris: this.horaris,
											cursos: this.cursos,
											assig_grups: this.assig_grups,

											preferencies: this.preferencies,

											pool_flagged: this.pool_flagged,
											assig_grups: this.assig_grups,

											generaPossiblesHoraris: (() => {this.generaPossiblesHoraris()})
										}*//*)</p>
										.then(function (horaris_render) {
											console.log("IN THEN: "+horaris_render);

											window.document.getElementById("render_horari_done").innerHTML = renderToStaticMarkup(horaris_render);

											window.document.getElementById("render_horari_loading").style.display="none";
										});*/

										//window.clearInterval(this.statusInterval);
									//}, 200);
									
									//setTimeout(()=>{
										this.generaPossiblesHoraris();
									//}, 200);

									setTimeout(()=>{
										//window.document.getElementById("render_horari_done").innerHTML = renderToStaticMarkup(this.horaris_render);

										//window.document.getElementById("render_horari_done").innerHTML = ""
										//window.document.getElementById("render_horari_done").appendChild(this.horaris_render);

										window.document.getElementById("render_horari_loading").style.display="none";
									}, 300);
//}
//func();

								}}
							>
								<b>{"Genera el"+((this.preferencies.max_horaris==1)?" millor horari possible" : ("s "+this.preferencies.max_horaris+" millors horaris possibles") )}</b>
							</Button>
							<br/><br/>
							{
							//"Si has escollit una gran quantitat d'assignatures, podria trigar..."
							}

						</p>
					</>:""}



					

				</div>


				<p className="text-center">
					<div className="render_horari m-auto">
						
						<p id="render_horari_loading" className="text-center" style={{display:"none"}} >
							<Spinner animation="border" variant="primary" />
							<br/>
							<span id="render_horari_loading_status"></span>
						</p>

						<br/>

						{/*this.horaris_render*/}
						<div id="render_horari_done">
							{this.horaris_render}
						</div>

					</div>
				</p>


				<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
				<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
				<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>

			</>
		);

	};
}



function ScheduleGen(props){
	//ESTE TROZO DE CÓDIGO EXPULSA AL USUARIO SI INTENTA CARGAR UNA PÁGINA SIN ESTAR LOGUEADO
	if (!Cookie.get("jwt")){
		window.location.href = 
			window.location.protocol+"//"+window.location.host+
			(BaseName==="/"?"":BaseName) + "/signin";
	}


	
	document.title = "ViGtory! Generador d'horaris";

	let screen_ref = React.createRef();
	let screen = <InitialScreen currentSection={props.currentSection} ref={screen_ref} />

	
	useEffect(() => {
		getHoraris().then((data) => {

			//console.log(data);

			let horaris = (data.hasOwnProperty("horaris") && Array.isArray(data["horaris"])) ? data["horaris"] : [];

			screen_ref.current.initialitzaHoraris(horaris);

		});
	}, []);


	return(
		<>
			 {screen}
		</>
	)
}
export default ScheduleGen;