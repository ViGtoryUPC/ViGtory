import React, { useImperativeHandle } from 'react';
import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Follow, Timeline } from 'react-twitter-widgets'
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

import Twitter_logo from '../assets/images/Twitter_logo.png';

//IMPORTANTE PARA QUE NO SE VEA MAL AL ABRIR EL TECLADO EN MÓVIL
//https://stackoverflow.com/questions/32963400/android-keyboard-shrinking-the-viewport-and-elements-using-unit-vh-in-css
var viewport = document.querySelector("meta[name=viewport]");
viewport.setAttribute("content", viewport.content + ", height=" + window.innerHeight);











class TwitterFeed extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
		};
		
		this.twitter_name = "ViGtoryUPC"
		this.lang = "ca";
		this.theme = "light";//dark
	}

	/*componentDidMount(){
		
	}*/

	render(){
		let twitter_name = this.twitter_name;
		let tw_logo_w = 30;
		let tw_logo_h = tw_logo_w*0.82;

		return(<>
			<div className="d-flex justify-content-between" >

				<a href={"https://twitter.com/"+twitter_name}>
					<img
						className="align-self-end mb-1 ms-2"
						src={Twitter_logo}
						width={tw_logo_w.toString()+"px"}
						height={tw_logo_h.toString()+"px"}
					/>
				</a>

				<Follow 
					username={twitter_name} 
					options={{ 
						lang: this.lang,
						size: "large",
						count: 'none'
					}}
					onLoad={()=>{
						//console.log("LOADED")

						//let iframe = window.document.getElementById("twitter-widget-0");
						/*let iframe = window.document.querySelectorAll('[id^="twitter-widget-"]')[0];
						console.log(iframe);
						

						let follow_count = iframe.contentWindow.document.querySelector("#count");*/

						//console.log(follow_count);
					}}
				/>

			</div>

			<div 
				className="pb-0"
				style={{
					backgroundColor:"white",
					borderRadius:"1rem",
					borderStyle:"solid",
					borderWidth:"0.125rem",
					borderColor:"rgba(0,127,191,1)",
					overflow:"hidden"
				}}
			>
				<Timeline
				style = {{}}
					dataSource={{
						sourceType: 'list',
						ownerScreenName: {twitter_name},
						id: '1533911007340417027'
					}}
					options={{
						lang: this.lang,
						theme: this.theme,
						chrome: "noheader, nofooter"
					}}
				/>
			</div>

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

				<div className="news_feed mx-auto" >
				
					

					<h2 className="text-center mb-4">
						Notícies:
					</h2>


					<TwitterFeed key={"twitter_"+(new Date().toString())} />
					


				</div>
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
	let main_ref = React.createRef();

	useEffect(() => {
		/*getSubjectList().then((data) => {
			//console.log(data);
			if (main_ref.current)
			main_ref.current.updateSubjectList(data);
		});*/
		if (main_ref.current)
			main_ref.current.forceUpdate();

		console.log("re-render");
	  }, [window.location.href && new Date()]);


	return(
		<InitialScreen currentSection={props.currentSection} key={"news_feed"+(new Date().toString())} main_ref={main_ref} />
	)
}
export default NewsFeed;