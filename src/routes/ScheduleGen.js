import React from 'react';
import { useEffect } from 'react';
import {API_address} from '../libraries/API_address';
//import ReactDOM from 'react-dom';
import { Routes, Route, Link, useHistory, useNavigate } from "react-router-dom";

import { Accordion, Button, Form, FloatingLabel, ListGroup } from 'react-bootstrap';
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

































class InitialScreen extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
		};

		this.max_assignatures_select = 10;
		this.max_assignatures_result = 7;
		this.horaris = [];
		this.cursos = {};
		this.assig_grups = {};

		this.preferencies = {
			max_horaris: 5
		}

		this.discarded_overlap_count = 0;
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
							if(fragments_horaris[j].codgrup.length==3){
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

		//Si son de días diferentes no solapan
		if (fr1.dia != fr2.dia) return false;

		//Si ambos se hacen en 2 semanas específicas de 4
		if ((fr1.setmana!=null)&&(fr2.setmana!=null)){
			//Si son de semanas diferentes no solapan
			if (fr1.setmana != fr2.setmana) return false;

			//Si son del mismo par de semanas
			//Si ambos se hacen en 1 semana específica de ese par
			if ((fr1.ordre!=null)&&(fr2.ordre!=null)){
				//Si son de semanas diferentes no solapan
				if (fr1.ordre != fr2.ordre) return false;
			}
		}

		//Si hemos llegado hasta aquí sin pasar por return, significa que los dos fragmentos suceden el mismo día de la misma semana. Solo queda comparar las horas de inicio y fin de cada uno

		let i1 = this.padTimeString(fr1.h_i); let f1 = this.padTimeString(fr1.h_f);
		let i2 = this.padTimeString(fr2.h_i); let f2 = this.padTimeString(fr2.h_f);

		//this.horesSolapen("08:30", "10:30", "10:29", "12:30"); //test
		return this.horesSolapen(i1, f1, i2, f2);
		
	}
	horarisSolapen(h1, h2){
		//h1 y h2 son listas de fragmentos de horarios (cada lista es un grupo)
		for(let i=0; i<h1.length; i++){
			for(let j=0; j<h2.length; j++){
				if (this.fragmentsSolapen(h1[i], h2[j])) return true;
			}
		}
		return false;
	}





	
	render(){

		let total_flagged_count = 0;
		this.pool_flagged = [];
		for (let i=0; i<(Object.keys(this.cursos).length); i++){
			for (let j=0; j<this.cursos[Object.keys(this.cursos)[i]].length; j++){
				let assign = this.cursos[Object.keys(this.cursos)[i]][j];

				total_flagged_count += assign.pool_flag ? 1:0;

				if (assign.pool_flag)
				this.pool_flagged.push({
					sigles_ud: assign.sigles_ud,
					nom: assign.nom
				});
			}
		}
		let rest_assig = this.max_assignatures_select-total_flagged_count;
		

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
							{"Marca quines assignatures i grups de la selecció que has fet tens per segur que vols cursar:"}
						</p>
					</>:""}



					<ListGroup className="assigSelectList">

						{this.pool_flagged.map(assig => {

							let assig_marcada = this.assig_grups[assig.sigles_ud].conviccio;
							return(<>
								


								<ListGroup.Item 
									className={"ps-2 pe-2 py-1 assigSelectAll"+(assig_marcada?" flagged":"")}
									
									onClick={()=>{
										this.assig_grups[assig.sigles_ud].conviccio = !assig_marcada;
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
														{grup_marcat ? "Preferent 🔵":"No ho tinc clar ⚪"}
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
						<p className="text-center">
							<Button>Genera els {this.preferencies.max_horaris} millors horaris possibles</Button>
							<br/>
							Si has escollit una gran quantitat d'assignatures, podria trigar...
						</p>
					</>:""}





















					

				</div>

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