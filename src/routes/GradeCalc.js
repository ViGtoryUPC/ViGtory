import React from 'react';
import { useEffect } from 'react';
import {API_address} from '../libraries/API_address';
//import ReactDOM from 'react-dom';
import { Routes, Route, Link, useHistory, useNavigate } from "react-router-dom";

import { Accordion, Button, Form, FloatingLabel } from 'react-bootstrap';
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



class InitialScreen extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			
		};
	}

	
	render(){
		
		return(
			<>
				<NavBar currentSection={this.props.currentSection} />
				<br/><br/><br/><br/>


			</>
		);

	};
}



function GradeCalc(props){
	//ESTE TROZO DE CÓDIGO EXPULSA AL USUARIO SI INTENTA CARGAR UNA PÁGINA SIN ESTAR LOGUEADO
	if (!Cookie.get("jwt")){
		window.location.href = 
			window.location.protocol+"//"+window.location.host+
			(BaseName==="/"?"":BaseName) + "/signin";
	}



	document.title = "ViGtory! Calculadora de notes";


	let navigate = useNavigate();
	function navigateTo(page) {
		navigate(page);
	}
	useEffect(() => {




	  }, []);


	return(
		<InitialScreen currentSection={props.currentSection} />
	)
}
export default GradeCalc;