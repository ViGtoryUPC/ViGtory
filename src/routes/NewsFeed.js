import React, { useImperativeHandle } from 'react';
import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import {API_address} from '../libraries/API_address';
//import ReactDOM from 'react-dom';
import { Routes, Route, Link, useHistory, useNavigate } from "react-router-dom";

import { Accordion, Button, ButtonGroup, Form, FloatingLabel, Table, Dropdown, DropdownButton, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';

import NavBar from "../components/NavBar";

import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';
import '../css/NewsFeed.css';

import { Cookie } from '../libraries/cookie';
import {BaseName} from "../libraries/basename";
import {getSubjectList} from '../libraries/data_request';

//IMPORTANTE PARA QUE NO SE VEA MAL AL ABRIR EL TECLADO EN MÓVIL
//https://stackoverflow.com/questions/32963400/android-keyboard-shrinking-the-viewport-and-elements-using-unit-vh-in-css
var viewport = document.querySelector("meta[name=viewport]");
viewport.setAttribute("content", viewport.content + ", height=" + window.innerHeight);











class TwitterFeed extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
		};
		
		
	}


	render(){
		
		return(<>





		</>);
	}


}
















class InitialScreen extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
		};

	}



	componentDidMount(){
		//this.forceUpdate();
	}


	
	
	render(){


		return(
			<>
				<NavBar currentSection={this.props.currentSection} />
				<br/><br/><br/><br/>

				<div className="grade_calc mx-auto" >
				
					<h2 className="text-center mb-4">Notícies:</h2>


					<TwitterFeed key={"twitter_"+(new Date().toString())} />
					


				</div>
				<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
				<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
				<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
			</>
		);

	};
}



function NewsFeed(props){
	//ESTE TROZO DE CÓDIGO EXPULSA AL USUARIO SI INTENTA CARGAR UNA PÁGINA SIN ESTAR LOGUEADO
	if (!Cookie.get("jwt")){
		window.location.href = 
			window.location.protocol+"//"+window.location.host+
			(BaseName==="/"?"":BaseName) + "/signin";
	}



	document.title = "ViGtory! Notícies";


	/*let navigate = useNavigate();
	function navigateTo(page) {
		navigate(page);
	}*/
	/*useEffect(() => {
		getSubjectList().then((data) => {
			//console.log(data);
			if (main_ref.current)
			main_ref.current.updateSubjectList(data);
		});
	  }, [window.location.href && new Date()]);*/

	//let main_ref = React.createRef();

	return(
		<InitialScreen currentSection={props.currentSection} key={"news_feed"+(new Date().toString())} />
	)
}
export default NewsFeed;