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

		this.horaris = [];
		this.cursos = {};
	}



	initialitzaHoraris(horaris){
		this.horaris = horaris;

		this.initialitzaCursos(horaris)



		//console.log(horaris);
		this.forceUpdate();
	}

	initialitzaCursos(horaris){
		let cursos = {};
		for (let i=0; i<horaris.length; i++){
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

		this.cursos = cursos;
	}





	
	render(){
		
		return(
			<>
				<NavBar currentSection={this.props.currentSection} />
				<br/><br/><br/><br/>






				<ListGroup className="fitxersDeleteList">

					{(Object.keys(this.cursos)).map(curs=>{return(<>

						<h1>{"CURS "+curs}</h1>

						

{/*
						<div className="fitxersDeleteList mb-0 px-3 mt-2 text-end">
							<Button className="fitxersDeleteAll mb-0 px-2 pt-1 pb-0"
								size="sm"
								onClick={()=>{
									for (let i=0; i<this.file_list.length; i++){
										this.file_list[i].deletion_flag = this.selecciona_buttn;
									}
									this.selecciona_buttn = !this.selecciona_buttn;
									this.forceUpdate();
								}}
							>
								{this.selecciona_buttn ? "Selecciona-ho tot":"Deselecciona-ho tot"}
							</Button>
						</div>
*/}






						{this.cursos[curs].map(assig => {
							console.log(assig);
							return(<>

								<b key={assig+"b"}>{assig.sigles_ud}</b>
								<br/>
								&nbsp;&nbsp;&nbsp;
								{"  ⤷ "+assig.nom}
								<br/>

						</>)
						})}
					</>)
					})}

				</ListGroup>


				<ListGroup className="fitxersDeleteList">
					
					{/*this.file_list.map((file) => {return (
						<ListGroup.Item 
							className={"pe-2 py-1"+(file.deletion_flag?" flagged":"")}
							
							onClick={()=>{
								file.deletion_flag = !file.deletion_flag;

								let flagged_count = 0;
								for (let i=0; i<this.file_list.length; i++){
									flagged_count += this.file_list[i].deletion_flag ? 1:0;
								}
								this.selecciona_buttn = !(flagged_count>=this.file_list.length/2)

								this.forceUpdate();
							}}
						>
							<span className="text-decoration-none d-flex align-items-center justify-content-between">
								<span className="text-break me-2">
								{file.filename}
								</span>
								<span 
									className="individualDelete px-2" 
									style={{whiteSpace:"nowrap"}}
								>
								<p className="text-end mb-1">
									<span>
										{file.deletion_flag ? "S'eliminarà":"No s'eliminarà"}
										&nbsp;
									</span>
									<h5 className="d-inline">
										{file.deletion_flag ? "☒":"☐"}
									</h5>
								</p>
								</span>
								
							</span>
							
						</ListGroup.Item>
					);})*/}
					

				</ListGroup>





























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