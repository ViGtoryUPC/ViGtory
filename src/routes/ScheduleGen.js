import React from 'react';
//import ReactDOM from 'react-dom';
import { Routes, Route, Link, useHistory } from "react-router-dom";

import { Accordion, Button, Form, FloatingLabel } from 'react-bootstrap';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';

import NavBar from "../components/NavBar";

import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';

import '../libraries/cookie';

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


			</>
		);

	};
}



function ScheduleGen(props){
	document.title = "ViGtory! Generador d'horaris";
	return(
		<InitialScreen currentSection={props.currentSection} />
	)
}
export default ScheduleGen;